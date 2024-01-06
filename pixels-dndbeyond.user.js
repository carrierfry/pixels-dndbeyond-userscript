// ==UserScript==
// @name         Pixels DnD Beyond
// @namespace    http://tampermonkey.net/
// @version      0.2
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

let socket = null;
const nativeWebSocket = window.WebSocket;
window.WebSocket = function (...args) {
    const socketTmp = new nativeWebSocket(...args);
    socket = socketTmp;

    window.WebSocket = nativeWebSocket;

    return socketTmp;
};


setTimeout(main, 1000);

function main() {
    if (!socket || socket.readyState !== 1) {
        console.log("socket not ready");
        setTimeout(main, 1000);
        return;
    }

    addPixelsLogoButton();
}

function generateRandomHex(length) {
    let result = '';
    const characters = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateDnDBeyondId() {
    return generateRandomHex(8) + "-" + generateRandomHex(4) + "-" + generateRandomHex(4) + "-" + generateRandomHex(4) + "-" + generateRandomHex(12);
}

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

function addPixelsLogoButton() {
    let button = document.createElement("li");
    button.className = "mm-nav-item";

    // create a link
    let link = document.createElement("a");
    link.className = "mm-nav-item__label mm-nav-item__label--link";
    // prevent the link from navigating
    link.href = "#";
    // prevent default click behavior
    link.innerText = "Pixels";
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

function rollDice(diceType, value) {
    let initJson = buildInitialJson();
    socket.send(JSON.stringify(initJson));

    setTimeout(() => {
        let dieValue = value || Math.floor(Math.random() * diceTypes[diceType]) + 1;
        console.log("sending value: " + dieValue);
        socket.send(JSON.stringify(buildRolledJson(initJson.data.rollId, dieValue)));
    }, 1000);
}

async function requestMyPixel() {
    const pixel = await requestPixel();

    console.log("Connecting...");
    await repeatConnect(pixel);

    pixel.addEventListener("roll", (face) => {
        console.log(`=> rolled face: ${face}`);

        // For now only D20, other dice in the future when I have my own dice and can explore the data structures :(
        rollDice("d20", face);
    });
}