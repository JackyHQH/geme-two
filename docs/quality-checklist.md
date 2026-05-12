# Quality Checklist

## Interaction

- [x] Single tap places the current piece into an empty cell.
- [x] Occupied cells reject placement and show feedback.
- [x] Undo restores the previous full game state and can only be used once per move.
- [x] Sound toggle persists the muted state locally.
- [ ] Game-over state blocks further placement and shows restart guidance.
- [ ] Pause state blocks board input.

## Screen Ratios

- [ ] 750 x 1334 design resolution.
- [ ] iPhone SE style narrow portrait.
- [ ] iPhone Pro Max style tall portrait.
- [ ] Common Android 20:9 portrait.
- [ ] WeChat DevTools simulator.
- [ ] Real device smoke test.

## Performance

- [ ] No visible frame drop during placement.
- [ ] No visible frame drop during chain merges.
- [ ] Audio loads once and reuses clips.
- [ ] Resource package size checked before WeChat build.
