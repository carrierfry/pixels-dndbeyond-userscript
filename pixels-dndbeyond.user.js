// ==UserScript==
// @name         Pixels DnD Beyond
// @namespace    http://tampermonkey.net/
// @version      0.8.5.3
// @description  Use Pixel Dice on DnD Beyond
// @author       carrierfry
// @match        https://www.dndbeyond.com/characters/*
// @icon         https://raw.githubusercontent.com/carrierfry/pixels-dndbeyond-userscript/main/chrome_extension/img/red_128x128.png
// @run-at       document-start
// @grant        none
// @updateURL    https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js
// @downloadURL  https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js
// @require      https://unpkg.com/@systemic-games/pixels-web-connect@1.2.0/dist/umd/index.js
// @require      https://unpkg.com/@systemic-games/pixels-edit-animation@1.2.0/dist/umd/index.js
// ==/UserScript==

const { repeatConnect, requestPixel, getPixel, Color } = pixelsWebConnect;
const { createDataSetForAnimation, EditAnimationRainbow } = pixelsEditAnimation;

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
};

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
};

const toDoLookup = {
    "d4": "You need to roll x d4!",
    "d6": "You need to roll x d6!",
    "d8": "You need to roll x d8!",
    "d10": "You need to roll x d10!",
    "d12": "You need to roll x d12!",
    "d20": "You need to roll x d20!",
};

let gamelogClassLookup = {
    "save": "tss-sbzcdr-RollType",
    "roll": "tss-1xoxte4-RollType",
    "check": "tss-34aoqs-RollType",
    "to hit": "tss-r93asv-RollType",
    "damage": "tss-t7co22-RollType"
};

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
let doubledAmount = false;
let last2D20Rolls = [];
let nextDmgRollIsCrit = false;
let beyond20Installed = false;
let characterData = {};
let gameLogEntries = [];
let lastHealth = -1;
let currentlyObserving = false;
let socketRetryCount = 0;
let d100RollHappening = false;
let d100RollParts = [];
let specialLighting = false;
let beyond20CustomRollNoSend = false;

let nextAdvantageRoll = false;
let nextDisadvantageRoll = false;
let nextCriticalRoll = false;
let nextEveryoneRoll = false;
let nextSelfRoll = false;
let nextDMRoll = false;

let useCustomDebouncing = false;
let debounceThreshold = 1000;

let lastGameId = 0;

let isTabletView = false;
let isMobileView = false;
let pixelModeMobileTracker = false;

const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        for (const addedNode of mutation.addedNodes) {
            if (addedNode.classList !== undefined && !addedNode.classList.contains("pixels-added-entry") && !addedNode.classList.contains("reordered-entry")) {
                // move element to first position of game log
                let gameLog = document.querySelector("[class*='GameLogEntries']");
                if (gameLog !== null) {
                    setTimeout(() => {
                        addedNode.classList.add("reordered-entry");
                        gameLog.prepend(addedNode);
                        console.log("Reordered entry");
                    }, 100);
                }
            }
        }
    }
};

const observer = new MutationObserver(callback);

// Intercept the WebSocket constructor so we can get the socket object
let socket = null;
const nativeWebSocket = window.WebSocket;
function interceptSocket() {
    window.WebSocket = function (...args) {
        console.log("Intercepting socket");
        const socketTmp = new nativeWebSocket(...args);
        socket = socketTmp;

        socket.addEventListener("close", (event) => {
            interceptSocket();
        });

        checkForOtherPeoplesRolls();

        window.WebSocket = nativeWebSocket;

        return socketTmp;
    };
}
interceptSocket();


setTimeout(main, 500);

// Main function
function main() {
    if (!checkIfCharacterSheetLoaded()) {
        setTimeout(main, 500);
        return;
    }

    if ((!socket || socket.readyState !== 1) && socketRetryCount < 8) {
        console.log("socket not ready");
        setTimeout(main, 500);
        socketRetryCount++;
        return;
    }

    navigator.bluetooth.getAvailability().then(isBluetoothAvailable => {
        if (isBluetoothAvailable) {
            setTimeout(() => {
                if (socket && socket.readyState === 1) {
                    getCompleteCharacterData();
                }
            }, 1000);
            checkIfBeyond20Installed();

            let color;
            if (isTabletView) {
                color = window.getComputedStyle(document.querySelector(".ct-character-header-tablet__button")).getPropertyValue("border-color");
            } else if (isMobileView) {
                color = window.getComputedStyle(document.querySelector(".ct-status-summary-mobile__button")).getPropertyValue("border-color");
            } else {
                color = window.getComputedStyle(document.querySelector(".ct-character-header-desktop__button")).getPropertyValue("border-color");
            }

            GM_addStyle(`.ct-character-header-desktop__group--pixels-active{ background-color:  ${color} !important; }`);
            GM_addStyle(`.ct-character-header-desktop__group--pixels-not-available { cursor: default !important; background-color: darkgray !important; border-color: darkgray !important; }`);
            GM_addStyle(`#red-pixel-icon { filter: brightness(30%) sepia(1) saturate(25); }`);
            addPixelsLogoButton();
            addPixelModeButton();
            addPixelsInfoBox();
            addDiceOverviewBox();
            checkForAutoConnect();
            loadLocalStorage();
            setInterval(checkForOpenGameLog, 500);
            setInterval(checkIfCharacterSheetLoaded, 1000);
            setInterval(checkForMissingPixelButtons, 1000);
            setInterval(checkForContextMenu, 300);
            setInterval(checkForTodo, 300);
            if (!isMobileView && !isTabletView) {
                setInterval(listenForRightClicks, 300);
            } else {
                setInterval(listenForLongHold, 300)
            }
            setInterval(listenForMouseOverOfNavItems, 300);
            setInterval(listenForQuickNavMenu, 20);
            setInterval(checkForHealthChange, 300);
        } else {
            let alertText = "";
            if (detectOS() === "Linux") {
                alertText = "Make sure that Web Bluetooth is enabled: chrome://flags/#enable-web-bluetooth. ";
            }
            if (navigator.brave !== undefined && navigator.brave.isBrave()) {
                alertText += "Please enable Web Bluetooth by opening the following URL brave://flags/#brave-web-bluetooth-api";
                alert(alertText);
            } else {
                alertText += "Make sure you have a Bluetooth Receiver connected. If that's the case, your browser does not support the Bluetooth Web API. Use a different browser";
                alert(alertText);
            }
        }
    });
}

function loadLocalStorage() {
    if (localStorage.getItem("lightingCheckbox") !== null) {
        specialLighting = localStorage.getItem("lightingCheckbox") === "true";
        document.getElementById("diceOption").checked = specialLighting;
    }

    if (localStorage.getItem("beyond20Checkbox") !== null) {
        beyond20CustomRollNoSend = localStorage.getItem("beyond20Checkbox") === "true";
        document.getElementById("beyond20CustomRolls").checked = beyond20CustomRollNoSend;
    }

    if (localStorage.getItem("useCustomDebouncer") !== null) {
        useCustomDebouncing = localStorage.getItem("useCustomDebouncer") === "true";
        document.getElementById("useCustomDebouncer").checked = useCustomDebouncing;
    }
}

function checkIfBeyond20Installed() {
    let beyond20 = document.querySelector(".ct-beyond20-settings-button");
    if (beyond20 !== null) {
        beyond20Installed = true;
    }

}

function checkForMissingPixelButtons() {
    // When you for example resize the window, so that the mobile view is shown, the buttons are removed. After resizing back to desktop view, the buttons do not
    // get added back. This function checks for that and adds them back if they are missing.

    if (isMobileView) {
        if (document.querySelector(".nav-list__item--connect-to-pixels") === null) {
            addPixelsLogoButton();
        }
        if (document.querySelector(".ct-character-header-mobile__group--pixels") === null) {
            addPixelModeButton();
        }
    } else if (isTabletView) {
        if (document.querySelector(".nav-list__item--connect-to-pixels") === null) {
            addPixelsLogoButton();
        }
        if (document.querySelector(".ct-character-header-tablet__group--pixels") === null) {
            addPixelModeButton();
        }
    } else {
        let forgeButton = document.querySelectorAll(".ct-character-header-desktop__group--builder");
        let pixelModeButton = document.querySelectorAll(".ct-character-header-desktop__group--pixels");
        if (forgeButton.length > 0 && pixelModeButton.length === 0) {
            addPixelsLogoButton();
            addPixelModeButton();
        }
    }
}

function checkForContextMenu() {
    let contextMenus = document.querySelectorAll(".MuiPopover-paper");
    let contextMenu = null;
    contextMenus.forEach((element) => {
        if (element.innerHTML.includes("Roll With:") || element.innerHTML.includes("Roll As:")) {
            contextMenu = element;
        }
    });

    if (contextMenu !== null) {
        let diceToolbar = document.querySelector(".dice-toolbar__dropdown-selected");
        if (diceToolbar === null) {
            addRollWithPixelButton(contextMenu);
            contextMenuShown = true;
        }
    } else {
        contextMenuShown = false;
    }
}

function checkForTodo() {
    if (Object.keys(currentlyExpectedRoll).length !== 0) {
        // let modifier = currentlyExpectedRoll.modifier;
        let dieType = currentlyExpectedRoll.dieType;
        let amount = currentlyExpectedRoll.origAmount;

        let text = toDoLookup[dieType];

        if (currentlyExpectedRoll.advantage) {
            text += " (Advantage)";
            text = text.replaceAll("x", (2 * amount));
        } else if (currentlyExpectedRoll.disadvantage) {
            text += " (Disadvantage)";
            text = text.replaceAll("x", (2 * amount));
        } else if (currentlyExpectedRoll.critical) {
            text += " (Critical Hit)";
            text = text.replaceAll("x", (2 * amount));
        } else {
            text = text.replaceAll("x", amount);
        }

        displayWhatUserNeedsToDo(text);
    } else {
        displayWhatUserNeedsToDo();
    }
}

function checkForHealthChange() {
    let element = document.querySelector('div[aria-labelledby="ct-health-summary-current-label ct-health-summary-label"]');
    if (element === null) {
        element = document.querySelector(".ct-status-summary-mobile__hp-current");
    }
    if (element !== null) {
        let currentHealth = parseInt(element.innerText);

        if (lastHealth === -1) {
            lastHealth = currentHealth;
        }

        if (currentHealth < lastHealth) {
            lightUpAllPixels("damage");
        } else if (currentHealth > lastHealth) {
            lightUpAllPixels("heal");
        }

        lastHealth = currentHealth;
    } else if (document.querySelector(".ct-health-summary__deathsaves-icon") !== null && lastHealth > 0) {
        lightUpAllPixels("damage");

        lastHealth = 0;
    }
}

function addRollWithPixelButton(contextMenu) {
    if (!contextMenuShown) {
        let button = document.createElement("button");
        button.id = "roll-with-pixels-button";
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
            let rollType = getRollTypeFromButton(lastRightClickedButton);
            let rollName = getRollNameFromButton(lastRightClickedButton);

            let { adv, dis, crit, target, scope } = determineRollType(e.currentTarget);

            currentlyExpectedRoll = {
                "modifier": modifier,
                "dieType": dieType,
                "amount": amount,
                "origAmount": amount,
                "advantage": adv,
                "disadvantage": dis,
                "critical": crit,
                "rollType": rollType,
                "rollName": rollName,
                "target": target,
                "scope": scope
            };

            nextAdvantageRoll = false;
            nextDisadvantageRoll = false;
            nextCriticalRoll = false;
            nextEveryoneRoll = false;
            nextSelfRoll = false;
            nextDMRoll = false;

            if (window.pixels !== undefined && pixels.length > 0) {
                for (let i = 0; i < pixels.length; i++) {
                    if (pixels[i].dieType === dieType || (pixels[i].dieType === "d6pipped" && dieType === "d6")) {
                        lightUpPixel(pixels[i], "waitingForRoll");
                    }
                }
            }
        };

        contextMenu.firstChild.appendChild(button);
    }
}

function listenForRightClicks() {
    document.querySelectorAll(".integrated-dice__container").forEach((element) => {
        element.removeEventListener('mousedown', handleRightClick);

        element.addEventListener('mousedown', handleRightClick);
    });
}

function listenForLongHold() {
    document.querySelectorAll(".integrated-dice__container").forEach((element) => {
        element.removeEventListener('touchstart', handleLongHold);

        element.addEventListener('touchstart', handleLongHold);
    })
}

function handleRightClick(e) {
    //e.button describes the mouse button that was clicked
    // 0 is left, 1 is middle, 2 is right
    if (e.button == 2 || e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        // console.log("Dice right clicked");

        lastRightClickedButton = e.currentTarget;
    }
}

function handleLongHold(e) {
    //e.preventDefault();
    //e.stopPropagation();

    lastRightClickedButton = e.currentTarget;
}

function listenForMouseOverOfNavItems() {
    let navItems = document.querySelectorAll(".ddbc-tab-list__nav-item");
    navItems.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
    });

    let optionsHeader = document.querySelectorAll(".ddbc-tab-options__header");
    optionsHeader.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
    });
}

function listenForQuickNavMenu() {
    if (isMobileView || isTabletView) {
        let quickNav = document.querySelectorAll(".ct-quick-nav__menu");
        let swiperMenu = document.querySelectorAll(".ct-component-carousel__placeholders--changing");
        if (quickNav.length > 0 || swiperMenu.length > 0) {
            if (!pixelModeMobileTracker) {
                console.log("Quick nav menu opened");
                handleMouseEnter();
                pixelModeMobileTracker = true;
            }
        } else {
            if (pixelModeMobileTracker) {
                console.log("Quick nav menu closed");
                handleMouseLeave();
                pixelModeMobileTracker = false;
            }
        }
    }
}

function handleMouseEnter(e) {
    if (!isMobileView && !isTabletView) {
        e.preventDefault();
        e.stopPropagation();
    }
    // console.log("Nav item hovered");

    if (pixelMode) {
        document.querySelectorAll(".integrated-dice__container").forEach((element, index) => {
            element.parentNode.replaceChild(originalDiceClick[index], element);
        });

        originalDiceClick = [];
    }
}

function handleMouseLeave(e) {
    if (!isMobileView && !isTabletView) {
        e.preventDefault();
        e.stopPropagation();
    }
    // console.log("Nav item left");

    if (pixelMode) {
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
                let rollType = getRollTypeFromButton(elClone);
                let rollName = getRollNameFromButton(elClone);

                let { adv, dis, crit, target, scope } = determineRollType(e.currentTarget);

                currentlyExpectedRoll = {
                    "modifier": modifier,
                    "dieType": dieType,
                    "amount": amount,
                    "origAmount": amount,
                    "advantage": adv,
                    "disadvantage": dis,
                    "critical": crit,
                    "rollType": rollType,
                    "rollName": rollName,
                    "target": target,
                    "scope": scope
                };

                if (nextAdvantageRoll && !dis && !crit) {
                    currentlyExpectedRoll.advantage = true;
                }
                if (nextDisadvantageRoll && !adv && !crit) {
                    currentlyExpectedRoll.disadvantage = true;
                }
                if (nextCriticalRoll && !adv && !dis) {
                    currentlyExpectedRoll.critical = true;
                }
                if (nextEveryoneRoll) {
                    setRollTarget("everyoneButton");
                }
                if (nextSelfRoll) {
                    setRollTarget("selfButton");
                }
                if (nextDMRoll) {
                    setRollTarget("dmButton");
                }


                if (window.pixels !== undefined && pixels.length > 0) {
                    for (let i = 0; i < pixels.length; i++) {
                        if (pixels[i].dieType === dieType || (pixels[i].dieType === "d6pipped" && dieType === "d6")) {
                            lightUpPixel(pixels[i], "waitingForRoll");
                        }
                    }
                }
            };
        });
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
function buildInitialJson(dieType, modifier = 0, amount = 1, rollkind = "", rolltype = "roll", action = "custom", target = getGameId(), scope = "gameId") {
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
            json.data.rolls[0].diceNotationStr = amount + dieType + getDiceNotationStrForRollType(rollkind) + "+" + modifier;
        } else {
            json.data.rolls[0].diceNotationStr = amount + dieType + getDiceNotationStrForRollType(rollkind) + modifier;
        }
    }
    json.data.rolls[0].rollKind = rollkind;
    if (rollkind === "critical") {
        json.data.rolls[0].rollKind = "critical hit";
    }
    if (rolltype !== "roll") {
        json.data.rolls[0].rollType = rolltype;
    }
    if (action !== "custom") {
        json.data.action = action;
    }
    json.data.context.messageTarget = "" + target;
    json.data.context.messageScope = scope;
    json.messageTarget = "" + target;
    json.messageScope = scope;
    return json;
}

function buildRolledJson(dieType, rollId, dieValue, modifier = 0, amount = 1, rollkind = "", rolltype = "roll", action = "custom", target = getGameId(), scope = "gameId") {
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
    json.data.rolls[0].diceNotationStr = amount + dieType + getDiceNotationStrForRollType(rollkind);
    if (modifier !== 0) {
        json.data.rolls[0].diceNotation.constant = modifier;
        json.data.rolls[0].result.constant = modifier;
        json.data.rolls[0].result.total += modifier;
        if (modifier > 0) {
            json.data.rolls[0].diceNotationStr = amount + dieType + getDiceNotationStrForRollType(rollkind) + "+" + modifier;
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
            json.data.rolls[0].diceNotationStr = "" + amount + dieType + getDiceNotationStrForRollType(rollkind) + modifier;
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
    json.data.rolls[0].rollKind = rollkind;
    if (rollkind === "critical") {
        json.data.rolls[0].rollKind = "critical hit";
    }
    if (rollkind === "advantage" || rollkind === "disadvantage") {
        let lastPlusIndex;
        if (modifier < 0) {
            lastPlusIndex = json.data.rolls[0].result.text.lastIndexOf('-');
        } else if (modifier === 0) {
            lastPlusIndex = json.data.rolls[0].result.text.length;
        } else {
            lastPlusIndex = json.data.rolls[0].result.text.lastIndexOf('+');
        }

        let firstPart = json.data.rolls[0].result.text.substring(0, lastPlusIndex); // "1+2+3"
        firstPart = firstPart.replaceAll('+', ',');
        let secondPart = json.data.rolls[0].result.text.substring(lastPlusIndex); // "+4"

        if (secondPart[0] === '-') {
            secondPart = "+" + secondPart;
        }

        json.data.rolls[0].result.text = "(" + firstPart + ")" + secondPart;
        if (rollkind === "disadvantage") {
            json.data.rolls[0].result.total = Math.min(...json.data.rolls[0].result.values) + modifier;
        } else {
            json.data.rolls[0].result.total = Math.max(...json.data.rolls[0].result.values) + modifier;
        }
    }
    if (rolltype !== "roll") {
        json.data.rolls[0].rollType = rolltype;
    }
    if (action !== "custom") {
        json.data.action = action;
    }
    json.data.context.messageTarget = "" + target;
    json.data.context.messageScope = scope;
    json.messageTarget = "" + target;
    json.messageScope = scope;
    return json;
}

// Adds a button that lets you connect to Pixels
function addPixelsLogoButton() {
    let button = document.createElement("li");
    button.className = "mm-nav-item";
    if (isMobileView || isTabletView) {
        button.className = "nav-list__item nav-list__item--connect-to-pixels";
    }

    // create a link
    let link = document.createElement("a");
    link.className = "mm-nav-item__label mm-nav-item__label--link";
    if (isMobileView || isTabletView) {
        link.className = "nav-list__item__label";
    }
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
    if (isMobileView || isTabletView) {
        lastNavItem = document.querySelectorAll(".nav-list__item");
    }
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
    if (lastGameId !== 0) {
        return lastGameId;
    }
    let gameId;
    if (!isMobileView && !isTabletView) {
        gameId = document.querySelector(".ddbc-tooltip").firstChild;
    } else {
        gameId = document.querySelector(".ddbc-link")
    }
    lastGameId = gameId.href.split("/")[4];
    return lastGameId;
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

function getCompleteCharacterData() {
    let campaignId = getGameId();
    let url = "https://www.dndbeyond.com/api/campaign/stt/active-campaigns/" + campaignId;

    fetch("https://auth-service.dndbeyond.com/v1/cobalt-token", {
        "headers": {
            "accept": "*/*",
            "accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en;q=0.7,en-US;q=0.6",
            "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.dndbeyond.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(response => response.json()).then(data1 => {
        // fetch the URL and put the json into the characterData variable
        fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "de-DE,de;q=0.9,en-DE;q=0.8,en;q=0.7,en-US;q=0.6",
                "authorization": "Bearer " + data1.token,
                "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "referrer": "https://www.dndbeyond.com/characters/" + getCharacterId(),
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(response => response.json()).then(data => {
            characterData = data;
        });
    });
}

// "Rolls" a die. You can specify the dice type and value and it will send the appropriate messages to the server.
function rollDice(dieType, value) {
    let modifier = 0;
    let multiRollComplete = false;
    let amount = 1;
    let forcedMultiRoll = false;

    if (dieType === "d20") {
        last2D20Rolls.push(value);
        if (last2D20Rolls.length > 2) {
            last2D20Rolls.shift();
        }
    }

    if (Object.keys(currentlyExpectedRoll).length !== 0) {
        if (currentlyExpectedRoll.dieType !== dieType) {
            console.log("wrong die type");
            return;
        }

        if (currentlyExpectedRoll.amount > 1) {
            multiRolls.push(value);
            if (currentlyExpectedRoll.advantage || currentlyExpectedRoll.disadvantage || currentlyExpectedRoll.critical) {

                if (!doubledAmount) {
                    currentlyExpectedRoll.amount = currentlyExpectedRoll.amount * 2;
                }
                if (multiRolls.length === currentlyExpectedRoll.amount) {
                    multiRollComplete = true;
                    amount = currentlyExpectedRoll.amount;
                }
                doubledAmount = true;
            } else {
                if (multiRolls.length === currentlyExpectedRoll.amount) {
                    multiRollComplete = true;
                    amount = currentlyExpectedRoll.amount;
                }
            }
        } else if (currentlyExpectedRoll.amount === 1 && (currentlyExpectedRoll.advantage || currentlyExpectedRoll.disadvantage || currentlyExpectedRoll.critical) && !doubledAmount) {
            multiRolls.push(value);
            multiRollComplete = false;
            currentlyExpectedRoll.amount = currentlyExpectedRoll.amount * 2
            amount = currentlyExpectedRoll.amount;
            forcedMultiRoll = true;
            doubledAmount = true;
        }

        modifier = parseInt(currentlyExpectedRoll.modifier);
    }

    if (multiRollComplete || Object.keys(currentlyExpectedRoll).length === 0 || currentlyExpectedRoll.amount === 1) {
        let initJson;
        if (d100RollHappening && d100RollParts.length === 0) {
            d100RollParts.push(value);
            console.log("waiting for second d100 roll part");
        } else if (d100RollHappening && d100RollParts.length === 1) {
            d100RollParts.push(value);
            let d100Value = d100RollParts[0] + d100RollParts[1];
            if (d100Value === 0) {
                d100Value = 100;
            }
            initJson = buildInitialJson("d100", modifier, d100Value);
        } else {
            if (Object.keys(currentlyExpectedRoll).length > 0) {
                initJson = buildInitialJson(dieType, modifier, amount, getRollKind(), currentlyExpectedRoll.rollType, currentlyExpectedRoll.rollName, currentlyExpectedRoll.target, currentlyExpectedRoll.scope);
            } else {
                initJson = buildInitialJson(dieType, modifier, amount);
            }

            if (socket && socket.readyState === 1) {
                socket.send(JSON.stringify(initJson));
            }

            let dieValue = value || Math.floor(Math.random() * diceTypes[dieType].result.total) + 1;

            let rolledJson;
            if (Object.keys(currentlyExpectedRoll).length > 0) {
                rolledJson = buildRolledJson(dieType, initJson.data.rollId, dieValue, modifier, amount, getRollKind(), currentlyExpectedRoll.rollType, currentlyExpectedRoll.rollName, currentlyExpectedRoll.target, currentlyExpectedRoll.scope);
            } else {
                rolledJson = buildRolledJson(dieType, initJson.data.rollId, dieValue, modifier, amount);
            }

            if (socket && socket.readyState === 1) {
                setTimeout(() => {
                    // console.log("sending value: " + dieValue);
                    socket.send(JSON.stringify(rolledJson));
                }, 1000);
            }

            if (Object.keys(currentlyExpectedRoll).length > 0 && (currentlyExpectedRoll.advantage || currentlyExpectedRoll.disadvantage)) {
                if (currentlyExpectedRoll.advantage && last2D20Rolls.length === 2 && (last2D20Rolls[0] === 20 || last2D20Rolls[1] === 20)) {
                    nextDmgRollIsCrit = true;
                } else if (currentlyExpectedRoll.disadvantage && last2D20Rolls.length === 2 && (last2D20Rolls[0] === 1 && last2D20Rolls[1] === 1)) {
                    nextDmgRollIsCrit = true;
                }
            } else if (Object.keys(currentlyExpectedRoll).length > 0 && last2D20Rolls[last2D20Rolls.length - 1] === 20 && dieType === "d20") {
                nextDmgRollIsCrit = true;
            }

            createToast(dieType, rolledJson.data.rolls[0].result.total, rolledJson.data.rolls[0].result.values[0], modifier, rolledJson.data.rolls[0].diceNotationStr);
            // displayDieRoll(dieType, value, modifier);
            // appendElementToGameLog(rolledJson);
            rolledJsonArray.push(rolledJson);
            currentlyExpectedRoll = {};

            if (pixelModeOnlyOnce && pixelMode) {
                pixelMode = false;
                if (isTabletView) {
                    document.querySelector(".ct-character-header-tablet__group--pixels").firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");
                } else if (isMobileView) {
                    document.querySelector(".ct-character-header-mobile__group--pixels").firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");
                } else {
                    document.querySelector(".ct-character-header-desktop__group--pixels").firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");
                }
                //document.querySelector(".ct-character-header-desktop__group--pixels").firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");
                document.querySelectorAll(".integrated-dice__container").forEach((element, index) => {
                    element.parentNode.replaceChild(originalDiceClick[index], element);
                });
                originalDiceClick = [];
                pixelModeOnlyOnce = false;
            }

            if (multiRollComplete) {
                multiRolls = [];
            }
            doubledAmount = false;

            document.querySelector("#advButton").style.backgroundColor = "darkgray";
            document.querySelector("#critButton").style.backgroundColor = "darkgray";
            document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
            document.querySelector("#everyoneButton").style.backgroundColor = "darkgray";
            document.querySelector("#selfButton").style.backgroundColor = "darkgray";
            document.querySelector("#dmButton").style.backgroundColor = "darkgray";

            nextAdvantageRoll = false;
            nextDisadvantageRoll = false;
            nextCriticalRoll = false;
            nextEveryoneRoll = false;
            nextSelfRoll = false;
            nextDMRoll = false;

            d100RollHappening = false;
            d100RollParts = [];
        }
    } else {
        console.log("waiting for more rolls");
    }
}

// Connects to a Pixel via the Pixels Web Connect library
async function requestMyPixel() {

    const pixel = await requestPixel();

    handleConnection(pixel);
}

async function lightUpPixel(pixel, reason = undefined) {
    if (reason === "waitingForRoll") {
        await pixel.blink(Color.dimYellow, { count: 3, duration: 2000, fade: 0.3 });
    } else if (reason === "connected") {
        await pixel.blink(Color.dimGreen, { count: 1, duration: 1500, fade: 0.8 });
    } else if (reason === "damage") {
        await pixel.blink(Color.dimRed, { count: 2, duration: 3000, fade: 1 });
    } else if (reason === "heal") {
        await pixel.blink(Color.dimGreen, { count: 2, duration: 3000, fade: 1 });
    } else if (reason === "quickLightUp") {
        await pixel.blink(Color.dimMagenta, { count: 3, duration: 1000, fade: 0.8 });
    } else if (reason === "nat1") {
        await pixel.blink(Color.dimRed, { count: 1, duration: 3000, fade: 1 });
    } else if (reason === "nat20") {
        await rainbowPixel(pixel);
    } else if (reason === "none") {
        // DO NOTHING
    } else {
        await pixel.blink(Color.brightCyan);
    }
}

async function lightUpAllPixels(reason = undefined) {
    if (window.pixels !== undefined) {
        for (let i = 0; i < pixels.length; i++) {
            await lightUpPixel(pixels[i], reason);
        }
    }
}

async function rainbowPixel(pixel) {
    // Create a simple rainbow animation
    const editDataSet = createDataSetForAnimation(
        new EditAnimationRainbow({
            duration: 3,
            count: 2,
            fade: 0.5,
            intensity: 0.3
        })
    );

    // And play it on the Pixel die
    await pixel.playTestAnimation(editDataSet.toDataSet());
}

async function checkForAutoConnect() {
    if (!!navigator?.bluetooth?.getDevices) {
        let systemIds = JSON.parse(localStorage.getItem("pixelsSystemIds"));
        if (systemIds !== null) {
            for (let i = 0; i < systemIds.length; i++) {
                let pixel = await getPixel(systemIds[i]);

                if (pixel !== undefined) {
                    handleConnection(pixel);
                }
            }
        }
    }
}

async function handleConnection(pixel) {

    if (!window.pixels) {
        window.pixels = [];
    }

    let systemIds = JSON.parse(localStorage.getItem("pixelsSystemIds"));
    if (systemIds === null) {
        systemIds = [];
    }

    console.log("Connecting...");
    await repeatConnect(pixel);

    if (pixel.dieType === "d6fudge") {
        await pixel.disconnect();
        console.log("Fudge dice are not supported! Die disconnected.");
        return;
    }

    pixel.manualDisconnect = false;
    pixel.debounceTimeStart = -1;
    pixel.debounceTimeEnd = -1;
    pixel.currentlyRollingOrHandling = false;

    if (!containsObject(pixel, window.pixels)) {

        pixel.addEventListener("roll", (face) => {
            // console.log(`=> rolled face: ${face}`);

            if (useCustomDebouncing && pixel.debounceTimeStart !== -1) {
                if (pixel.debounceTimeEnd - pixel.debounceTimeStart < debounceThreshold) {
                    // console.log((debounceTimeEnd - debounceTimeStart));
                    // console.log("Roll too fast, ignoring...");
                    pixel.stopAllAnimations();
                    return;
                }
            }

            pixel.debounceTimeStart = -1;
            pixel.debounceTimeEnd = -1;
            // For now only D20, other dice in the future when I have my own dice and can explore the data structures :(
            if (pixel.dieType === "d6pipped") {
                rollDice("d6", face);
            } else {
                rollDice(pixel.dieType, face);
            }
        });

        pixel.addEventListener("rollState", (state) => {
            // console.log(`=> rollState: ${state}`);
            // console.log(state);

            if (pixel.dieType === "d10" || pixel.dieType === "d00") {
                if (state.state === "rolling") {
                    // check if the other die (d10 or d00) is also rolling
                    for (let i = 0; i < window.pixels.length; i++) {
                        if ((pixel.dieType === "d00" && window.pixels[i].dieType === "d10" && window.pixels[i].status === "rolling")
                            || (pixel.dieType === "d10" && window.pixels[i].dieType === "d00" && window.pixels[i].status === "rolling")) {
                            d100RollHappening = true;
                        }
                    }
                }
            }

            if (useCustomDebouncing) {
                if ((state.state === "rolling" || state.state === "handling") && !pixel.currentlyRollingOrHandling) {
                    pixel.debounceTimeStart = Date.now();
                    pixel.currentlyRollingOrHandling = true;
                } else if (!pixel.currentlyRollingOrHandling && state.state === "onFace") {
                    pixel.debounceTimeStart = Date.now();
                    pixel.debounceTimeEnd = Date.now();
                } else if (state.state === "onFace") {
                    pixel.debounceTimeEnd = Date.now();
                    pixel.currentlyRollingOrHandling = false;
                }
            }
        });

        pixel.addEventListener("status", (status) => {
            // console.log(`=> status: ${status}`);

            if (pixel.manualDisconnect === false) {
                if (status === "disconnected") {
                    setTimeout(() => {
                        console.log("Reconnecting...");
                        repeatConnect(pixel);
                    }, 1000);
                }
            }

            if (status === "ready") {
                pixel.manualDisconnect = false;
                lightUpPixel(pixel, "connected");
                addDieToTable(pixel);
            }
        });

        window.pixels.push(pixel);
    }

    addDieToTable(pixel);
    lightUpPixel(pixel, "connected");
    document.querySelector(".pixels-info-box").style.display = "block";
    updateCurrentPixels();

    if (!containsObject(pixel.systemId, systemIds)) {
        systemIds.push(pixel.systemId);
        localStorage.setItem("pixelsSystemIds", JSON.stringify(systemIds));
    }
}

function addPixelModeButton() {
    let div = document.createElement("div");
    if (isTabletView) {
        div.className = "ct-character-header-tablet__group ct-character-header-tablet__group--pixels";
    } else if (isMobileView) {
        div.className = "ct-character-header-mobile__group ct-character-header-mobile__group--pixels";
    } else {
        div.className = "ct-character-header-desktop__group ct-character-header-desktop__group--pixels";
    }

    div.style = "user-select: none;";

    div.innerHTML = '<div class="ct-character-header-desktop__button" role="button" tabindex="0"> <div class="ct-character-header-desktop__button-icon"> <img id="red-pixel-icon" src="https://raw.githubusercontent.com/carrierfry/pixels-dndbeyond-userscript/main/img/white.png" width="16px" height="16px"> </div> <span class="ct-character-header-desktop__button-label">Pixel Mode</span> </div>'
    if (isTabletView) {
        document.querySelector(".ct-character-header-tablet__group--short-rest").parentNode.insertBefore(div, document.querySelector(".ct-character-header-tablet__group--short-rest"));
    } else if (isMobileView) {
        document.querySelector(".ct-character-header-mobile__group--gap").appendChild(div);
    } else {
        document.querySelector(".ct-character-header-desktop__group--short-rest").parentNode.insertBefore(div, document.querySelector(".ct-character-header-desktop__group--short-rest"));
    }
    div.oncontextmenu = function (e) {
        e.preventDefault();
    }

    if (!beyond20Installed) {

        let longPressStart = 0;

        div.addEventListener('touchstart', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (longPressStart === 0) {
                longPressStart = Date.now();

                if (!tootltipShown) {

                    let topleft = getPageTopLeft(div);

                    if (!beyond20Installed) {
                        if (isMobileView) {
                            displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left) - 50, parseInt(topleft.top) - 50);
                        } else if (isTabletView) {
                            displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
                        } else {
                            displayTooltip("Left click to enable pixel mode for 1 roll.<br>Right click to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
                        }
                    } else {
                        displayTooltip("Pixel Mode is not available when Beyond20 is installed<br>Use the right click menu instead or disable Beyond20", parseInt(topleft.left), parseInt(topleft.top) - 75);
                    }

                    tootltipShown = true;
                }
            }
        })

        function handleMouseUpTouchEnd(e) {
            e.preventDefault();
            console.log("Pixels button clicked");

            //e.button describes the mouse button that was clicked
            // 0 is left, 1 is middle, 2 is right
            if (e.button == 0 && !e.ctrlKey) {
                pixelModeOnlyOnce = true;
                console.log("Pixels button clicked once");
            }

            if (isMobileView || isTabletView) {
                if (longPressStart > 0 && Date.now() - longPressStart > 300) {
                    pixelModeOnlyOnce = false;
                    console.log("Pixels button long clicked");
                } else {
                    pixelModeOnlyOnce = true;
                }
            }

            longPressStart = 0;

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
                        let rollType = getRollTypeFromButton(elClone);
                        let rollName = getRollNameFromButton(elClone);

                        let { adv, dis, crit, target, scope } = determineRollType(e.currentTarget);

                        currentlyExpectedRoll = {
                            "modifier": modifier,
                            "dieType": dieType,
                            "amount": amount,
                            "origAmount": amount,
                            "advantage": adv,
                            "disadvantage": dis,
                            "critical": crit,
                            "rollType": rollType,
                            "rollName": rollName,
                            "target": target,
                            "scope": scope
                        };

                        if (nextAdvantageRoll && !dis && !crit) {
                            currentlyExpectedRoll.advantage = true;
                        }
                        if (nextDisadvantageRoll && !adv && !crit) {
                            currentlyExpectedRoll.disadvantage = true;
                        }
                        if (nextCriticalRoll && !adv && !dis) {
                            currentlyExpectedRoll.critical = true;
                        }
                        if (nextEveryoneRoll) {
                            setRollTarget("everyoneButton");
                        }
                        if (nextSelfRoll) {
                            setRollTarget("selfButton");
                        }
                        if (nextDMRoll) {
                            setRollTarget("dmButton");
                        }

                        if (window.pixels !== undefined && pixels.length > 0) {
                            for (let i = 0; i < pixels.length; i++) {
                                if (pixels[i].dieType === dieType || (pixels[i].dieType === "d6pipped" && dieType === "d6")) {
                                    lightUpPixel(pixels[i], "waitingForRoll");
                                }
                            }
                        }
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
            if (isMobileView || isTabletView) {
                if (tootltipShown) {
                    document.querySelector(".tippy-popper--pixel-mode").remove();
                    tootltipShown = false;
                }
            }
        }

        if (isMobileView || isTabletView) {
            div.addEventListener('touchend', handleMouseUpTouchEnd);
        } else {
            div.addEventListener('mouseup', handleMouseUpTouchEnd);
        }
    } else {
        div.firstChild.classList.add("ct-character-header-desktop__group--pixels-not-available");
    }

    div.addEventListener('mouseover', function (e) {
        e.preventDefault();
        // console.log("Pixels button hovered");

        if (!tootltipShown) {

            let topleft = getPageTopLeft(div);

            if (!beyond20Installed) {
                if (isMobileView) {
                    displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left) - 50, parseInt(topleft.top) - 50);
                } else if (isTabletView) {
                    displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
                } else {
                    displayTooltip("Left click to enable pixel mode for 1 roll.<br>Right click to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
                }
            } else {
                displayTooltip("Pixel Mode is not available when Beyond20 is installed<br>Use the right click menu instead or disable Beyond20", parseInt(topleft.left), parseInt(topleft.top) - 75);
            }

            tootltipShown = true;
        }
    });

    div.addEventListener('mouseout', function (e) {
        e.preventDefault();
        // console.log("Pixels button unhovered");

        if (tootltipShown) {
            document.querySelector(".tippy-popper--pixel-mode").remove();
            tootltipShown = false;
        }
    });

    GM_addStyle(".ct-character-header-mobile__group--pixels { width: 140px; margin-left: calc(100% - 140px); }");
}

function addPixelsInfoBox() {
    // The info box should live on the left side of the page
    // It should have a little icon that expands the box when clicked
    // When clicked again, it should collapse the box

    let div = document.createElement("div");
    div.className = "pixels-info-box";

    div.innerHTML = '<div class="pixels-info-box__content"> <div class="pixels-info-box__content__title">Pixel Info</div> <div class="pixels-info-box__content__text"> <p id="pixel-amount" class="no-pixel-warning">You currently have no pixel dice connected!</p> <p class="todo_text">You currently have nothing to do!</p> </div> <div class="pixels-info-box__content__buttons_overview"> <button id="diceOverviewButton">Dice Overview</button> </div> <div class="pixels-info-box__content__buttons_target"> <button id="everyoneButton">Everyone</button> <button id="selfButton">Self</button> <button id="dmButton">DM</button> </div> <div class="pixels-info-box__content__buttons"> <button id="advButton">Adv.</button> <button id="critButton">Crit</button> <button id="disadvButton">Disadv.</button> </div> </div>';
    document.querySelector("body").appendChild(div);

    // add style to the info box (it should be on the left side of the page and be closed by default)
    // it should expand to the right when opened and be roughly 300px wide

    if (isMobileView || isTabletView) {
        GM_addStyle(`.pixels-info-box { position: fixed; top: 50px; left: calc(50% - 25%); width: 50%; min-width: 250px; height: 250px; background-color: rgba(0,0,0,0.90); z-index: 999`);
    } else {
        GM_addStyle(`.pixels-info-box { position: fixed; top: 50px; left: 0%; width: 320px; height: 250px; background-color: rgba(0,0,0,0.90); z-index: 999`);
    }
    GM_addStyle(`.pixels-info-box__content { position: absolute; top: 0%; left: 5%; width: 90%; right: 5%; height: 100%; }`);
    GM_addStyle(`.pixels-info-box__content__title { position: absolute; top: 0%; left: 0%; width: 100%; height: 10%; font-size: 1.5em; text-align: center; color: white; }`);
    GM_addStyle(`.pixels-info-box__content__text { position: absolute; top: 10%; left: 0%; width: 100%; height: 80%; font-size: 1em; text-align: center; color: white; overflow-y:auto; }`);
    GM_addStyle(`.pixels-info-box__content__buttons { position: absolute; top: 90%; left: 0%; width: 100%; height: 10%; }`);
    GM_addStyle(`.pixels-info-box__content__buttons_target { position: absolute; top: 75%; left: 0%; width: 100%; height: 10%; }`);
    GM_addStyle(`.pixels-info-box__content__buttons_overview { position: absolute; top: 60%; left: 0%; width: 100%; height: 10%; }`);
    GM_addStyle(`.pixels-info-box__content__buttons button, .pixels-info-box__content__buttons_target button { width: 30%; height: 100%; margin-left: 1%; background-color: darkgray; border: 2px solid; }`);
    GM_addStyle(`.pixels-info-box__content__buttons_overview button { width: 94%; height: 100%; margin-left: 1%; background-color: darkgray; border: 2px solid; }`);
    GM_addStyle(`.pixels-info-box__content__buttons #advButton { border-color: lime; }`);
    GM_addStyle(`.pixels-info-box__content__buttons #critButton { border-color: yellow; }`);
    GM_addStyle(`.pixels-info-box__content__buttons #disadvButton { border-color: red; }`);
    GM_addStyle(`.pixels-info-box__content__buttons_target #everyoneButton { border-color: white; }`);
    GM_addStyle(`.pixels-info-box__content__buttons_target #selfButton { border-color: white; }`);
    GM_addStyle(`.pixels-info-box__content__buttons_target #dmButton { border-color: white; }`);
    GM_addStyle(`.pixels-info-box__content__buttons_overview #diceOverviewButton { border-color: white; }`);
    GM_addStyle(`.no-pixel-warning { color: yellow; }`);

    document.querySelectorAll(".pixels-info-box__content__buttons button").forEach((element) => {
        element.onclick = (e) => {
            setRollType(element.id);
        };
    });

    document.querySelectorAll(".pixels-info-box__content__buttons_target button").forEach((element) => {
        element.onclick = (e) => {
            setRollTarget(element.id);
        };
    });

    document.querySelector("#diceOverviewButton").onclick = (e) => {
        e.preventDefault();

        if (document.querySelector(".dice-overview-box").style.display === "none") {
            document.querySelector(".dice-overview-box").style.display = "block";
        } else {
            document.querySelector(".dice-overview-box").style.display = "none";
        }
    };

    // the box should be closed by default
    div.style.display = "none";

    // add a button that opens and closes the box
    let button = document.createElement("button");
    button.className = "pixels-info-box__button";
    button.innerHTML = '<img src="https://raw.githubusercontent.com/carrierfry/pixels-dndbeyond-userscript/main/chrome_extension/img/colorful_128x128.png" width="32px" height="32px">';
    button.onclick = (e) => {
        e.preventDefault();
        // console.log("Pixels info box button clicked");

        if (div.style.display === "none") {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    };
    document.querySelector("body").appendChild(button);

    // add style to the button
    if (isMobileView || isTabletView) {
        // make button in top middle
        GM_addStyle(`.pixels-info-box__button { position: fixed; top: 6px; left: calc(50% - 16px); width: 32px; height: 32px; border: 0; background-color: transparent; z-index: 999`);
    } else {
        GM_addStyle(`.pixels-info-box__button { position: fixed; top: 18px; left: 0%; width: 32px; height: 32px; border: 0; background-color: transparent; z-index: 999`);
    }

    // Initialize variables for tracking dragging state and position
    let isDragging = false;
    let startPosition = { x: 0, y: 0 };
    let offset = { x: 0, y: 0 };

    // Add mousedown event listener to enable dragging
    div.addEventListener('mousedown', (event) => {
        isDragging = true;
        startPosition = { x: event.clientX, y: event.clientY };
        offset = {
            x: div.offsetLeft - event.clientX,
            y: div.offsetTop - event.clientY
        };
    });

    // Add mousemove event listener to move the element while dragging
    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            div.style.left = `${event.clientX + offset.x}px`;
            div.style.top = `${event.clientY + offset.y}px`;
        }
    });

    // Add mouseup event listener to disable dragging
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function addDiceOverviewBox() {
    let div = document.createElement("div");
    div.className = "dice-overview-box";

    // the box should have a title and a list of all dice that are currently connected
    let innerHTML = '<div class="dice-overview-box__content"> <div class="dice-overview-box__content__title">Dice Overview</div> <button id="closeDiceOverviewButton" class="dice-overview-box__button">X</button> <div class="dice-overview-box__content__features"> auto-reconnect is currently AUTO_STATUS </div> <div class="dice-overview-box__content__settings"> <input type="checkbox" id="diceOption" name="diceOption"><label for="diceOption"> Light up dice when other characters score a natural 1 or 20</label><br> <input type="checkbox" id="beyond20CustomRolls" name="beyond20CustomRolls"><label for="beyond20CustomRolls"> Do not send custom rolls to Roll20 (only relevant when Beyond20 is installed)</label><br> <input type="checkbox" id="useCustomDebouncer" name="useCustomDebouncer"><label for="useCustomDebouncer"> EXPERIMENTAL: Make false positives when rolling less likely</label> </div> <div class="dice-overview-box__content__table"> <table id="diceTable"><tr><th>Type</th><th>Name</th><th>Connection Status</th><th>Roll Status</th><th>Battery</th><th>Face</th><th>Action</th></tr></table> </div> </div>';

    if (!!navigator?.bluetooth?.getDevices) {
        innerHTML = innerHTML.replaceAll('AUTO_STATUS', '<span class="pixelsAutoReconnectStatus" style="color: lime">enabled</span>');
    } else {
        innerHTML = innerHTML.replaceAll('AUTO_STATUS', '<span class="pixelsAutoReconnectStatus" style="color: #ff3333">disabled</span>');
    }
    div.innerHTML = innerHTML;

    document.querySelector("body").appendChild(div);

    if (!(!!navigator?.bluetooth?.getDevices)) {
        document.querySelector(".pixelsAutoReconnectStatus").onmouseover = (e) => {
            e.preventDefault();
            if (!tootltipShown) {
                let topleft = getPageTopLeft(div.children[0].children[2].children[0]);
                displayTooltip('To enable auto-reconnect, make sure you have the "Use the new permissions backend for Web Bluetooth" flag enabled. You can do so by opening "chrome://flags" in a new tab', parseInt(topleft.left), parseInt(topleft.top) - 80);

                tootltipShown = true;
            }
        }

        document.querySelector(".pixelsAutoReconnectStatus").onmouseout = (e) => {
            e.preventDefault();
            if (tootltipShown) {
                document.querySelector(".tippy-popper--pixel-mode").remove();
                tootltipShown = false;
            }
        }
    }

    // add style to the info box (it should be in the middle of the page and be closed by default)

    if (isMobileView || isTabletView) {
        GM_addStyle(`.dice-overview-box { position: fixed; top: 50%; left: 50%; width: 95%; height: 95%; background-color: rgba(0,0,0,0.95); z-index: 999; transform: translate(-50%, -50%); }`);
    } else {
        GM_addStyle(`.dice-overview-box { position: fixed; top: 50%; left: 50%; width: 700px; height: 700px; background-color: rgba(0,0,0,0.95); z-index: 999; transform: translate(-50%, -50%); }`);
    }
    GM_addStyle(`.dice-overview-box__content { position: absolute; top: 0%; left: 5%; width: 90%; right: 5%; height: 100%; }`);
    GM_addStyle(`.dice-overview-box__content__title { position: absolute; top: 0%; left: 0%; width: 100%; height: 10%; font-size: 1.5em; text-align: center; color: white; }`);
    GM_addStyle(`.dice-overview-box__content__features { position: absolute; top: 5%; left: 0%; width: 100%; height: 10%; font-size: 1em; text-align: center; color: white; }`);
    GM_addStyle(`.dice-overview-box__content__settings { position: absolute; top: 10%; left: 0%; width: 100%; height: 10%; font-size: 1em; text-align: left; color: white; }`);
    GM_addStyle(`.dice-overview-box__content__table { position: absolute; top: 20%; left: 0%; width: 100%; height: 90%; }`);
    GM_addStyle(`.dice-overview-box__content__table table { width: 100%; color: white; }`);
    GM_addStyle(`.dice-overview-box__content__table table, th, td { border: 1px solid white; }`);
    // make text in table centered
    GM_addStyle(`.dice-overview-box__content__table table th, td { text-align: center; }`);
    GM_addStyle(`.dice-overview-box__content__table table td a { color: white; }`);
    GM_addStyle(`.dice-overview-box__content__table table td a:hover { cursor: pointer; color: yellow; }`);
    //make the box movable
    GM_addStyle(`.dice-overview-box { -webkit-app-region: drag; }`);


    // the box should be closed by default
    div.style.display = "none";

    let button = document.querySelector("#closeDiceOverviewButton");
    button.onclick = (e) => {
        e.preventDefault();
        // console.log("Dice overview box button clicked");

        div.style.display = "none";
    };

    let lightingCheckbox = document.querySelector("#diceOption");
    lightingCheckbox.onclick = (e) => {
        specialLighting = lightingCheckbox.checked;
        localStorage.setItem("lightingCheckbox", specialLighting);
    };

    let beyond20Checkbox = document.querySelector("#beyond20CustomRolls");
    beyond20Checkbox.onclick = (e) => {
        beyond20CustomRollNoSend = beyond20Checkbox.checked;
        localStorage.setItem("beyond20Checkbox", beyond20CustomRollNoSend);
    };

    let debounceCheckbox = document.querySelector("#useCustomDebouncer");
    debounceCheckbox.onclick = (e) => {
        useCustomDebouncing = debounceCheckbox.checked;
        localStorage.setItem("useCustomDebouncer", useCustomDebouncing);
    }

    // add style to the button (it should be in the top right corner of the box)
    GM_addStyle(`.dice-overview-box__button { position: absolute; top: 0%; right: 0%; width: 32px; height: 32px; border: 0; background-color: transparent; color: white; z-index: 999`);
}

function addDieToTable(pixel) {
    let table = document.querySelector("#diceTable");
    let newRow = undefined;
    let onlyUpdate = false;

    // insert a new cell for each column in the row
    let typeCell = undefined;
    let nameCell = undefined;
    let connectionStatusCell = undefined;
    let rollStatusCell = undefined;
    let batteryCell = undefined;
    let faceCell = undefined;
    let actionCell = undefined;

    // check if a row for this pixel already exists
    if (document.getElementById("pixel" + pixel.pixelId) === null) {
        newRow = table.insertRow(-1);

        // insert a new cell for each column in the row
        typeCell = newRow.insertCell(0);
        nameCell = newRow.insertCell(1);
        connectionStatusCell = newRow.insertCell(2);
        rollStatusCell = newRow.insertCell(3);
        batteryCell = newRow.insertCell(4);
        faceCell = newRow.insertCell(5);
        actionCell = newRow.insertCell(6);
    } else {
        newRow = document.getElementById("pixel" + pixel.pixelId);
        onlyUpdate = true;

        typeCell = newRow.children[0];
        nameCell = newRow.children[1];
        connectionStatusCell = newRow.children[2];
        rollStatusCell = newRow.children[3];
        batteryCell = newRow.children[4];
        faceCell = newRow.children[5];
        actionCell = newRow.children[6];
    }

    if (!onlyUpdate) {
        newRow.id = "pixel" + pixel.pixelId;
        actionCell.innerHTML = '<a id="pixel' + pixel.pixelId + 'LightUp">Light up</a> | <a id="pixel' + pixel.pixelId + 'Disconnect">Disconnect</a>';

        document.querySelector("#pixel" + pixel.pixelId + "LightUp").addEventListener('click', function (e) {
            e.preventDefault();
            console.log("Light up button clicked");

            lightUpPixel(pixel, "quickLightUp");
        });

        document.querySelector("#pixel" + pixel.pixelId + "Disconnect").addEventListener('click', function (e) {
            e.preventDefault();
            console.log("Disconnect button clicked");

            pixel.manualDisconnect = true;
            pixel.disconnect();
            let systemIds = JSON.parse(localStorage.getItem("pixelsSystemIds"));
            if (systemIds !== null) {
                systemIds = systemIds.filter(e => e !== pixel.systemId);
                localStorage.setItem("pixelsSystemIds", JSON.stringify(systemIds));
            }
            updateCurrentPixels();
        });
    }

    // add the data to the cells
    typeCell.innerHTML = pixel.dieType;
    nameCell.innerHTML = pixel.name;
    connectionStatusCell.innerHTML = pixel.status;
    rollStatusCell.innerHTML = pixel.rollState;
    batteryCell.innerHTML = pixel.batteryLevel + "%";
    faceCell.innerHTML = pixel.currentFace;

    if (!pixel.manualDisconnect) {
        setTimeout(() => {
            addDieToTable(pixel);
        }, 300);
    } else {
        newRow.remove();
    }
}

function displayWhatUserNeedsToDo(text = undefined) {
    if (text === undefined) {
        text = "You currently have nothing to do!";
    }

    document.querySelector(".todo_text").innerHTML = text;
}

function updateCurrentPixels() {
    let amount = 0;
    for (let i = 0; i < window.pixels.length; i++) {
        if (window.pixels[i].status !== "disconnected") {
            amount++;
        }
    }
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
            text += value + "x " + key + ", ";
        }
        text = text.substring(0, text.length - 2);
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

function getRollNameFromButton(button) {
    let potentialName = button.closest(".ct-skills__item");
    if (potentialName !== null) {
        potentialName = potentialName.querySelector(".ct-skills__col--skill").innerHTML;
    } else if (button.closest(".ct-quick-info__ability") !== null) {
        potentialName = button.closest(".ct-quick-info__ability").querySelector(".ddbc-ability-summary__abbr").innerText;
    } else if (button.closest(".ct-main-mobile__ability") !== null) {
        potentialName = button.closest(".ct-main-mobile__ability").querySelector(".ddbc-ability-summary__abbr").innerText;
    } else if (button.closest(".ct-main-tablet__ability") !== null) {
        potentialName = button.closest(".ct-main-tablet__ability").querySelector(".ddbc-ability-summary__abbr").innerText;
    } else if (button.closest(".ddbc-saving-throws-summary__ability-modifier") !== null) {
        potentialName = button.closest(".ddbc-saving-throws-summary__ability-modifier").parentElement.children[3].firstChild.innerText;
    } else if (button.closest(".ct-initiative-box") !== null || button.closest(".ct-combat-mobile__extra--initiative") !== null) {
        potentialName = "Initiative";
    } else if (button.closest(".ddbc-combat-attack__action") !== null) {
        potentialName = button.closest(".ddbc-combat-attack__action").parentElement.children[1].firstChild.firstChild.innerText;
    } else if (button.closest(".ddbc-combat-attack__damage") !== null) {
        potentialName = button.closest(".ddbc-combat-attack__damage").parentElement.children[1].firstChild.firstChild.innerText;
    } else if (button.closest(".ct-spells-spell__damage") !== null) {
        potentialName = button.closest(".ct-spells-spell__damage").parentElement.children[1].firstChild.firstChild.innerText;
    } else if (button.closest(".ct-spells-spell__attacking") !== null) {
        potentialName = button.closest(".ct-spells-spell__attacking").parentElement.children[1].firstChild.firstChild.innerText;
    } else {
        potentialName = "custom";
    }

    //check if last character is a *
    if (potentialName[potentialName.length - 1] === "*") {
        potentialName = potentialName.substring(0, potentialName.length - 1);
    }

    return potentialName;
}

function getRollTypeFromButton(button) {
    let potentialRollType = "roll";
    let potentialRollTypeDiv = button.closest(".ct-subsection--skills");
    if (potentialRollTypeDiv !== null || button.closest(".ct-skills__item") !== null) {
        potentialRollType = "check";
    } else if (button.closest(".ct-quick-info__ability") !== null || button.closest(".ct-main-mobile__ability") !== null || button.closest(".ct-main-tablet__ability") !== null) {
        potentialRollType = "check";
    } else if (button.closest(".ddbc-saving-throws-summary__ability-modifier") !== null) {
        potentialRollType = "save";
    } else if (button.closest(".ddbc-combat-attack__action") !== null) {
        potentialRollType = "to hit";
    } else if (button.closest(".ddbc-combat-attack__damage") !== null) {
        potentialRollType = "damage";
    } else if (button.closest(".ct-spells-spell__damage") !== null) {
        potentialRollType = "damage";
    } else if (button.closest(".ct-spells-spell__attacking") !== null) {
        potentialRollType = "to hit";
    }
    return potentialRollType;
}

function checkForOpenGameLog() {
    const config = { attributes: false, childList: true, subtree: false };
    let gameLog = document.querySelector("[class*='GameLogEntries']");

    if (gameLog !== null) {

        if (!currentlyObserving) {
            currentlyObserving = true;
            observer.observe(gameLog, config);
        }

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
        // reorderGamelog();
    } else {
        gameLogOpen = false;
        rolledJsonArrayIndex = 0;

        if (currentlyObserving) {
            currentlyObserving = false;
            observer.disconnect();
        }
    }
}

function setRollType(type) {
    if (Object.keys(currentlyExpectedRoll).length !== 0) {
        if (type === "advButton" || type === "advantage" || nextAdvantageRoll) {
            currentlyExpectedRoll.advantage = !currentlyExpectedRoll.advantage;
            currentlyExpectedRoll.disadvantage = false;
            currentlyExpectedRoll.critical = false;
            if (currentlyExpectedRoll.advantage) {
                document.querySelector("#advButton").style.backgroundColor = "lime";
                document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
                document.querySelector("#critButton").style.backgroundColor = "darkgray";
            } else {
                document.querySelector("#advButton").style.backgroundColor = "darkgray";
            }
        } else if (type === "critButton" || type === "critical" || nextCriticalRoll) {
            currentlyExpectedRoll.critical = !currentlyExpectedRoll.critical;
            currentlyExpectedRoll.advantage = false;
            currentlyExpectedRoll.disadvantage = false;
            if (currentlyExpectedRoll.critical) {
                document.querySelector("#critButton").style.backgroundColor = "yellow";
                document.querySelector("#advButton").style.backgroundColor = "darkgray";
                document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
            } else {
                document.querySelector("#critButton").style.backgroundColor = "darkgray";
            }
        } else if (type === "disadvButton" || type === "disadvantage" || nextDisadvantageRoll) {
            currentlyExpectedRoll.disadvantage = !currentlyExpectedRoll.disadvantage;
            currentlyExpectedRoll.advantage = false;
            currentlyExpectedRoll.critical = false;
            if (currentlyExpectedRoll.disadvantage) {
                document.querySelector("#disadvButton").style.backgroundColor = "red";
                document.querySelector("#advButton").style.backgroundColor = "darkgray";
                document.querySelector("#critButton").style.backgroundColor = "darkgray";
            } else {
                document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
            }
        } else if (type === "normal") {
            currentlyExpectedRoll.advantage = false;
            currentlyExpectedRoll.disadvantage = false;
            currentlyExpectedRoll.critical = false;
            document.querySelector("#advButton").style.backgroundColor = "darkgray";
            document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
            document.querySelector("#critButton").style.backgroundColor = "darkgray";
        }
    } else {
        if (type === "advButton" || type === "advantage") {
            document.querySelector("#advButton").style.backgroundColor = "lime";
            document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
            document.querySelector("#critButton").style.backgroundColor = "darkgray";

            nextAdvantageRoll = true;
            nextDisadvantageRoll = false;
            nextCriticalRoll = false;
        } else if (type === "critButton" || type === "critical") {
            document.querySelector("#critButton").style.backgroundColor = "yellow";
            document.querySelector("#advButton").style.backgroundColor = "darkgray";
            document.querySelector("#disadvButton").style.backgroundColor = "darkgray";

            nextAdvantageRoll = false;
            nextDisadvantageRoll = false;
            nextCriticalRoll = true;
        } else if (type === "disadvButton" || type === "disadvantage") {
            document.querySelector("#disadvButton").style.backgroundColor = "red";
            document.querySelector("#advButton").style.backgroundColor = "darkgray";
            document.querySelector("#critButton").style.backgroundColor = "darkgray";

            nextAdvantageRoll = false;
            nextDisadvantageRoll = true;
            nextCriticalRoll = false;
        } else if (type === "normal") {
            document.querySelector("#advButton").style.backgroundColor = "darkgray";
            document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
            document.querySelector("#critButton").style.backgroundColor = "darkgray";

            nextAdvantageRoll = false;
            nextDisadvantageRoll = false;
            nextCriticalRoll = false;
        }
    }
}

function setRollTarget(type) {
    if (Object.keys(currentlyExpectedRoll).length !== 0) {
        if (type === "everyoneButton" || nextEveryoneRoll) {
            currentlyExpectedRoll.target = getGameId();
            currentlyExpectedRoll.scope = "gameId";
            document.querySelector("#everyoneButton").style.backgroundColor = "white";
            document.querySelector("#selfButton").style.backgroundColor = "darkgray";
            document.querySelector("#dmButton").style.backgroundColor = "darkgray";
        } else if (type === "selfButton" || nextSelfRoll) {
            currentlyExpectedRoll.target = getUserId();
            currentlyExpectedRoll.scope = "userId";
            document.querySelector("#selfButton").style.backgroundColor = "white";
            document.querySelector("#everyoneButton").style.backgroundColor = "darkgray";
            document.querySelector("#dmButton").style.backgroundColor = "darkgray";
        } else if (type === "dmButton" || nextDMRoll) {
            currentlyExpectedRoll.target = characterData.data.dmId;
            currentlyExpectedRoll.scope = "userId";
            document.querySelector("#dmButton").style.backgroundColor = "white";
            document.querySelector("#selfButton").style.backgroundColor = "darkgray";
            document.querySelector("#everyoneButton").style.backgroundColor = "darkgray";
        }
    } else {
        if (type === "everyoneButton") {
            document.querySelector("#everyoneButton").style.backgroundColor = "white";
            document.querySelector("#selfButton").style.backgroundColor = "darkgray";
            document.querySelector("#dmButton").style.backgroundColor = "darkgray";

            nextEveryoneRoll = true;
            nextSelfRoll = false;
            nextDMRoll = false;
        } else if (type === "selfButton") {
            document.querySelector("#selfButton").style.backgroundColor = "white";
            document.querySelector("#everyoneButton").style.backgroundColor = "darkgray";
            document.querySelector("#dmButton").style.backgroundColor = "darkgray";

            nextEveryoneRoll = false;
            nextSelfRoll = true;
            nextDMRoll = false;
        } else if (type === "dmButton") {
            document.querySelector("#dmButton").style.backgroundColor = "white";
            document.querySelector("#selfButton").style.backgroundColor = "darkgray";
            document.querySelector("#everyoneButton").style.backgroundColor = "darkgray";

            nextEveryoneRoll = false;
            nextSelfRoll = false;
            nextDMRoll = true;
        }
    }
}

function determineRollType(rollButton) {
    let adv = false;
    let dis = false;
    let crit = false;
    let target = getGameId();
    let scope = "gameId";

    if (!pixelMode) {

        let list = undefined;
        if (target !== getCharacterId()) {
            list = rollButton.previousSibling.previousSibling.firstChild.nextSibling.nextSibling.nextSibling.firstChild; // ul
        } else {
            list = rollButton.previousSibling.previousSibling.firstChild.nextSibling.firstChild;
        }
        if (list !== null) {
            let children = list.children;
            //children.forEach((element) => {
            for (let i = 0; i < children.length; i++) {
                let element = children[i];
                if (element.children[2] !== undefined) {
                    if (element.children[1].innerHTML.includes("Adv")) {
                        adv = true;
                        setRollType("advantage");
                    } else if (element.children[1].innerHTML.includes("Dis")) {
                        dis = true;
                        setRollType("disadvantage");
                    } else if (element.children[1].innerHTML.includes("Crit")) {
                        crit = true;
                        setRollType("critical");
                    } else {
                        setRollType("normal");
                    }
                }
            };
        }


        list = rollButton.previousSibling.previousSibling.children[1].firstChild; // ul
        if (list !== null) {
            let children = list.children;
            //children.forEach((element) => {
            for (let i = 0; i < children.length; i++) {
                let element = children[i];
                if (element.children[2] !== undefined) {
                    if (element.children[1].innerHTML.includes("Every")) {
                        target = getGameId();
                        scope = "gameId";
                        setRollTarget("everyoneButton");
                    } else if (element.children[1].innerHTML.includes("Self")) {
                        target = getUserId();
                        scope = "userId";
                        setRollTarget("selfButton");
                    } else if (element.children[1].innerHTML.includes("Master")) {
                        target = characterData.data.dmId;
                        scope = "userId";
                        setRollTarget("dmButton");
                    }
                }
            };
        }
    }
    return { adv, dis, crit, target, scope };
}

function getRollKind() {
    if (currentlyExpectedRoll.advantage) {
        return "advantage";
    } else if (currentlyExpectedRoll.disadvantage) {
        return "disadvantage";
    } else if (currentlyExpectedRoll.critical) {
        return "critical";
    } else {
        return "";
    }
}

function createToast(dieType, total, value, modifier = 0, diceNotationStr = undefined) {
    let div = document.createElement("div");
    div.id = generateDnDBeyondId();

    if (diceNotationStr === undefined) {
        diceNotationStr = "1" + dieType;
    }

    // let innerDiv = '<div id="noty_layout__bottomRight" role="alert" aria-live="polite" class="noty_layout uncollapse" onclick="this.remove()"> <div id="noty_bar_UUID" class="noty_bar noty_type__alert noty_theme__valhalla noty_close_with_click"> <div class="noty_body"> <div class="dice_result "> <div class="dice_result__info"> <div class="dice_result__info__title"><span class="dice_result__info__rolldetail"> </span><span class="dice_result__rolltype rolltype_roll" style="animation: linear party-time-text 1s infinite;">pixel roll</span></div> <div class="dice_result__info__results"><span class="dice-icon-die dice-icon-die--DIETYPE" alt=""></span></div><span class="dice_result__info__dicenotation" title="AMOUNTDIETYPE">DICENOTATIONSTR</span> </div> <div class="dice_result__total-container"><span class="dice_result__total-result dice_result__total-result-">VALUE</span></div> </span> </div> </div> <div class="noty_progressbar"></div> </div> </div>'
    let innerDiv = '<div id="noty_layout__bottomRight" role="alert" aria-live="polite" class="noty_layout uncollapse" onclick="this.remove()"><div id="noty_bar_UUID" class="NOBA noty_type__alert noty_theme__valhalla noty_close_with_click"><div class="noty_body"><div class="dice_result CRITICAL"><div class="dice_result__info"><div class="dice_result__info__title"><span class="dice_result__info__rolldetail">custom: </span><span class="dice_result__rolltype rolltype_ROLLTYPE">ROLLTYPE</span></div>POTENTIALTARGET<div class="dice_result__info__results"><span class="dice-icon-die dice-icon-die--DIETYPE" alt=""></span><span class="dice_result__info__breakdown" title="VALUE">VALUE</span></div><span class="dice_result__info__dicenotation" title="DICENOTATIONSTR">DICENOTATIONSTR</span></div><span class="dice_result__divider dice_result__divider--"></span><div class="dice_result__total-container">ROLLKIND<span class="dice_result__total-result dice_result__total-result-">TOTAL</span></div></div></div><div class="noty_progressbar"></div></div></div>';
    innerDiv = innerDiv.replace("UUID", generateDnDBeyondId());
    innerDiv = innerDiv.replaceAll("DIETYPE", dieType);
    innerDiv = innerDiv.replaceAll("DICENOTATIONSTR", diceNotationStr);

    if (beyond20CustomRollNoSend && Object.keys(currentlyExpectedRoll).length === 0) {
        innerDiv = innerDiv.replaceAll("NOBA", "noty_bar_custom");
    } else {
        innerDiv = innerDiv.replaceAll("NOBA", "noty_bar");
    }

    let fullValue = "";
    if (currentlyExpectedRoll.amount > 1) {
        if (currentlyExpectedRoll.advantage || currentlyExpectedRoll.disadvantage) {
            fullValue += "(";
            for (let i = 0; i < currentlyExpectedRoll.amount; i++) {
                fullValue += multiRolls[i] + ",";
            }
            fullValue = fullValue.slice(0, -1);
            fullValue += ")";
        } else {
            for (let i = 0; i < currentlyExpectedRoll.amount; i++) {
                fullValue += multiRolls[i] + "+";
            }
            fullValue = fullValue.slice(0, -1);
        }
    }

    if (currentlyExpectedRoll.rollType !== undefined && currentlyExpectedRoll.rollType !== "custom") {
        innerDiv = innerDiv.replaceAll("custom", currentlyExpectedRoll.rollName);
    }

    if (currentlyExpectedRoll.rollType !== undefined && currentlyExpectedRoll.rollType === "to hit") {
        innerDiv = innerDiv.replace("ROLLTYPE", "tohit");
        innerDiv = innerDiv.replace("ROLLTYPE", "to hit");
    } else if (currentlyExpectedRoll.rollName !== undefined && currentlyExpectedRoll.rollName !== "roll") {
        innerDiv = innerDiv.replaceAll("ROLLTYPE", currentlyExpectedRoll.rollType);
    } else {
        innerDiv = innerDiv.replaceAll("ROLLTYPE", "roll");
    }

    if (fullValue === "") {
        fullValue = "" + value;
    }

    if (modifier !== 0) {
        if (modifier > 0) {
            // innerDiv = innerDiv.replaceAll("VALUE", fullValue + "+" + modifier + " = " + (total));
            innerDiv = innerDiv.replaceAll("VALUE", fullValue + "+" + modifier);
        } else {
            // innerDiv = innerDiv.replaceAll("VALUE", fullValue + "" + modifier + " = " + (total));
            innerDiv = innerDiv.replaceAll("VALUE", fullValue + "+" + modifier);
        }
    } else if (fullValue.includes("+")) {
        innerDiv = innerDiv.replaceAll("VALUE", fullValue);
    }
    innerDiv = innerDiv.replaceAll("VALUE", fullValue);

    innerDiv = innerDiv.replaceAll("TOTAL", total);

    if (currentlyExpectedRoll.advantage) {
        innerDiv = innerDiv.replaceAll("ROLLKIND", '<span class="dice_result__total-header dice_result__total-header--advantage">+ADV</span>');
    } else if (currentlyExpectedRoll.disadvantage) {
        innerDiv = innerDiv.replaceAll("ROLLKIND", '<span class="dice_result__total-header dice_result__total-header--disadvantage">-DIS</span>');
    } else if (currentlyExpectedRoll.critical) {
        innerDiv = innerDiv.replaceAll("ROLLKIND", '<span class="dice_result__total-header dice_result__total-header--crit">CRIT</span>');
        innerDiv = innerDiv.replaceAll("CRITICAL", "dice_result--crit");
    } else {
        innerDiv = innerDiv.replaceAll("ROLLKIND", "");
    }

    if (currentlyExpectedRoll.target !== undefined && currentlyExpectedRoll.target === getUserId() && currentlyExpectedRoll.scope === "userId") {
        innerDiv = innerDiv.replaceAll("POTENTIALTARGET", '\n                        <div class="dice_result__info__title">\n                                <span class="dice_result__info__targetdetail">TO: SELF\n                               </span>\n                            </div>\n                        ');
    } else if (currentlyExpectedRoll.target !== undefined && currentlyExpectedRoll.target === getGameId() && currentlyExpectedRoll.scope === "gameId") {
        innerDiv = innerDiv.replaceAll("POTENTIALTARGET", '');
    } else if (currentlyExpectedRoll.target !== undefined && currentlyExpectedRoll.target === characterData.data.dmId && currentlyExpectedRoll.scope === "userId") {
        innerDiv = innerDiv.replaceAll("POTENTIALTARGET", '\n                        <div class="dice_result__info__title">\n                                <span class="dice_result__info__targetdetail">TO: DM\n                               </span>\n                            </div>\n                        ');
    } else {
        innerDiv = innerDiv.replaceAll("POTENTIALTARGET", '');
    }

    div.innerHTML = innerDiv;
    document.querySelector("body").appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 8000);
}

function checkForOtherPeoplesRolls() {
    if (socket !== undefined) {
        socket.addEventListener('message', function (event) {
            if (event.data === "pong") {
                return;
            }
            let json = JSON.parse(event.data);
            if (json.eventType === "dice/roll/fulfilled") {
                console.log(json);

                if (json.data.rolls[0].diceNotationStr.includes("d20")) {
                    let rollBaseValue = -1;
                    // is roll a single d20
                    if (json.data.rolls[0].result.values.length === 1) {
                        rollBaseValue = json.data.rolls[0].result.values[0];
                    } else {
                        // is roll advantage or disadvantage
                        if (json.data.rolls[0].rollKind === "advantage") {
                            rollBaseValue = Math.max(json.data.rolls[0].result.values[0], json.data.rolls[0].result.values[1]);
                        } else if (json.data.rolls[0].rollKind === "disadvantage") {
                            rollBaseValue = Math.min(json.data.rolls[0].result.values[0], json.data.rolls[0].result.values[1]);
                        }
                    }

                    // is roll nat20 or nat1
                    let lightingType = "none";
                    if (rollBaseValue === 20) {
                        lightingType = "nat20";
                    } else if (rollBaseValue === 1) {
                        lightingType = "nat1";
                    }

                    if (specialLighting) {
                        lightUpAllPixels(lightingType);
                    }
                }
            }
        });
    }
}

window.appendElementToGameLog = function (json) {
    let gameLog = document.querySelector("[class*='GameLogEntries']");

    let element = document.createElement("li");
    element.className = "tss-8-Self-ref tss-1kuahcg-GameLogEntry-Self-Flex pixels-added-entry";
    let innerDiv = '<div class="tss-1e6zv06-MessageContainer-Flex"> <div class="tss-dr2its-Line-Flex"><span class="tss-1tj70tb-Sender">CHARACTER_NAME</span></div> <div class="tss-8-Self-ref tss-cmvb5s-Message-Self-Flex"> <div class="tss-iqf1z5-Container-Flex"> <div class="tss-24rg5g-DiceResultContainer-Flex"> <div class="tss-kucurx-Result"> <div class="tss-3-Self-ref tss-1rj7iab-Line-Title-Self"><span class="tss-cx78hg-Action">WHAT</span>: <span class="CSS_RT">TYPE</span> </div> <div class="tss-16k6xf2-Line-Breakdown"><svg width="32" height="32" fill="currentColor" title="D20" class="tss-1qy7qai-DieIcon"> <path d="M16 1l14 7.45v15l-1 .596L16 31 2 23.55V8.45L16 1zm5 19.868H10l6 7.45 5-7.45zm-13.3.496L5 22.954l7.1 3.874-4.4-5.464zm16.6-.1l-4.4 5.464 7.1-3.874-2.7-1.59zM4 13.716v7.55l2.7-1.59-2.7-5.96zm24 0l-2.7 5.96.2.1 2.5 1.49v-7.55zM16 9.841l-6 9.04h12l-6-9.04zm-2-.596l-9.6.795 3.7 7.947L14 9.245zm4 0l5.8 8.742 3.7-8.047-9.5-.695zm-1-5.464V7.16l7.4.596L17 3.781zm-2 0L7.6 7.755l7.4-.596V3.78z"> </path> </svg><span class="tss-3-Self-ref tss-1nuv2ow-Line-Number-Self" title="COMBINED">COMBINED</span> </div> <div class="tss-1wcf5kt-Line-Notation"><span>DICE_NOTATION</span></div> </div><svg width="19" height="70" viewBox="0 0 19 100" class="tss-1ddr9a0-DividerResult"> <path fill="currentColor" d="M10 0v30H9V0zm0 70v30H9V70zm9-13H0v-3h19zm0-10H0v-3h19z"></path> </svg> <div class="tss-1jo3bnd-TotalContainer-Flex"> <div class="tss-3-Self-ref tss-183k5bv-Total-Self-Flex"><span>VALUE</span></div> </div> </div> <div class="tss-1tqix15-DicePreviewContainer-Flex"> <div class="tss-yuoem4-SetPreviewContainer-Flex"><span class="tss-2auhl5-PreviewThumbnail-DieThumbnailContainer"><span title="2" class="tss-171s1s1-DieThumbnailWrapper"><img class="tss-s4qeha-DieThumbnailImage" src="https://www.dndbeyond.com/dice/images/thumbnails/00101-d20-2.png" alt="d20 roll of 2"></span></span> <div class="tss-xdfhrf-SetPreviewDescriptionContainer"> <div class="tss-1dhkeq7-Divider"></div> <div class="tss-1x8v1yt-SetPreviewActionsContainer-Flex"><span class="tss-15yp4kz-SetPreviewDescription">Rolled with Basic Black: Black</span> </div> </div> </div> <div class="tss-eaaqq4-DieThumbnailsList"></div> </div> </div> </div><time datetime="DATETIME" title="DATETIME_HUMAN" class="tss-1yxh2yy-TimeAgo-TimeAgo">TIME_HUMAN</time> </div>';

    innerDiv = innerDiv.replaceAll("CHARACTER_NAME", getCharacterName());
    innerDiv = innerDiv.replaceAll("WHAT", "custom");
    innerDiv = innerDiv.replaceAll("TYPE", "roll");
    innerDiv = innerDiv.replaceAll("COMBINED", json.data.rolls[0].result.text);
    innerDiv = innerDiv.replaceAll("DICE_NOTATION", json.data.rolls[0].diceNotationStr);
    innerDiv = innerDiv.replaceAll("VALUE", json.data.rolls[0].result.total);
    // date time in this format: "1/14/2024 6:29 PM" (force AM/PM)
    innerDiv = innerDiv.replaceAll("DATETIME_HUMAN", new Date(json.dateTime).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).replace(', ', ' '));
    // time in this format: 8:01 PM (force AM/PM)
    innerDiv = innerDiv.replaceAll("TIME_HUMAN", new Date(json.dateTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).split(",")[0]);
    // date time in this format: 2024-01-08T20:01:30+01:00
    innerDiv = innerDiv.replaceAll("DATETIME", toISOStringWithTimezone(new Date(json.dateTime)));

    innerDiv = innerDiv.replaceAll("custom", json.data.action);
    innerDiv = innerDiv.replaceAll("roll", json.data.rolls[0].rollType);

    innerDiv = innerDiv.replaceAll("CSS_RT", gamelogClassLookup[json.data.rolls[0].rollType]);

    element.innerHTML = innerDiv;

    //add .pixels-added-entry to the class list
    element.classList.add("pixels-added-entry");

    gameLog.prepend(element);
}

function toISOStringWithTimezone(date) {
    const pad = (num) => String(num).padStart(2, '0');
    const timezoneOffset = -date.getTimezoneOffset();
    const sign = timezoneOffset >= 0 ? '+' : '-';
    const hours = pad(Math.abs(Math.floor(timezoneOffset / 60)));
    const minutes = pad(Math.abs(timezoneOffset % 60));

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${hours}:${minutes}`;
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

function getDiceNotationStrForRollType(rollType) {
    if (rollType === "advantage") {
        return "kh1";
    } else if (rollType === "disadvantage") {
        return "kl1";
    } else if (rollType === "critical") {
        return "";
    } else {
        return "";
    }
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

function checkIfCharacterSheetLoaded() {
    if (document.querySelector(".ct-character-header-desktop__group--short-rest") !== null || document.querySelector(".ct-character-header-tablet__group--short-rest") !== null || document.querySelector(".ct-character-header-mobile") !== null) {
        if (document.querySelector(".ct-character-header-tablet__group--short-rest") !== null) {
            isTabletView = true;
            isMobileView = false;
        } else if (document.querySelector(".ct-character-header-mobile") !== null) {
            isTabletView = false;
            isMobileView = true;
        } else {
            isTabletView = false;
            isMobileView = false;
        }
        return true;
    } else {
        return false;
    }
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

function detectOS() {
    let userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}