export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  supportingImage: string;
  supportingImageAlt: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  authorImageAlt: string;
  keywords: string[];
  intro: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
  takeaway: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-your-best-clients-quietly-leave",
    title: "Why your best clients quietly leave — and how to spot it three months before they do",
    description:
      "Client churn in a bookkeeping practice rarely starts with a complaint. It starts with a quiet shift the firm misses for a quarter. Here is what those early signals look like in 2026.",
    eyebrow: "Client retention",
    date: "May 22, 2026",
    readTime: "8 min read",
    image: "/blogs/tata.png",
    imageAlt: "Bookkeeping team reviewing a client relationship at risk of churn",
    supportingImage: "/subsolution/accounting.jpg",
    supportingImageAlt: "Quiet client account showing reduced engagement over a quarter",
    authorName: "Anna Kowalska",
    authorRole: "Practice growth advisor",
    authorImage: "/testimonials/alex_finn.jpg",
    authorImageAlt: "Anna Kowalska, practice growth advisor",
    keywords: [
      "client retention bookkeeping",
      "accounting firm churn",
      "client churn signals",
      "accounting practice growth 2026",
    ],
    intro:
      "Most firms lose their best clients quietly. There is no angry email, no exit meeting, no formal review. The relationship simply cools — slower replies, shorter messages, a missed quarterly call, a request that quietly moves to another provider. By the time the partner notices, the offboarding letter is already drafted. The hard truth is that churn signals usually appear three months before the client actually leaves, and most practices are not built to catch them.",
    sections: [
      {
        title: "The first signal is in the email thread, not the engagement letter",
        body: [
          "Healthy clients send messy emails. They forward an invoice with a one-line note. They ask a payroll question on Friday afternoon. They tell you something personal — a new hire, a holiday, a tax worry. That informal stream is the real heartbeat of the relationship. When a client is preparing to leave, the email rhythm changes before the financials do. Replies become shorter and more formal. Personal context disappears. The client stops including you on the small stuff and starts treating you like a compliance vendor.",
          "Most firms do not track this because it does not show up on a dashboard. But anyone running a 50-client book can name the three accounts where the tone has shifted. The discipline is to write those names down once a month. A simple list, kept honestly, will surface churn risk earlier than any retention software. The shift is not in the numbers. The shift is in the writing.",
        ],
      },
      {
        title: "The second signal is the question they stopped asking",
        body: [
          "Engaged clients ask forward-looking questions. Should I incorporate. Should I take a dividend now or in January. Should I hire a contractor or an employee. Those questions mean the client sees you as part of their decision making. When a client stops asking forward-looking questions and only asks for documents — the trial balance, last year's return, the export — they are quietly preparing to hand the relationship to someone else. They want their file, clean and current, because they are about to share it.",
          "This is the single most reliable churn signal in a small practice and the one most firms miss. Document requests without context are a tell. The defensive response is to deliver the document and ask a forward-looking question back. Not a sales question. A real one. What changed. What are you planning. If the client engages, the relationship is recoverable. If the reply is polite and brief, the file is already on its way out.",
        ],
      },
      {
        title: "The third signal is your own internal flinching",
        body: [
          "Practice owners know which clients they avoid. The folder you do not want to open on Monday. The name in the inbox that makes you sigh. That flinch is data. It usually means one of three things: the work has drifted from the original scope, the fee has not moved in three years, or the relationship has lost the warmth it had at the start. All three predict churn — but only the first two are usually addressed. The third quietly compounds.",
          "The discipline is to name the flinch out loud, in writing, in a one-page client review every quarter. Not a financial review of the client's books. A relationship review of the engagement. Where has scope crept. Where has the fee fallen behind the work. Where has the relationship gone quiet. Firms that do this find that one honest conversation reopens the door more often than they expect — and that the clients who refuse the conversation were already gone in everything but name.",
        ],
      },
      {
        title: "What the best practices are doing differently in 2026",
        body: [
          "The firms growing well in 2026 are not the ones with the cleanest tech stack. They are the ones treating retention as a deliberate practice. They run a quarterly client temperature check — fifteen minutes per client, no agenda, no upsell, just an honest call. They keep a one-page record of every relationship. They re-price annually, transparently, with reasoning. And they fire the bottom 10 percent every year without apology, which makes room for the relationships they actually want.",
          "None of this is technology. None of it requires new software. It requires the partner to do the unglamorous work of looking at the client list with cold eyes once a quarter. Most firms will not do this. The ones that do will keep the clients that matter, lose the ones that were going to leave anyway, and stop being surprised in December by churn that was visible in September.",
        ],
      },
    ],
    takeaway:
      "The best clients leave quietly because nobody is watching for the quiet signals. A one-page relationship review every quarter catches three months of warning that financial dashboards never will.",
  },
  {
    slug: "end-of-the-timesheet",
    title: "The end of the timesheet: how forward-looking firms are pricing in 2026",
    description:
      "Hourly billing is not dying because it is unfair. It is dying because it punishes the firm for getting faster. Here is what is replacing it inside the practices that are growing.",
    eyebrow: "Pricing trends",
    date: "May 19, 2026",
    readTime: "9 min read",
    image: "/subsolution/accounting.jpg",
    imageAlt: "Accounting partner reviewing a value-based engagement letter",
    supportingImage: "/subsolution/banking.webp",
    supportingImageAlt: "Modern pricing model dashboard for accounting practice",
    authorName: "Tomasz Nowak",
    authorRole: "Practice pricing consultant",
    authorImage: "/testimonials/tom_blomfield.jpg",
    authorImageAlt: "Tomasz Nowak, practice pricing consultant",
    keywords: [
      "value pricing accounting",
      "end of timesheets",
      "accounting firm pricing 2026",
      "fixed fee bookkeeping",
    ],
    intro:
      "The timesheet was invented to bill lawyers in the 1950s. Accounting borrowed it because the alternative felt unscientific. Seventy years later, every honest practice owner knows the problem: the hour is a unit of input, not value, and the more efficient the firm becomes, the less it earns. In 2026, the firms that are growing have stopped tracking hours as a billing instrument. They still track them — for capacity planning — but they have moved billing somewhere else entirely.",
    sections: [
      {
        title: "Why hourly billing punishes the firm that gets better",
        body: [
          "Imagine two bookkeepers. One has refined her month-end process to four hours per client. The other still takes twelve. If both bill at $80 an hour, the efficient one earns a third of the income for the same outcome. The timesheet, presented as fairness, is actually a tax on competence. It rewards slowness and disguises skill as effort. Every junior who learns the work faster than expected gets reprimanded by the billing model, because the value delivered does not change but the invoice does.",
          "The deeper damage is in the client conversation. Hourly bills force a quiet negotiation every month — was this really six hours, did the call need to be that long, can the bookkeeper write off some of it. That negotiation is corrosive. It signals to the client that the work is a meter running and that the firm benefits from inefficiency. No senior partner would say this, but every junior bookkeeper feels it the first time a client questions a line item.",
        ],
      },
      {
        title: "What value pricing actually means in practice",
        body: [
          "Value pricing is not 'guess a number that sounds bigger than the hours.' It is a different conversation entirely. The firm scopes the engagement in writing: what is delivered, when, with what level of involvement. The price is fixed at the start of the year, broken into monthly retainers, and reviewed annually. Scope creep is renegotiated, not absorbed. The client knows the cost. The firm knows the income. The hour disappears from both sides of the conversation.",
          "The hard part is the scoping document. Most practices write engagement letters that are vague by design — the firm protects itself by being broad. Value pricing requires the opposite. Each deliverable is named, each cadence is set, each exception is priced. The work to write this honestly is significant the first time and trivial after the third. Firms that adopt value pricing universally describe the engagement letter rewrite as the moment the practice felt different.",
        ],
      },
      {
        title: "The three pricing tiers that work for a small practice",
        body: [
          "The cleanest structure for a bookkeeping or compliance practice is three tiers — usually called something like Essential, Active, and Advisory. Essential covers monthly close, payroll, sales tax, and the year-end pack. Active adds quarterly advisory calls and a written summary. Advisory adds forecast work, KPI dashboards, and unlimited email access. The price difference is meaningful — often 2x between tiers — and the deliverables are distinct, not bundled.",
          "The decision the client makes is no longer 'how many hours will this take.' It is 'how involved do I want my accountant to be.' That is a much better question. It moves the relationship away from a meter and toward a choice. It also makes upsell honest. A client moving from Essential to Active is not being squeezed. They are choosing more involvement, at a transparent price, with a written scope. Practices report 30 to 50 percent of clients self-select into a higher tier within the first year when the tiering is offered this clearly.",
        ],
      },
      {
        title: "What to do with the hours you still track",
        body: [
          "Stopping hourly billing does not mean stopping time tracking. The best firms still track every hour — internally, for capacity and pricing intelligence, not for the client invoice. The data tells the partner which clients are unprofitable, which junior is bottlenecking, which service lines are mispriced, and where automation has already paid back. The timesheet becomes a management tool instead of a billing instrument, and that is where it was always more useful.",
          "The transition is rarely smooth. Long-tenured clients will resist the change at first because hourly bills, despite being worse for them, feel safer. The firms that succeed give clients a written before-and-after comparison: same scope, same deliverables, fixed price replacing variable invoices, no surprises. Most clients agree within one cycle. The ones who refuse to move are usually the ones whose hours were under-priced anyway, and losing them is part of the cleanup.",
        ],
      },
    ],
    takeaway:
      "The timesheet is leaving the billing conversation because it taxes competence and signals the wrong incentives. The firms that price the scope instead of the hour are quietly outearning the ones that did not change.",
  },
  {
    slug: "bookkeeper-at-9pm-on-sunday",
    title: "What being a bookkeeper actually looks like at 9pm on a Sunday",
    description:
      "The public version of bookkeeping is a clean dashboard. The private version is a Sunday-night batch of receipts, a client message at 9pm, and a quiet anxiety about the month-end on Wednesday. This is the part that nobody writes about.",
    eyebrow: "Daily life",
    date: "May 14, 2026",
    readTime: "7 min read",
    image: "/subsolution/backoffice-automation.webp",
    supportingImage: "/subsolution/healthcare.jpg",
    supportingImageAlt: "Mid-week backlog of bookkeeping work waiting for review",
    imageAlt: "Solo bookkeeper finishing a client batch on a Sunday evening",
    authorName: "Marek Zielinski",
    authorRole: "Solo bookkeeper, twelve years",
    authorImage: "/testimonials/alvaro_cintas.jpg",
    authorImageAlt: "Marek Zielinski, solo bookkeeper for twelve years",
    keywords: [
      "bookkeeper life",
      "solo bookkeeper workload",
      "bookkeeping burnout",
      "small practice realities",
    ],
    intro:
      "The conferences and the LinkedIn posts do not tell you this part. They show a partner in a clean office with a coffee, talking about advisory services and tech stacks. The reality of running a small bookkeeping practice in 2026 is closer to a Sunday evening at the kitchen table, finishing one last client's receipts because Monday is already overbooked. That gap — between how the profession is presented and how it is actually lived — is worth naming honestly.",
    sections: [
      {
        title: "The week does not end on Friday",
        body: [
          "A bookkeeper running thirty to fifty clients does not finish on Friday. The week ends when the inbox is at a stopping point — and the inbox is never at a stopping point during the first week of a month. The Sunday-evening shift is not a sign of poor planning. It is a structural feature of running a small practice where the month-end cliff hits everyone at the same time, the deliverables are not optional, and the client expects the report to land on the second business day even though the client only sent the bank feed on the first.",
          "The bookkeepers who burn out in this profession are not the ones who work hard. They are the ones who pretend they do not have to. The Sunday session is not a confession. It is the job. The healthier framing is to plan for it: a defined window, a specific scope, a real break afterward. Pretending it does not happen is what makes it spread into the rest of the week.",
        ],
      },
      {
        title: "The client message at 9pm",
        body: [
          "Some clients message at 9pm. Not many, but enough to matter. The instinct is to reply quickly, because the relationship feels personal and the work is small. That instinct is what destroys the boundary. Once a client learns the bookkeeper replies in the evening, they will message in the evening — not because they are demanding but because they are also working in the evening and the bookkeeper is the only professional service they can reach.",
          "The fix is not to set an out-of-office. The fix is to be unreachable for three hours a day, reliably, without explanation. No reply. Not even a 'will get back to you tomorrow.' Silence at night, replies in the morning. Clients adjust within a week. The bookkeepers who do this universally report that no client has ever left over it, and that the evening work that does happen is now done without interruption, which is what made it possible to do at all.",
        ],
      },
      {
        title: "The Wednesday month-end anxiety",
        body: [
          "Every small practice has a Wednesday month-end where four or five clients close at once. The anxiety starts on Sunday. The plan looks workable on paper and falls apart the moment one bank feed breaks or one client sends receipts late. That anxiety is not a weakness. It is the cost of a deliverable model that compresses fifty firms' month-ends into the same three days. The way out is not better time management. The way out is staggering the deliverable dates across the month with client agreement.",
          "Practices that do this — moving five clients to a 10th close, five to a 15th, five to a 20th — describe the change as the largest single quality-of-life improvement they have made in years. Clients almost never resist, because the deliverable date is meaningful only to the bookkeeper. The board meeting was always going to be later than that. The conversation feels uncomfortable at first and becomes routine within two cycles. The Wednesday anxiety becomes a Monday-Tuesday-Wednesday-Thursday-Friday rhythm where no single day carries the full month.",
        ],
      },
      {
        title: "What separates the practices that last",
        body: [
          "The bookkeepers still in the profession at year fifteen are not the ones with the most technical skill. They are the ones who built a practice that does not require Sunday evenings as a structural feature. That usually means fewer clients than the spreadsheet would suggest, higher fees than felt comfortable when set, written scope on every engagement, and a willingness to fire the bottom 10 percent every year. It is not a glamorous formula. It is just what works when the work is real.",
          "The profession will keep adding tools, integrations, AI features, and dashboards. None of those change the Sunday evening unless the underlying practice is built to not need it. Software does not save a practice that overbooks itself. It just helps an overbooked practice run slightly faster toward burnout. The discipline is older than any tech stack: scope honestly, price for the scope, deliver on time, and be unreachable at night. Everything else is the marketing layer.",
        ],
      },
    ],
    takeaway:
      "The Sunday-evening shift is not a personal failing. It is the structural cost of an overbooked practice. The fix is not productivity. It is fewer clients, higher fees, written scope, and three reliable hours of silence every night.",
  },
  {
    slug: "what-stays-human-in-bookkeeping",
    title: "AI is changing what 'bookkeeping' means — what stays human in 2026",
    description:
      "Half the work bookkeepers did five years ago is being automated away. The other half is becoming more important, and harder to hire for. Here is the line, and why it matters for the firms staying ahead.",
    eyebrow: "Profession in 2026",
    date: "May 9, 2026",
    readTime: "10 min read",
    image: "/blogs/cardo.svg",
    imageAlt: "Illustration of automated bookkeeping workflow handing off to a human reviewer",
    supportingImage: "/subsolution/banking.webp",
    supportingImageAlt: "Modern accounting practice working alongside AI tooling",
    authorName: "Piotr Wozniak",
    authorRole: "Senior practice strategist",
    authorImage: "/testimonials/catalin.jpg",
    authorImageAlt: "Piotr Wozniak, senior practice strategist",
    keywords: [
      "AI in bookkeeping",
      "future of accounting profession",
      "automation bookkeeping 2026",
      "human work in accounting",
    ],
    intro:
      "The honest version of the AI-and-accounting conversation is not that the profession is disappearing. It is that the profession is splitting. The data-entry layer is being automated faster than most firms acknowledge. The judgment layer is becoming more valuable than the firms have priced. The bookkeepers who will own the next decade are the ones who can describe the difference clearly — to themselves, to their juniors, and to their clients.",
    sections: [
      {
        title: "What is genuinely being automated",
        body: [
          "Bank feed categorisation, invoice extraction, expense matching, basic reconciliation, payroll calculation, simple compliance filings — these are no longer human work in any well-run practice. They were human work in 2020. They are software work in 2026, and a junior bookkeeper trained primarily on these tasks is now training on tasks that the software does faster, cheaper, and with better audit trail. The honest answer to 'are these skills still valuable' is: they are necessary but no longer differentiating.",
          "The firms still billing for these tasks at human rates are surviving on relationships, not value. That is a fragile position. The clients eventually notice — usually when a younger competitor demonstrates the same output for a third of the fee. The defensive move is not to keep charging for what is being automated. It is to move up the work and reprice the engagement around the layer that stays human.",
        ],
      },
      {
        title: "What is becoming more human, not less",
        body: [
          "Several parts of bookkeeping are becoming more human and more valuable, not less. The first is judgment on edge cases — the receipt that does not match a vendor, the journal entry that needs a human to decide which account, the transaction that is technically correct and operationally suspicious. AI tools surface these faster than ever, which means a bookkeeper spends less time finding the problem and more time deciding what it means. That is judgment work. It does not scale by adding more software.",
          "The second is the client conversation. The board-meeting prep, the 'should I incorporate' question, the 'are we hiring too fast' worry. Clients are increasingly bringing these to their bookkeeper because their bookkeeper is the only outside advisor who actually sees the numbers every month. Software does not have that relationship. It cannot. And the value of that relationship has gone up sharply because the surrounding work has been automated — the bookkeeper now has more time per client, and that time is what the client is really paying for.",
        ],
      },
      {
        title: "The trap of trying to automate the relationship",
        body: [
          "A common mistake in 2026 is to take the time freed by automation and pour it back into more clients at the same fee. That is the wrong move. The market is moving in the opposite direction. Clients are paying more per relationship and expecting fewer transactional interactions. The firms doing well are running smaller books at higher fees, with more time per client, not larger books at flat fees. That requires a pricing change before it requires a staffing change.",
          "The other trap is using AI tooling as a marketing veneer without changing the underlying engagement. A firm can buy every tool, automate every workflow, and still bill hourly for the time the tools removed. The client sees the tools, sees the bill, and quietly looks for an alternative. The internal restructuring — pricing, scope, deliverables — has to happen alongside the tool adoption, or the tools become an unpaid productivity gift to the client.",
        ],
      },
      {
        title: "What the next five years probably look like",
        body: [
          "The 2030 picture is not 'no bookkeepers.' It is fewer bookkeepers, paid more per relationship, doing less of the data work and more of the judgment work. The juniors entering the profession now will spend almost no time on categorisation. They will spend time on review, on client communication, on edge cases, on understanding the business they serve. That requires a different training arc, a different career ladder, and a different conversation with the client about what the firm actually does.",
          "Firms preparing for this are doing three things now. They are repricing engagements around judgment and advisory, not throughput. They are training juniors on client conversation from year one, not year five. And they are letting go of clients who only want a data-entry service, because those clients will leave for software within two years anyway and the relationship was never going to deepen. None of this is dramatic. It is just the quiet restructuring of a profession that is being remade in plain view.",
        ],
      },
    ],
    takeaway:
      "The bookkeepers winning the next decade are not the ones with the most tools. They are the ones who priced the judgment layer, let the automation handle the throughput, and built relationships that software cannot replicate.",
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
