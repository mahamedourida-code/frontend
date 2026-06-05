# AxLiner Symbol Prompt Library — GPT Image 2

A ready-to-paste library of image-generation prompts for **GPT Image 2** (OpenAI). Each prompt produces ONE caricature-style symbol on a **transparent background** for the AxLiner app.

**How to use:** copy a prompt below, append the **Global Style Block** (it ends every prompt with `— [GLOBAL STYLE]` as a reminder), paste into GPT Image 2, then save the resulting transparent PNG to the `File:` path shown (the app's `/public/symbols/` folder).

---

## GLOBAL STYLE BLOCK

> Append this paragraph to EVERY prompt so the whole set stays visually consistent.

```
[GLOBAL STYLE] — Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.
```

---

## Document types

### Invoice
- **File:** `/public/symbols/invoice.png`
- **Where it's used:** intake mode picker + review board document-type chips
- **Size:** medium
- **Prompt:** A single crisp paper invoice, cream-white sheet seen front-on at a slight tilt, with a bold emerald header bar, a few neat line-item rows suggested by simple horizontal strokes, and a small mint total box at the bottom-right highlighted in #d1fae5. One corner curls playfully. Clean and tidy, the "ideal" version of a document. — [GLOBAL STYLE]

### Receipt
- **File:** `/public/symbols/receipt.png`
- **Where it's used:** intake mode picker, receipt-capture flows
- **Size:** medium
- **Prompt:** A long narrow thermal till receipt curling into a friendly S-curve, cream paper with a zig-zag torn bottom edge, faint dashed item lines and a bold emerald total near the top. Slightly exaggerated long proportions for character, like a ribbon. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Bank statement
- **File:** `/public/symbols/bank-statement.png`
- **Where it's used:** intake mode picker, statement import
- **Size:** medium
- **Prompt:** A multi-column bank statement page, paper-white, with a small emerald bank/columns icon in the header, several rows of debit/credit entries shown as alternating short strokes, and a tiny running-balance column tinted sky blue #0ea5e9. Orderly and grid-like. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Spreadsheet / table
- **File:** `/public/symbols/spreadsheet.png`
- **Where it's used:** export-to-Excel/CSV buttons, results view
- **Size:** medium
- **Prompt:** A clean spreadsheet grid card tilted in 3/4 view, white cells with crisp emerald gridlines, a green header row in #10b981, and one cell glowing soft mint #d1fae5 as if just filled in correctly. Neat columns and rows, the satisfying "clean books" payoff. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Handwritten note
- **File:** `/public/symbols/handwritten-note.png`
- **Where it's used:** intake mode picker (handwritten mode), messy-source examples
- **Size:** medium
- **Prompt:** A small torn-edge notepad sheet with looping squiggly handwriting scrawls (illegible wavy ink lines, not real letters), a coffee-ring stain in warm clay #eadcc8, and a stubby pencil resting across the corner. Casual, human, a little messy but charming. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Messy sources (the chaos AxLiner tames)

### Pile of mixed papers
- **File:** `/public/symbols/paper-pile.png`
- **Where it's used:** landing "Throw us the whole folder" band, messy-intake hero
- **Size:** hero
- **Prompt:** A big chaotic pile of mismatched finance documents — invoices, receipts, a folded statement, a sticky note — fanned out at wild angles, some crumpled, one receipt sliding off the top. Cream and paper-white sheets with tiny emerald and amber detail marks, exaggerated messy stack proportions. Expressive, overflowing, comedic chaos waiting to be sorted. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Crumpled receipt
- **File:** `/public/symbols/crumpled-receipt.png`
- **Where it's used:** messy-source illustrations, "from this…" before state
- **Size:** medium
- **Prompt:** A heavily crumpled and wrinkled till receipt, cream paper with exaggerated creases and folds and a torn edge, faint smudged ink lines. A single amber #f59e0b crinkle highlight catches the light. Looks rescued from a pocket, full of character. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Phone photographing a receipt
- **File:** `/public/symbols/phone-capture.png`
- **Where it's used:** mobile capture flow, upload options
- **Size:** medium
- **Prompt:** A friendly smartphone held front-on, emerald-trimmed body, its screen showing a small receipt framed inside camera brackets, with two tiny mint focus-corner marks and a soft #d1fae5 capture flash burst at the top. The receipt sits just below/behind as the real subject being snapped. Playful, snappy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Flatbed scanner
- **File:** `/public/symbols/scanner.png`
- **Where it's used:** upload/import source options
- **Size:** medium
- **Prompt:** A chunky caricature flatbed scanner in 3/4 view, white-and-emerald body with a raised lid, a bright sky-blue #0ea5e9 scan-light bar sweeping across the glass, and a document peeking out beneath. Slightly squat exaggerated proportions, friendly and mechanical. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Envelope dropping a document
- **File:** `/public/symbols/email-drop.png`
- **Where it's used:** email-in / forward-to-AxLiner intake, integrations
- **Size:** medium
- **Prompt:** An open cream envelope tilted forward with its flap up, a single invoice sliding out and downward as if being delivered, motion suggested by two short mint speed-lines. Emerald accent on the envelope seam, a tiny sky-blue @ mark on the corner to hint at email. Lively, mid-action. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Shoebox of receipts
- **File:** `/public/symbols/shoebox.png`
- **Where it's used:** landing messy-source storytelling, "the shoebox problem"
- **Size:** hero
- **Prompt:** A worn cardboard shoebox in warm clay #eadcc8 overflowing with a jumble of crumpled receipts and folded notes spilling over every edge, a couple fluttering out the top. Lid askew on one side. Exaggerated overstuffed proportions, comic and relatable — the classic accountant's nightmare. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Accounting concepts

### VAT box
- **File:** `/public/symbols/vat-box.png`
- **Where it's used:** tax/VAT settings, line-item tax fields
- **Size:** medium
- **Prompt:** A chunky cardboard cube box drawn in clean 3/4 isometric-ish view, warm clay #eadcc8 faces with emerald edges, and the letters "VAT" stamped boldly on the visible front side in deep emerald #064e3b. Solid, tactile, a little playful. (Text "VAT" allowed here.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Stack of coins
- **File:** `/public/symbols/coins.png`
- **Where it's used:** totals, amounts, billing/credits
- **Size:** inline
- **Prompt:** A small neat stack of round coins viewed front-on, golden-amber #f59e0b faces with emerald rim highlights, the top coin showing a simple generic currency dot/disc (no specific symbol). Slightly chunky cartoon proportions, cheerful and clean. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Calculator
- **File:** `/public/symbols/calculator.png`
- **Where it's used:** totals/recalculation, accounting tools
- **Size:** medium
- **Prompt:** A friendly pocket calculator in 3/4 view, mint #d1fae5 body with emerald buttons in a tidy grid, a sky-blue #0ea5e9 display strip showing a few simple digit blocks (no readable number). Rounded chunky keys, approachable and tactile. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Ledger / accounts book
- **File:** `/public/symbols/ledger.png`
- **Where it's used:** accounts/books section, history
- **Size:** medium
- **Prompt:** A thick open hardcover ledger book in 3/4 view, deep-emerald #064e3b cover with a cream ribbon bookmark, two open pages ruled with columns and rows of short entry strokes, a faint mint balance column. Solid and trustworthy, slightly oversized for character. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Percent tag
- **File:** `/public/symbols/percent-tag.png`
- **Where it's used:** tax rate / discount fields, pricing
- **Size:** inline
- **Prompt:** A small price-style swing tag with a punched hole and a short string, mint #d1fae5 face with an emerald border, a bold "%" percent symbol centered in deep emerald #064e3b. Tilted jauntily. (The % symbol is allowed.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Banknote / currency
- **File:** `/public/symbols/banknote.png`
- **Where it's used:** amounts, payments context, billing
- **Size:** inline
- **Prompt:** A single folded banknote drawn front-on with a soft fold curve, emerald-green #10b981 paper with a cream oval medallion in the center (blank, no portrait), simple corner flourishes. Clean cartoon money, light and friendly, no specific currency symbol. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Magnifying glass over an invoice (review)
- **File:** `/public/symbols/review-magnify.png`
- **Where it's used:** review board header, "review your data" step
- **Size:** medium
- **Prompt:** A bold magnifying glass with a violet #8b5cf6 rim and emerald handle hovering over a cream invoice, the glass enlarging one line-item row inside its lens with a soft mint highlight, suggesting careful inspection. The handle angles down-right. Inquisitive and focused. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### "APPROVED" rubber stamp
- **File:** `/public/symbols/approved-stamp.png`
- **Where it's used:** review board approve action, draft-ready state
- **Size:** medium
- **Prompt:** A wooden-handled rubber stamp pressed at a jaunty angle, leaving a bold circular emerald-green ink imprint reading "APPROVED" in chunky uppercase, with a couple of tiny ink-splatter dots for energy. Handle in warm clay #eadcc8. Confident and satisfying. (Text "APPROVED" allowed.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Two overlapping pages (duplicate)
- **File:** `/public/symbols/duplicate.png`
- **Where it's used:** duplicate-detection flag on review board
- **Size:** inline
- **Prompt:** Two identical cream invoice pages overlapping with a slight offset, the back one tinted rose #f43f5e to signal a duplicate, with a small rose copy/overlap glyph in the corner. Clean, simple, instantly reads as "same document twice." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Warning flag (exception / anomaly)
- **File:** `/public/symbols/warning-flag.png`
- **Where it's used:** exception markers, needs-review badges
- **Size:** inline
- **Prompt:** A small triangular pennant flag on a short pole, bold rose #f43f5e fabric with a tiny exclamation mark cut-out, fluttering with one wave curve. Compact and punchy — an attention-grabbing anomaly marker. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Balance scale
- **File:** `/public/symbols/balance-scale.png`
- **Where it's used:** reconciliation / balanced-books concept, accuracy section
- **Size:** medium
- **Prompt:** A classic two-pan balance scale standing level and even, emerald #10b981 frame and beam, two mint #d1fae5 pans hanging in perfect equilibrium, a small coin in each pan. Tidy and symmetrical to signal "balanced." Slightly chunky friendly proportions. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Pipeline & states

### Processing gears
- **File:** `/public/symbols/processing-gears.png`
- **Where it's used:** processing/extraction loading states
- **Size:** medium
- **Prompt:** Two interlocking cog gears, the larger one emerald #10b981 and the smaller sky-blue #0ea5e9, with a tiny document silhouette tucked behind suggesting work in progress, and two short mint motion-arc lines hinting at rotation. Mechanical, energetic, mid-spin. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Clean / ready checkmark badge
- **File:** `/public/symbols/ready-check.png`
- **Where it's used:** clean/ready status, completed steps
- **Size:** inline
- **Prompt:** A round badge with a soft scalloped or starburst edge, mint #d1fae5 fill with a deep-emerald #064e3b ring, and a bold confident emerald checkmark centered inside. A tiny mint sparkle at the top-right for "clean." Crisp and reassuring. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Sync to QuickBooks / Xero
- **File:** `/public/symbols/sync-publish.png`
- **Where it's used:** publish-to-accounting action, integration sync
- **Size:** medium
- **Prompt:** Two circular arrows chasing each other in a continuous loop (refresh/sync motif), the top arrow emerald #10b981 and the bottom sky-blue #0ea5e9, encircling a small cream document with a tiny green check in the center to show a clean record syncing across. Smooth, in-motion, dependable. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Upload tray with arrow
- **File:** `/public/symbols/upload-tray.png`
- **Where it's used:** drop-zone / upload button, intake
- **Size:** medium
- **Prompt:** An open document in-tray viewed front-on with a bold emerald up-arrow rising out of it, a cream sheet lifting on the arrow, soft mint #d1fae5 glow inside the tray. Two short motion ticks beneath the arrow. Inviting "drop your files here" energy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Paper plane (publish / send)
- **File:** `/public/symbols/paper-plane.png`
- **Where it's used:** send/publish/export confirmation
- **Size:** inline
- **Prompt:** A crisp folded paper plane mid-flight angled up-right, cream paper with a single emerald #10b981 fold-line accent, trailed by a short curved dashed mint flight path. Light, swift, optimistic — the "it's on its way" moment. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### AI assistant mascot (owl reading a document)
- **File:** `/public/symbols/ai-mascot.png`
- **Where it's used:** AI-assistant touchpoints, onboarding, empty states
- **Size:** hero
- **Prompt:** A charming caricature owl mascot perched and peering intently through small round emerald spectacles at a cream invoice it holds in its wing-hands, head tilted in concentration, soft emerald-and-mint feather palette with deep-emerald #064e3b brow tufts and a tiny amber #f59e0b beak. A faint sky-blue thought-spark above its head suggests it's reading and understanding. Wise, friendly, a little nerdy — the helpful AI bookkeeper. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Robot reader (alternate AI assistant)
- **File:** `/public/symbols/ai-robot.png`
- **Where it's used:** alternate AI-assistant icon, processing personality
- **Size:** medium
- **Prompt:** A friendly boxy little robot with a rounded mint #d1fae5 head, two glowing sky-blue #0ea5e9 eyes scanning left-to-right across a cream document it holds, an emerald antenna with a tiny green light, and a small scan-line beam from its eyes onto the page. Approachable, curious, helpful — not menacing. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Empty states & hero illustrations

### Friendly filing cabinet
- **File:** `/public/symbols/filing-cabinet.png`
- **Where it's used:** empty-history / archive empty states
- **Size:** hero
- **Prompt:** A tall friendly filing cabinet in 3/4 view with a gently rounded body, deep-emerald #064e3b drawers with mint #d1fae5 handle labels, the top drawer open to reveal neatly tabbed folders standing in a row, one cream document peeking up. A tiny green check sticker on the front. Organized, welcoming, a touch of personality. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Before → after (chaos to clean)
- **File:** `/public/symbols/before-after.png`
- **Where it's used:** landing hero, the core value-prop illustration
- **Size:** hero
- **Prompt:** A two-part composition with a bold emerald arrow in the middle pointing left-to-right: on the LEFT, a messy crumpled jumble of receipts and scribbled notes at chaotic angles in warm clay and amber tones; on the RIGHT, a clean tidy emerald-and-white spreadsheet grid with one mint #d1fae5 highlighted cell and a tiny green check. The arrow is the transformation. Expressive contrast — "turn chaos into clean books." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Empty inbox tray
- **File:** `/public/symbols/empty-inbox.png`
- **Where it's used:** empty intake / "all caught up" states
- **Size:** medium
- **Prompt:** A single empty document in-tray viewed front-on, mint #d1fae5 tray with an emerald rim, nothing inside but a faint mint base shine, and a tiny cheerful sparkle or zero-dot floating above to signal "all clear, nothing to review." Calm, clean, restful. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Bonus utility symbols

### Review board
- **File:** `/public/symbols/review-board.png`
- **Where it's used:** Batch Review Board nav/section header (the core differentiator)
- **Size:** hero
- **Prompt:** A caricature kanban-style board or clipboard standing in 3/4 view, deep-emerald #064e3b frame holding three small document cards in a row — one with an amber #f59e0b "needs review" dot, one with a violet #8b5cf6 magnifier mark, one with an emerald green check — plus a tiny magnifying glass clipped to the side. Organized triage at a glance, the heart of AxLiner. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Folder drop ("throw us the whole folder")
- **File:** `/public/symbols/folder-drop.png`
- **Where it's used:** batch upload band, the brand tagline moment
- **Size:** hero
- **Prompt:** An open manila folder tilted up and forward, warm clay #eadcc8 with an emerald tab, mouth wide open as a cascade of mixed receipts, invoices and notes tumbles INTO it from above, a few mint motion-lines showing the toss. Generous, welcoming, batch-scale — "throw us the whole folder." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Confidence flag (field-level)
- **File:** `/public/symbols/confidence-flag.png`
- **Where it's used:** low-confidence field markers on the review board
- **Size:** inline
- **Prompt:** A small dog-eared sticky-note flag tab, amber #f59e0b fill with a tiny question-mark or wavy "uncertain" squiggle, peeling slightly off its surface. Compact and unobtrusive — gently says "double-check this field." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Export to Excel/CSV
- **File:** `/public/symbols/export-excel.png`
- **Where it's used:** download/export buttons
- **Size:** inline
- **Prompt:** A small spreadsheet sheet with emerald gridlines and a bold emerald down-arrow overlapping its lower-right corner to signal download/export, one cell tinted mint #d1fae5. Clean, immediately legible as "save the clean data." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Landing page

### Hero — chaos to clean books (centerpiece)
- **File:** `/public/symbols/landing-hero-transform.png`
- **Where it's used:** landing page hero, the big expressive centerpiece
- **Size:** hero
- **Prompt:** A large dramatic centerpiece: on the left a swirling tornado-like jumble of crumpled receipts, a folded bank statement, a handwritten invoice and a sticky note all tumbling and fanning at wild angles in warm clay and amber tones, funneling rightward through a glowing emerald #10b981 swoosh into a pristine tidy spreadsheet grid on the right with crisp emerald gridlines, a green header row, one mint #d1fae5 cell glowing with a tiny green check. Big, energetic, cinematic motion with mint speed-lines — the whole AxLiner promise in one image. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Feature card — batch processing
- **File:** `/public/symbols/feature-batch.png`
- **Where it's used:** landing feature cards (batch processing)
- **Size:** medium
- **Prompt:** A tall neat stack of many cream document pages all being processed at once, a wide emerald #10b981 conveyor-belt bar sliding the whole stack rightward, each page bearing a tiny green check as it passes a sky-blue #0ea5e9 scan line, two short mint motion-arcs for speed. Conveys "dozens at once, not one at a time." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Feature card — the review board
- **File:** `/public/symbols/feature-review.png`
- **Where it's used:** landing feature cards (review board)
- **Size:** medium
- **Prompt:** A friendly hand holding a stylus tapping a correction onto one cell of a floating review card, the card a cream document mini-row with a violet #8b5cf6 highlight on the edited field, a small green check appearing where the fix lands, and an amber #f59e0b dot on a neighboring field still awaiting review. Hands-on, human-in-the-loop correction energy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Feature card — vendor memory / learning
- **File:** `/public/symbols/feature-vendor-memory.png`
- **Where it's used:** landing feature cards (vendor memory / it learns)
- **Size:** medium
- **Prompt:** A cheerful brain-shaped node drawn in soft emerald and mint, with a glowing violet #8b5cf6 lightbulb spark at its top, connected by neat dotted emerald lines to three small supplier cards (each a tiny cream tile with a different colored tag — amber, sky, rose) as if remembering each vendor's quirks. A small recall arrow loops back. Smart, friendly, "it learns your suppliers." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Feature card — duplicate & anomaly safety
- **File:** `/public/symbols/feature-safety.png`
- **Where it's used:** landing feature cards (duplicate & anomaly detection)
- **Size:** medium
- **Prompt:** A protective emerald shield standing in front of two overlapping cream invoices, the back invoice tinted rose #f43f5e to flag a duplicate, and a small amber #f59e0b warning triangle catching an out-of-place figure. A tiny green check on the shield says "caught before it ships." Watchful, reassuring, guard-on-duty. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Feature card — accounting-software sync
- **File:** `/public/symbols/feature-sync.png`
- **Where it's used:** landing feature cards (publish to accounting software)
- **Size:** medium
- **Prompt:** Two rounded app-tile cards facing each other — a cream AxLiner tile with an emerald check and a generic mint "ledger app" tile with simple bar marks — joined by a smooth two-way emerald-and-sky-blue arrow loop carrying a tiny clean document between them. No real logos. Effortless, connected, dependable handoff. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Outcome stat — hours back (clock + coins)
- **File:** `/public/symbols/stat-hours-back.png`
- **Where it's used:** landing outcome/stats band (time saved)
- **Size:** medium
- **Prompt:** A friendly round wall clock in emerald and cream with its hands sweeping backward (a small counter-clockwise mint arrow), and a tidy stack of amber #f59e0b coins resting beside it, one coin balanced on the clock's rim. A tiny green up-tick sparkle. Reads instantly as "get hours back, save money." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Happy bookkeeper (relieved)
- **File:** `/public/symbols/happy-bookkeeper.png`
- **Where it's used:** landing outcome/stats band, testimonials lead-in
- **Size:** medium
- **Prompt:** A cheerful bookkeeper character leaning back with a relaxed satisfied smile, hands behind the head, an emerald cardigan and mint shirt, a tidy cream spreadsheet floating beside them showing a green check, the once-messy paper pile now small and tamed in the corner. Relief and pride — "finally caught up." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### How it works — step 1 (upload)
- **File:** `/public/symbols/how-step-upload.png`
- **Where it's used:** landing "how it works" 1-2-3 (step 1)
- **Size:** medium
- **Prompt:** A bold rounded numbered badge "1" in deep emerald #064e3b sitting beside a friendly open folder tossing a small cascade of mixed documents upward into a mint #d1fae5 drop-zone with an emerald up-arrow. Clear first-step energy — "drop everything in." (Numeral "1" allowed.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### How it works — step 2 (review)
- **File:** `/public/symbols/how-step-review.png`
- **Where it's used:** landing "how it works" 1-2-3 (step 2)
- **Size:** medium
- **Prompt:** A bold rounded numbered badge "2" in deep emerald #064e3b beside a violet #8b5cf6 magnifying glass hovering over a cream review card, one field highlighted mint and a tiny stylus making a quick correction with a green check. Clear second-step energy — "glance and fix." (Numeral "2" allowed.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### How it works — step 3 (publish)
- **File:** `/public/symbols/how-step-publish.png`
- **Where it's used:** landing "how it works" 1-2-3 (step 3)
- **Size:** medium
- **Prompt:** A bold rounded numbered badge "3" in deep emerald #064e3b beside a clean cream document flying as a paper plane into a generic mint "ledger app" tile, with an emerald-and-sky-blue sync loop and a green check landing on the tile. Clear third-step energy — "publish clean books." (Numeral "3" allowed.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Testimonial — 5-star quote bubble
- **File:** `/public/symbols/testimonial-quote.png`
- **Where it's used:** landing testimonials section
- **Size:** medium
- **Prompt:** A plump rounded speech bubble in cream with an emerald outline, holding a row of five tidy amber #f59e0b stars across the top and a couple of soft mint quote-mark glyphs, with a small emerald heart in the corner. Warm, social-proof energy — a happy customer talking. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Confidence gauge (field-level, not accuracy %)
- **File:** `/public/symbols/confidence-gauge.png`
- **Where it's used:** landing benchmark/confidence motif
- **Size:** medium
- **Prompt:** A friendly semicircular dial gauge with a needle resting confidently in the emerald #10b981 "green zone" on the right, the arc graduated from soft amber on the left to emerald on the right, and a tiny field-check tick beside the needle instead of any number. Conveys confidence and field-level checks — never a literal percentage. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Final CTA — let's go rocket
- **File:** `/public/symbols/cta-rocket.png`
- **Where it's used:** landing final call-to-action band
- **Size:** medium
- **Prompt:** A cheerful little rocket made from a rolled cream document, emerald #10b981 nose cone and mint fins, lifting off with an amber #f59e0b flame and three short mint motion-puffs, a tiny green check sticker on its side. Optimistic launch energy — "get started now." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Pricing page

### Price tag
- **File:** `/public/symbols/price-tag.png`
- **Where it's used:** pricing page header, plan cards
- **Size:** medium
- **Prompt:** A bold swing price tag with a punched hole and a short emerald string, mint #d1fae5 face with a deep-emerald #064e3b border and a simple generic currency disc in the center (no specific symbol), tilted jauntily with a tiny amber sparkle. Clean, inviting, "fair pricing." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Plan tiers podium
- **File:** `/public/symbols/plan-podium.png`
- **Where it's used:** pricing page plan comparison
- **Size:** medium
- **Prompt:** Three rising podium blocks of increasing height in mint, emerald and deep-emerald, each topped with a small rounded plan card, the tallest center block crowned with a tiny amber #f59e0b star to mark the recommended tier. Clean, tiered, "pick your level." (No numerals required.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Credits / tokens coin stack
- **File:** `/public/symbols/credits-stack.png`
- **Where it's used:** pricing page credits explainer, billing
- **Size:** medium
- **Prompt:** A generous tiered stack of round token coins in amber #f59e0b with emerald rims, each coin face stamped with a tiny generic document glyph to read as "document credits," a couple of loose coins beside the stack and one mint #d1fae5 coin glinting on top. Plentiful, cheerful, "credits to spend." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Free trial gift / spark
- **File:** `/public/symbols/free-trial-gift.png`
- **Where it's used:** pricing page free-trial callout
- **Size:** medium
- **Prompt:** A small cheerful wrapped gift box, mint #d1fae5 body with an emerald ribbon and bow, lid lifting slightly to let an amber #f59e0b sparkle and a tiny green check burst out. A couple of mint confetti dots float around it. Generous, welcoming — "start free." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Integrations page

### Generic ledger-app tile
- **File:** `/public/symbols/integration-ledger-tile.png`
- **Where it's used:** integrations page connection tiles (generic accounting app)
- **Size:** medium
- **Prompt:** A single rounded app-icon tile in mint #d1fae5 with an emerald border, its face showing a simple generic ledger motif — a tiny columned book with a green check — and a small emerald "connected" dot in the corner. Deliberately generic, NO real brand logos. Clean and trustworthy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Plug & socket connection
- **File:** `/public/symbols/integration-plug.png`
- **Where it's used:** integrations page "connect" motif
- **Size:** medium
- **Prompt:** An emerald #10b981 plug and a mint #d1fae5 socket meeting in the center about to click together, each emerging from a small rounded app card, a tiny amber #f59e0b spark at the contact point and two short mint motion-ticks. Reads instantly as "connect your tools." No logos. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### OAuth handshake
- **File:** `/public/symbols/integration-handshake.png`
- **Where it's used:** integrations page secure-authorize motif
- **Size:** medium
- **Prompt:** Two friendly cartoon hands clasping in a confident handshake in the center, one cuff emerald and one cuff sky-blue #0ea5e9, with a small mint #d1fae5 padlock-check token floating just above the grip to signal a secure authorized connection. Trustworthy, mutual, "permission granted." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Two-way sync loop
- **File:** `/public/symbols/integration-two-way.png`
- **Where it's used:** integrations page sync-direction motif
- **Size:** medium
- **Prompt:** Two rounded cards on either side connected by a bold figure-eight / dual-arrow loop, the upper arrow emerald flowing right and the lower arrow sky-blue #0ea5e9 flowing left, a tiny clean document riding each arrow with a green check. Clearly bidirectional — "stays in sync both ways." No logos. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---


## Solutions & products

### Manual data-entry being automated
- **File:** `/public/symbols/solution-data-entry.png`
- **Where it's used:** data-entry solution page hero
- **Size:** hero
- **Prompt:** A tired pair of cartoon hands hovering over a keyboard mid-typing on one side, fading into soft amber, while on the other side a confident emerald #10b981 automation swoosh with a tiny gear and green check takes over the task, a cream form auto-filling its cells with mint #d1fae5 highlights. The contrast says "stop typing it by hand." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Handwritten table → clean grid
- **File:** `/public/symbols/solution-handwritten-table.png`
- **Where it's used:** handwritten-tables solution page hero
- **Size:** hero
- **Prompt:** On the left a wonky hand-drawn table with squiggly illegible ink rows and crooked clay-colored gridlines, morphing across an emerald #10b981 transformation arrow into a crisp clean spreadsheet grid on the right with straight emerald gridlines, a green header row and one mint #d1fae5 filled cell with a check. Wonky-to-perfect contrast. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Paper form being digitised
- **File:** `/public/symbols/solution-paper-form.png`
- **Where it's used:** paper-forms solution page hero
- **Size:** hero
- **Prompt:** A printed paper form with labeled boxes and tick fields lifting off a clipboard and dissolving along its right edge into a stream of small mint #d1fae5 digital pixels/dots flowing into a clean cream digital card with emerald fields and a green check. A sky-blue #0ea5e9 scan-beam runs down the form. "Paper to data" in one motion. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Financial-statement stack
- **File:** `/public/symbols/solution-financial-docs.png`
- **Where it's used:** financial-documents solution page hero
- **Size:** hero
- **Prompt:** A confident fanned stack of formal financial documents — a balance sheet, a P&L page with a tiny bar-chart, and a multi-column statement — overlapping neatly at slight angles, cream pages with emerald header bars and a sky-blue #0ea5e9 chart accent, the top page bearing a green check. Professional, substantial, "serious finance docs handled." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Products overview montage
- **File:** `/public/symbols/products-overview.png`
- **Where it's used:** products page hero / overview
- **Size:** hero
- **Prompt:** A friendly cluster of AxLiner's core product elements arranged in a loose constellation — a small review board card, a spreadsheet grid, a scanning robot head, a sync loop and a coin stack — all orbiting a central emerald #10b981 spark, connected by faint mint dotted lines. Rich, inviting "everything AxLiner does" overview. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Converter pages

### Photo → Excel grid
- **File:** `/public/symbols/converter-image-to-excel.png`
- **Where it's used:** image-to-excel converter landing
- **Size:** hero
- **Prompt:** A framed photo/picture card with a small mountain-and-sun image glyph on the left, transforming across an emerald #10b981 arrow into a crisp spreadsheet grid on the right with emerald gridlines and a mint #d1fae5 filled cell holding a green check. A couple of mint pixel-dots travel along the arrow. "Picture becomes a table." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Handwritten → Excel
- **File:** `/public/symbols/converter-handwritten-to-excel.png`
- **Where it's used:** handwritten-to-excel converter landing
- **Size:** hero
- **Prompt:** A torn notepad sheet with looping illegible ink scrawls and a stubby pencil on the left, transforming across an emerald #10b981 arrow into a tidy spreadsheet grid on the right with neat emerald rows and one mint #d1fae5 cell with a green check. The messy ink visibly "snaps" into clean cells. "Scribbles become a spreadsheet." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Screenshot frame → table
- **File:** `/public/symbols/converter-screenshot-to-excel.png`
- **Where it's used:** screenshot-to-excel converter landing
- **Size:** hero
- **Prompt:** A browser/app screenshot frame with a top bar and dotted selection corners on the left, transforming across an emerald #10b981 arrow into a clean spreadsheet grid on the right, a small sky-blue #0ea5e9 crop-marquee dissolving into emerald cells with a green check in a mint #d1fae5 cell. "Snip your screen into a table." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### JPG badge → spreadsheet
- **File:** `/public/symbols/converter-jpg-to-excel.png`
- **Where it's used:** jpg-to-excel converter landing
- **Size:** hero
- **Prompt:** A rounded file-format badge with a small generic image glyph and a tiny "JPG" tag on its corner on the left, transforming across an emerald #10b981 arrow into a clean spreadsheet grid on the right with emerald gridlines and a mint #d1fae5 cell holding a green check. (The label "JPG" is allowed.) "Image file becomes data." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### OCR scan-beam over text
- **File:** `/public/symbols/converter-ocr-scan.png`
- **Where it's used:** OCR converter landing
- **Size:** hero
- **Prompt:** A cream document with rows of simple text-strokes being swept by a bright sky-blue #0ea5e9 horizontal scan beam, the strokes above the beam still grey and the strokes below it turning crisp emerald #10b981 as if "recognised," with a tiny green check at the bottom and small mint #d1fae5 reticle corners framing the page. Active OCR reading in progress. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## For accountants

### Friendly accountant at a tidy desk
- **File:** `/public/symbols/accountant-desk.png`
- **Where it's used:** for-accountants page hero
- **Size:** hero
- **Prompt:** A friendly accountant character seated confidently at a tidy desk, emerald cardigan and round spectacles, a neat cream spreadsheet open in front showing a green check, a small organized tray of sorted documents and a calculator beside them, a tiny amber #f59e0b coffee mug. Calm, in-control, professional warmth — "your books, handled." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Bookkeeper hero (standing, confident)
- **File:** `/public/symbols/bookkeeper-hero.png`
- **Where it's used:** for-bookkeepers page hero
- **Size:** hero
- **Prompt:** A confident bookkeeper character standing front-on with arms crossed and a friendly grin, mint shirt and emerald apron-pocket holding a stubby pencil, a small floating spreadsheet card with a green check beside their shoulder and a tidy stack of sorted documents at their feet. Capable and approachable — "the bookkeeper's sidekick." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Practice / multi-client
- **File:** `/public/symbols/practice-multi-client.png`
- **Where it's used:** for-accountants page (practices / multiple clients)
- **Size:** medium
- **Prompt:** A friendly accountant figure in the center with three small client folders fanned out around them, each folder a different accent color (amber, sky-blue, violet) with its own tiny company glyph and a green check, connected by neat mint dotted lines. Organized portfolio energy — "manage every client in one place." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Benchmarks page

### Leaderboard podium
- **File:** `/public/symbols/benchmark-podium.png`
- **Where it's used:** benchmarks page hero
- **Size:** hero
- **Prompt:** A three-step winners' podium with the tallest center block topped by a small cream document card wearing a tiny amber #f59e0b crown/star, the side blocks in mint and emerald holding smaller cards, a soft sky-blue sparkle above the winner. Leaderboard energy about confidence, NOT a numeric accuracy claim. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Trophy
- **File:** `/public/symbols/benchmark-trophy.png`
- **Where it's used:** benchmarks page (best-in-class motif)
- **Size:** medium
- **Prompt:** A cheerful two-handled trophy cup, amber #f59e0b gold bowl with an emerald #10b981 base and a small mint #d1fae5 star on the front, a couple of soft sparkle dots around the rim. Celebratory and confident without any number. "Top of its class." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Test / measuring motif
- **File:** `/public/symbols/benchmark-measure.png`
- **Where it's used:** benchmarks page (methodology / testing)
- **Size:** medium
- **Prompt:** A friendly clipboard checklist beside a simple beaker/measuring flask, the clipboard cream with three emerald check rows and one amber #f59e0b in-progress row, the flask holding mint #d1fae5 liquid with a tiny sky-blue bubble. Methodical "we test it rigorously" energy, about confidence and field-level checks, no percentage. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Blogs, contact & guides

### Quill / article
- **File:** `/public/symbols/blog-quill.png`
- **Where it's used:** blog index hero, article motif
- **Size:** medium
- **Prompt:** An elegant emerald #10b981 quill feather pen poised over a cream article sheet that shows a few neat text-strokes and a small mint #d1fae5 heading bar, a tiny amber ink-dot at the nib. Thoughtful, editorial, "stories and guides." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Contact — envelope + chat bubble
- **File:** `/public/symbols/contact-envelope-chat.png`
- **Where it's used:** contact page hero
- **Size:** medium
- **Prompt:** A friendly cream envelope with an emerald seal slightly overlapping a rounded mint #d1fae5 chat bubble that holds a small emerald check and three sky-blue #0ea5e9 typing dots. Warm, approachable "get in touch / we'll reply." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Guide signpost / map
- **File:** `/public/symbols/guide-signpost.png`
- **Where it's used:** guide / help-center page hero
- **Size:** medium
- **Prompt:** A friendly wooden signpost with three pointing arrow-boards in emerald, mint and amber, each bearing a tiny simple glyph (a folder, a check, a question mark), a small sky-blue compass needle at the base. Helpful, "find your way" wayfinding energy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Lightbulb tip
- **File:** `/public/symbols/guide-lightbulb.png`
- **Where it's used:** tips callouts in guides / blog
- **Size:** inline
- **Prompt:** A cheerful glowing lightbulb with an amber #f59e0b glass dome, an emerald #10b981 base, a tiny mint #d1fae5 filament shaped like a small check, and three short radiating spark-lines. Bright "pro tip" energy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## Dashboard pages

### Dashboard home overview
- **File:** `/public/symbols/dashboard-home.png`
- **Where it's used:** dashboard home / overview empty or header
- **Size:** medium
- **Prompt:** A friendly dashboard card showing a small rising emerald #10b981 bar chart, a tiny sky-blue #0ea5e9 line trend, and a mint #d1fae5 donut segment, with a small green check pill in the corner. Clean analytics-at-a-glance, "here's your day." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Inbox with notification
- **File:** `/public/symbols/dashboard-inbox.png`
- **Where it's used:** dashboard inbox / incoming documents
- **Size:** medium
- **Prompt:** An open document in-tray with two cream sheets freshly arrived inside, an emerald rim, and a small rose #f43f5e notification badge dot at the top-right corner, a tiny mint motion-tick showing something just landed. "New documents waiting." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Companies / office building
- **File:** `/public/symbols/dashboard-companies.png`
- **Where it's used:** dashboard companies / company files
- **Size:** medium
- **Prompt:** A friendly small office building in 3/4 view, mint #d1fae5 facade with deep-emerald #064e3b windows in a tidy grid, an emerald door, and a tiny amber #f59e0b flag on the roof, a small cream file-tab tucked at its base. Professional "company file" energy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Clients / people portfolio
- **File:** `/public/symbols/dashboard-clients.png`
- **Where it's used:** dashboard clients list
- **Size:** medium
- **Prompt:** Three friendly rounded avatar circles overlapping in a row, each a different accent (emerald, sky-blue, amber) with a simple smiling face, the front one wearing a tiny mint #d1fae5 check badge. Warm "your clients" group portrait. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Settings — gear & sliders
- **File:** `/public/symbols/dashboard-settings.png`
- **Where it's used:** dashboard settings page
- **Size:** medium
- **Prompt:** A chunky emerald #10b981 cog gear overlapping a small mint #d1fae5 panel of two horizontal sliders with sky-blue #0ea5e9 knobs, one slider knob mid-adjustment, a tiny amber dot indicator. Tidy "tune your preferences" energy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### History — clock & archive box
- **File:** `/public/symbols/dashboard-history.png`
- **Where it's used:** dashboard history / past jobs
- **Size:** medium
- **Prompt:** A small warm-clay #eadcc8 archive box with a lid and a cream label, a friendly round emerald clock overlapping its front corner with a tiny mint counter-clockwise arrow, one cream document tab peeking out. "Your past runs, archived." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### AP draft bill (stamped DRAFT)
- **File:** `/public/symbols/ap-draft-bill.png`
- **Where it's used:** AP draft bills page, the reviewed-bill state
- **Size:** medium
- **Prompt:** A clean cream bill document with an emerald header bar and neat line-item rows, a bold violet #8b5cf6 diagonal "DRAFT" rubber-stamp imprint across it and a tiny green check in the corner showing it's reviewed and ready to publish (but not yet posted). Professional, "ready as a draft." (Text "DRAFT" allowed.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Draft bills stack ready to publish
- **File:** `/public/symbols/ap-bills-ready.png`
- **Where it's used:** AP draft bills page (batch ready to publish)
- **Size:** medium
- **Prompt:** A neat stack of reviewed bill documents with a small violet "DRAFT" tab on each, the top one lifting slightly toward a generic mint "ledger app" tile via an emerald sync arrow with a green check. Several bills, one motion — "publish the whole batch." (Tab text "DRAFT" allowed.) — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Bank reconciliation — two columns balancing
- **File:** `/public/symbols/dashboard-reconciliation.png`
- **Where it's used:** bank reconciliation view
- **Size:** medium
- **Prompt:** Two cream columns of short entry-strokes side by side, a left column tinted sky-blue #0ea5e9 and a right column emerald #10b981, with little matching dotted lines linking pairs of rows across the gap and a small mint #d1fae5 equals-sign badge in the center showing they balance. Tidy "everything matches" energy. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

---

## More workspace symbols

### Auto-detect magic wand classifier
- **File:** `/public/symbols/workspace-auto-detect.png`
- **Where it's used:** workspace auto-detect / classify documents
- **Size:** medium
- **Prompt:** A friendly violet #8b5cf6 magic wand with an amber #f59e0b star tip waving over a small cream document, sprinkling mint #d1fae5 sparkle-dots, while a tiny emerald type-chip ("invoice / receipt" implied by a small glyph) pops up above it to show it auto-classified the doc. Smart, delightful "it knows what this is." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Per-field source highlight
- **File:** `/public/symbols/workspace-source-highlight.png`
- **Where it's used:** workspace per-field source linking (click a field, see it on the doc)
- **Size:** medium
- **Prompt:** A cream document on the left with one line-item region boxed in a glowing emerald #10b981 highlight, a dotted sky-blue #0ea5e9 connector line arcing across to a single spreadsheet cell on the right that is tinted mint #d1fae5 and holds a green check — showing the extracted value traced back to its exact spot on the source. "See where every number came from." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Vendor memory brain-lightbulb
- **File:** `/public/symbols/workspace-vendor-recall.png`
- **Where it's used:** workspace vendor-memory recall badge (recognised supplier)
- **Size:** inline
- **Prompt:** A small friendly brain in soft emerald and mint with a tiny violet #8b5cf6 lightbulb glowing above it and a single supplier card popping up beside it bearing a green check, two short mint recall-arc lines. Compact "remembered this vendor" badge. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### High-value invoice flag
- **File:** `/public/symbols/workspace-high-value.png`
- **Where it's used:** workspace high-value / large-amount invoice flag
- **Size:** inline
- **Prompt:** A cream invoice with a bold amber #f59e0b banner ribbon across its top corner bearing a small upward coin-stack glyph, and a tiny deep-emerald exclamation dot to say "this one's big — look twice." Compact attention badge for large amounts. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Mark-ready checkmark stamp
- **File:** `/public/symbols/workspace-mark-ready.png`
- **Where it's used:** workspace "mark ready" action on a reviewed doc
- **Size:** inline
- **Prompt:** A wooden-handled rubber stamp in warm clay #eadcc8 pressing down to leave a bold emerald #10b981 circular check imprint on a cream card, a couple of tiny mint ink-splatter dots for energy. Satisfying "marked ready" action. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Drag-and-drop hand
- **File:** `/public/symbols/workspace-drag-drop.png`
- **Where it's used:** workspace drag-and-drop upload hint
- **Size:** medium
- **Prompt:** A friendly cartoon hand pinching and dropping a single cream document down into a mint #d1fae5 dashed drop-zone outline with an emerald up-arrow inside, two short sky-blue motion-ticks trailing the document. Clear "drag your files here" gesture. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Multi-page document stack
- **File:** `/public/symbols/workspace-multipage.png`
- **Where it's used:** workspace multi-page document indicator
- **Size:** inline
- **Prompt:** A small fanned stack of three cream pages clipped together at the top-left with an emerald paperclip, each page slightly offset to show depth, a tiny mint #d1fae5 page-count dot badge in the corner. Clean "this is a multi-page document" indicator. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Multi-currency globe
- **File:** `/public/symbols/workspace-currency-globe.png`
- **Where it's used:** workspace multi-currency handling
- **Size:** inline
- **Prompt:** A friendly emerald-and-sky-blue globe with simple mint #d1fae5 landmass shapes, orbited by three tiny amber #f59e0b coins each showing a different generic currency disc (no specific symbols), a small green check pinned to the front. "Any currency, handled." — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

### Line-items list
- **File:** `/public/symbols/workspace-line-items.png`
- **Where it's used:** workspace line-items panel
- **Size:** inline
- **Prompt:** A clean cream list card with four neat rows, each row a small emerald bullet dot, a short description-stroke and a tiny aligned amount-block on the right, one row tinted mint #d1fae5 with a green check as the "verified" line. Orderly "itemised lines" panel. — [Render as a flat, modern caricature in a friendly editorial-illustration
style: bold clean outlines with consistent medium-thick line weight across the whole set,
slightly exaggerated and playful proportions, a single centered subject viewed at a consistent
3/4 or front-on angle. Use a limited, cohesive AxLiner palette — primary emerald green #10b981,
soft mint #d1fae5, deep emerald #064e3b, with restrained accents of amber #f59e0b, sky blue
#0ea5e9, rose #f43f5e, violet #8b5cf6, warm clay #eadcc8, near-black ink #171717, and
paper-white/cream for documents. Soft, simple flat shading only — no heavy gradients, no
photorealism, no glossy 3D renders. Keep a generous empty margin around the subject. CRITICAL:
fully transparent background, no background, no backdrop color, no drop shadow cast onto the
background, isolated subject, PNG with alpha channel, no text labels unless explicitly
requested, no canvas, no frame, no border. Crisp, confident, characterful — turning chaos into
clean books.]

## Workspace — minimal accounting-code symbols

> **[WORKSPACE MINIMAL STYLE]** — A separate, deliberately *different* family from the playful
> caricatures above. Clean minimal flat / duotone icons with precise geometric line-work and
> generous negative space — the restraint of a premium fintech / accounting icon set (Mercury,
> Ramp, Linear). Restrained and professional: at most subtle depth (a single soft shadow or one
> tonal step), never playful cartoon faces, never heavy outlines used as characters. Palette is
> brand emerald **#10b981** / mint **#d1fae5** / deep emerald **#064e3b** mixed tastefully with
> warm clay **#eadcc8** and deeper browns **#6b4f2e** / **#8a6d46** — either brown-led or
> emerald+brown duotone, kept cohesive across the set. Crisp 2px-feel strokes, rounded joins,
> aligned to a tidy grid. Always transparent background (PNG with alpha), no frame, isolated.

### Nominal account-code tag
- **File:** `/public/symbols/code-account-tag.png`
- **Where it's used:** AP draft-bills queue, on the "account" coding column of a line
- **Size:** inline
- **Prompt:** A minimal price-tag / luggage-tag shape turned sideways, deep-emerald #064e3b outline with a clay #eadcc8 fill, a single small punch-hole eyelet rendered in brown #6b4f2e, and three short horizontal placeholder strokes inside suggesting a code label. Clean geometric, one soft shadow. — [WORKSPACE MINIMAL STYLE]

### "4000" account-code chip
- **File:** `/public/symbols/code-4000-chip.png`
- **Where it's used:** result cards, showing the mapped GL account on a coded line
- **Size:** inline
- **Prompt:** A small rounded-rectangle chip, mint #d1fae5 fill with an emerald #10b981 hairline border, containing the numerals "4000" in deep-emerald #064e3b in a tidy monospaced-feel weight. Flat, balanced padding, faint single drop shadow. — [WORKSPACE MINIMAL STYLE]

### Chart-of-accounts tree
- **File:** `/public/symbols/code-coa-tree.png`
- **Where it's used:** account mapping panel / map-to-account picker
- **Size:** medium
- **Prompt:** A minimal hierarchical tree of small rounded nodes connected by right-angle connector lines, top node in emerald #10b981, child nodes in warm clay #eadcc8 with brown #6b4f2e outlines, connectors in deep emerald. Three tidy levels, lots of negative space. — [WORKSPACE MINIMAL STYLE]

### Account-category chip
- **File:** `/public/symbols/code-category-chip.png`
- **Where it's used:** spend-by-category grouping on result cards
- **Size:** inline
- **Prompt:** A small pill-shaped category chip with a tiny solid emerald #10b981 dot at the left and a short clay #eadcc8 bar to its right inside a deep-emerald hairline outline, suggesting a labelled category. Minimal, duotone, one soft shadow. — [WORKSPACE MINIMAL STYLE]

### Coded ledger line
- **File:** `/public/symbols/code-ledger-line.png`
- **Where it's used:** review board rows, a single coded ledger entry
- **Size:** inline
- **Prompt:** A single horizontal ledger row: a thin brown #6b4f2e baseline, a small left-edge account-code square in emerald #10b981, and three evenly spaced clay #eadcc8 value blocks of varying width to the right. Crisp, flat, generous spacing. — [WORKSPACE MINIMAL STYLE]

### Numbered account badge
- **File:** `/public/symbols/code-account-badge.png`
- **Where it's used:** vendor memory, default account assigned to a supplier
- **Size:** inline
- **Prompt:** A clean circular badge with a deep-emerald #064e3b ring, clay #eadcc8 interior, and a centred "#" glyph in brown #8a6d46. Minimal, perfectly geometric, single subtle shadow. — [WORKSPACE MINIMAL STYLE]

### Cost-centre code
- **File:** `/public/symbols/code-cost-centre.png`
- **Where it's used:** AP draft-bills queue, optional cost-centre coding
- **Size:** inline
- **Prompt:** A minimal concentric target: an outer emerald #10b981 ring, a clay #eadcc8 middle ring, and a solid brown #6b4f2e centre dot, suggesting a cost centre / allocation point. Flat duotone, crisp edges, ample whitespace. — [WORKSPACE MINIMAL STYLE]

### Department code
- **File:** `/public/symbols/code-department.png`
- **Where it's used:** coding panel, department dimension on a line
- **Size:** inline
- **Prompt:** Three minimal stacked rounded bars of decreasing width (an org/department glyph), top bar emerald #10b981, middle clay #eadcc8, bottom brown #6b4f2e outline-only. Tidy left alignment, flat, one faint shadow. — [WORKSPACE MINIMAL STYLE]

### Tax / VAT code chip
- **File:** `/public/symbols/code-vat-chip.png`
- **Where it's used:** Net / VAT / Total breakdown, the VAT-code selector
- **Size:** inline
- **Prompt:** A small rounded chip with mint #d1fae5 fill and emerald #10b981 hairline border containing a tidy "VAT" label in deep-emerald #064e3b beside a tiny clay #eadcc8 square. Minimal, flat, balanced. — [WORKSPACE MINIMAL STYLE]

### "20%" tax-rate tile
- **File:** `/public/symbols/code-rate-20-tile.png`
- **Where it's used:** Net / VAT / Total breakdown, applied tax rate
- **Size:** inline
- **Prompt:** A small rounded square tile, clay #eadcc8 fill with a brown #6b4f2e hairline border, showing "20%" in deep-emerald #064e3b with a clean percent glyph. Flat, single soft shadow, generous padding. — [WORKSPACE MINIMAL STYLE]

### Zero-rated marker
- **File:** `/public/symbols/code-zero-rated.png`
- **Where it's used:** VAT coding, zero-rated lines on the review board
- **Size:** inline
- **Prompt:** A minimal "0%" glyph: a clean emerald #10b981 zero with a small clay #eadcc8 percent mark, set on no background. Hairline strokes, perfectly balanced, restrained. — [WORKSPACE MINIMAL STYLE]

### Exempt marker
- **File:** `/public/symbols/code-exempt.png`
- **Where it's used:** VAT coding, exempt-from-VAT lines
- **Size:** inline
- **Prompt:** A minimal rounded-square outline in brown #6b4f2e with a single diagonal slash through it and a tiny clay #eadcc8 dot, signalling "exempt / not applicable". Flat, geometric, lots of whitespace. — [WORKSPACE MINIMAL STYLE]

### Reverse-charge glyph
- **File:** `/public/symbols/code-reverse-charge.png`
- **Where it's used:** VAT coding, reverse-charge supplies
- **Size:** inline
- **Prompt:** Two minimal curved arrows forming a tight clockwise loop, one arm emerald #10b981 and the other brown #6b4f2e, with a small clay #eadcc8 dot in the centre, suggesting charge reversed onto the buyer. Clean, duotone, subtle. — [WORKSPACE MINIMAL STYLE]

### Debit / credit T-account
- **File:** `/public/symbols/code-t-account.png`
- **Where it's used:** review board, the double-entry preview of a coded line
- **Size:** medium
- **Prompt:** A minimal "T" rule dividing two columns: left column headed with a small emerald #10b981 "Dr" mark, right column with a brown #6b4f2e "Cr" mark, two short clay #eadcc8 value bars beneath each. Deep-emerald baseline, flat, precise. — [WORKSPACE MINIMAL STYLE]

### Journal entry
- **File:** `/public/symbols/code-journal-entry.png`
- **Where it's used:** publish step, the journal that will be posted
- **Size:** medium
- **Prompt:** A minimal bound ledger card with a clay #eadcc8 page, a brown #6b4f2e spine on the left, and three ruled lines where the first cell of each row is an emerald #10b981 account-code square. Flat, one soft shadow, tidy. — [WORKSPACE MINIMAL STYLE]

### Double-entry arrows
- **File:** `/public/symbols/code-double-entry.png`
- **Where it's used:** review board, balance indicator between Dr and Cr
- **Size:** inline
- **Prompt:** Two minimal horizontal arrows pointing toward each other meeting at a centre node, left arrow emerald #10b981, right arrow brown #6b4f2e, centre node a small clay #eadcc8 diamond, expressing balanced double entry. Hairline, flat. — [WORKSPACE MINIMAL STYLE]

### Trial balance
- **File:** `/public/symbols/code-trial-balance.png`
- **Where it's used:** period / close summary on the workspace
- **Size:** medium
- **Prompt:** A minimal two-column list with a short emerald #10b981 total rule under the left column and a matching brown #6b4f2e rule under the right, the two totals aligned to show agreement; values as clay #eadcc8 bars. Clean, restrained, lots of space. — [WORKSPACE MINIMAL STYLE]

### Balanced-books equals
- **File:** `/public/symbols/code-balanced-equals.png`
- **Where it's used:** review board, "books balanced" confirmation
- **Size:** inline
- **Prompt:** A bold minimal equals sign, top bar emerald #10b981 and bottom bar brown #6b4f2e, with a tiny clay #eadcc8 tick tucked at the right, signalling a balanced equation. Flat, geometric, subtle. — [WORKSPACE MINIMAL STYLE]

### Reconciliation match
- **File:** `/public/symbols/code-recon-match.png`
- **Where it's used:** reconciliation surface, matched pair
- **Size:** medium
- **Prompt:** Two minimal columns of small rounded blocks (clay #eadcc8 on the left, mint #d1fae5 on the right) joined by a single emerald #10b981 connector line ending in a small emerald tick, showing two sides reconciled. Flat duotone, precise alignment. — [WORKSPACE MINIMAL STYLE]

### Matched vs unmatched
- **File:** `/public/symbols/code-matched-unmatched.png`
- **Where it's used:** reconciliation, status of a line
- **Size:** inline
- **Prompt:** Two small stacked rows: the top pair joined by an emerald #10b981 link with a tiny tick, the bottom pair offset and broken with a brown #6b4f2e dashed gap, contrasting matched against unmatched. Minimal, flat, clear whitespace. — [WORKSPACE MINIMAL STYLE]

### Clearing glyph
- **File:** `/public/symbols/code-clearing.png`
- **Where it's used:** reconciliation, clearing-account staging
- **Size:** inline
- **Prompt:** A minimal funnel shape narrowing to a point, clay #eadcc8 body with a brown #6b4f2e outline and a single emerald #10b981 droplet exiting the bottom, suggesting items passing through a clearing account. Flat, restrained, one soft shadow. — [WORKSPACE MINIMAL STYLE]

### Account sparkline
- **File:** `/public/symbols/code-account-sparkline.png`
- **Where it's used:** result cards, per-account trend at a glance
- **Size:** inline
- **Prompt:** A single minimal sparkline stroke in emerald #10b981 rising gently across the frame, with one small solid brown #6b4f2e end-dot. No axes, hairline weight, lots of negative space. — [WORKSPACE MINIMAL STYLE]

### Spend-by-category bars
- **File:** `/public/symbols/code-spend-bars.png`
- **Where it's used:** workspace summary, spend grouped by account category
- **Size:** medium
- **Prompt:** Four minimal vertical bars of varying height on a thin brown #6b4f2e baseline, alternating emerald #10b981 and clay #eadcc8 fills, evenly spaced with rounded tops. Flat, tidy, generous padding. — [WORKSPACE MINIMAL STYLE]

### Month-over-month trend arrow
- **File:** `/public/symbols/code-mom-trend.png`
- **Where it's used:** workspace summary, period-over-period movement
- **Size:** inline
- **Prompt:** A minimal upward trend arrow following a short two-segment line, the line in brown #6b4f2e and the arrowhead and final segment in emerald #10b981, with a faint clay #eadcc8 dot at the origin. Hairline, flat, restrained. — [WORKSPACE MINIMAL STYLE]

### Cashflow line
- **File:** `/public/symbols/code-cashflow-line.png`
- **Where it's used:** workspace summary, cash in/out over the period
- **Size:** medium
- **Prompt:** A smooth minimal wave line crossing a thin brown #6b4f2e zero-axis, the portion above the axis filled with a faint mint #d1fae5 and stroked emerald #10b981, the dip below stroked brown #8a6d46. Clean, calm, plenty of whitespace. — [WORKSPACE MINIMAL STYLE]

### Budget-vs-actual gauge
- **File:** `/public/symbols/code-budget-gauge.png`
- **Where it's used:** workspace summary, budget tracking
- **Size:** medium
- **Prompt:** A minimal semicircular gauge arc, the track in clay #eadcc8 and the filled portion in emerald #10b981, with a slim brown #6b4f2e needle pointing just past the midpoint. Flat, geometric, no clutter. — [WORKSPACE MINIMAL STYLE]

### Aging / AP-due timeline
- **File:** `/public/symbols/code-aging-timeline.png`
- **Where it's used:** AP draft-bills queue, due / aging buckets
- **Size:** medium
- **Prompt:** A minimal horizontal timeline with four evenly spaced node dots progressing left to right from emerald #10b981 through clay #eadcc8 to brown #8a6d46, connected by a thin brown baseline, suggesting aging buckets (current → overdue). Flat, restrained. — [WORKSPACE MINIMAL STYLE]

### Variance indicator
- **File:** `/public/symbols/code-variance.png`
- **Where it's used:** review board, variance flag on a coded amount
- **Size:** inline
- **Prompt:** Two minimal stacked chevrons, the upper one emerald #10b981 (favourable up) and the lower one brown #8a6d46 (adverse down), separated by a thin clay #eadcc8 divider line. Compact, flat, balanced. — [WORKSPACE MINIMAL STYLE]

### Extract-field
- **File:** `/public/symbols/code-extract-field.png`
- **Where it's used:** result cards, a parsed/extracted field
- **Size:** inline
- **Prompt:** A minimal dashed clay #eadcc8 capture rectangle with two emerald #10b981 corner brackets and a small brown #6b4f2e value bar pulled out to the side, suggesting a field extracted from a document. Flat, precise, airy. — [WORKSPACE MINIMAL STYLE]

### Confidence tick
- **File:** `/public/symbols/code-confidence-tick.png`
- **Where it's used:** review board, field-level confidence flag
- **Size:** inline
- **Prompt:** A minimal rounded square in mint #d1fae5 with an emerald #10b981 hairline border holding a clean emerald check mark, and a tiny clay #eadcc8 dot at the corner. Flat, single soft shadow, restrained. — [WORKSPACE MINIMAL STYLE]

### Map-to-account
- **File:** `/public/symbols/code-map-to-account.png`
- **Where it's used:** AP draft-bills queue, mapping a line to a GL account
- **Size:** inline
- **Prompt:** A minimal clay #eadcc8 source square linked by a single emerald #10b981 arrow to a small deep-emerald #064e3b account-code chip on the right, expressing "map this to an account". Hairline connector, flat, clean. — [WORKSPACE MINIMAL STYLE]

### Post / publish coded entry
- **File:** `/public/symbols/code-post-entry.png`
- **Where it's used:** publish step, sending coded entries to QuickBooks
- **Size:** medium
- **Prompt:** A minimal coded ledger card (clay #eadcc8 with one emerald #10b981 code square) lifting upward with a single emerald arrow into a small open bracket, suggesting a posted/published entry. Flat, one soft shadow, calm. — [WORKSPACE MINIMAL STYLE]

### Batch counter
- **File:** `/public/symbols/code-batch-counter.png`
- **Where it's used:** inbox / review board header, count of items in the batch
- **Size:** inline
- **Prompt:** Three minimal stacked rounded cards offset like a deck, clay #eadcc8 fills with brown #6b4f2e hairlines, the front card carrying a small solid emerald #10b981 count badge in its corner. Flat, tidy, subtle depth. — [WORKSPACE MINIMAL STYLE]

### Period / close
- **File:** `/public/symbols/code-period-close.png`
- **Where it's used:** workspace, locking / closing an accounting period
- **Size:** inline
- **Prompt:** A minimal calendar-square in clay #eadcc8 with a brown #6b4f2e top binding, overlaid by a small emerald #10b981 closed-padlock glyph at the corner, suggesting a closed period. Flat, geometric, single soft shadow. — [WORKSPACE MINIMAL STYLE]
