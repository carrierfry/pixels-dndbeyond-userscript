# Pixels DnD Beyond integration

This is a userscript that integrates Pixels into DnD Beyond.

You can run it with [Tampermonkey](https://www.tampermonkey.net/).

## Features
- Can connect to Pixel dice
- Can identify a roll with a Pixel die and submmit it to DnD Beyond

## Todos / Things that need to be implemented
- [ ] Support other dice than D20s
- [ ] Test if it works with pixel dice actually, since I don't have any right now
- [ ] Make it possible to automatically add the modifiers to the roll (e.g. +5 for a strength check)
- [ ] Show the roll to the user (currently only the other players can see it)

## Known bugs
- Currently, the script only works if you open the character sheet in DnD Beyond directly (for example by reloading the page). If you open the character sheet via the overlay, it won't work. (This is because DnD BEyond is a single site application and the script only runs once when the page is loaded.)

## How to use
1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Install the script by clicking [here](https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js) and clicking on `Install script`
3. Open a character sheet in DnD Beyond
4. Click on the `Connect to Pixels` button at the top and connect to your Pixel dice
5. Roll a die with your Pixel dice

## Software used
[Pixels Web Connect](https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-web-connect) (via [unpkg](https://unpkg.com/))