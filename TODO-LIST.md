# TODO-LIST

## 0. Project Setup

- [x] Clone `git@github.com:JackyHQH/geme-two.git` into `/Users/hongqinghan/game-two`.
- [x] Confirm the repository is nearly empty and ready for a new Cocos project.
- [x] Add the first project planning document.
- [x] Add project overview diagram at `docs/overview.svg`.
- [ ] Confirm the target Cocos Creator version.
- [ ] Open the project in Cocos Creator and let the editor generate required `.meta` files.
- [ ] Configure the WeChat Mini Game build target.
- [ ] Verify preview in Cocos Creator.
- [ ] Verify build output in WeChat DevTools.

## 1. First Playable Core

- [x] Build a pure TypeScript board model with no Cocos dependency.
- [x] Support a fixed 6x6 grid.
- [x] Support placing the current piece into an empty cell.
- [x] Detect 3-or-more connected matching pieces.
- [x] Merge matched pieces into the next-level piece.
- [x] Resolve chain merges until the board is stable.
- [x] Support advanced-quality merge output for 4-or-more matches.
- [x] Apply x2 scoring when an advanced-quality piece is consumed in a merge.
- [x] Track score, turn count, next piece, and game-over state.
- [x] Add a text-only Cocos controller for early playtesting.
- [x] Add core logic tests.
- [ ] Wire the controller into a Cocos scene in the editor.
- [x] Add restart and one-step undo buttons.
- [ ] Add pause button behavior.

## 2. Original Game Design

- [ ] Pick the final original theme.
- [x] Finalize the first merge chain: 草地 → 花丛 → 小树 → 木屋 → 小院 → 小镇 → 城堡.
- [x] Define first spawn distribution: 草地 80%, 花丛 15%, 小树 4%, 木屋 1%.
- [ ] Balance the difficulty curve after playtesting.
- [ ] Define special pieces such as clear, wildcard, obstacle, and enemy pieces.
- [x] Define the first advanced-quality piece rule.
- [ ] Balance scoring, combo rewards, and game-over pacing.

## 3. UI And Interaction

- [x] Build the first unified portrait mobile layout.
- [x] Show score, best score, turn count, current piece, and next piece.
- [x] Add first-pass touch feedback and status messages for invalid cells.
- [x] Switch board and button taps to direct Cocos node events for reliable placement.
- [x] Tighten first-screen layout to avoid overlapping HUD, board, and bottom controls.
- [ ] Add game-over and restart flows.
- [ ] Add settings for music and sound effects.
- [x] Add sound-effect mute toggle with local persistence.
- [x] Add AI bitmap start menu with 6x6, 7x7, and 8x8 mode selection.
- [x] Add bear-mode menu toggle as a saved option without gameplay logic yet.
- [x] Implement bear mode gameplay: bear spawn cadence, random movement, blocked tombstone conversion, tombstone merge, and money-bag collection.
- [x] Add local best-score storage.

## 4. Art And Audio

- [x] Record external source audio directory: `/Users/hongqinghan/sounds`.
- [x] Save generated UI mockup reference at `docs/reference/ui-mockup.png`.
- [x] Add the first UI graphic library at `assets/art/ui`.
- [x] Apply the first UI kit to the Cocos runtime interface.
- [x] Regenerate the UI kit toward the user-provided fairy-tale town reference image.
- [x] Generate a separated fairy-tale UI asset set at `assets/art/generated-ui`.
- [x] Generate AI bitmap UI source sheets and cropped PNG assets at `assets/art/ai-ui`.
- [x] Generate AI bitmap bear idle/walk frames, tombstone, money bag, and start-menu art.
- [x] Wire AI bitmap menu, component, and piece PNGs into the Cocos runtime UI.
- [x] Import source audio files into `assets/resources/audio`: `place.wav`, `select.wav`, `click.wav`, `merge.wav`, `levelup.wav`.
- [ ] Replace text pieces with original placeholder icons.
- [ ] Create final original piece art.
- [ ] Add board, background, and UI styling.
- [x] Add place, select, click, merge, and level-up sounds.
- [ ] Add missing invalid and game-over sounds if needed.
- [x] Add first-pass placement, merge, and invalid-click animations.
- [x] Add runtime advanced-piece aura and star-badge UI.
- [x] Add bear movement frame animation and money-bag collection feedback.
- [ ] Add score popups and richer chain-merge animation.

## 5. WeChat Mini Game

- [ ] Configure mini game metadata.
- [ ] Check package size and resource loading.
- [ ] Test on WeChat DevTools.
- [ ] Test on real devices.
- [ ] Add optional share flow.
- [ ] Add optional leaderboard.
- [ ] Add optional rewarded ad hook.

## 6. Quality

- [x] Expand tests for one-step undo and merge rollback.
- [ ] Expand tests for edge cases and random generation.
- [x] Start a device and screen-ratio QA checklist at `docs/quality-checklist.md`.
- [ ] Test all common screen ratios.
- [ ] Profile performance on lower-end phones.
- [ ] Prepare icon, screenshots, description, privacy policy, and release notes.

## 7. Release Preparation

- [x] Start release checklist at `docs/release-checklist.md`.
- [ ] Prepare WeChat Mini Game app metadata.
- [ ] Prepare app icon and store screenshots.
- [ ] Draft privacy policy and release notes.
