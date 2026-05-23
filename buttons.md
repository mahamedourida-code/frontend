# Button Surface Prompts

## Generation Rules

- Generate blank button surfaces only. Add every label and icon later in Figma or code.
- Export as `PNG` with real alpha transparency. The canvas outside the button must be fully transparent: no white background, no colored panel, no floor, no checkerboard pattern drawn into the image.
- Keep one consistent family: straight front view, horizontal pill rectangle, centered, ratio about `3.4:1`, polished 2D interface surface with restrained depth.
- Keep empty space inside the button for text and optional icons. No letters, symbols, logos, UI cards, or cursor.
- Use the generated result as the visual reference for a reusable component; normal product states should still be implemented with CSS/Figma components.

## Primary Buttons

### 1. Green Primary Action

Use for: `Try it`, `Upload`, `Convert files`, `Start conversion`, `Continue`.

```text
Generate one blank premium SaaS primary button surface only, exported as a transparent PNG with real alpha transparency. The button is a wide horizontal pill rectangle, straight front view, approximately 3.4 to 1 width-to-height ratio, with smooth 14-pixel-style corner rounding and clean symmetric proportions. Fill it with a rich emerald green based on #079765, gently brighter through the upper third and slightly deeper at the bottom edge. Add a very thin soft white reflected highlight just inside the upper border, a restrained inner shading line along the bottom, and a subtle diffuse shadow directly under the button that fades into transparency. The finish should look polished and tactile, similar to a carefully designed modern SaaS call-to-action, not plastic, not neon, not glassmorphism. Leave the entire center empty for a white label and optional small icon to be placed later. No text, no icon, no surrounding interface. Everything outside the button, including around the shadow, must be transparent alpha, with no visible background.
```

### 2. Charcoal Account Action

Use for: `Sign up`, signed-in `Dashboard`, `Go to workspace`.

```text
Generate one blank premium account-action button surface only, exported as a transparent PNG with real alpha transparency. Use a wide horizontal pill rectangle in near-black charcoal #0B111D, front-facing and centered, approximately 3.4 to 1 ratio with refined rounded corners. The surface should have a subtle graphite gradient: softly lifted near the top and denser toward the lower edge. Add a narrow pale reflection inside the upper rim, a barely visible inset contour, and a clean low shadow fading into transparency. It should feel confident, quiet, and expensive, suited to a login or dashboard entry button in a professional product. Keep the center fully blank for a white text label to be added in Figma. No text, no logo, no icon, no border frame, no surrounding page. The entire canvas outside the button must be transparent alpha, not white.
```

### 3. Lime Upgrade Action

Use for: `Upgrade`, `Buy credits`, `Increase limits`.

```text
Generate one blank premium upgrade button surface only, exported as a transparent PNG with true alpha transparency. Create a wide rounded pill rectangle, front view, about 3.4 to 1 ratio. Use a fresh lime-green base close to #D4FF6F, with a soft almost-ivory highlight across the upper edge and a controlled green-lime depth at the lower edge. Give it the attractive lifted finish of a paid-plan call-to-action: smooth, bright, noticeable, but not glowing or childish. Add a shallow soft shadow underneath that remains transparent around it. The middle must be blank and calm for a dark label added later. No text, no icon, no price, no surrounding card, no background rectangle. Everything outside the button must be fully transparent alpha.
```

### 4. Reviewed Batch Download Action

Use for: `Download reviewed batch`, `Download corrected files`.

```text
Generate one blank premium final-action button surface only, exported as a transparent PNG with real alpha transparency. Build a wide pill rectangle in deep charcoal #0B111D with the same proportions and corner radius as the green primary button. Add one restrained emerald detail: a hairline #18E399 accent embedded along the lower inside edge, stopping before both rounded corners. Use a fine white upper reflection and a soft controlled shadow beneath the shape. The surface should communicate a completed, dependable export action, not a destructive action and not a decorative hero element. Leave the center empty for a white label and an optional small download icon added in code. No generated text, no icon, no file image, no UI around it. The exterior canvas must be entirely transparent alpha.
```

## Everyday Buttons

### 5. Neutral Secondary Button

Use for: `Browse files`, `Manage billing`, `View history`, `Convert another batch`.

```text
Generate one blank secondary SaaS button surface only, transparent PNG with real alpha transparency. Use a horizontal rounded rectangle with the same radius family as the primary button, but slightly less height and visual weight. The fill is clean off-white #FFFFFF with a very thin cool-gray border #DFDFDF, a faint top highlight, and an extremely soft shadow below. It should look precise and clickable against either a white or pale neutral page, without competing with the primary green action. Keep the center completely empty for dark text and an optional icon added later. No text, no symbols, no outer card, no backdrop. Everything outside the button is transparent alpha.
```

### 6. Compact Toolbar Button

Use for: `Last modified`, file view switcher, filters, date range, export menu.

```text
Generate one blank compact toolbar button surface only, exported as a transparent PNG with real alpha transparency. Create a low-height horizontal rounded rectangle, wider than it is tall, with subtle 10-pixel-style rounding. Use a nearly white fill, a crisp light-gray one-pixel-style border, no strong gradient, and only a tiny diffuse shadow so it feels like a modern productivity dashboard control. Leave comfortable blank horizontal padding for a short dark label and a chevron or icon inserted later. No content, no symbols, no selected state, no surrounding toolbar. The entire area outside the button must be transparent alpha.
```

### 7. Selected Segment Button

Use for: active state in `Monthly / Annual`, `Table output / Text output`, or view-mode switches.

```text
Generate one blank selected-segment pill surface only, exported as a transparent PNG with true alpha transparency. Use a compact softly rounded capsule with a pale mint fill derived from #18E399 at very low intensity, a precise emerald inner edge, and almost no shadow. It must feel like a quiet selected option inside a segmented control, not a main call-to-action. Keep the surface blank for dark text added later. No parent container, no second segment, no text, no icon, no background panel. Everything outside the selected capsule must be fully transparent alpha.
```

### 8. Danger Confirmation Button

Use for: `Delete`, `Revoke share`, or irreversible confirmation only.

```text
Generate one blank restrained danger button surface only, exported as a transparent PNG with real alpha transparency. Use the same rounded proportions as a secondary button, with a muted warm-red fill close to #CA3214, a softly brightened upper edge, and a minimal lower shadow. Keep it serious and controlled, suitable for a confirmation dialog, not alarmingly saturated. The center stays blank for a white label added later. No warning icon, no text, no surrounding dialog, and no background. Everything outside the button must be fully transparent alpha.
```

## Button Hierarchy Suggestions

1. Use the **green primary** only for the main task on a screen: upload or convert.
2. Use the **charcoal action** for account entry and workspace navigation, not for routine operations.
3. Show the **lime upgrade** only when the user is near a limit, has exhausted credits, or is evaluating plans.
4. Use the **reviewed batch download** only after files have been inspected or corrected; it should feel like the completion action.
5. Keep browsing, filters, history, billing management, sorting, and retry actions in the **neutral secondary** or **toolbar** styles.
6. Use selected-segment styling for modes and billing cycles; do not turn mode choices into competing green CTA buttons.
7. Keep destructive actions visually separate and uncommon; they should never look like the normal conversion path.
