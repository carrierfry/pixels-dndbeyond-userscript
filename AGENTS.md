# AGENTS.md

This document is the single source of truth for AI coding agents working in this
repository. Read it fully before making changes.

## 1. What this project is

A browser integration that lets players use physical **Pixels** Bluetooth dice
(<https://gamewithpixels.com/>) on **D&D Beyond** (<https://www.dndbeyond.com/>).
It is shipped in two forms that share essentially the same logic:

1. **Tampermonkey userscript** — `pixels-dndbeyond.user.js` at the repo root.
   Loaded via `@require` of the Pixels UMD bundles from unpkg. Auto-updates
   from the `main` branch of `carrierfry/pixels-dndbeyond-userscript`.
2. **Chrome extension (MV3)** — `chrome_extension/`. Bundles the same Pixels
   UMD libraries locally in `chrome_extension/lib/` and ships `content.js`,
   which is `pixels-dndbeyond.user.js` minus the `==UserScript==` header block.

> **The two entry points must stay in sync.** `content.js` is the userscript
> body with the 22-line userscript header stripped and the external `@require`
> URLs replaced by local `lib/*.js` files referenced from `manifest.json`.
> When you change logic in one, change the other the same way. The version
> strings in the userscript header, `manifest.json`, and any release commit
> messages should also match (current: `1.0.4.1`).

Supported pages (from `@match` / manifest `matches`):
- `https://www.dndbeyond.com/characters/*`
- `https://www.dndbeyond.com/combat-tracker/*` (encounter builder)
- `https://www.dndbeyond.com/encounters/*`, `/my-encounters*`, `/encounter-builder*`
- `https://www.dndbeyond.com/games/*` (maps) — userscript only

Runtime is the page's MAIN world (the content script declares `"world":
"MAIN"`, and the userscript runs in the page context via `@grant none`). It
needs access to `window.WebSocket`, `navigator.bluetooth`, D&D Beyond's
in-page globals, and the Beyond20 extension's `CustomEvent` bridge.

## 2. Repository layout

```
pixels-dndbeyond.user.js     # Userscript entry point (4100+ lines, single file)
chrome_extension/
  manifest.json              # MV3 manifest; loads lib/*.js then content.js
  content.js                 # Same body as the userscript, sans header
  lib/
    pixels-web-connect_1.3.1.js    # vendored @systemic-games/pixels-web-connect
    pixels-edit-animation_1.3.0.js# vendored @systemic-games/pixels-edit-animation
  img/                       # extension + pixel-mode icons
documentation/img/           # screenshots referenced by README.md
guides/mobile.md             # mobile install guide
img/                         # white pixel icon used in the Pixel Mode button
test/
  smoke.js                   # Playwright smoke test against live dndbeyond.com
  package.json               # only dependency: playwright
  README.md                  # how to set up cookies + DDB_CHARACTER_URL
  cookies.json (gitignored)  # required session input
  artifacts/ (gitignored)    # screenshots/HTML dumps on failure
  .profile/ (gitignored)     # persistent Chromium profile
README.md                    # user-facing docs
LICENSE                      # MIT
```

There is no build step, no bundler, no transpiler. Edits land directly in the
two JS files. The `lib/*.js` files are vendored UMD builds; do **not** hand-edit
them — bump the version and re-vendor from unpkg, then update the `@require`
URLs in the userscript header and the `lib/` filenames in `manifest.json`
together.

## 3. Architecture of the content script

The whole integration is one large script that runs at `document-start`.
Top-level code executes immediately; everything else is driven by timers,
event listeners, and a WebSocket hook.

### Boot sequence
1. `interceptSocket()` (pixels-dndbeyond.user.js:508) wraps `window.WebSocket`
   so the first socket D&D Beyond opens is captured into the module-level
   `socket` variable. This socket is the game-log channel; rolls are sent
   over it.
2. A `setTimeout(main, 500)` kicks off initialization, and a `navigation`
   `"navigate"` listener re-runs `main()` when the user moves into the
   encounter builder.
3. `main()` (pixels-dndbeyond.user.js:548) waits until the character sheet
   / encounter builder / map DOM is loaded and the WebSocket is open, checks
   `navigator.bluetooth.getAvailability()`, then:
   - injects the **Pixel Mode** button, the **Pixels logo/info box**, the
     **dice overview** box, and the **Connect to Pixels** nav entry,
   - starts a battery of `setInterval` polls (see "Pollers" below),
   - calls `checkForAutoConnect()` to reconnect previously paired dice via
     `navigator.bluetooth.getDevices()`.
4. `doneOnlyOnceStuff` guards the `setInterval` registrations so they only
   start once per page lifetime.

### Pixel dice connection
- `requestMyPixel()` → `requestPixel()` (Pixels Web Connect) →
  `handleConnection(pixel)` (pixels-dndbeyond.user.js:2060).
- `handleConnection` calls `repeatConnect`, rejects `d6fudge`, registers
  `"roll"` and `"status"` listeners on the die, pushes the die into
  `window.pixels`, and persists its `systemId` in `localStorage.pixelsSystemIds`
  for auto-reconnect.
- The `"roll"` event handler is the core: it validates the roll against
  `currentlyExpectedRoll` (die type, amount, advantage/disadvantage/critical),
  accumulates multi-rolls, then calls `rollDice(realDieType, value)`.
- `lightUpPixel()` / `rainbowPixel()` drive LED feedback; reasons include
  `waitingForRoll`, `connected`, `damage`, `heal`, `nat1`, `nat20`.

### Roll pipeline
- `rollDice(realDieType, value)` (pixels-dndbeyond.user.js:1780) is the single
  entry point for submitting a roll. It is called both by the Pixel `"roll"`
  listener and directly by the smoke test. It:
  - resolves `d100` as a two-die roll (`d10` + `d00`) via `d100RollHappening`
    / `d100RollParts`,
  - handles advantage/disadvantage/critical by doubling the expected amount,
  - builds `diceMessageInitial` (`dice/roll/pending`) and `diceMessageRolled`
    (`dice/roll/fulfilled`) from the `diceTypes`/`diceMessage*` templates at
    the top of the file, fills `context` from `getCharacterId/Name/GameId/...`,
  - sends both messages over the captured `socket`,
  - calls `createToast()` and `appendElementToGameLog()` for local UI,
  - forwards a rendered roll to the Beyond20 extension via
    `sendBeyond20Event("SendMessage", renderedRoll)` when Beyond20 is present.
- `currentlyExpectedRoll` is the module-level "what roll is the user being
  asked to make next" state. It is populated by the Pixel Mode click handler
  and consumed/cleared by `rollDice()`. `cancelCurrentRoll()` resets it and
  is exposed on `window` for the smoke test.

### Pixel Mode UI swap
When Pixel Mode is enabled, `addPixelModeButton()` clones every
`.integrated-dice__container` and replaces the clone's click handler with
`onClickHandler`, which:
- reads die type / modifier / amount / roll type / roll name / damage type
  from the button via the `get*FromButton()` helpers,
- populates `currentlyExpectedRoll`,
- lights up matching connected dice (`waitingForRoll`).
Right-click / context menu is handled separately by `addRollWithPixelButton()`
and `handleRightClick()`. `checkIfDiceButtonCanBeSwappedAgain()` re-swaps
buttons when D&D Beyond re-renders them.

### Beyond20 bridge
Optional interop with the Beyond20 extension. `checkIfBeyond20Installed()`
probes for it; `sendRollToBeyond20()` builds a `beyond20Roll` + matching
`renderedRoll` (HTML included) and dispatches `Beyond20_SendMessage`. The
`beyond20CustomRollNoSend` flag (toggleable in the info box, persisted in
`localStorage.beyond20Checkbox`) suppresses forwarding for "pure custom"
rolls.

### Pollers (started in `main()`)
| Interval | Function | Purpose |
| --- | --- | --- |
| 500 ms | `checkForOpenGameLog` | injects entries into the game log when it's open |
| 1000 ms | `checkIfCharacterSheetLoaded` | re-init after sheet reloads |
| 1000 ms | `checkForMissingPixelButtons` | re-inject swapped dice buttons |
| 300 ms | `checkForContextMenu` | inject "Roll with Pixels" into right-click menus |
| 300 ms | `checkForTodo` | show "roll X dN" reminders |
| 300 ms | `listenForRightClicks` / `listenForLongHold` | mobile + desktop roll intents |
| 300 ms | `listenForMouseOverOfNavItems` / `listenForQuickNavMenu` | inject Connect entry |
| 20 ms | `listenForDeathSaveButtonAppearing` | swap death-save button |
| 300 ms | `checkForHealthChange` | light up dice on damage/heal |
| 30000 ms | `refreshRSSI` | update signal-strength table |

A `MutationObserver` (`observer` near pixels-dndbeyond.user.js:483) reorders
new game-log entries so the user's own rolls appear at the top.

### Key module-level state (pixels-dndbeyond.user.js:414+)
`pixelMode`, `pixelModeOnlyOnce`, `currentlyExpectedRoll`, `multiRolls`,
`doubledAmount`, `d100RollHappening`, `d100RollParts`, `last2D20Rolls`,
`nextAdvantageRoll` / `nextDisadvantageRoll` / `nextCriticalRoll` /
`nextEveryoneRoll` / `nextSelfRoll` / `nextDMRoll`, `virtualDice`,
`beyond20Installed`, `beyond20CustomRollNoSend`, `beyond20Settings`,
`doneOnlyOnceStuff`, `socket`, `window.pixels`. Several of these are
deliberately global on `window` (e.g. `window.cancelCurrentRoll`) so the
smoke test can drive the page context.

## 4. External dependencies

| Library | Source | Used for |
| --- | --- | --- |
| `@systemic-games/pixels-web-connect` | unpkg 1.3.1 (userscript `@require`) / `chrome_extension/lib/pixels-web-connect_1.3.1.js` | BLE discovery, `requestPixel`, `getPixel`, `repeatConnect`, `Color` |
| `@systemic-games/pixels-edit-animation` | unpkg 1.3.0 (userscript `@require`) / `chrome_extension/lib/pixels-edit-animation_1.3.0.js` | rainbow animation on nat 20 |
| Beyond20 browser extension (optional, runtime-detected) | not bundled | forwards rolls to VTTs; detected via `window.beyond20` / events |
| Playwright | `test/package.json` | smoke test only |

Imports at the top of the script:
```js
const { repeatConnect, requestPixel, getPixel, Color } = pixelsWebConnect;
const { createDataSetForAnimation, EditAnimationRainbow, AnimationFlagsValues } = pixelsEditAnimation;
```
Both UMD globals must be available before the script body runs. In the
userscript that's guaranteed by `@require`; in the extension by the script
ordering in `manifest.json`.

## 5. Conventions to follow when editing

- **No build step.** Write plain ES that runs in the page MAIN world on
  Chromium-family browsers (Chrome, Edge, Vivaldi, Brave with the Web BT
  flag, Kiwi/Lemur on mobile). Do not assume Node APIs, ESM imports, or a
  bundler.
- **Single file per surface.** All logic lives in `pixels-dndbeyond.user.js`
  and is mirrored in `chrome_extension/content.js`. Do not split into
  modules without a very good reason; if you do, you must solve loading for
  *both* the userscript (no `@require` for local files) and the extension
  (`manifest.json` script list).
- **Keep the two entry points in sync.** After editing one, port the same
  change to the other. The only accepted difference is the userscript's
  22-line `==UserScript==` header block, which `content.js` must not have.
- **Do not edit `chrome_extension/lib/*.js` by hand.** They are vendored
  UMD bundles. To upgrade a Pixels library: vendor the new file into
  `chrome_extension/lib/` with a versioned filename, update `manifest.json`'s
  `js` array, and update the matching `@require` URL + version in the
  userscript header.
- **Versioning.** Bump the `@version` line in the userscript header and the
  `"version"` field in `chrome_extension/manifest.json` together, in the
  same commit, and keep them equal. Recent commits use the pattern
  `Bump (extension|userscript) version to X.Y.Z.W`.
- **Naming.** Existing helpers use `camelCase` functions and `PascalCase`-
  ish constants (`diceTypes`, `diceMessageInitial`, `beyond20RenderedRoll`).
  Module-level mutable state is plain `let` at the top level. Match this.
- **Selectors are fragile.** D&D Beyond ships obfuscated class names
  (e.g. `tss-1xoxte4-RollType`, `styles_scenarioMenuEncounters`). The script
  mostly uses `[class*='...']` substring matches to survive renames. Prefer
  that pattern for new selectors, and capture failing DOM in the smoke test's
  `artifacts/` when something breaks.
- **Bluetooth is not available in tests.** The smoke test drives
  `rollDice()` directly. Any new roll-path code should remain callable via
  `rollDice(realDieType, value)` without a real die.
- **No comments unless asked.** The file is intentionally comment-light;
  the existing sparse `//` comments mark non-obvious gotchas. Do not add
  decorative comments.
- **Commit messages** are short, imperative, and describe the user-visible
  fix or the version bump (see `git log --oneline` for examples). Do not
  commit unless explicitly asked.

## 6. Testing

There is one test: the Playwright smoke test in `test/`.

### Prerequisites (one-time, inside WSL/Ubuntu)
```bash
cd test
npm install
npx playwright install chromium
```

### Required inputs
- `test/cookies.json` (gitignored) — a logged-in D&D Beyond session. The
  easiest robust method is DevTools → Network → "Copy as cURL" on the
  document request to `/characters/<id>`, pasted verbatim. See
  `test/README.md` for accepted formats. Use a throwaway account: the test
  sends real rolls to that account's game log.
- `DDB_CHARACTER_URL` env var pointing at a character on that account.

### Run
```bash
cd test
npm run smoke
# or, to watch the browser:
HEADED=1 DDB_CHARACTER_URL=https://www.dndbeyond.com/characters/<id> npm run smoke
```

### What it verifies
1. Content script runs (WebSocket interception active).
2. `checkIfCharacterSheetLoaded()` becomes true (Short Rest header matches).
3. `Pixel Mode` button and pixels info box are injected.
4. `Connect to Pixels` nav entry is injected.
5. `rollDice("d20", 18)` sends init + rolled messages over the game-log
   socket and the roll shows up in the game log UI.
6. Pixel Mode flow: click a check/save button, `rollDice()` with the
   matching die type, verify the roll is submitted with the modifier.

On failure, screenshots + an HTML dump land in `test/artifacts/` (gitignored)
so you can diff D&D Beyond's current DOM against the selectors the extension
expects.

There is no unit test runner and no linter configured for the content
script. After non-trivial JS edits, at minimum load the userscript in
Tampermonkey / the extension in a Chromium browser and confirm the Pixel
Mode button appears and `rollDice("d20", 18)` from the DevTools console
lands in the game log.

## 7. Known gotchas

- **No Bluetooth in CI / WSL.** `navigator.bluetooth` is unavailable; the
  smoke test stubs nothing and instead calls `rollDice()` directly. Any
  change that pushes logic *before* `rollDice` (e.g. into the BLE event
  listener) is not covered by the test.
- **Page must be reloaded.** The script only initializes if the character
  sheet is loaded directly (see README "Known bugs"). The smoke test loads
  the URL fresh to satisfy this.
- **`@grant none` is load-bearing.** It makes the userscript run in the
  page's main context so it can reach D&D Beyond's globals and the real
  `window.WebSocket`. Do not switch to a sandboxed grant without reworking
  the WebSocket interception and Beyond20 bridge.
- **`document-start` is load-bearing.** The WebSocket hook must be in place
  before D&D Beyond opens its game-log socket. Keep `@run-at document-start`
  in the userscript and `"run_at": "document_start"` in the manifest.
- **Live site drift.** D&D Beyond changes DOM and obfuscated class names
  frequently. When a selector breaks, check `test/artifacts/` and update
  the `[class*='…']` substring matchers in both entry points.
- **WSL2 access from Windows.** This checkout lives at
  `/home/fabian/pixels-dndbeyond-userscript` inside the `Ubuntu-24.04` WSL
  distro. From PowerShell, invoke shell commands as
  `wsl -d Ubuntu-24.04 -- bash -c "..."` and do not rely on Windows `&&`
  chaining inside that `bash -c` string — use POSIX `&&`/`||` inside the
  quoted command instead.

## 8. Things this repo deliberately does not have

- No bundler, no TypeScript, no transpiler, no formatter config.
- No CI workflow file in-repo (the smoke test is run manually against the
  live site).
- No `.editorconfig` / `.prettierrc` / `.eslintrc`. Match the surrounding
  style (4-space indent, double quotes for HTML attributes and JSON, single
  quotes for string literals in JS where the file already does so).
- No secret management. `test/cookies.json` is the only sensitive input and
  it is gitignored. Never commit it.
