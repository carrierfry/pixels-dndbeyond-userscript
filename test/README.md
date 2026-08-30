# Browser smoke tests

Loads the chrome extension into a real Chromium via Playwright, opens a
character sheet on the live dndbeyond.com, and checks that the extension's UI
appears and that rolls submitted via `rollDice()` land in the game log. Use it
whenever DnD Beyond changes their character sheet and something breaks.

## Setup

```bash
cd test
npm install
npx playwright install chromium   # only if no Playwright browser is present yet
```

The tests need a logged-in DnD Beyond session (anonymous visitors get a
stripped-down sheet without the Short Rest header, so the extension never
initializes). Provide one as a cookie dump in `test/cookies.json` (gitignored).
A throwaway account with a test character is recommended — the roll tests send
real rolls to that account's game log.

**Easiest way (captures everything, including HttpOnly cookies):**

1. Log into dndbeyond.com and open your character sheet.
2. Open DevTools → Network tab, reload the page.
3. Right-click the first request (the document request to `/characters/...`)
   → Copy → **Copy as cURL**.
4. Paste the whole thing into `test/cookies.json` as-is.

**Alternative (console snippet):** paste this into the DevTools console on any
dndbeyond.com page and save the copied output to `test/cookies.json`:

```js
copy(document.cookie); console.log("copied", document.cookie.split(";").length, "cookies to clipboard");
```

Note this only captures cookies that are visible to JavaScript — if the login
session cookie is HttpOnly, the tests will report `logged-in session FAIL` and
you'll need the cURL method above instead.

Accepted formats: a DevTools "Copy as cURL" dump, a raw `Cookie:` header line,
a bare `name=value; name2=value2` string, a plain JSON array of cookies
(cookie-editor "Export as JSON"), or a Playwright `storageState` object.

Then tell the tests which character sheet to use:

```bash
export DDB_CHARACTER_URL="https://www.dndbeyond.com/characters/<your-test-character-id>"
```

## Optional: load the Beyond20 extension

The content script has a Beyond20 bridge (`sendRollToBeyond20`) that forwards
rolls to VTTs when the Beyond20 extension is present. To exercise it in the
smoke test, download the Beyond20 Chrome build into `test/beyond20/`:

```bash
cd test
mkdir beyond20 && cd beyond20
curl -fsSL -o beyond20-chrome.zip "https://github.com/kakaroto/Beyond20/releases/latest/download/beyond_20-2.20.1-chrome.zip"
# unzip with whatever's available (unzip, python3, etc.)
unzip beyond20-chrome.zip && rm beyond20-chrome.zip
```

The exact version doesn't matter much; the download URL follows the pattern
`beyond_20-<version>-chrome.zip` (check
<https://github.com/kakaroto/Beyond20/releases/latest> for the current tag).
The directory just needs to contain Beyond20's `manifest.json` at its root.

When `test/beyond20/` exists, the smoke test automatically loads it alongside
the Pixels extension and runs two extra checks:

- **Beyond20 extension detected** — verifies `beyond20Installed` is `true`.
- **roll forwarded to Beyond20** — verifies a `Beyond20_SendMessage` event
  fires after `rollDice()`.

Without the directory, those checks are reported as `SKIP` and the rest of the
suite runs unchanged. `test/beyond20/` is gitignored — it's a vendored
third-party extension, not part of this repo.

## Running

```bash
npm run smoke        # character sheet
npm run smoke:map    # maps VTT (needs a character in a campaign with an active map)
```

Environment variables:

| Variable            | Default              | Meaning                                     |
| ------------------- | -------------------- | ------------------------------------------- |
| `DDB_CHARACTER_URL` | (required)           | Character sheet URL of the test character   |
| `DDB_MAP_URL`       | (required for map)   | Map URL of a campaign the test account is in (`https://www.dndbeyond.com/games/<id>`) |
| `DDB_COOKIES`       | `test/cookies.json`  | Path to the cookie dump                     |
| `HEADED`            | unset                | Set to `1` to watch the browser             |

On failure the script leaves screenshots and an HTML dump in `test/artifacts/`
(gitignored) so you can diff DnD Beyond's current DOM against the selectors the
extension expects.

## What it checks

1. Extension content script runs (WebSocket interception active).
2. `checkIfCharacterSheetLoaded()` becomes true, i.e. the Short Rest header
   selectors still match.
3. The `Pixel Mode` button and the pixels info box get injected.
4. The `Connect to Pixels` nav entry gets injected.
5. A plain `rollDice("d20", 18)` from the page context sends the init +
   rolled messages over the game-log socket and the roll shows up in the game
   log UI.
6. Pixel-mode flow: click a check/save button on the sheet, then `rollDice()`
   with the matching die type, and verify the roll is submitted with the
   modifier applied.

Bluetooth is NOT exercised — `rollDice()` is called directly, which is the same
entry point the real Pixels dice event listener uses.

The map test (`smoke-map.js`) drives the whole maps VTT flow: map load with
retry against D&D Beyond's intermittent 500s, top bar Pixels UI, the sheet
iframe opened via the sidebar, Pixel Mode toggle round-trip over postMessage,
bridge roll onto the game-log socket, the dice popup, and game log injection
(queued while closed, flushed to the visually chronological position, live
entries reordered by the observer).
