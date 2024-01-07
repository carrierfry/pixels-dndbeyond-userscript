// ==UserScript==
// @name         Pixels DnD Beyond
// @namespace    http://tampermonkey.net/
// @version      0.3.1
// @description  Use Pixel Dice on DnD Beyond
// @author       carrierfry
// @match        https://www.dndbeyond.com/characters/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://gamewithpixels.com/
// @run-at       document-start
// @grant        none
// @updateURL    https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js
// @downloadURL  https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js
// @require      https://unpkg.com/@systemic-games/pixels-web-connect@1.1.1/dist/umd/index.js
// ==/UserScript==

const { repeatConnect, requestPixel } = pixelsWebConnect;

const diceTypes = {
    "d4": 4,
    "d6": 6,
    "d8": 8,
    "d10": 10,
    "d12": 12,
    "d20": 20,
    "d100": 100
};
const diceMessageInitial = {
    "id": "12345678-1234-1234-1234-1234567890ab",
    "dateTime": "1704476526766",
    "gameId": "1234567",
    "userId": "123456789",
    "source": "web",
    "data": {
        "action": "custom",
        "rolls": [{
            "diceNotation": {
                "set": [{
                    "count": 1,
                    "dieType": "d20",
                    "dice": [{
                        "dieType": "d20",
                        "dieValue": 0
                    }],
                    "operation": 0
                }],
                "constant": 0
            },
            "diceNotationStr": "1d20",
            "rollType": "roll",
            "rollKind": ""
        }],
        "context": {
            "entityId": "12345678",
            "entityType": "character",
            "name": "Character Name",
            "avatarUrl": "URL",
            "messageScope": "gameId",
            "messageTarget": "1234567"
        },
        "setId": "00101",
        "rollId": "12345678-1234-1234-1234-1234567890ab"
    },
    "entityId": "12345678",
    "entityType": "character",
    "eventType": "dice/roll/pending",
    "persist": false,
    "messageScope": "gameId",
    "messageTarget": "1234567"
}

const diceMessageRolled = {
    "id": "12345678-1234-1234-1234-1234567890ab",
    "dateTime": "1704476909800",
    "gameId": "1234567",
    "userId": "123456789",
    "source": "web",
    "data": {
        "action": "custom",
        "rolls": [{
            "diceNotation": {
                "set": [{
                    "count": 1,
                    "dieType": "d20",
                    "dice": [{
                        "dieType": "d20",
                        "dieValue": 1
                    }],
                    "operation": 0
                }],
                "constant": 0
            },
            "diceNotationStr": "1d20",
            "rollType": "roll",
            "rollKind": "",
            "result": {
                "constant": 0,
                "values": [1],
                "total": 1,
                "text": "1"
            }
        }], "context": {
            "entityId": "12345678",
            "entityType": "character",
            "name": "Character Name",
            "avatarUrl": "URL",
            "messageScope": "gameId",
            "messageTarget": "1234567"
        },
        "setId": "00101",
        "rollId": "12345678-1234-1234-1234-1234567890ab"
    },
    "entityId": "12345678",
    "entityType": "character",
    "eventType": "dice/roll/fulfilled",
    "persist": true,
    "messageScope": "gameId",
    "messageTarget": "1234567"
}

// Intercept the WebSocket constructor so we can get the socket object
let socket = null;
const nativeWebSocket = window.WebSocket;
window.WebSocket = function (...args) {
    const socketTmp = new nativeWebSocket(...args);
    socket = socketTmp;

    window.WebSocket = nativeWebSocket;

    return socketTmp;
};


setTimeout(main, 1000);

// Main function
function main() {
    if (!socket || socket.readyState !== 1) {
        console.log("socket not ready");
        setTimeout(main, 1000);
        return;
    }

    addPixelsLogoButton();
}

// generates a random hex string of the given length
function generateRandomHex(length) {
    let result = '';
    const characters = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// DnD Beyond uses a UUID for the rollId and messageId. That gets generated here
function generateDnDBeyondId() {
    return generateRandomHex(8) + "-" + generateRandomHex(4) + "-" + generateRandomHex(4) + "-" + generateRandomHex(4) + "-" + generateRandomHex(12);
}

// There are two messages that need to be sent to the server to roll a die. The first is the initial message, the second is the rolled message.
// The initial message is sent with a random rollId, the rolled message is sent with the same rollId as the initial message.
// These 2 functions build the JSON for those messages.
function buildInitialJson() {
    let json = JSON.parse(JSON.stringify(diceMessageInitial));
    json.id = generateDnDBeyondId();
    json.dateTime = Date.now();
    json.data.rollId = generateDnDBeyondId();
    json.data.context.entityId = getCharacterId();
    json.data.context.name = getCharacterName();
    json.data.context.avatarUrl = getAvatarUrl();
    json.data.context.messageTarget = getGameId();
    json.userId = getUserId();
    json.messageTarget = getGameId();
    json.gameId = getGameId();
    json.entityId = getCharacterId();
    return json;
}

function buildRolledJson(rollId, dieValue) {
    let json = JSON.parse(JSON.stringify(diceMessageRolled));
    json.id = generateDnDBeyondId();
    json.dateTime = Date.now();
    json.data.rollId = rollId;
    json.data.context.entityId = getCharacterId();
    json.data.context.name = getCharacterName();
    json.data.context.avatarUrl = getAvatarUrl();
    json.data.context.messageTarget = getGameId();
    json.userId = getUserId();
    json.messageTarget = getGameId();
    json.gameId = getGameId();
    json.entityId = getCharacterId();
    json.data.rolls[0].diceNotation.set[0].dice[0].dieValue = dieValue;
    json.data.rolls[0].result.values[0] = [dieValue];
    json.data.rolls[0].result.total = dieValue;
    json.data.rolls[0].result.text = dieValue.toString();
    return json;
}

// Adds a button that lets you connect to Pixels
function addPixelsLogoButton() {
    let button = document.createElement("li");
    button.className = "mm-nav-item";

    // create a link
    let link = document.createElement("a");
    link.className = "mm-nav-item__label mm-nav-item__label--link";
    // prevent the link from navigating
    link.href = "#";
    // prevent default click behavior
    link.innerText = "Connect to Pixels";
    link.onclick = (e) => {
        e.preventDefault();
        console.log("Pixels link clicked");

        requestMyPixel();
    };
    button.appendChild(link);
    // find the last mm-nav-item and insert after it
    let lastNavItem = document.querySelectorAll(".mm-nav-item");
    lastNavItem = lastNavItem[lastNavItem.length - 1];
    console.log(lastNavItem);
    lastNavItem.parentNode.insertBefore(button, lastNavItem.nextSibling);
}

// The following 5 functions get different information from DOM elements and the URL
function getCharacterId() {
    let url = window.location.href;
    let urlParts = url.split("/");
    let characterId = urlParts[urlParts.length - 1];
    return characterId;
}

function getCharacterName() {
    let name = document.querySelector(".ddb-character-app-sn0l9p");
    return name.innerText;
}

function getGameId() {
    let gameId = document.querySelector(".ddbc-tooltip").firstChild;
    return gameId.href.split("/")[4];
}

function getUserId() {
    let userId = document.querySelector("#message-broker-client").getAttribute("data-userid");
    return userId;
}

function getAvatarUrl() {
    let avatar = document.querySelector(".ddbc-character-avatar__portrait").getAttribute("style").split("url(\"")[1].split("\")")[0];
    return avatar;
}

// "Rolls" a die. You can specify the dice type and value and it will send the appropriate messages to the server.
function rollDice(diceType, value) {
    // Also here needs to be more work done to support other dice types

    let initJson = buildInitialJson();
    socket.send(JSON.stringify(initJson));

    setTimeout(() => {
        let dieValue = value || Math.floor(Math.random() * diceTypes[diceType]) + 1;
        console.log("sending value: " + dieValue);
        socket.send(JSON.stringify(buildRolledJson(initJson.data.rollId, dieValue)));
    }, 1000);

    createToast(diceType, value);
}

// Connects to a Pixel via the Pixels Web Connect library
async function requestMyPixel() {
    const pixel = await requestPixel();

    console.log("Connecting...");
    await repeatConnect(pixel);

    pixel.addEventListener("roll", (face) => {
        console.log(`=> rolled face: ${face}`);

        // For now only D20, other dice in the future when I have my own dice and can explore the data structures :(
        rollDice("d20", face);
    });

    window.pixel = pixel;
}

window.createToast = function (dieType, value) {
    let div = document.createElement("div");
    div.id = generateDnDBeyondId();

    let innerDiv = '<div id="noty_layout__bottomRight" role="alert" aria-live="polite" class="noty_layout uncollapse" onclick="this.remove()"> <div id="noty_bar_UUID" class="noty_bar noty_type__alert noty_theme__valhalla noty_close_with_click"> <div class="noty_body"> <div class="dice_result "> <div class="dice_result__info"> <div class="dice_result__info__title"><span class="dice_result__info__rolldetail"> </span><span class="dice_result__rolltype rolltype_roll" style="animation: linear party-time-text 1s infinite;">pixel roll</span></div> <div class="dice_result__info__results"><span class="dice-icon-die dice-icon-die--DIETYPE" alt=""></span></div><span class="dice_result__info__dicenotation" title="1DIETYPE">1DIETYPE</span> </div> <div class="dice_result__total-container"><span class="dice_result__total-result dice_result__total-result-">VALUE</span></div> </span> </div> </div> <div class="noty_progressbar"></div> </div> </div>'
    innerDiv = innerDiv.replace("UUID", generateDnDBeyondId());
    innerDiv = innerDiv.replaceAll("DIETYPE", dieType);
    innerDiv = innerDiv.replaceAll("VALUE", value);

    div.innerHTML = innerDiv;
    document.querySelector("body").appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 5000);
}