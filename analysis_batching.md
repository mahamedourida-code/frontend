# Batch Processing Analysis

## Executive Summary

AxLiner's product promise is fast batch conversion with one action. The current architecture is feasible, but the current batch path can feel slow because the work is not fully pipeline-based. A user uploads 5 files, but the system does several serial steps before and during OCR:

- The API validates every file, renders PDFs into page images, and uploads each processing unit to Supabase Storage before the job is queued.
- The worker downloads every stored input from Supabase before starting OCR.
- A single Celery batch task owns the whole batch instead of dispatching each image/page as its own independent sub-job.
- OCR calls are capped globally at `MAX_CONCURRENT_OCR_CALLS=3`.
- `OlmOCRService._apply_rate_limiting()` adds an artificial delay before every model request, with exponential backoff behavior. This is probably one of the biggest reasons the second, third, and later images feel slower than expected.

For a 5-image batch, the ideal product behavior is: upload quickly, create a job immediately, show per-file status, process multiple files in parallel with a controlled global OCR cap, and stream results as each file finishes. The current system is close, but too much batch work is bundled into one long task.

## Current Batch Flow

1. Frontend sends all files to `POST /api/v1/jobs/batch-upload`.
2. Backend reads every file into memory.
3. If a file is a PDF, the backend renders all pages into PNG images using PyMuPDF at 180 DPI.
4. Backend creates `processing_units`.
5. Backend uploads each processing unit to Supabase Storage sequentially through `upload_source_file()`.
6. Backend creates Redis/Supabase job metadata.
7. Backend queues one Celery task: `process_batch_from_storage`.
8. Worker downloads every stored image from Supabase sequentially.
9. Worker calls `process_batch_simple()`.
10. `process_batch_simple()` creates concurrent tasks, but local and distributed semaphores limit OCR calls.
11. Each image calls DeepInfra through the OpenAI-compatible chat completions API.
12. Each result is converted to XLSX or TXT, uploaded to Supabase, written to metadata, and published over websocket.

## Where The Delay Most Likely Comes From

### 1. Artificial OCR Delay Before Every Request

Relevant file: `backend/app/services/olmocr.py`

`_apply_rate_limiting()` runs before every OCR request. It increments `_request_count` and applies:

- base delay: `OLMOCR_BASE_DELAY_SECONDS=2.0`
- exponential backoff: `2, 4, 8, 10...` seconds depending on request count
- jitter on top

This means a 5-file batch can be slowed before DeepInfra even receives requests. Because `get_olmocr_service()` returns a singleton per worker process, all images in that worker share this rate limiter.

This protects the external provider, but it also makes normal batches feel worse than they should. A proper system should use a global provider concurrency/rate limiter, not a growing sleep before every normal request.

### 2. Global OCR Cap Is Conservative

Relevant files:

- `backend/fly.toml`
- `backend/app/tasks/simple_batch.py`
- `backend/app/services/redis_service.py`

Current production values:

- `WORKER_CONCURRENCY=2`
- `MAX_CONCURRENT_OCR_CALLS=3`

So across all worker machines, only 3 OCR calls should run at the same time. For 5 files, the fastest possible path is at least two OCR waves. If one model request takes 8 seconds, OCR alone is about 16 seconds before storage, parsing, Excel generation, retries, websocket, and queue time.

That cap is good for safety, but it is low for a product whose main value is batch speed. It should be increased only after measuring DeepInfra latency, 429s, failures, and cost.

### 3. One Celery Task Owns The Whole Batch

Relevant files:

- `backend/app/tasks/batch_tasks.py`
- `backend/app/tasks/simple_batch.py`

`process_batch_from_storage` is one Celery task for the whole batch. Inside that task, it downloads all files, then creates async OCR tasks.

The issue: a whole user batch occupies a Celery worker slot while it waits for storage, semaphore availability, OCR latency, and result uploads. If multiple users submit batches, worker slots can be occupied by long-running batches instead of individual image/page tasks being fairly distributed.

SaaS products usually split this into:

- one parent job
- many child tasks, one per image/page
- a reducer/finalizer that marks the parent job complete when all children finish

That gives better fairness, retries, progress, and scaling.

### 4. PDF Work Happens Before Queueing

Relevant files:

- `backend/app/api/v1/jobs.py`
- `backend/app/utils/pdf_pages.py`

PDFs are rendered inside the web API request before the job is queued. A 5-page PDF becomes 5 PNG processing units. A mixed batch of 5 files can silently become 20+ OCR units if PDFs have multiple pages.

For user experience, this looks like the app is stuck before processing begins. Better SaaS behavior is to create the job quickly, then let workers expand PDFs into page tasks while the frontend shows `Preparing pages`.

### 5. Storage Round Trips Add Latency

Current flow uploads source files to Supabase Storage, then the worker downloads them before OCR.

This is durable and production-safe, but it adds:

- upload time from API to Supabase
- download time from Supabase to worker
- base64 encoding before DeepInfra

That is acceptable for reliability, but the UI must show these stages. Also, uploads should ideally be direct-to-storage from the browser with signed upload URLs, then the backend queues processing from storage paths.

### 6. Retry And Backoff Can Make A Batch Look Frozen

Relevant files:

- `backend/app/services/olmocr.py`
- `backend/app/tasks/batch_tasks.py`

The OCR methods retry on broad exceptions with backoff and `max_time=30`. Celery also retries a whole batch task with `default_retry_delay=120`.

Retries are needed, but users need to see `retrying file 3` rather than a generic processing state. Also, retries should happen per image/page, not for the entire batch.

### 7. Cold Starts Can Hurt The First Interaction

Relevant file: `backend/fly.toml`

The web process has `auto_stop_machines='stop'` and `min_machines_running=0`. If workers are also not always warm in the new Fly account/deployment setup, first conversion can pay cold-start time. DeepInfra model/provider latency can also have warm/cold variation.

For a paid batch product, at least one web machine and one worker machine should stay warm once traffic starts.

## How SaaS Products Usually Handle This

### They Do Not Process A Batch As One Big Task

They model it as:

- Batch job: user-facing object.
- File tasks: each uploaded file.
- Page tasks: each PDF page or image.
- Result tasks: conversion/output generation.
- Finalizer: produces ZIP, combined workbook, or final status.

This lets the system retry one failed page without restarting the whole batch.

### They Use Bounded Parallelism

They do parallel requests, but not unlimited parallel requests.

Typical controls:

- per-user concurrency
- per-plan concurrency
- global provider concurrency
- per-provider token bucket
- queue admission limits
- timeout per OCR call
- retry budget per file

For AxLiner, the right model is not "send 100 requests at once." It is "send as many as your provider and budget safely allow, while preserving predictable completion time."

### They Use Multiple Providers Carefully

Using many APIs can help, but it should be a routing strategy, not random duplication.

Better pattern:

- primary provider: best accuracy/cost for handwritten table extraction
- secondary provider: fallback when primary is slow or returning 429/5xx
- specialized route: text-only model for `Text output`
- specialized route: table/XLSX model or post-processing for `Table output`
- circuit breaker: temporarily stop sending work to a provider when error rate is high
- hedged request only for paid/high-priority jobs that exceed a latency threshold

Sending the same image to many models by default will increase cost and can create inconsistent outputs.

### They Separate Queues By Work Type

Recommended queue classes:

- `fast_images`: small images, paid users, quick jobs
- `pdf_pages`: heavier PDF-rendered pages
- `text_output`: text-only extraction
- `table_output`: Excel/table extraction
- `finalizers`: ZIP/workbook/share generation

This avoids a large PDF batch blocking small image jobs.

### They Show The Real Stage To The User

Good batch UX shows:

- Uploading
- Preparing pages
- Queued
- Processing 2 of 5
- Retrying 1 file
- Ready files appearing progressively
- Download all when complete

The user should never wonder whether the batch is stuck.

## What I Would Measure First

Before changing architecture, add timing logs/metrics for:

- request received
- file validation finished
- PDF render started/finished, with page count
- source upload started/finished per file/page
- job queued
- Celery task picked up
- storage download started/finished per file/page
- semaphore wait time per OCR call
- OCR request started/finished per file/page
- DeepInfra status/error/latency
- XLSX/TXT generation time
- result upload time
- websocket publish time
- frontend received first result
- frontend received final result

Without these timings, it is easy to guess wrong. My strongest guess is that the artificial `_apply_rate_limiting()` sleep plus the low global OCR cap are the biggest causes after basic storage/PDF overhead.

## Recommended Direction For AxLiner

### Phase 1: Make Current System Observable

Add per-stage timings and expose them internally. Do not scale blindly before knowing whether the bottleneck is:

- API upload
- PDF rendering
- Supabase Storage
- worker pickup delay
- semaphore wait
- DeepInfra latency
- result generation
- websocket delivery

### Phase 2: Remove Normal-Path Artificial Sleep

Keep the Redis distributed semaphore and provider rate limits, but avoid exponential sleeping before every normal request. Backoff should happen after provider throttling/errors, not before healthy calls.

### Phase 3: Split Batch Into Child Jobs

Change the queue model from:

`one batch task -> many OCR calls inside it`

to:

`one parent job -> one task per image/page -> finalizer`

This is the architecture that best matches the product promise.

### Phase 4: Tune Provider Parallelism

Start with:

- worker machines: 1
- worker concurrency: 2
- global OCR concurrency: 3

Then increase gradually:

- if queue wait is high and provider 429/error rate is low, increase OCR concurrency
- if CPU/memory is high, add worker machines
- if provider latency rises or 429s appear, reduce concurrency or add fallback routing

For a paid launch, realistic early targets:

- free users: lower priority, low concurrency
- Pro: normal priority, 1-2 active batches
- Max/Mega: higher queue priority and higher per-user concurrency

### Phase 5: Add Provider Routing

Do not rely on only one model forever. Build a provider abstraction:

- `ocr_table_primary`
- `ocr_table_fallback`
- `ocr_text_primary`
- `ocr_text_fallback`

Then route jobs based on output mode, provider health, latency, and plan.

## Direct Answer

Yes, batch processing should use parallel requests, but only with strict concurrency control. The main problem is not that the system has no parallelism. It already has some. The issue is that the batch pipeline has serial preparation steps, a low global OCR cap, artificial per-request delay, and a single Celery task owning the whole batch.

The best architecture for AxLiner is a durable parent batch job with per-image/page child tasks, progressive results, bounded provider concurrency, provider fallback, and clear user-facing stage updates.
