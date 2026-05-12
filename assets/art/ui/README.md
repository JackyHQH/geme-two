# Childhood Town Fairy UI Kit

This folder keeps the visual source for the first playable UI.

- `style-tokens.json`: palette, dimensions, named components, and piece list.
- `ui-kit.svg`: vector reference for the fairy-tale town style: wood sign, ribbons, cream cards, board cells, buttons, and piece icons.
- The current direction is based on the user-provided reference image in the conversation.
- Advanced pieces use the same base icon as their normal level, plus a warm gold aura and top-right star badge. They match as normal pieces, and score x2 when consumed in a merge.

Runtime application currently happens in `assets/scripts/ui/theme/UiTheme.ts` and `assets/scripts/ui/GameController.ts` using Cocos `Graphics` and `Label`, so the MVP can run before final image assets are imported.
