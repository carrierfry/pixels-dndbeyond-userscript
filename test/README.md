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
initializes). Provide one as a cookie dump:

1. Log into dndbeyond.com in your normal browser (a throwaway account with a
   test character is recommended).
2. Export the cookies for `dndbeyond.com` (e.g. with a cookie-editor extension,
   "Export as JSON").
3. Save them to `test/cookies.json` (gitignored).

Accepted formats: a plain JSON array of cookies, or an object with a `cookies`
array (Playwright `storageState` format). Cookie-editor style entries
(`sameSite: "no_restriction"`, `expirationDate`, etc.) are normalized
automatically.

Then tell the tests which character sheet to use:

```bash
export DDB_CHARACTER_URL="https://www.dndbeyond.com/characters/<your-test-character-id>"
```

## Running

```bash
npm run smoke
```

Environment variables:

| Variable            | Default              | Meaning                                     |
| ------------------- | -------------------- | ------------------------------------------- |
| `DDB_CHARACTER_URL` | (required)           | Character sheet URL of the test character   |
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
