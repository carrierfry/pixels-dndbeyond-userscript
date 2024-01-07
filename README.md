# Pixels DnD Beyond integration

This is a userscript that integrates [Pixels](https://gamewithpixels.com/) into [DnD Beyond](https://www.dndbeyond.com/) by making it possible to throw pixel dice and submit the result to DnD Beyond.

You can run it with [Tampermonkey](https://www.tampermonkey.net/).

## Features
- Can connect to Pixel dice
- Can identify a roll with a Pixel die and submit it to DnD Beyond (Currently only 1 D20)

## Todos / Things that need to be implemented
- [ ] Support other dice than D20s
- [ ] Test if it works with pixel dice actually, since I don't have any right now
- [ ] Make it possible to automatically add the modifiers to the roll (e.g. +5 for a strength check)
- [ ] Show the roll to the user (currently only the other players who are in the session can see it live)

## Known bugs
- Currently, the script only works if you open the character sheet in DnD Beyond directly (for example by reloading the page). If you open the character sheet by clicking on `view` in your campaign or character overwie, it won't work. (This is because DnD Beyond is a single site application and the script only runs once when the page is loaded.)
- Since this userscript only interacts with the websocket of DnD Beyond, you currently can't see the roll in the game log until you reload the page. Other players that are in the session will see the roll live though.

## How to use
1. Install [Tampermonkey](https://www.tampermonkey.net/) into your browser (chromium based browsers like Chrome or Edge should work)
2. Install the script by clicking [here](https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js) and clicking on `Install script`
3. Open a character sheet in DnD Beyond (make sure to reload the page once it's open if you opened it by clicking on `view` in your campaign or character overview)
4. Click on the `Connect to Pixels` text at the top right (to the right of the `Subscribe` text) and connect to your Pixel dice
5. Roll a pixel die
6. (Optional) If you want to see the roll, refresh the page and open the game log again. Your roll should be visible there.

## Software used
[Pixels Web Connect](https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-web-connect) (via [unpkg](https://unpkg.com/))