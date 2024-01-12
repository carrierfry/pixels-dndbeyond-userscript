// ==UserScript==
// @name         Pixels DnD Beyond
// @namespace    http://tampermonkey.net/
// @version      0.4.2
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
    "d4": {
        "diceNotation": {
            "set": [{
                "count": 1,
                "dieType": "d4",
                "dice": [{
                    "dieType": "d4",
                    "dieValue": 0
                }],
                "operation": 0
            }],
            "constant": 0
        },
        "diceNotationStr": "1d4",
        "rollType": "roll",
        "rollKind": "",
        "result": {
            "constant": 0,
            "values": [4],
            "total": 4,
            "text": "4"
        }
    },
    "d6": {
        "diceNotation": {
            "set": [{
                "count": 1,
                "dieType": "d6",
                "dice": [{
                    "dieType": "d6",
                    "dieValue": 0
                }],
                "operation": 0
            }],
            "constant": 0
        },
        "diceNotationStr": "1d6",
        "rollType": "roll",
        "rollKind": "",
        "result": {
            "constant": 0,
            "values": [6],
            "total": 6,
            "text": "6"
        }
    },
    "d8": {
        "diceNotation": {
            "set": [{
                "count": 1,
                "dieType": "d8",
                "dice": [{
                    "dieType": "d8",
                    "dieValue": 0
                }],
                "operation": 0
            }],
            "constant": 0
        },
        "diceNotationStr": "1d8",
        "rollType": "roll",
        "rollKind": "",
        "result": {
            "constant": 0,
            "values": [8],
            "total": 8,
            "text": "8"
        }
    },
    "d10": {
        "diceNotation": {
            "set": [{
                "count": 1,
                "dieType": "d10",
                "dice": [{
                    "dieType": "d10",
                    "dieValue": 0
                }],
                "operation": 0
            }],
            "constant": 0
        },
        "diceNotationStr": "1d10",
        "rollType": "roll",
        "rollKind": "",
        "result": {
            "constant": 0,
            "values": [10],
            "total": 10,
            "text": "10"
        }
    },
    "d12": {
        "diceNotation": {
            "set": [{
                "count": 1,
                "dieType": "d12",
                "dice": [{
                    "dieType": "d12",
                    "dieValue": 0
                }],
                "operation": 0
            }],
            "constant": 0
        },
        "diceNotationStr": "1d12",
        "rollType": "roll",
        "rollKind": "",
        "result": {
            "constant": 0,
            "values": [12],
            "total": 12,
            "text": "12"
        }
    },
    "d20": {
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
        "rollKind": "",
        "result": {
            "constant": 0,
            "values": [20],
            "total": 20,
            "text": "20"
        }
    }
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
    "eventType": "dice/roll/fulfilled",
    "persist": true,
    "messageScope": "gameId",
    "messageTarget": "1234567"
}

const toDoLookup = {
    "d4": "You need to roll x d4!",
    "d6": "You need to roll x d6!",
    "d8": "You need to roll x d8!",
    "d10": "You need to roll x d10!",
    "d12": "You need to roll x d12!",
    "d20": "You need to roll x d20!",
}

let multiRolls = [];

let pixelMode = false;
let originalDiceClick = [];
let currentlyExpectedRoll = {};
let gameLogOpen = false;
let rolledJsonArray = [];
let rolledJsonArrayIndex = 0;
let currentlyUpdatingGameLog = false;
let firstEntryAddedToGameLog = false;
let pixelModeOnlyOnce = false;
let tootltipShown = false;
let contextMenuShown = false;
let lastRightClickedButton = null;

// Intercept the WebSocket constructor so we can get the socket object
let socket = null;
const nativeWebSocket = window.WebSocket;
window.WebSocket = function (...args) {
    const socketTmp = new nativeWebSocket(...args);
    socket = socketTmp;

    window.WebSocket = nativeWebSocket;

    return socketTmp;
};


setTimeout(main, 500);

// Main function
function main() {
    if (!socket || socket.readyState !== 1) {
        console.log("socket not ready");
        setTimeout(main, 500);
        return;
    }

    let color = window.getComputedStyle(document.querySelector(".ct-character-header-desktop__button")).getPropertyValue("border-color");

    GM_addStyle(`.ct-character-header-desktop__group--pixels-active{ background-color:  ${color} !important; }`);
    //GM_addStyle(`.pixels-info-box { position: fixed; top: 25%; left: 25%; width: 50%; height: 50%; background-color: rgba(0,0,0,0.5); z-index: 999`);
    addPixelsLogoButton();
    addPixelModeButton();
    addPixelsInfoBox();
    setInterval(checkForOpenGameLog, 500);
    setInterval(checkForMissingPixelButtons, 1000);
    setInterval(checkForContextMenu, 300);
    setInterval(checkForTodo, 300);
    setInterval(listenForRightClicks, 300);
}

function checkForMissingPixelButtons() {
    // When you for example resize the window, so that the mobile view is shown, the buttons are removed. After resizing back to desktop view, the buttons do not
    // get added back. This function checks for that and adds them back if they are missing.

    let forgeButton = document.querySelectorAll(".ct-character-header-desktop__group--builder");
    let pixelModeButton = document.querySelectorAll(".ct-character-header-desktop__group--pixels");
    if (forgeButton.length > 0 && pixelModeButton.length === 0) {
        addPixelsLogoButton();
        addPixelModeButton();
    }
}

function checkForContextMenu() {
    let contextMenu = document.querySelector(".MuiPaper-root");

    if (contextMenu !== null) {
        addRollWithPixelButton(contextMenu);
        contextMenuShown = true;
    } else {
        contextMenuShown = false;
    }
}

function checkForTodo() {
    if (Object.keys(currentlyExpectedRoll).length !== 0) {
        // let modifier = currentlyExpectedRoll.modifier;
        let dieType = currentlyExpectedRoll.dieType;
        let amount = currentlyExpectedRoll.amount;

        let text = toDoLookup[dieType];
        text = text.replaceAll("x", amount);

        displayWhatUserNeedsToDo(text);
    } else {
        displayWhatUserNeedsToDo();
    }
}

function addRollWithPixelButton(contextMenu) {
    if (!contextMenuShown) {
        let button = document.createElement("button");
        button.className = "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-fullWidth MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-fullWidth css-1kol59t";
        button.setAttribute("tabindex", "0");
        button.setAttribute("type", "button");
        button.innerText = "Roll with Pixels";

        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Roll with Pixels clicked");

            contextMenu.remove();

            let modifier = getModifierFromButton(lastRightClickedButton);
            let dieType = getDieTypeFromButton(lastRightClickedButton);
            let amount = getAmountFromButton(lastRightClickedButton);

            currentlyExpectedRoll = {
                "modifier": modifier,
                "dieType": dieType,
                "amount": amount
            };

        };

        contextMenu.firstChild.appendChild(button);
    }
}

function listenForRightClicks() {
    document.querySelectorAll(".integrated-dice__container").forEach((element) => {
        element.removeEventListener('mouseup', handleRightClick);

        element.addEventListener('mouseup', handleRightClick);
    });
}

function handleRightClick(e) {
    //e.button describes the mouse button that was clicked
    // 0 is left, 1 is middle, 2 is right
    if (e.button == 2) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Dice right clicked");

        lastRightClickedButton = e.currentTarget;
    }
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
function buildInitialJson(dieType, modifier = 0, amount = 1) {
    let json = JSON.parse(JSON.stringify(diceMessageInitial));
    json.id = generateDnDBeyondId();
    json.dateTime = Date.now();
    json.data.rollId = generateDnDBeyondId();
    json.data.context.entityId = getCharacterId();
    json.data.context.name = getCharacterName();
    json.data.context.avatarUrl = getAvatarUrl();
    if (json.data.context.avatarUrl === null) {
        delete json.data.context.avatarUrl;
    }
    json.data.context.messageTarget = getGameId();
    json.userId = getUserId();
    json.messageTarget = getGameId();
    json.gameId = getGameId();
    json.entityId = getCharacterId();
    json.data.rolls[0].diceNotation.set[0].count = amount;
    json.data.rolls[0].diceNotation.set[0].dieType = dieType;
    json.data.rolls[0].diceNotation.set[0].dice[0].dieType = dieType;
    if (amount > 1) {
        let clone = JSON.parse(JSON.stringify(json.data.rolls[0].diceNotation.set[0].dice[0]));
        json.data.rolls[0].diceNotation.set[0].dice = [];
        for (let i = 0; i < amount; i++) {
            json.data.rolls[0].diceNotation.set[0].dice.push(clone);
        }
    }
    json.data.rolls[0].diceNotationStr = amount + dieType;
    if (modifier !== 0) {
        json.data.rolls[0].diceNotation.constant = modifier;
        if (modifier > 0) {
            json.data.rolls[0].diceNotationStr = amount + dieType + "+" + modifier;
        } else {
            json.data.rolls[0].diceNotationStr = amount + dieType + modifier;
        }
    }
    return json;
}

function buildRolledJson(dieType, rollId, dieValue, modifier = 0, amount = 1) {
    let json = JSON.parse(JSON.stringify(diceMessageRolled));
    json.id = generateDnDBeyondId();
    json.dateTime = Date.now();
    json.data.rollId = rollId;
    json.data.context.entityId = getCharacterId();
    json.data.context.name = getCharacterName();
    json.data.context.avatarUrl = getAvatarUrl();
    if (json.data.context.avatarUrl === null) {
        delete json.data.context.avatarUrl;
    }
    json.data.context.messageTarget = getGameId();
    json.userId = getUserId();
    json.messageTarget = getGameId();
    json.gameId = getGameId();
    json.entityId = getCharacterId();
    json.data.rolls[0] = JSON.parse(JSON.stringify(diceTypes[dieType]));
    json.data.rolls[0].diceNotation.set[0].count = amount;
    json.data.rolls[0].diceNotation.set[0].dice[0].dieValue = dieValue;
    json.data.rolls[0].result.values[0] = dieValue;
    json.data.rolls[0].result.total = dieValue;
    json.data.rolls[0].result.text = dieValue.toString();
    json.data.rolls[0].diceNotationStr = amount + dieType;
    if (modifier !== 0) {
        json.data.rolls[0].diceNotation.constant = modifier;
        json.data.rolls[0].result.constant = modifier;
        json.data.rolls[0].result.total += modifier;
        if (modifier > 0) {
            json.data.rolls[0].diceNotationStr = amount + dieType + "+" + modifier;
            if (amount > 1) {
                let clone = JSON.parse(JSON.stringify(json.data.rolls[0].diceNotation.set[0].dice[0]));
                json.data.rolls[0].diceNotation.set[0].dice = [];
                json.data.rolls[0].result.values = [];
                json.data.rolls[0].result.text = "";
                json.data.rolls[0].result.total = 0;
                for (let i = 0; i < amount; i++) {
                    clone.dieValue = multiRolls[i];
                    json.data.rolls[0].diceNotation.set[0].dice.push(clone);
                    json.data.rolls[0].result.values.push(multiRolls[i]);
                    json.data.rolls[0].result.text += multiRolls[i] + "+";
                    json.data.rolls[0].result.total += multiRolls[i];
                }
                json.data.rolls[0].result.text = json.data.rolls[0].result.text.slice(0, -1);
                json.data.rolls[0].result.total += modifier;
            }
            json.data.rolls[0].result.text += "+" + modifier;
        } else {
            json.data.rolls[0].diceNotationStr = "" + amount + dieType + modifier;
            if (amount > 1) {
                let clone = JSON.parse(JSON.stringify(json.data.rolls[0].diceNotation.set[0].dice[0]));
                json.data.rolls[0].diceNotation.set[0].dice = [];
                json.data.rolls[0].result.values = [];
                json.data.rolls[0].result.text = "";
                json.data.rolls[0].result.total = 0;
                for (let i = 0; i < amount; i++) {
                    clone.dieValue = multiRolls[i];
                    json.data.rolls[0].diceNotation.set[0].dice.push(clone);
                    json.data.rolls[0].result.values.push(multiRolls[i]);
                    json.data.rolls[0].result.text += multiRolls[i] + "+";
                    json.data.rolls[0].result.total += multiRolls[i];
                }
                json.data.rolls[0].result.text = json.data.rolls[0].result.text.slice(0, -1);
                json.data.rolls[0].result.total += modifier;
            }
            json.data.rolls[0].result.text += "" + modifier;
        }
    } else if (amount > 1) {
        let clone = JSON.parse(JSON.stringify(json.data.rolls[0].diceNotation.set[0].dice[0]));
        json.data.rolls[0].diceNotation.set[0].dice = [];
        json.data.rolls[0].result.values = [];
        json.data.rolls[0].result.text = "";
        json.data.rolls[0].result.total = 0;
        for (let i = 0; i < amount; i++) {
            clone.dieValue = multiRolls[i];
            json.data.rolls[0].diceNotation.set[0].dice.push(clone);
            json.data.rolls[0].result.values.push(multiRolls[i]);
            json.data.rolls[0].result.text += multiRolls[i] + "+";
            json.data.rolls[0].result.total += multiRolls[i];
        }
        json.data.rolls[0].result.text = json.data.rolls[0].result.text.slice(0, -1);
    }
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
    let avatar = document.querySelector(".ddbc-character-avatar__portrait").getAttribute("style");
    if (avatar === null) {
        return null;
    }
    avatar = avatar.split("url(\"")[1].split("\")")[0];
    return avatar;
}

// "Rolls" a die. You can specify the dice type and value and it will send the appropriate messages to the server.
function rollDice(dieType, value) {
    let modifier = 0;
    let multiRollComplete = false;
    let amount = 1;

    if (Object.keys(currentlyExpectedRoll).length !== 0) {
        if (currentlyExpectedRoll.dieType !== dieType) {
            console.log("wrong die type");
            return;
        }

        if (currentlyExpectedRoll.amount > 1) {
            // console.log("multiple dice not supported yet");
            // currentlyExpectedRoll = {};
            // return;

            multiRolls.push(value);
            if (multiRolls.length === currentlyExpectedRoll.amount) {
                multiRollComplete = true;
                amount = currentlyExpectedRoll.amount;
            }
        }

        modifier = parseInt(currentlyExpectedRoll.modifier);
    }

    if (multiRollComplete || Object.keys(currentlyExpectedRoll).length === 0 || currentlyExpectedRoll.amount === 1) {
        let initJson = buildInitialJson(dieType, modifier, amount);
        socket.send(JSON.stringify(initJson));

        let dieValue = value || Math.floor(Math.random() * diceTypes[dieType].result.total) + 1;
        let rolledJson = buildRolledJson(dieType, initJson.data.rollId, dieValue, modifier, amount);

        setTimeout(() => {
            console.log("sending value: " + dieValue);
            socket.send(JSON.stringify(rolledJson));
        }, 1000);

        createToast(dieType, rolledJson.data.rolls[0].result.total, rolledJson.data.rolls[0].result.values[0], modifier, rolledJson.data.rolls[0].diceNotationStr);
        // displayDieRoll(dieType, value, modifier);
        // appendElementToGameLog(rolledJson);
        rolledJsonArray.push(rolledJson);
        currentlyExpectedRoll = {};

        if (pixelModeOnlyOnce && pixelMode) {
            pixelMode = false;
            document.querySelector(".ct-character-header-desktop__group--pixels").firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");
            document.querySelectorAll(".integrated-dice__container").forEach((element, index) => {
                element.parentNode.replaceChild(originalDiceClick[index], element);
            });
            originalDiceClick = [];
            pixelModeOnlyOnce = false;
        }

        if (multiRollComplete) {
            multiRolls = [];
        }
    } else {
        console.log("waiting for more rolls");
    }
}

// Connects to a Pixel via the Pixels Web Connect library
async function requestMyPixel() {
    if (!window.pixels) {
        window.pixels = [];
    }

    const pixel = await requestPixel();

    console.log("Connecting...");
    await repeatConnect(pixel);

    pixel.addEventListener("roll", (face) => {
        console.log(`=> rolled face: ${face}`);

        // For now only D20, other dice in the future when I have my own dice and can explore the data structures :(
        rollDice(pixel.dieType, face);
    });

    window.pixels.push(pixel);

    updateCurrentPixels();
}

function addPixelModeButton() {
    let div = document.createElement("div");
    div.className = "ct-character-header-desktop__group ct-character-header-desktop__group--pixels";

    div.innerHTML = '<div class="ct-character-header-desktop__button" role="button" tabindex="0"> <div class="ct-character-header-desktop__button-icon"> <img src="https://www.google.com/s2/favicons?sz=16&domain=https://gamewithpixels.com/"> </div> <span class="ct-character-header-desktop__button-label">Pixel Mode</span> </div>'
    document.querySelector(".ct-character-header-desktop__group--short-rest").parentNode.insertBefore(div, document.querySelector(".ct-character-header-desktop__group--short-rest"));
    div.oncontextmenu = function (e) {
        e.preventDefault();
    }

    div.addEventListener('mouseup', function (e) {
        e.preventDefault();
        console.log("Pixels button clicked");

        //e.button describes the mouse button that was clicked
        // 0 is left, 1 is middle, 2 is right
        if (e.button == 0) {
            pixelModeOnlyOnce = true;
        }

        pixelMode = !pixelMode;
        if (pixelMode) {
            div.firstChild.classList.add("ct-character-header-desktop__group--pixels-active");

            document.querySelectorAll(".integrated-dice__container").forEach((element) => {
                originalDiceClick.push(element);

                let elClone = element.cloneNode(true);

                element.parentNode.replaceChild(elClone, element);
                elClone.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Dice clicked");

                    let modifier = getModifierFromButton(elClone);
                    let dieType = getDieTypeFromButton(elClone);
                    let amount = getAmountFromButton(elClone);

                    currentlyExpectedRoll = {
                        "modifier": modifier,
                        "dieType": dieType,
                        "amount": amount
                    };
                };
            });
        } else {
            div.firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");

            document.querySelectorAll(".integrated-dice__container").forEach((element, index) => {
                element.parentNode.replaceChild(originalDiceClick[index], element);
            });

            originalDiceClick = [];
            pixelModeOnlyOnce = false;
        }
    });

    div.addEventListener('mouseover', function (e) {
        e.preventDefault();
        console.log("Pixels button hovered");

        if (!tootltipShown) {

            let topleft = getPageTopLeft(div);

            displayTooltip("Left click to enable pixel mode for 1 roll.<br>Right click to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
            //displayTooltip("Test", topleft.left, topleft.top);
            tootltipShown = true;
        }
    });

    div.addEventListener('mouseout', function (e) {
        e.preventDefault();
        console.log("Pixels button unhovered");

        if (tootltipShown) {
            document.querySelector(".tippy-popper--pixel-mode").remove();
            tootltipShown = false;
        }
    });
}

function addPixelsInfoBox() {
    // The info box should live on the left side of the page
    // It should have a little icon that expands the box when clicked
    // When clicked again, it should collapse the box

    let div = document.createElement("div");
    div.className = "pixels-info-box";

    div.innerHTML = '<div class="pixels-info-box__content"> <div class="pixels-info-box__content__title">Pixel Info</div> <div class="pixels-info-box__content__text"> <p id="pixel-amount" class="no-pixel-warning">You currently have no pixel dice connected!</p> <p class="todo_text">You currently have nothing to do!</p> </div> </div>';
    document.querySelector("body").appendChild(div);

    // add style to the info box (it should be on the left side of the page and be closed by default)
    // it should expand to the right when opened and be roughly 300px wide

    GM_addStyle(`.pixels-info-box { position: fixed; top: 52px; left: 0%; width: 320px; height: 200px; background-color: rgba(0,0,0,0.90); z-index: 999`);
    GM_addStyle(`.pixels-info-box__content { position: absolute; top: 0%; left: 5%; width: 90%; right: 5%; height: 100%; }`);
    GM_addStyle(`.pixels-info-box__content__title { position: absolute; top: 0%; left: 0%; width: 100%; height: 10%; font-size: 1.5em; text-align: center; color: white; }`);
    GM_addStyle(`.pixels-info-box__content__text { position: absolute; top: 10%; left: 0%; width: 100%; height: 90%; font-size: 1em; text-align: center; color: white; overflow-y:auto; }`);
    GM_addStyle(`.no-pixel-warning { color: yellow; }`);

    // the box should be closed by default
    div.style.display = "none";

    // add a button that opens and closes the box
    let button = document.createElement("button");
    button.className = "pixels-info-box__button";
    button.innerHTML = '<img src="https://www.google.com/s2/favicons?sz=32&domain=https://gamewithpixels.com/">';
    button.onclick = (e) => {
        e.preventDefault();
        console.log("Pixels info box button clicked");

        if (div.style.display === "none") {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    };
    document.querySelector("body").appendChild(button);

    // add style to the button
    GM_addStyle(`.pixels-info-box__button { position: fixed; top: 20px; left: 0%; width: 32px; height: 32px; border: 0; background-color: transparent; z-index: 999`);


}

function displayDieRoll(dieType, value, modifier = 0) {
    let div = document.createElement("div");
    div.id = generateDnDBeyondId();

    let innerDiv = '<div id="roll_list_entry_UUID" role="alert" aria-live="polite" class="noty_layout uncollapse" onclick="this.remove()"> <div id="noty_bar_UUID" class="noty_bar noty_type__alert noty_theme__valhalla noty_close_with_click"> <div class="noty_body"> <div class="dice_result "> <div class="dice_result__info"> <div class="dice_result__info__title"><span class="dice_result__info__rolldetail"> </span><span class="dice_result__rolltype rolltype_roll" style="animation: linear party-time-text 1s infinite;">pixel roll</span></div> <div class="dice_result__info__results"><span class="dice-icon-die dice-icon-die--DIETYPE" alt=""></span></div><span class="dice_result__info__dicenotation" title="1DIETYPE">1DIETYPE</span> </div> <div class="dice_result__total-container"><span class="dice_result__total-result dice_result__total-result-">VALUE</span></div> </span> </div> </div> <div class="noty_progressbar"></div> </div> </div>'
    innerDiv = innerDiv.replace("UUID", generateDnDBeyondId());
    innerDiv = innerDiv.replaceAll("DIETYPE", dieType);
    if (modifier !== 0) {
        if (modifier > 0) {
            innerDiv = innerDiv.replaceAll("VALUE", value + " + " + modifier + " = " + (value + modifier));
        } else {
            innerDiv = innerDiv.replaceAll("VALUE", value + appendSpacesToSignOfNegativeNumbers(modifier) + " = " + (value + modifier));
        }
    }
    innerDiv = innerDiv.replaceAll("VALUE", value);

    div.innerHTML = innerDiv;
    document.querySelector(".pixels-info-box__content__text").appendChild(div);

    //add styles
    GM_addStyle(`.dice-icon-die--DIETYPE { background-image: url("https://gamewithpixels.com/dice/DIETYPE.png"); }`);
    let id = "#" + div.firstChild.id;
    GM_addStyle(`${id} { margin-top: 5px; }`);
}

function displayWhatUserNeedsToDo(text = undefined) {
    if (text === undefined) {
        text = "You currently have nothing to do!";
    }

    document.querySelector(".todo_text").innerHTML = text;
}

function updateCurrentPixels() {
    let amount = window.pixels.length;
    let text = "You currently have " + amount + " pixel dice connected!";
    if (amount === 0) {
        text = "You currently have no pixel dice connected!";
    } else {
        // Now we list how many of each connected dice type we have
        let diceTypes = {};
        window.pixels.forEach((pixel) => {
            if (diceTypes[pixel.dieType] === undefined) {
                diceTypes[pixel.dieType] = 1;
            } else {
                diceTypes[pixel.dieType]++;
            }
        });

        text += "<br><br>";
        for (const [key, value] of Object.entries(diceTypes)) {
            text += value + "x " + key + "<br>";
        }
    }
    document.querySelector("#pixel-amount").innerHTML = text;
}

function getDieTypeFromButton(button) {
    let dieType = "";
    if (typeof button.firstChild === "object" && typeof button.firstChild.data === "string") {
        dieType = button.firstChild.data;
    } else {
        dieType = button.firstChild.getAttribute("aria-label");
        if (dieType === null) {
            dieType = button.firstChild.firstChild.innerHTML;

            if (dieType === undefined) {
                dieType = button.firstChild.innerHTML;
            }
        }
    }

    dieType = dieType.replaceAll(" ", "");

    if (dieType.includes("d")) {
        dieType = "d" + dieType.split("d")[1];
        dieType = dieType.split("+");

        if (dieType.length > 1) {
            dieType = dieType[0];
        } else {
            dieType = dieType[0].split("-")[0];
        }
    } else {
        dieType = "d20";
    }

    return dieType;
}

function getModifierFromButton(button) {
    let modifier = 0;
    if (typeof button.firstChild === "object" && typeof button.firstChild.data === "string") {
        modifier = button.firstChild.data;
    } else {

        modifier = button.firstChild.getAttribute("aria-label");
        if (modifier === null) {
            modifier = button.firstChild.firstChild.innerHTML;

            if (modifier === undefined) {
                modifier = button.firstChild.innerHTML;
            }
        }
    }

    modifier = modifier.replaceAll(" ", "");
    if (modifier.includes("d")) {
        modifier = modifier.split("+");
        if (modifier.length > 1) {
            modifier = modifier[1];
        } else {
            modifier = modifier[0].split("-")[1] * -1;

            if (isNaN(modifier)) {
                modifier = 0;
            }
        }
    } else {
        modifier = parseInt(modifier);
    }

    return modifier;
}

function getAmountFromButton(button) {
    let amount = 1;
    if (typeof button.firstChild === "object" && typeof button.firstChild.data === "string") {
        amount = button.firstChild.data;
    } else {
        amount = button.firstChild.getAttribute("aria-label");
        if (amount === null) {
            amount = button.firstChild.firstChild.innerHTML;

            if (amount === undefined) {
                amount = button.firstChild.innerHTML;
            }
        }
    }

    amount = amount.replaceAll(" ", "");
    if (amount.includes("d")) {
        let oldAmount = amount;
        amount = amount.split("d")[0];

        if (amount === oldAmount) {
            amount = 1;
        }
    } else {
        amount = 1;
    }

    amount = parseInt(amount);

    return amount;
}

function checkForOpenGameLog() {
    let gameLog = document.querySelector("[class*='GameLogEntries']");

    if (gameLog !== null) {
        if (!currentlyUpdatingGameLog) {
            currentlyUpdatingGameLog = true;
            if (gameLogOpen) {
                if (rolledJsonArrayIndex < rolledJsonArray.length - 1) {
                    rolledJsonArrayIndex++;
                    appendElementToGameLog(rolledJsonArray[rolledJsonArrayIndex]);
                }
                if (rolledJsonArray.length === 1 && rolledJsonArrayIndex === 0 && firstEntryAddedToGameLog === false) {
                    appendElementToGameLog(rolledJsonArray[rolledJsonArrayIndex]);
                    firstEntryAddedToGameLog = true;
                }
            } else {
                rolledJsonArrayIndex = 0;
                document.querySelectorAll(".pixels-added-entry").forEach((element) => {
                    element.remove();
                });

                for (let i = 0; i < rolledJsonArray.length; i++) {
                    appendElementToGameLog(rolledJsonArray[i]);
                    rolledJsonArrayIndex = i;
                    firstEntryAddedToGameLog = true;
                }

                gameLogOpen = true;
            }
            currentlyUpdatingGameLog = false;
        }
    } else {
        gameLogOpen = false;
        rolledJsonArrayIndex = 0;
    }
}


function createToast(dieType, total, value, modifier = 0, diceNotationStr = undefined) {
    let div = document.createElement("div");
    div.id = generateDnDBeyondId();

    if (diceNotationStr === undefined) {
        diceNotationStr = "1" + dieType;
    }

    let innerDiv = '<div id="noty_layout__bottomRight" role="alert" aria-live="polite" class="noty_layout uncollapse" onclick="this.remove()"> <div id="noty_bar_UUID" class="noty_bar noty_type__alert noty_theme__valhalla noty_close_with_click"> <div class="noty_body"> <div class="dice_result "> <div class="dice_result__info"> <div class="dice_result__info__title"><span class="dice_result__info__rolldetail"> </span><span class="dice_result__rolltype rolltype_roll" style="animation: linear party-time-text 1s infinite;">pixel roll</span></div> <div class="dice_result__info__results"><span class="dice-icon-die dice-icon-die--DIETYPE" alt=""></span></div><span class="dice_result__info__dicenotation" title="AMOUNTDIETYPE">DICENOTATIONSTR</span> </div> <div class="dice_result__total-container"><span class="dice_result__total-result dice_result__total-result-">VALUE</span></div> </span> </div> </div> <div class="noty_progressbar"></div> </div> </div>'
    innerDiv = innerDiv.replace("UUID", generateDnDBeyondId());
    innerDiv = innerDiv.replaceAll("DIETYPE", dieType);
    innerDiv = innerDiv.replaceAll("DICENOTATIONSTR", diceNotationStr);

    let fullValue = "";
    if (currentlyExpectedRoll.amount > 1) {
        for (let i = 0; i < currentlyExpectedRoll.amount; i++) {
            fullValue += multiRolls[i] + "+";
        }
        fullValue = fullValue.slice(0, -1);
    }

    if (fullValue === "") {
        fullValue = "" + value;
    }

    if (modifier !== 0) {
        if (modifier > 0) {
            innerDiv = innerDiv.replaceAll("VALUE", fullValue + "+" + modifier + " = " + (total));
        } else {
            innerDiv = innerDiv.replaceAll("VALUE", fullValue + "" + modifier + " = " + (total));
        }
    } else if (fullValue.includes("+")) {
        innerDiv = innerDiv.replaceAll("VALUE", fullValue + " = " + total);
    }
    innerDiv = innerDiv.replaceAll("VALUE", fullValue);

    div.innerHTML = innerDiv;
    document.querySelector("body").appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 8000);
}

window.appendElementToGameLog = function (json) {
    let gameLog = document.querySelector("[class*='GameLogEntries']");

    let element = document.createElement("li");
    element.className = "tss-8-Self-ref tss-1kuahcg-GameLogEntry-Self-Flex pixels-added-entry";
    let innerDiv = '<div class="tss-1e6zv06-MessageContainer-Flex"> <div class="tss-dr2its-Line-Flex"><span class="tss-1tj70tb-Sender">CHARACTER_NAME</span></div> <div class="tss-8-Self-ref tss-cmvb5s-Message-Self-Flex"> <div class="tss-iqf1z5-Container-Flex"> <div class="tss-24rg5g-DiceResultContainer-Flex"> <div class="tss-kucurx-Result"> <div class="tss-3-Self-ref tss-1rj7iab-Line-Title-Self"><span class="tss-cx78hg-Action">WHAT</span>: <span class="tss-1xoxte4-RollType">TYPE</span> </div> <div class="tss-16k6xf2-Line-Breakdown"><svg width="32" height="32" fill="currentColor" title="D20" class="tss-1qy7qai-DieIcon"> <path d="M16 1l14 7.45v15l-1 .596L16 31 2 23.55V8.45L16 1zm5 19.868H10l6 7.45 5-7.45zm-13.3.496L5 22.954l7.1 3.874-4.4-5.464zm16.6-.1l-4.4 5.464 7.1-3.874-2.7-1.59zM4 13.716v7.55l2.7-1.59-2.7-5.96zm24 0l-2.7 5.96.2.1 2.5 1.49v-7.55zM16 9.841l-6 9.04h12l-6-9.04zm-2-.596l-9.6.795 3.7 7.947L14 9.245zm4 0l5.8 8.742 3.7-8.047-9.5-.695zm-1-5.464V7.16l7.4.596L17 3.781zm-2 0L7.6 7.755l7.4-.596V3.78z"> </path> </svg><span class="tss-3-Self-ref tss-1nuv2ow-Line-Number-Self" title="COMBINED">COMBINED</span> </div> <div class="tss-1wcf5kt-Line-Notation"><span>DICE_NOTATION</span></div> </div><svg width="19" height="70" viewBox="0 0 19 100" class="tss-1ddr9a0-DividerResult"> <path fill="currentColor" d="M10 0v30H9V0zm0 70v30H9V70zm9-13H0v-3h19zm0-10H0v-3h19z"></path> </svg> <div class="tss-1jo3bnd-TotalContainer-Flex"> <div class="tss-3-Self-ref tss-183k5bv-Total-Self-Flex"><span>VALUE</span></div> </div> </div> <div class="tss-1tqix15-DicePreviewContainer-Flex"> <div class="tss-yuoem4-SetPreviewContainer-Flex"><span class="tss-2auhl5-PreviewThumbnail-DieThumbnailContainer"><span title="2" class="tss-171s1s1-DieThumbnailWrapper"><img class="tss-s4qeha-DieThumbnailImage" src="https://www.dndbeyond.com/dice/images/thumbnails/00101-d20-2.png" alt="d20 roll of 2"></span></span> <div class="tss-xdfhrf-SetPreviewDescriptionContainer"> <div class="tss-1dhkeq7-Divider"></div> <div class="tss-1x8v1yt-SetPreviewActionsContainer-Flex"><span class="tss-15yp4kz-SetPreviewDescription">Rolled with Basic Black: Black</span> </div> </div> </div> <div class="tss-eaaqq4-DieThumbnailsList"></div> </div> </div> </div><time datetime="DATETIME" title="DATETIME_HUMAN" class="tss-1yxh2yy-TimeAgo-TimeAgo">TIME_HUMAN</time> </div>';

    innerDiv = innerDiv.replaceAll("CHARACTER_NAME", getCharacterName());
    innerDiv = innerDiv.replaceAll("WHAT", "custom");
    innerDiv = innerDiv.replaceAll("TYPE", "roll");
    innerDiv = innerDiv.replaceAll("COMBINED", json.data.rolls[0].result.text);
    innerDiv = innerDiv.replaceAll("DICE_NOTATION", json.data.rolls[0].diceNotationStr);
    innerDiv = innerDiv.replaceAll("VALUE", json.data.rolls[0].result.total);
    // date time in this format: 2024-01-08T20:01:30+01:00
    innerDiv = innerDiv.replaceAll("DATETIME", new Date(json.dateTime).toISOString());
    // date time in this format: 1/8/2024 8:01 PM (force AM/PM)
    innerDiv = innerDiv.replaceAll("DATETIME_HUMAN", new Date(json.dateTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));
    // time in this format: 8:01 PM (force AM/PM)
    innerDiv = innerDiv.replaceAll("TIME_HUMAN", new Date(json.dateTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).split(",")[0]);

    element.innerHTML = innerDiv;

    gameLog.prepend(element);
}

window.rollDice = rollDice;
window.pwc = pixelsWebConnect;
window.updateCurrentPixels = updateCurrentPixels;
window.createToast = createToast;
window.currentlyExpectedRoll = currentlyExpectedRoll;

function GM_addStyle(css) {
    const style = document.getElementById("GM_addStyleBy8626") || (function () {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = "GM_addStyleBy8626";
        document.head.appendChild(style);
        return style;
    })();
    const sheet = style.sheet;
    sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}

function appendSpacesToSignOfNegativeNumbers(number) {
    if (number < 0) {
        return " - " + number.toString().substring(1);
    } else {
        return number;
    }
}

function getPageTopLeft(el) {
    var rect = el.getBoundingClientRect();
    var docEl = document.documentElement;
    return {
        left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0),
        top: rect.top + (window.pageYOffset || docEl.scrollTop || 0)
    };
}

function displayTooltip(tooltipText, x, y) {
    let styleText = "z-index: 9999; transition-duration: 350ms; visibility: visible; position: absolute; top: 0px; left: 0px; will-change: transform; transform: translate3d(xpospx, ypospx, 0px);";
    styleText = styleText.replace("xpos", x);
    styleText = styleText.replace("ypos", y);

    let innerHTML = '<div class="tippy-tooltip custom-dark-theme" data-size="regular" data-animation="scale" data-state="visible" style="transition-duration: 100ms; top: 0px;"><div class="tippy-arrow" style=""></div><div class="tippy-content">TEXT</div></div>';
    innerHTML = innerHTML.replace("TEXT", tooltipText);

    let tooltip = document.createElement("div");
    tooltip.className = "tippy-popper tippy-popper--pixel-mode";
    tooltip.id = "tippy-50";
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("x-placement", "top");
    tooltip.setAttribute("style", styleText);

    tooltip.innerHTML = innerHTML;

    document.querySelector("body").appendChild(tooltip);
}