# Pixels DnD Beyond integration

This is a userscript that integrates [Pixels](https://gamewithpixels.com/) into [DnD Beyond](https://www.dndbeyond.com/) by making it possible to throw pixel dice and submit the result to DnD Beyond.

This is currently the only way to use Pixels with DnD Beyond, as DnD Beyond didn't add support for Pixels yet.

## Features
- Can connect to Pixel dice
- Can identify a roll with a Pixel die and submit it to DnD Beyond as a custom roll
- Die rolls appear in the game log for other players that are in the session
- "Pixel Mode" button. Let's you choose a check/save/damage and waits for you to roll your Pixel die. After you rolled the die, it automatically submits the roll to DnD Beyond

## Which browsers are supported?
These are the browsers we have tested and confirmed to work:
- Google Chrome
- Chromium
- Microsoft Edge
- Vivaldi

Brave also works, but only after manually enabling the Bluetooth Web API flag. You can do so here: `brave://flags/#brave-web-bluetooth-api`!

⚠️⚠️⚠️ **Safari, Firefox and Opera are not supported** yet, as they either don't support the Bluetooth Web API yet or disabled it on purpose! ⚠️⚠️⚠️

## Download
You can now install the integration from the Chrome Web Store by clicking [here](https://chromewebstore.google.com/detail/pixels-dndbeyond-integrat/dldknofeibljjommedjjegffjlemgack)! This is the easiest way to install the integration, as you don't have to do anything special. The Chrome Web Store version will receive updates less frequently than the userscript version, but it is also more stable.

Alternatively, you can install the userscript by following the instructions below.
1. Install [Tampermonkey](https://www.tampermonkey.net/) into your browser (make sure to use this link, as some browsers block Tampermonkey if it get's added via the chrome web store. When you follow this link, you get a button to install Tampermonkey from the respective browser's web store)
2. Install the script by clicking [here](https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js) and clicking on `Install script`. It will update automatically once per day after that.

## How to use

1. Open a character sheet in DnD Beyond (make sure to reload the page once it's open if you opened it by clicking on `view` in your campaign or character overview)
2. Click on the `Connect to Pixels` text at the top right (to the right of the `Subscribe` text) and connect to your Pixel dice
3. Repeat step 4 for every pixel die you want to connect

Once you are connected to your Pixel dice, there are 2 ways to roll with them:
1. Click on `Pixel Mode`. Now every time you click on a check/save/damage button, it will wait for you to roll your Pixel die and then automatically submit the roll to DnD Beyond.
2. Right click on a check/save/damage button and click on `Roll with Pixels`. Again the site will wait for you to roll your Pixel die and then automatically submit the roll to DnD Beyond.

## What is "Pixel Mode"?
Pixel Mode allows you to choose a check/save/damage and then roll your Pixel die. Instead of rolling a virtual die, the site waits for you to roll your Pixel die and then automatically submits the roll to DnD Beyond.
You can enable it by clicking on the `Pixel Mode` button at the top beside the `Short Rest` button.

If you left click on the `Pixel Mode` button, it will enable Pixel Mode for the next roll.<br>
If you right click on the `Pixel Mode` button, it will enable Pixel Mode until you disable it again.

Pixel Mode is not available when using [Beyond20](https://beyond20.here-for-more.info/) as there are bugs with it.

## Experimental support for mobile
With the latest version it is possible to use the Tampermonkey script on the mobile view of DnD Beyond. This requires the use of a browser that supports chrome extensions though:
1. Install the [Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser) from the Play Store and open it
2. Tap on the 3 dots and select `Extensions`. There, tap on `+ (from store)`
3. A window of the chrome web store opens. Search for `Tampermonkey` and install it
4. Once installed, click on [this link](https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js) **in the Kiwi browser**! A window of Tampermonkey should pop up, asking you, if you want to install the script. Accept that
5. Go to DnD Beyond and open a character sheet. Make sure to reload it once.
6. Click on the hamburger menu on the top right and select `Connect to Pixels`. From here on everything should work like it does on PC

## Todos / Things that need to be implemented
- [x] ~~Support other dice than D20s~~
- [x] ~~Test if it works with pixel dice actually, since I don't have any right now~~
- [x] ~~Make it possible to automatically add the modifiers to the roll (e.g. +5 for a strength check)~~
- [x] ~~Make it possible to roll multiple dice at once (e.g. `2d6+4`)~~
- [x] ~~d100 rolls with a d10 and a d00~~
- [x] ~~Show the roll to the user as a toast/popup~~
- [x] ~~Show the roll in the game log to the user itself (currently only the other players who are in the session can see it live)~~

## Known bugs
- Currently, the script only works if you open the character sheet in DnD Beyond directly (for example by reloading the page). If you open the character sheet by clicking on `view` in your campaign or character overwie, it won't work. (If you are using the chrome web store version, it will work in both cases)
- If you are connected to your pixel dice and reload the page, you have to reconnect to your pixel dice again. (It shows that the dice is already connected, but it doesn't work until you reconnect.)
- Healing spells can only be rolled with pixel by using the pixel mode. Other spells can also be rolled with pixel by using `right click -> roll with pixel` on the damage button.

## Software used
[Pixels Web Connect](https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-web-connect) (via [unpkg](https://unpkg.com/))
[Pixels Edit Animation](https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-edit-animation) (via [unpkg](https://unpkg.com/))