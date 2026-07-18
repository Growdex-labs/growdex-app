# AI Campaign Workspace Scale Design QA

**Comparison target**

- Source visual truth path: `/var/folders/61/_gpbs9bd52vgc9hwvjtng_pm0000gn/T/codex-clipboard-f6f65f1b-644f-4e35-8c20-200d03a644ca.png`
- Implementation URL: `http://localhost:4000/panel/campaigns/new`
- Implementation screenshot path: `/private/tmp/growdex-ai-workspace-scale-final.jpg`
- Viewport: the 2664 × 3012 source is a 144-DPI capture of a 1332 × 1506 CSS-pixel desktop viewport. The implementation was captured at exactly 1332 × 1506 CSS pixels.
- State: signed-in desktop, AI creation selected, empty campaign, starter suggestions visible.

**Full-view comparison evidence**

- Side-by-side comparison: `/private/tmp/growdex-ai-workspace-scale-comparison.jpg`
- The implementation preserves the source's navigation, campaign tree, tracker, campaign-name field, dotted canvas, empty-state message, assistant helper, starter actions, and prompt positions while increasing their usable visual scale.

**Focused region comparison evidence**

- Top and center comparison: `/private/tmp/growdex-ai-workspace-scale-focused-comparison.jpg`
- The focused comparison confirms that the campaign tree, seven-step tracker, campaign input, empty-state heading, helper copy, and assistant text are larger without clipping or changing the screen hierarchy.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: the step tracker is now 12px, campaign input 16px, empty-state heading 30px, assistant helper 16px at wide desktop, and decision results 16px. Weight, line height, wrapping, and the existing Growdex font family remain consistent.
- Spacing and layout rhythm: the AI campaign tree grows to 208px at wide desktop and 176px at standard desktop. The tracker keeps all seven steps visible at wide desktop and scrolls safely at narrower desktop sizes. The original empty-state position and canvas structure are preserved.
- Colors and visual tokens: khaki campaign selection, violet AI accents, pale assistant surfaces, dark navigation, muted steps, and dotted canvas are unchanged.
- Image quality and asset fidelity: the existing Growdex logo and gradient sparkle assets remain unchanged and sharp. Standard controls continue to use the project's icon library.
- Copy and content: all product copy is unchanged; only scale, line length, and spacing were adjusted.
- Responsive behavior: at 1078px, the page has a 176px campaign tree and 287px assistant with no document overflow. At 390px, the assistant remains visible and the document has no horizontal overflow.

**Comparison history**

1. Reported state — source screenshot above.
   - Earlier finding: P1, the entire AI workspace used the compact scale originally introduced to match a downscaled Figma reference. The tree was 112px, step labels were 7–8px, the campaign input was 14px, decision actions were 10–12px, and assistant helper text was 12px.
2. Final state — `/private/tmp/growdex-ai-workspace-scale-final.jpg`.
   - Fixes made: enlarged the campaign tree, all step labels, campaign input, empty/loading/clarification states, decision rows and actions, assistant messages and options, starter actions, prompt field, send button, and approval control as one coordinated scale system.
   - Post-fix evidence: measured wide-desktop values are a 208px tree, 319px assistant card, 12px step labels, 16px input and assistant helper, and 30px empty-state heading. All seven step labels remain visible.

**Primary interactions tested**

- Selecting “Create with AI” opens the rescaled empty workspace.
- Typing a campaign prompt enables the larger send control; clearing it disables sending again.
- Desktop and mobile layouts retain the assistant and avoid horizontal overflow.
- App browser console errors checked: none. One unrelated wallet-extension injection error was excluded because it originated from a `chrome-extension://` URL, not Growdex.

**Implementation Checklist**

- [x] Increase the campaign tree and keep labels readable.
- [x] Increase all seven tracker labels without hiding steps at wide desktop.
- [x] Increase campaign input and empty/loading/clarification content.
- [x] Increase AI decision rows, actions, assistant messages, suggestions, prompt, and send control.
- [x] Verify 1332px, 1078px, and 390px viewport behavior.
- [x] TypeScript, lint, unit tests, interaction checks, and app console check passed.

**Follow-up Polish**

- No P3 polish is required for handoff.

final result: passed
