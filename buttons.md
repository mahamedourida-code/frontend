# Button Asset Prompts

## Generation Rules

- Use generated assets only for signature buttons. Build normal navigation, filters, cancel, sort, settings, menu controls, and unapproved symbols in Figma/code.
- Do not generate words inside buttons. Leave a clean empty center for text such as `Try it`, `Dashboard`, or `Upgrade` to be added in Figma.
- Button output: isolated horizontal button surface with a fully transparent background outside the button, exported as PNG with alpha transparency, 2048 x 1024, centered, generous clear margin, no surrounding UI.
- Do not generate mode symbols yet. Any future symbol must be an isolated object with a fully transparent background, never a colored backing square or card.
- Button palette: deep green `#079765`, bright accent `#18E399`, lime upgrade accent `#D4FF6F`, charcoal `#0B111D`, neutral white.

## Key Button Surfaces

### 1. Primary Conversion Button

Use for: `Try it`, `Upload`, `Convert files`, `Start conversion`.

```text
Create a single blank horizontal SaaS call-to-action button surface, no text and no icon. Wide pill-rounded rectangle with a polished AxLiner green finish: deep emerald base #079765, slightly brighter green upper edge, subtle white reflected highlight along the top inner rim, very soft lower shadow, crisp vector-like 2D rendering. The button should feel premium and reliable, not playful, not glassy neon. Straight front view, no perspective, no UI around it. Leave the center entirely blank for typography to be added later in Figma. Everything outside the button must be fully transparent with alpha transparency, not white and not a checkerboard drawn into the image. Export as a transparent PNG.
```

### 2. Account / Dashboard Button

Use for: `Sign up`, signed-in `Dashboard`.

```text
Create a single blank horizontal SaaS action button surface, no text and no icon. Wide pill-rounded rectangle in near-black charcoal #0B111D with a refined dark graphite upper gradient, thin pale reflected highlight on the upper inside edge, subtle inset depth and a clean small shadow below. It should look precise and confident, like a premium productivity product login action. Front view, large clear margin, no surrounding interface, center kept blank for a text label added in Figma. Everything outside the button must be fully transparent with alpha transparency, not white and not a checkerboard drawn into the image. Export as a transparent PNG.
```

### 3. Upgrade / Credits Button

Use for: `Upgrade`, `Buy credits`, quota reached prompts.

```text
Create a single blank horizontal upgrade button surface for a professional SaaS product, no text and no icon. Wide rounded rectangle in fresh lime-green: main fill #D4FF6F, lighter almost-white lime reflection across the top edge, gentle green-yellow depth toward the bottom, clean soft shadow. The result should feel valuable and inviting, not fluorescent or childish. Front view with generous clear margin, blank center ready for typography in Figma. Everything outside the button must be fully transparent with alpha transparency, not white and not a checkerboard drawn into the image. Export as a transparent PNG.
```

### 4. Reviewed Batch Download Button

Use for: the important post-review action `Download reviewed batch`.

```text
Create a blank wide action button surface for exporting a completed reviewed batch, no text. Use a dark charcoal base #0B111D, with a very thin emerald #18E399 accent line embedded along the lower edge and a restrained white upper highlight. Include one tiny empty reserved area at the left for an export symbol to be placed later, but do not draw an icon. The mood is final, secure, and professional. Front view, no UI context, no glow. Everything outside the button must be fully transparent with alpha transparency, not white and not a checkerboard drawn into the image. Export as a transparent PNG.
```
