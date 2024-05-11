// ==UserScript==
// @name         Pixels DnD Beyond
// @namespace    http://tampermonkey.net/
// @version      0.9.5
// @description  Use Pixel Dice on DnD Beyond
// @author       carrierfry
// @license      MIT
// @match        https://www.dndbeyond.com/characters/*
// @match        https://www.dndbeyond.com/combat-tracker/*
// @match        https://www.dndbeyond.com/encounters/*
// @match        https://www.dndbeyond.com/my-encounters*
// @match        https://www.dndbeyond.com/encounter-builder*
// @icon         https://raw.githubusercontent.com/carrierfry/pixels-dndbeyond-userscript/main/chrome_extension/img/red_128x128.png
// @run-at       document-start
// @grant        none
// @updateURL    https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js
// @downloadURL  https://github.com/carrierfry/pixels-dndbeyond-userscript/raw/main/pixels-dndbeyond.user.js
// @require      https://unpkg.com/@systemic-games/pixels-web-connect@1.2.2/dist/umd/index.js
// @require      https://unpkg.com/@systemic-games/pixels-edit-animation@1.2.2/dist/umd/index.js
// ==/UserScript==

const { repeatConnect, requestPixel, getPixel, Color } = pixelsWebConnect;

const { createDataSetForAnimation, EditAnimationRainbow, AnimationFlagsValues } = pixelsEditAnimation;

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
    },
    "d100": {
        "diceNotation": {
            "set": [{
                "count": 1,
                "dieType": "d100",
                "dice": [{
                    "dieType": "d100",
                    "dieValue": 0
                }],
                "operation": 0
            }],
            "constant": 0
        },
        "diceNotationStr": "1d100",
        "rollType": "roll",
        "rollKind": "",
        "result": {
            "constant": 0,
            "values": [100],
            "total": 100,
            "text": "100"
        }
    },
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

const beyond20Roll = {
    "action": "roll",
    "character": {
        "name": "Username",
        "source": "D&D Beyond",
        "avatar": "URL to Avatar",
        "id": "character ID",
        "type": "Character",
        "url": "https://www.dndbeyond.com/characters/" + "character ID",
        "settings": {
            "custom-roll-dice": ""
        }
    },
    "type": "ability",
    "roll": "1d20+2",
    "ability": "INT",
    "advantage": 0,
    "whisper": 0,
    "modifier": "+" + "2",
    "name": "Intelligence",
    "sendMessage": true,
    // "initiative": "+2",
}

const beyond20RenderedRoll = {
    "action": "rendered-roll",
    "attack_rolls": [
        {
            "formula": "1d20+2",
            "parts": [
                {
                    "total": 5, // total without modifiers!
                    "formula": "1d20", // formula without modifiers
                    "rolls": [
                        {
                            "roll": 8,
                        }
                    ],
                    "amount": 1, // how many dice are rolled
                    "faces": 20, // how many faces does the die have
                    "modifiers": "" // always empty
                },
                "+", // modifier + or -
                5 // the pure modifier without sign
            ],
            "fail-limit": null,
            "critical-limit": null,
            "critical-failure": false,
            "critical-success": false,
            "discarded": false,
            "type": "ability-check",
            "total": "10"
        }
    ],
    "attributes": {},
    "character": "character Name",
    "damage_rolls": [],
    "description": null,
    "html": "",
    "request": "instead link to the roll object",
    "open": false,
    "play_sound": true,
    "roll_info": [],
    "source": null,
    "title": "Intelligence (+2)",
    "total_damages": {},
    "whisper": 0
}

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
    "damage": "tss-t7co22-RollType",
    "recharge": "tss-r93asv-RollType"
};

let svgDiceLookup = {
    "d4": '<svg width="32" height="32" fill="currentColor" title="D4" class="tss-1qy7qai-DieIcon"><path d="M14.65 3L31 15.15 25.532 29H1L14.65 3zm.208 3.373L3.91 27.228h19.707l-8.76-20.855zm2.14.57l7.917 18.848 3.957-10.026-11.874-8.822z"></path></svg>',
    "d6": '<svg width="32" height="32" fill="currentColor" title="D6" class="tss-1qy7qai-DieIcon"><path d="M29.5 2.5v18.796L21.523 29.5H2.5V8.931L12.66 2.5H29.5zm-9.233 7.8h-16v17.434h16V10.3zm7.467-5.069l-5.701 4.607V26.44l5.7-5.864V5.231zm-1.616-.965H13.17L6.428 8.534h14.409l5.28-4.268z"></path></svg>',
    "d8": '<svg width="32" height="32" fill="currentColor" title="D8" class="tss-1qy7qai-DieIcon"><path d="M16 .5l-13 8v13l13 10 13-10v-13l-13-8zm11 15.9L20 5l7 4.5v6.9zM16 2.5l.1.1 11.1 17.9H4.8L15.9 2.6l.1-.1zM12 5L5 16.4V9.5L12 5zM6.9 22.5h18.2L16 29l-9.1-6.5z"></path></svg>',
    "d10": '<svg width="32" height="32" fill="currentColor" title="D10" class="tss-1qy7qai-DieIcon"><path d="M16 1.5l-16 12 1 6 15 11 15-11 1-6-16-12zm13.7 12.8l-.5 3.2-3.5-1.7-5.4-9 9.4 7.5zM15 21.1v6.1l-11.1-8L7 17.6l8 3.5zm2 0l8-3.5 3.1 1.6L17 27.3v-6.2zm6.6-5.1L16 19.4 8.4 16 16 4.4 23.6 16zM2.3 14.3l9.4-7.5-5.4 9-3.5 1.7-.5-3.2z"></path></svg>',
    "d12": '<svg width="32" height="32" fill="currentColor" title="D12" class="tss-1qy7qai-DieIcon"><path d="M26 4L16 0 6 4l-5 7v10l6 7 9 4 9-4 6-7V11l-5-7zM3 11.9L7 14l3.7 8.2-3.4 3.4L3 21v-9.1zM13 22l-3.7-7.2L16 9.2l6.7 5.5L19 22h-6zm16-1l-4.3 4.7-3.4-3.4L25 14l4-2.1V21zM17 2.2l7.8 3.6L28 10l-4.5 2.6L17 7.5V2.2zM7.2 5.8L15 2.2v5.2l-6.5 5.1-.5-.1L4 10l3.2-4.2zm2.1 21l3-3h7.5l3 3L16 30l-6.7-3.2z"></path></svg>',
    "d20": '<svg width="32" height="32" fill="currentColor" title="D20" class="tss-1qy7qai-DieIcon"> <path d="M16 1l14 7.45v15l-1 .596L16 31 2 23.55V8.45L16 1zm5 19.868H10l6 7.45 5-7.45zm-13.3.496L5 22.954l7.1 3.874-4.4-5.464zm16.6-.1l-4.4 5.464 7.1-3.874-2.7-1.59zM4 13.716v7.55l2.7-1.59-2.7-5.96zm24 0l-2.7 5.96.2.1 2.5 1.49v-7.55zM16 9.841l-6 9.04h12l-6-9.04zm-2-.596l-9.6.795 3.7 7.947L14 9.245zm4 0l5.8 8.742 3.7-8.047-9.5-.695zm-1-5.464V7.16l7.4.596L17 3.781zm-2 0L7.6 7.755l7.4-.596V3.78z"> </path> </svg>',
    "d100": '<svg width="48" height="32" fill="currentColor" title="D100" class="tss-1qy7qai-DieIcon"><path d="M12 5L0 14l.75 4.5L12 26.75l11.25-8.25L24 14 12 5zm10.275 9.6L21.9 17l-2.625-1.275-4.05-6.75 7.05 5.625zM11.25 19.7v4.575l-8.325-6 2.325-1.2 6 2.625zm1.5 0l6-2.625 2.325 1.2-8.325 6.075V19.7zm4.95-3.825l-5.7 2.55-5.7-2.55 5.7-8.7 5.7 8.7zM1.725 14.6l7.05-5.625-4.05 6.75L2.1 17l-.375-2.4zM36 5l-12 9 .75 4.5L36 26.75l11.25-8.25L48 14 36 5zm10.275 9.6L45.9 17l-2.625-1.275-4.05-6.75 7.05 5.625zM35.25 19.7v4.575l-8.325-6 2.325-1.2 6 2.625zm1.5 0l6-2.625 2.325 1.2-8.325 6.075V19.7zm4.95-3.825l-5.7 2.55-5.7-2.55 5.7-8.7 5.7 8.7zM25.725 14.6l7.05-5.625-4.05 6.75L26.1 17l-.375-2.4z"></path></svg>'
};

let abilityNameLookup = {
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma"
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
let virtualDice = true;

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
let swapButtonInterval = null;
let currentlySwapped = false;

let isEncounterBuilder = false;

let alreadyHandledMouseLeave = false;

let doneOnlyOnceStuff = false;
let alreadyNavigated = false;
let lastURL = "";
let currentURL = "";

let requireTabOpen = false;
let speakOnRoll = false;
let beyond20OldMethod = false;

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


setTimeout(() => {
    if (!alreadyNavigated && !(/https:\/\/www.dndbeyond.com\/encounters\/*/.test(window.location.href) || /https:\/\/www.dndbeyond.com\/my-encounters*/.test(window.location.href) || /https:\/\/www.dndbeyond.com\/encounter-builder*/.test(window.location.href))) {
        main();
    }
}, 500);
navigation.addEventListener("navigate", (event) => {
    lastURL = currentURL;
    currentURL = event.destination.url;
    console.log("Navigated");
    if (checkIfNavigatedToEncounterBuilder()) {
        alreadyNavigated = true;
        pixelMode = false;
        main();
        console.log("Navigated to Encounter Builder");
    } else {
        alreadyNavigated = false;
    }
});

// Main function
function main() {
    if (!window.location.href.includes("combat-tracker")) {
        if (!checkIfCharacterSheetLoaded()) {
            setTimeout(main, 500);
            return;
        }
    } else {
        isEncounterBuilder = true;
        if (!checkIfEncounterBuilderIsLoaded()) {
            setTimeout(main, 500);
            return;
        }
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
                if (socket && socket.readyState === 1 && !isEncounterBuilder) {
                    getCompleteCharacterData();
                }
            }, 1000);
            checkIfBeyond20Installed();

            if (!window.pixels) {
                window.pixels = [];
            }

            if (!isEncounterBuilder) {
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
            } else {
                GM_addStyle(`.ct-character-header-desktop__group--pixels-active{ background-color: #1b9af0 !important; color: white !important; }`);
                encounterBuilderAddEventListeners();
            }
            addPixelModeButton();
            addPixelsLogoButton();
            addPixelsInfoBox();
            addDiceOverviewBox();
            checkForAutoConnect();
            loadLocalStorage();
            if (!doneOnlyOnceStuff) {
                setInterval(checkForOpenGameLog, 500);
                setInterval(checkIfCharacterSheetLoaded, 1000);
                setInterval(checkForMissingPixelButtons, 1000);
                setInterval(checkForContextMenu, 300);
                setInterval(checkForTodo, 300);
                setInterval(listenForRightClicks, 300);
                setInterval(listenForLongHold, 300)
                setInterval(listenForMouseOverOfNavItems, 300);
                setInterval(listenForQuickNavMenu, 20);
                setInterval(checkForHealthChange, 300);
            }

            if (isEncounterBuilder) {
                GM_addStyle(`.tippy-popper[x-placement^=top] .custom-dark-theme .tippy-arrow { border-top-color: #b0b7bd }`);
                GM_addStyle(`.tippy-popper[x-placement^=left] .custom-dark-theme .tippy-arrow { border-left-color: #b0b7bd }`);
                GM_addStyle(`.tippy-popper[x-placement^=right] .custom-dark-theme .tippy-arrow { border-right-color: #b0b7bd }`);
                GM_addStyle(`.tippy-popper[x-placement^=bottom] .custom-dark-theme .tippy-arrow { border-bottom-color: #b0b7bd }`);
                GM_addStyle(`.tippy-popper { max-width: 350px; -webkit-perspective: 700px; perspective: 700px; z-index: 9999; outline: 0; -webkit-transition-timing-function: cubic-bezier(.165,.84,.44,1); transition-timing-function: cubic-bezier(.165,.84,.44,1); pointer-events: none;}`);
                GM_addStyle(`.tippy-tooltip { position: relative; color: #fff; border-radius: 4px; font-size: .9rem; padding: .3rem .6rem; text-align: center; will-change: transform; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background-color: #333; }`);
                GM_addStyle(`.tippy-popper[x-placement^=top] .tippy-arrow { border-top: 7px solid #333; border-right: 7px solid transparent; border-left: 7px solid transparent; bottom: -7px; margin: 0 7px; -webkit-transform-origin: 50% 0; transform-origin: 50% 0; }`);
                GM_addStyle(`.tippy-arrow, .tippy-roundarrow { position: absolute; width: 0; height: 0; }`);
                GM_addStyle(`.tippy-tooltip.custom-dark-theme { background-color: #b0b7bd; color: #000 }`);
            }

            doneOnlyOnceStuff = true;
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
    if (!doneOnlyOnceStuff) {
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

        if (localStorage.getItem("pixelModeOnlyExistingDice") !== null) {
            virtualDice = localStorage.getItem("pixelModeOnlyExistingDice") === "true";
            document.getElementById("pixelModeOnlyExistingDice").checked = virtualDice;
        }

        if (localStorage.getItem("ignoreRollsWhenTabInactive") !== null) {
            requireTabOpen = localStorage.getItem("ignoreRollsWhenTabInactive") === "true";
            document.getElementById("ignoreRollsWhenTabInactive").checked = requireTabOpen;
        }

        if (localStorage.getItem("speakOnRoll") !== null) {
            speakOnRoll = localStorage.getItem("speakOnRoll") === "true";
            document.getElementById("speakOnRoll").checked = speakOnRoll;
        }

        if (localStorage.getItem("beyond20OldMethod") !== null) {
            beyond20OldMethod = localStorage.getItem("beyond20OldMethod") === "true";
            document.getElementById("beyond20OldMethod").checked = beyond20OldMethod;
        }

        //localStorage.setItem("pixelModeOnlyExistingDice", virtualDice);
    }
}

function checkIfBeyond20Installed() {
    let beyond20 = document.querySelector(".ct-beyond20-settings-button");
    if (beyond20 !== null) {
        beyond20Installed = true;
    } else {
        beyond20 = document.querySelector(".beyond20-quick-roll-tooltip");
        if (beyond20 !== null) {
            beyond20Installed = true;
        }
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
            pixelMode = false;
            addPixelModeButton();
        }
    } else if (isTabletView) {
        if (document.querySelector(".nav-list__item--connect-to-pixels") === null) {
            addPixelsLogoButton();
        }
        if (document.querySelector(".ct-character-header-tablet__group--pixels") === null) {
            pixelMode = false;
            addPixelModeButton();
        }
    } else {
        let forgeButton = document.querySelectorAll(".ct-character-header-desktop__group--builder");
        let pixelModeButton = document.querySelectorAll(".ct-character-header-desktop__group--pixels");
        if (forgeButton.length > 0 && pixelModeButton.length === 0) {
            pixelMode = false;
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
            e.stopImmediatePropagation();
            console.log("Roll with Pixels clicked");

            let currentTarget = e.currentTarget;

            contextMenu.remove();
            let { adv, dis, crit, target, scope } = determineRollType(currentTarget);


            let modifier = getModifierFromButton(lastRightClickedButton);
            let dieType = getDieTypeFromButton(lastRightClickedButton);
            let amount = getAmountFromButton(lastRightClickedButton);
            let rollType = getRollTypeFromButton(lastRightClickedButton);
            let rollName = getRollNameFromButton(lastRightClickedButton);
            let damageType = getDamageTypeFromButton(lastRightClickedButton);

            // Here we already know if we want to roll to our selve or not from the context menu
            // if (isEncounterBuilder) {
            //     nextSelfRoll = true;
            //     target = getUserId();
            //     scope = "userId";
            // }

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
                "scope": scope,
                "damageType": damageType
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

            document.querySelector(".MuiBackdrop-invisible").click();
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
    if (isEncounterBuilder) {
        // let combatants = document.querySelectorAll(".combat-tracker__combatants");
        // combatants.forEach((element) => {
        //     element.removeEventListener('mouseenter', handleMouseEnter);
        //     element.removeEventListener('mouseleave', handleMouseLeave);

        //     element.addEventListener('mouseenter', handleMouseEnter);
        //     element.addEventListener('mouseleave', handleMouseLeave);
        // });
    } else {
        // let navItems = document.querySelectorAll(".ddbc-tab-list__nav-item");
        let navItems = document.querySelectorAll(".styles_tabButton__wvSLf"); // DnDBeyond: Let's rename this perfectly fine class from "ddbc-tab-list__nav-item" to something stupid like "styles_tabButton__wvSLf", why not?
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
}

function listenForQuickNavMenu() {
    if (isMobileView || isTabletView) {
        let quickNav = document.querySelectorAll(".ct-quick-nav__menu");
        let swiperMenu = document.querySelectorAll(".ct-component-carousel__placeholders--changing");
        if (quickNav.length > 0 || swiperMenu.length > 0) {
            if (!pixelModeMobileTracker) {
                // console.log("Quick nav menu opened");
                handleMouseEnter();
                pixelModeMobileTracker = true;
            }
        } else {
            if (pixelModeMobileTracker) {
                // console.log("Quick nav menu closed");
                handleMouseLeave();
                pixelModeMobileTracker = false;
            }
        }
    }
}

function handleMouseEnter(e) {
    if (!isMobileView && !isTabletView && !isEncounterBuilder) {
        e.preventDefault();
        e.stopPropagation();
    }
    // console.log("Nav item hovered");

    if (pixelMode) {
        document.querySelectorAll(".integrated-dice__container").forEach((element, index) => {
            element.parentNode.replaceChild(originalDiceClick[index], element);
        });

        originalDiceClick = [];

        if (isTouchDevice() && !isMobileView && !isTabletView && !isEncounterBuilder) {
            setTimeout(() => {
                handleMouseLeave(e);
                alreadyHandledMouseLeave = true;
            }, 100);
        }
    }
}

function handleMouseLeave(e) {
    if (!isMobileView && !isTabletView && !isEncounterBuilder) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!alreadyHandledMouseLeave) {
        if (pixelMode) {

            originalDiceClick = [];

            document.querySelectorAll(".integrated-dice__container").forEach((element) => {
                originalDiceClick.push(element);

                let elClone = element.cloneNode(true);

                element.parentNode.replaceChild(elClone, element);
                function onClickHandler(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log("Dice clicked");

                    let modifier = getModifierFromButton(elClone);
                    let dieType = getDieTypeFromButton(elClone);
                    let amount = getAmountFromButton(elClone);
                    let rollType = getRollTypeFromButton(elClone);
                    let rollName = getRollNameFromButton(elClone);
                    let damageType = getDamageTypeFromButton(elClone);

                    if (e.type === "contextmenu") {
                        elClone.parentNode.replaceChild(element, elClone);
                        lastRightClickedButton = element;
                        const event = new MouseEvent('contextmenu', {
                            bubbles: true
                        });
                        element.dispatchEvent(event);
                        swapButtonInterval = setInterval(() => {
                            checkIfDiceButtonCanBeSwappedAgain(element, elClone);
                        }, 50);
                        return;
                    }

                    if ((!checkIfDieTypeIsConnected(dieType) && virtualDice && e.type !== "contextmenu") || (dieType === "d20" && isRollFlat(elClone))) {
                        elClone.parentNode.replaceChild(element, elClone);
                        element.click();
                        element.parentNode.replaceChild(elClone, element);
                        return;
                    }

                    let { adv, dis, crit, target, scope } = determineRollType(e.currentTarget);
                    if (isEncounterBuilder) {
                        nextSelfRoll = true;
                        target = getUserId();
                        scope = "userId";
                    }

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
                        "scope": scope,
                        "damageType": damageType
                    };

                    document.querySelector("#selfButton").style.backgroundColor = "darkgray";
                    document.querySelector("#everyoneButton").style.backgroundColor = "white";
                    document.querySelector("#dmButton").style.backgroundColor = "darkgray";
                    document.querySelector("#advButton").style.backgroundColor = "darkgray";
                    document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
                    document.querySelector("#critButton").style.backgroundColor = "darkgray";

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

                elClone.onclick = onClickHandler;
                elClone.addEventListener("contextmenu", onClickHandler);
            });
        }
    } else {
        alreadyHandledMouseLeave = false;
    }
}

function completelySwapButtons() {
    handleMouseLeave();
}

function encounterBuilderAddEventListeners() {
    let elements = document.querySelectorAll(".combatant-summary__details");

    elements.forEach((element) => {
        element.addEventListener("click", () => {
            handleMouseEnter();
            setTimeout(completelySwapButtons, 100);
        }, true);
    });
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
    if (!doneOnlyOnceStuff) {
        let button = document.createElement("li");
        button.className = "mm-nav-item";
        if (isMobileView || isTabletView || (isEncounterBuilder && document.querySelector(".menu-button").checkVisibility())) {
            button.className = "nav-list__item nav-list__item--connect-to-pixels";
        }

        // create a link
        let link = document.createElement("a");
        link.className = "mm-nav-item__label mm-nav-item__label--link";
        if (isMobileView || isTabletView || (isEncounterBuilder && document.querySelector(".menu-button").checkVisibility())) {
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
        if (isMobileView || isTabletView || (isEncounterBuilder && document.querySelector(".menu-button").checkVisibility())) {
            lastNavItem = document.querySelectorAll(".nav-list__item");
        }
        lastNavItem = lastNavItem[lastNavItem.length - 1];
        lastNavItem.parentNode.insertBefore(button, lastNavItem.nextSibling);
    }
}

// The following 5 functions get different information from DOM elements and the URL
function getCharacterId() {
    let url = window.location.href;
    let urlParts = url.split("/");
    let characterId = urlParts[urlParts.length - 1];
    return characterId;
}

function getCharacterName() {
    let name;
    if (isEncounterBuilder) {
        name = document.querySelector(".mon-stat-block__name");
    } else {
        name = document.querySelector(".ddb-character-app-sn0l9p");
    }
    return name.innerText;
}

function getGameId() {
    if (lastGameId !== 0) {
        return lastGameId;
    }
    let gameId;
    if (isEncounterBuilder) {
        if (socket && socket.readyState === 1) {
            gameId = socket.url.split("gameId=")[1].split("&userId")[0];
            lastGameId = gameId;
        } else {
            lastGameId = 0;
        }
    } else {
        if (!isMobileView && !isTabletView) {
            gameId = document.querySelector(".ddbc-tooltip").firstChild;
        } else {
            gameId = document.querySelector(".ddbc-link");
            if (gameId === null) {
                gameId = window.location;
            }
        }
        lastGameId = gameId.href.split("/")[4];
    }
    return lastGameId;
}

function getUserId() {
    let userId = document.querySelector("#message-broker-client").getAttribute("data-userid");
    return userId;
}

function getAvatarUrl() {
    let avatar;
    if (!isEncounterBuilder) {
        avatar = document.querySelector(".ddbc-character-avatar__portrait").getAttribute("style");
        if (avatar === null) {
            return null;
        }
        avatar = avatar.split("url(\"")[1].split("\")")[0];
    } else {
        let allCharacters = document.querySelectorAll(".combatant-summary__name");
        allCharacters.forEach((element) => {
            if (element.innerText === getCharacterName()) {
                avatar = element.parentElement.parentElement.firstChild.firstChild.src;
                if (avatar === null) {
                    return null;
                }
            }
        })
    }
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

    if (requireTabOpen && document.hidden) {
        return;
    }

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

            if (speakOnRoll) {
                speakRoll(rolledJson);
            }

            createToast(dieType, rolledJson.data.rolls[0].result.total, rolledJson.data.rolls[0].result.values[0], modifier, rolledJson.data.rolls[0].diceNotationStr);

            if (beyond20Installed && !beyond20OldMethod) {
                sendRollToBeyond20(rolledJson);
            }

            rolledJsonArray.push(rolledJson);
            currentlyExpectedRoll = {};

            if (pixelModeOnlyOnce && pixelMode) {
                pixelMode = false;
                if (isEncounterBuilder) {
                    document.querySelector(".ddbeb-button--pixels").classList.remove("ct-character-header-desktop__group--pixels-active");
                    document.querySelector(".ddbeb-button--pixels").firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");
                } else if (isTabletView) {
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
            intensity: 0.3,
            animFlags: AnimationFlagsValues.traveling | AnimationFlagsValues.useLedIndices
        })
    );

    // And play it on the Pixel die
    await pixel.playTestAnimation(editDataSet.toDataSet());
}

async function checkForAutoConnect() {
    if (!doneOnlyOnceStuff) {
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

    if (!containsObject(pixel.systemId, systemIds) && !!navigator?.bluetooth?.getDevices) {
        systemIds.push(pixel.systemId);
        localStorage.setItem("pixelsSystemIds", JSON.stringify(systemIds));
    }
}

function addPixelModeButton() {
    let div = document.createElement("div");
    if (isEncounterBuilder) {
        div.className = "ddbeb-button ddbeb-button--pixels";
    } else if (isTabletView) {
        div.className = "ct-character-header-tablet__group ct-character-header-tablet__group--pixels";
    } else if (isMobileView) {
        div.className = "ct-character-header-mobile__group ct-character-header-mobile__group--pixels";
    } else {
        div.className = "ct-character-header-desktop__group ct-character-header-desktop__group--pixels";
    }
    div.id = "pixel-mode-button";

    div.style = "user-select: none;";

    if (isEncounterBuilder) {
        div.innerHTML = '<div class="ct-character-header-desktop__button" role="button" tabindex="0"><span class="ct-character-header-desktop__button-label">Pixel Mode</span></div>';
    } else {
        div.innerHTML = '<div class="ct-character-header-desktop__button" role="button" tabindex="0"> <div class="ct-character-header-desktop__button-icon"> <img id="red-pixel-icon" src="https://raw.githubusercontent.com/carrierfry/pixels-dndbeyond-userscript/main/img/white.png" width="16px" height="16px"> </div> <span class="ct-character-header-desktop__button-label">Pixel Mode</span> </div>'
    }
    if (isEncounterBuilder) {
        document.querySelector(".combat-tracker__header").appendChild(div);
    } else if (isTabletView) {
        document.querySelector(".ct-character-header-tablet__group--short-rest").parentNode.insertBefore(div, document.querySelector(".ct-character-header-tablet__group--short-rest"));
    } else if (isMobileView) {
        document.querySelector(".ct-character-header-mobile__group--gap").appendChild(div);
    } else {
        document.querySelector(".ct-character-header-desktop__group--short-rest").parentNode.insertBefore(div, document.querySelector(".ct-character-header-desktop__group--short-rest"));
    }
    div.oncontextmenu = function (e) {
        e.preventDefault();
    }

    let longPressStart = 0;

    div.addEventListener('touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (longPressStart === 0) {
            longPressStart = Date.now();

            if (!tootltipShown) {

                let topleft = getPageTopLeft(div);

                if (isMobileView) {
                    displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left) - 50, parseInt(topleft.top) - 50);
                } else if (isTabletView) {
                    displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
                } else {
                    displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
                }

                tootltipShown = true;
            }
        }
    });

    function handleMouseUpTouchEnd(e) {
        e.preventDefault();
        console.log("Pixels button clicked");

        //e.button describes the mouse button that was clicked
        // 0 is left, 1 is middle, 2 is right
        if (e.button == 0 && !e.ctrlKey) {
            pixelModeOnlyOnce = true;
            console.log("Pixels button clicked once");
        }

        if (longPressStart > 0 && Date.now() - longPressStart > 300) {
            pixelModeOnlyOnce = false;
            console.log("Pixels button long clicked");
        } else if (longPressStart > 0) {
            pixelModeOnlyOnce = true;
        }
        handleMainStuff();
    }
    function handleMainStuff() {
        longPressStart = 0;

        pixelMode = !pixelMode;
        if (pixelMode) {
            if (isEncounterBuilder) {
                div.classList.add("ct-character-header-desktop__group--pixels-active");
            }
            div.firstChild.classList.add("ct-character-header-desktop__group--pixels-active");
            document.querySelectorAll(".integrated-dice__container").forEach((element, index) => {
                originalDiceClick.push(element);

                let elClone = element.cloneNode(true);

                element.parentNode.replaceChild(elClone, element);

                function onClickHandler(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log("Dice clicked");

                    let modifier = getModifierFromButton(elClone);
                    let dieType = getDieTypeFromButton(elClone);
                    let amount = getAmountFromButton(elClone);
                    let rollType = getRollTypeFromButton(elClone);
                    let rollName = getRollNameFromButton(elClone);
                    let damageType = getDamageTypeFromButton(elClone);

                    if (e.type === "contextmenu") {
                        elClone.parentNode.replaceChild(element, elClone);
                        lastRightClickedButton = element;
                        const event = new MouseEvent('contextmenu', {
                            bubbles: true
                        });
                        element.dispatchEvent(event);
                        swapButtonInterval = setInterval(() => {
                            checkIfDiceButtonCanBeSwappedAgain(element, elClone);
                        }, 50);
                        return;
                    }

                    if ((!checkIfDieTypeIsConnected(dieType) && virtualDice && e.type !== "contextmenu") || (dieType === "d20" && isRollFlat(elClone))) {
                        elClone.parentNode.replaceChild(element, elClone);
                        element.click();
                        element.parentNode.replaceChild(elClone, element);
                        return;
                    }

                    let { adv, dis, crit, target, scope } = determineRollType(e.currentTarget);
                    if (isEncounterBuilder) {
                        nextSelfRoll = true;
                        target = getUserId();
                        scope = "userId";
                    }

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
                        "scope": scope,
                        "damageType": damageType
                    };

                    document.querySelector("#selfButton").style.backgroundColor = "darkgray";
                    document.querySelector("#everyoneButton").style.backgroundColor = "white";
                    document.querySelector("#dmButton").style.backgroundColor = "darkgray";
                    document.querySelector("#advButton").style.backgroundColor = "darkgray";
                    document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
                    document.querySelector("#critButton").style.backgroundColor = "darkgray";

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
                elClone.onclick = onClickHandler;
                elClone.addEventListener("contextmenu", onClickHandler);
            });
        } else {
            div.firstChild.classList.remove("ct-character-header-desktop__group--pixels-active");
            if (isEncounterBuilder) {
                div.classList.remove("ct-character-header-desktop__group--pixels-active");
            }

            document.querySelectorAll(".integrated-dice__container").forEach((element, index) => {
                element.parentNode.replaceChild(originalDiceClick[index], element);
            });

            originalDiceClick = [];
            pixelModeOnlyOnce = false;
        }

        if (tootltipShown) {
            document.querySelector(".tippy-popper--pixel-mode").remove();
            tootltipShown = false;
        }
    }

    div.addEventListener('touchend', handleMouseUpTouchEnd);
    div.addEventListener('mouseup', handleMouseUpTouchEnd);

    div.addEventListener('mouseover', function (e) {
        e.preventDefault();
        // console.log("Pixels button hovered");

        if (!tootltipShown) {

            let topleft = getPageTopLeft(div);

            if (isMobileView) {
                displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left) - 50, parseInt(topleft.top) - 50);
            } else if (isTabletView) {
                displayTooltip("Short tap to enable pixel mode for 1 roll.<br>Long tap to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
            } else {
                displayTooltip("Left click to enable pixel mode for 1 roll.<br>Right click to enable permantently", parseInt(topleft.left), parseInt(topleft.top) - 50);
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
    handleMainStuff();
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

    if (isMobileView || isTabletView || (isEncounterBuilder && document.querySelector(".menu-button").checkVisibility())) {
        GM_addStyle(`.pixels-info-box { position: fixed; top: 50px; left: calc(50% - 25%); width: 50%; min-width: 250px; height: 250px; background-color: rgba(0,0,0,0.90); z-index: 999`);
    } else {
        GM_addStyle(`.pixels-info-box { position: fixed; top: 50px; left: 0%; width: 320px; height: 250px; background-color: rgba(0,0,0,0.90); z-index: 999`);
    }
    if (isEncounterBuilder) {
        GM_addStyle(`.pixels-info-box { line-height: 1; }`);
    }
    GM_addStyle(`.pixels-info-box__content { position: absolute; top: 0%; left: 5%; width: 90%; right: 5%; height: 100%; }`);
    GM_addStyle(`.pixels-info-box__content__title { position: absolute; top: 0%; left: 0%; width: 100%; height: 10%; font-size: 1.5em; text-align: center; color: white; cursor: move; }`);
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
    if (isMobileView || isTabletView || (isEncounterBuilder && document.querySelector(".menu-button").checkVisibility())) {
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
            // Calculate new position
            let newX = event.clientX + offset.x;
            let newY = event.clientY + offset.y;

            // Get the boundaries of the screen
            const maxX = window.innerWidth - div.offsetWidth;
            const maxY = window.innerHeight - div.offsetHeight;

            // Ensure the box stays within the screen boundaries
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            div.style.left = `${newX}px`;
            div.style.top = `${newY}px`;
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
    let innerHTML = '<div class="dice-overview-box__content">';
    innerHTML += '<div class="dice-overview-box__content__title">Dice Overview</div>';
    innerHTML += '<button id="closeDiceOverviewButton" class="dice-overview-box__button">X</button>';
    innerHTML += '<div class="dice-overview-box__content__features"> auto-reconnect is currently AUTO_STATUS </div>';
    innerHTML += '<div class="dice-overview-box__content__settings">';
    innerHTML += '<div class="dice-overview-box__content__settings__checkboxes">';
    innerHTML += '<input type="checkbox" id="diceOption" name="diceOption"><label for="diceOption"> Light up dice when other characters score a natural 1 or 20</label><br>';
    innerHTML += '<input type="checkbox" id="beyond20CustomRolls" name="beyond20CustomRolls"><label for="beyond20CustomRolls"> Do not send custom rolls to Roll20 (only relevant when Beyond20 is installed)</label><br>';
    innerHTML += '<input type="checkbox" id="beyond20OldMethod" name="beyond20OldMethod"><label for="beyond20OldMethod"> Use deprecated way of handling Beyond20 (only relevant when Beyond20 is installed)</label><br>';
    innerHTML += '<input type="checkbox" id="pixelModeOnlyExistingDice" name="pixelModeOnlyExistingDice" checked><label for="pixelModeOnlyExistingDice"> When using pixel mode, use virtual dice when no Pixel die of a type is connected</label><br>';
    innerHTML += '<input type="checkbox" id="useCustomDebouncer" name="useCustomDebouncer"><label for="useCustomDebouncer"> Make false positives when rolling less likely</label><br>';
    innerHTML += '<input type="checkbox" id="ignoreRollsWhenTabInactive" name="ignoreRollsWhenTabInactive"><label for="ignoreRollsWhenTabInactive"> Ignore rolls when the tab is not open</label><br>';
    innerHTML += '<input type="checkbox" id="speakOnRoll" name="speakOnRoll"><label for="speakOnRoll"> Accessibility: Speak out results on roll with pixels dice</label><br>';
    innerHTML += '</div></div>';
    innerHTML += '<div class="dice-overview-box__content__table"> <table id="diceTable"><tr><th>Type</th><th>Name</th><th>Connection Status</th><th>Roll Status</th><th>Battery</th><th>Face</th><th>Action</th></tr></table> </div> </div>';

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

    if (isMobileView || isTabletView || (isEncounterBuilder && document.querySelector(".menu-button").checkVisibility())) {
        GM_addStyle(`.dice-overview-box { position: fixed; line-height: 1; top: 50%; left: 50%; width: 95%; height: 95%; background-color: rgba(0,0,0,0.95); z-index: 999; transform: translate(-50%, -50%); }`);
    } else {
        GM_addStyle(`.dice-overview-box { position: fixed; line-height: 1; top: 50%; left: 50%; width: 700px; height: 700px; background-color: rgba(0,0,0,0.95); z-index: 999; transform: translate(-50%, -50%); }`);
    }
    if (isEncounterBuilder) {
        GM_addStyle(`.dice-overview-box { line-height: 1; }`);
    }
    GM_addStyle(`.dice-overview-box__content { position: absolute; top: 0%; left: 5%; width: 90%; right: 5%; height: 100%; }`);
    GM_addStyle(`.dice-overview-box__content__title { position: absolute; top: 0%; left: 0%; width: 100%; height: 10%; font-size: 1.5em; text-align: center; color: white; }`);
    GM_addStyle(`.dice-overview-box__content__features { position: absolute; top: 5%; left: 0%; width: 100%; height: 10%; font-size: 1em; text-align: center; color: white; }`);
    GM_addStyle(`.dice-overview-box__content__settings { position: absolute; top: 10%; left: 0%; width: 100%; height: 10%; font-size: 1em; text-align: left; color: white; }`);
    GM_addStyle(`.dice-overview-box__content__table { position: absolute; top: 30%; left: 0%; width: 100%; height: 90%; }`);
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
    };

    let virtualDiceCheckbox = document.querySelector("#pixelModeOnlyExistingDice");
    virtualDiceCheckbox.onclick = (e) => {
        virtualDice = virtualDiceCheckbox.checked;
        localStorage.setItem("pixelModeOnlyExistingDice", virtualDice);
    };

    let ignoreRollsWhenTabInactive = document.querySelector("#ignoreRollsWhenTabInactive");
    ignoreRollsWhenTabInactive.onclick = (e) => {
        requireTabOpen = ignoreRollsWhenTabInactive.checked;
        localStorage.setItem("ignoreRollsWhenTabInactive", requireTabOpen);
    };

    let speakOnRollCheckbox = document.querySelector("#speakOnRoll");
    speakOnRollCheckbox.onclick = (e) => {
        speakOnRoll = speakOnRollCheckbox.checked;
        localStorage.setItem("speakOnRoll", speakOnRoll);
    };

    let beyond20OldMethodCheckbox = document.querySelector("#beyond20OldMethod");
    beyond20OldMethodCheckbox.onclick = (e) => {
        beyond20OldMethod = beyond20OldMethodCheckbox.checked;
        localStorage.setItem("beyond20OldMethod", beyond20OldMethod);
    };

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
    let nothingToDo = false;
    if (text === undefined) {
        text = "You currently have nothing to do!";
        nothingToDo = true;
    }

    if (!nothingToDo) {
        let cancelSpan = " ( <span onclick='cancelCurrentRoll()' style='cursor: pointer; color: lightcoral;'>cancel</span> )";
        text += cancelSpan;
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
        if (dieType === "(") {
            dieType = button.innerText;
        }
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
    } else if (dieType.includes("Recharge")) {
        dieType = "d6";
    } else {
        dieType = "d20";
    }

    if (dieType.includes(")")) {
        dieType = dieType.substr(0, dieType.indexOf(")"));
    }
    return dieType;
}

function getModifierFromButton(button) {
    let modifier = 0;
    if (typeof button.firstChild === "object" && typeof button.firstChild.data === "string") {
        if (isEncounterBuilder) {
            if (button.innerHTML.includes("(")) {
                modifier = button.innerHTML.substr(1, 100).substr(0, button.innerHTML.length - 2);
            } else {
                modifier = button.innerHTML;
            }
        } else {
            modifier = button.firstChild.data;
        }
    } else {

        modifier = button.firstChild.getAttribute("aria-label");
        if (modifier === null) {
            // modifier = button.firstChild.firstChild.innerHTML;
            modifier = button.firstChild.innerText.replace("\n", "");

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

    if (isNaN(modifier)) {
        modifier = 0;
    }
    return modifier;
}

function getAmountFromButton(button) {
    let amount = 1;
    if (typeof button.firstChild === "object" && typeof button.firstChild.data === "string") {
        amount = button.firstChild.data;
        if (amount === "(") {
            amount = button.innerText;
        }
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

    if ((amount + "").includes("(")) {
        amount = amount.substr(1, 100);
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
    } else if (isEncounterBuilder) {
        if (button.closest(".ability-block") !== null) {
            potentialName = button.closest(".ability-block__stat").querySelector(".ability-block__heading").innerText;
        } else if (button.closest(".mon-stat-block__tidbits") !== null) {
            potentialName = button.previousSibling.data.split(" ")[0];
            if (potentialName === "") {
                potentialName = button.previousSibling.previousSibling.innerText;
            }
        } else if (button.closest(".mon-stat-block__description-blocks") !== null) {
            if (button.closest("p").querySelector("strong") !== null) {
                potentialName = button.closest("p").querySelector("strong").firstChild.data;
            } else {
                potentialName = "custom";
            }
            // if last character is a . then remove it
            if (potentialName[potentialName.length - 1] === ".") {
                potentialName = potentialName.substring(0, potentialName.length - 1);
            }
        } else if (button.closest(".mon-stat-block__attribute") !== null) {
            potentialName = button.closest(".mon-stat-block__attribute").querySelector(".mon-stat-block__attribute-label").innerText;
            if (potentialName === "Hit Points") {
                potentialName = "HP";
            }
        }
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
    } else if (button.innerText.includes("Recharge")) {
        potentialRollType = "recharge";
    } else if (isEncounterBuilder) {
        if (button.closest(".mon-stat-block__tidbit") !== null && button.closest(".mon-stat-block__tidbit").innerText.includes("Skill")) {
            potentialRollType = "check";
        } else if (button.closest(".mon-stat-block__tidbit") !== null && button.closest(".mon-stat-block__tidbit").innerText.includes("Saving")) {
            potentialRollType = "save";
        } else if (button.closest(".mon-stat-block__stat-block") !== null) {
            potentialRollType = "check";
        } else if (button.nextSibling !== null && button.nextSibling.data !== null && button.nextSibling.data.includes("to hit")) {
            potentialRollType = "to hit";
        } else if (button.nextSibling !== null && button.nextSibling.data !== null && button.nextSibling.data.includes("damage")) {
            potentialRollType = "damage";
        } else if (button.innerText.includes("d")) {
            potentialRollType = "damage";
        } else if (button.closest(".mon-stat-block__tidbit") !== null) {
            potentialRollType = "roll";
        }
    }
    return potentialRollType;
}

function getDamageTypeFromButton(button) {
    let potentialDamageType = "";
    if (button.querySelector(".ddbc-damage-type-icon") !== null) {
        let splittedDamageType = button.querySelector(".ddbc-damage-type-icon").className.split("--")[1];
        if (splittedDamageType !== undefined) {
            potentialDamageType = splittedDamageType;
        }
    }
    return potentialDamageType;
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

    if (currentlySwapped || !pixelMode) {

        let list = undefined;
        if (target !== getCharacterId()) {
            if (isEncounterBuilder && target === 0) {
                list = rollButton.previousSibling.previousSibling.firstChild.nextSibling.firstChild;
            } else {
                list = rollButton.previousSibling.previousSibling.firstChild.nextSibling.nextSibling.nextSibling.firstChild; // ul
            }
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

    if (beyond20OldMethod && (Object.keys(currentlyExpectedRoll).length > 0 || (!beyond20CustomRollNoSend && Object.keys(currentlyExpectedRoll).length === 0))) {
        innerDiv = innerDiv.replaceAll("NOBA", "noty_bar");
    } else {
        innerDiv = innerDiv.replaceAll("NOBA", "noty_bar_custom");
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

function appendElementToGameLog(json) {
    let gameLog = document.querySelector("[class*='GameLogEntries']");

    let element = document.createElement("li");
    let innerDiv;

    if (isEncounterBuilder) {
        element.className = "tss-8-Other-ref tss-17y30t1-GameLogEntry-Other-Flex pixels-added-entry";
        innerDiv = '<p role="img" class="tss-wyeh8h-Avatar-Flex"> <img class="tss-1e4a2a1-AvatarPortrait" src="AVATAR" alt="CHARACTER_NAME"> </p> <div class="tss-1e6zv06-MessageContainer-Flex"> <div class="tss-dr2its-Line-Flex"><span class="tss-1tj70tb-Sender">CHARACTER_NAME</span></div> <div class="tss-8-Other-ref tss-1qn6fu1-Message-Other-Flex"> <div class="tss-iqf1z5-Container-Flex"> <div class="tss-24rg5g-DiceResultContainer-Flex"> <div class="tss-kucurx-Result"> <div class="tss-3-Other-ref tss-1o65fpw-Line-Title-Other"><span class="tss-cx78hg-Action">WHAT</span>: <span class="CSS_RT">TYPE</span> </div> <div class="tss-16k6xf2-Line-Breakdown">SVG<span class="tss-3-Other-ref tss-kzbwsw-Line-Number-Other" title="COMBINED">COMBINED</span> </div> <div class="tss-1wcf5kt-Line-Notation"><span>DICE_NOTATION</span></div> </div><svg width="19" height="70" viewBox="0 0 19 100" class="tss-3-Target-ref tss-1c5trim-DividerResult-Target"> <path fill="currentColor" d="M10 0v30H9V0zm0 70v30H9V70zm9-13H0v-3h19zm0-10H0v-3h19z"></path> </svg> <div class="tss-1jo3bnd-TotalContainer-Flex">ADV <div class="tss-3-Other-ref tss-3-Target-ref tss-11yjuwm-Total-Other-Target-Flex"><span>VALUE</span></div> </div> </div> <div class="tss-1tqix15-DicePreviewContainer-Flex"> <div class="tss-yuoem4-SetPreviewContainer-Flex"><span class="tss-2auhl5-PreviewThumbnail-DieThumbnailContainer"><span title="COUNTED_VAL" class="tss-171s1s1-DieThumbnailWrapper"><img class="tss-s4qeha-DieThumbnailImage" src="https://www.dndbeyond.com/dice/images/thumbnails/00101-DIE-COUNTED_VAL.png" alt="DIE roll of COUNTED_VAL"></span></span> <div class="tss-xdfhrf-SetPreviewDescriptionContainer"> <div class="tss-1dhkeq7-Divider"></div> <div class="tss-1x8v1yt-SetPreviewActionsContainer-Flex"><span class="tss-15yp4kz-SetPreviewDescription">Rolled with Basic Black: Black</span> </div> </div> </div> <div class="tss-eaaqq4-DieThumbnailsList"></div> </div> </div> </div><time datetime="DATETIME" title="DATETIME_HUMAN" class="tss-1yxh2yy-TimeAgo-TimeAgo">TIME_HUMAN</time> </div>';
    } else {
        element.className = "tss-8-Self-ref tss-1kuahcg-GameLogEntry-Self-Flex pixels-added-entry";
        innerDiv = '<div class="tss-1e6zv06-MessageContainer-Flex"> <div class="tss-dr2its-Line-Flex"><span class="tss-1tj70tb-Sender">CHARACTER_NAME</span></div> <div class="tss-8-Self-ref tss-cmvb5s-Message-Self-Flex"> <div class="tss-iqf1z5-Container-Flex"> <div class="tss-24rg5g-DiceResultContainer-Flex"> <div class="tss-kucurx-Result"> <div class="tss-3-Self-ref tss-1rj7iab-Line-Title-Self"><span class="tss-cx78hg-Action">WHAT</span>: <span class="CSS_RT">TYPE</span> </div> <div class="tss-16k6xf2-Line-Breakdown">SVG<span class="tss-3-Self-ref tss-1nuv2ow-Line-Number-Self" title="COMBINED">COMBINED</span> </div> <div class="tss-1wcf5kt-Line-Notation"><span>DICE_NOTATION</span></div> </div><svg width="19" height="70" viewBox="0 0 19 100" class="tss-1ddr9a0-DividerResult"> <path fill="currentColor" d="M10 0v30H9V0zm0 70v30H9V70zm9-13H0v-3h19zm0-10H0v-3h19z"></path> </svg> <div class="tss-1jo3bnd-TotalContainer-Flex">ADV <div class="tss-3-Self-ref tss-183k5bv-Total-Self-Flex"><span>VALUE</span></div> </div> </div> <div class="tss-1tqix15-DicePreviewContainer-Flex"> <div class="tss-yuoem4-SetPreviewContainer-Flex"><span class="tss-2auhl5-PreviewThumbnail-DieThumbnailContainer"><span title="COUNTED_VAL" class="tss-171s1s1-DieThumbnailWrapper"><img class="tss-s4qeha-DieThumbnailImage" src="https://www.dndbeyond.com/dice/images/thumbnails/00101-DIE-COUNTED_VAL.png" alt="DIE roll of COUNTED_VAL"></span></span> <div class="tss-xdfhrf-SetPreviewDescriptionContainer"> <div class="tss-1dhkeq7-Divider"></div> <div class="tss-1x8v1yt-SetPreviewActionsContainer-Flex"><span class="tss-15yp4kz-SetPreviewDescription">Rolled with Basic Black: Black</span> </div> </div> </div> <div class="tss-eaaqq4-DieThumbnailsList"></div> </div> </div> </div><time datetime="DATETIME" title="DATETIME_HUMAN" class="tss-1yxh2yy-TimeAgo-TimeAgo">TIME_HUMAN</time> </div>';
    }

    innerDiv = innerDiv.replaceAll("CHARACTER_NAME", getCharacterName());
    innerDiv = innerDiv.replaceAll("AVATAR", json.data.context.avatarUrl);
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

    if (json.data.rolls[0].rollKind === "advantage") {
        innerDiv = innerDiv.replaceAll("ADV", '<small class="tss-oe8pdp-TotalHeader"><span>+ADV</span></small>');
    } else if (json.data.rolls[0].rollKind === "disadvantage") {
        innerDiv = innerDiv.replaceAll("ADV", "<small class='tss-oe8pdp-TotalHeader'><span>-DIS</span></small>");
    } else {
        innerDiv = innerDiv.replaceAll("ADV", '');
    }

    if (json.data.rolls[0].result.values.length > 1) {
        if (json.data.rolls[0].rollKind === "advantage") {
            innerDiv = innerDiv.replaceAll("COUNTED_VAL", Math.max(...json.data.rolls[0].result.values));
        } else if (json.data.rolls[0].rollKind === "disadvantage") {
            innerDiv = innerDiv.replaceAll("COUNTED_VAL", Math.min(...json.data.rolls[0].result.values));
        } else {
            innerDiv = innerDiv.replaceAll("COUNTED_VAL", json.data.rolls[0].result.values[0]);
        }
    } else {
        innerDiv = innerDiv.replaceAll("COUNTED_VAL", Math.max(...json.data.rolls[0].result.values));
    }

    innerDiv = innerDiv.replaceAll("SVG", svgDiceLookup[json.data.rolls[0].diceNotation.set[0].dieType]);
    innerDiv = innerDiv.replaceAll("DIE", json.data.rolls[0].diceNotation.set[0].dieType);

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

function checkIfEncounterBuilderIsLoaded() {
    if (document.querySelector(".combat-tracker-page__content-section") !== null) {
        return true;
    } else {
        return false;
    }
}

function checkIfDieTypeIsConnected(dieType) {
    for (let i = 0; i < window.pixels.length; i++) {
        if ((window.pixels[i].dieType === dieType || (window.pixels[i].dieType === "d6pipped" && dieType === "d6")) && window.pixels[i].isReady) {
            return true;
        }
    }
    return false;
}

function checkIfDiceButtonCanBeSwappedAgain(currentButton, newButton) {
    let element = document.querySelector(".MuiPaper-root > div");
    if (element !== null) {
        lastRightClickedButton = currentButton;
        currentlySwapped = true;
        return false;
    } else {
        currentButton.parentNode.replaceChild(newButton, currentButton);
        lastRightClickedButton = newButton;
        clearInterval(swapButtonInterval);
        currentlySwapped = false;
        return true;
    }
}

function speakRoll(rolledJson) {
    let ssu = new SpeechSynthesisUtterance();
    let text = "";
    let modifiedOperator = rolledJson.data.rolls[0].result.text.replaceAll("+-", " minus ");
    modifiedOperator = modifiedOperator.replaceAll("+", " + ");
    modifiedOperator = modifiedOperator.replaceAll("-", " minus ");
    modifiedOperator = modifiedOperator.replaceAll(",", " , ");

    if (rolledJson.data.rolls[0].rollKind !== "") {
        text += rolledJson.data.rolls[0].rollKind + ": ";
    }
    text += modifiedOperator;

    if (rolledJson.data.rolls[0].result.text === "" + rolledJson.data.rolls[0].result.total) {
        text = rolledJson.data.rolls[0].result.total
    } else {
        text += " = " + rolledJson.data.rolls[0].result.total;
    }

    ssu.text = text;
    ssu.volume = 1;
    ssu.rate = 0.8;
    ssu.pitch = 1;
    ssu.lang = "en-US";
    window.speechSynthesis.speak(ssu);
}

function isRollFlat(element) {
    if (element.innerText.includes("+") || element.innerText.includes("-") || element.innerText.includes("(")) {
        return false;
    } else {
        return true;
    }
}

function cancelCurrentRoll() {
    currentlyExpectedRoll = {};

    // uncolor buttons
    document.querySelector("#everyoneButton").style.backgroundColor = "darkgray";
    document.querySelector("#selfButton").style.backgroundColor = "darkgray";
    document.querySelector("#dmButton").style.backgroundColor = "darkgray";

    document.querySelector("#advButton").style.backgroundColor = "darkgray";
    document.querySelector("#disadvButton").style.backgroundColor = "darkgray";
    document.querySelector("#critButton").style.backgroundColor = "darkgray";
}
window.cancelCurrentRoll = cancelCurrentRoll;

function checkIfNavigatedToEncounterBuilder() {
    if (/https:\/\/www.dndbeyond.com\/combat-tracker\/*/.test(currentURL)) {
        return true;
    }
    return false;
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

function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addBeyond20EventListener(name, callback) {
    const event = ["Beyond20_" + name, (evt) => {
        const detail = evt.detail || [];
        callback(...detail)
    }, false];
    document.addEventListener(...event);
    return event;
}
function sendBeyond20Event(name, ...args) {
    const rollDetail = args;
    const event = new CustomEvent("Beyond20_" + name, { "detail": rollDetail });
    document.dispatchEvent(event);
}

function sendRollToBeyond20(rolledJson) {
    let roll = JSON.parse(JSON.stringify(beyond20Roll));
    let renderedRoll = JSON.parse(JSON.stringify(beyond20RenderedRoll));

    let operator = "+";
    if (rolledJson.data.rolls[0].result.constant < 0) {
        operator = "-";
    }
    let operatorForDisplay = operator === "+" ? "+" : "";

    let rollName = rolledJson.data.action;
    if (rolledJson.data.action.length <= 3) {
        rollName = abilityNameLookup[rolledJson.data.action.toLowerCase()] || rollName;
    }

    roll.character.name = rolledJson.data.context.name;
    roll.character.avatar = rolledJson.data.context.avatarUrl;
    roll.character.id = rolledJson.entityId;
    roll.character.url = "https://www.dndbeyond.com/characters/" + rolledJson.entityId;
    roll.roll = rolledJson.data.rolls[0].diceNotationStr;
    if (Object.keys(currentlyExpectedRoll).length > 0) {
        roll.ability = currentlyExpectedRoll.rollName.toUpperCase();
        roll.name = rollName;

        renderedRoll.title = rollName + " (" + operatorForDisplay + rolledJson.data.rolls[0].result.constant + ")";

        if (rolledJson.data.action === "Initiative") {
            roll.initiative = operatorForDisplay + rolledJson.data.rolls[0].result.constant;
            roll.type = "initiative";
            renderedRoll.attack_rolls[0].type = "initiative";
        }

        if (rolledJson.data.rolls[0].rollType === "save") {
            roll.type = "saving-throw";
        } else if (rolledJson.data.rolls[0].rollType === "to hit") {
            roll.type = "attack";
            roll.rollAttack = true;
        } else if (rolledJson.data.rolls[0].rollType === "damage") {
            roll.type = "attack";
            roll.rollDamage = true;
        }
    } else {
        roll.name = "\n                            custom: roll\n                        ";
        renderedRoll.title = "\n                            custom: roll\n                         (" + roll.roll.split(operator)[0] + ")";
    }
    roll.modifier = operatorForDisplay + rolledJson.data.rolls[0].result.constant;
    renderedRoll.attack_rolls[0].formula = roll.roll;
    renderedRoll.attack_rolls[0].parts[0].total = rolledJson.data.rolls[0].result.values[0];
    renderedRoll.attack_rolls[0].parts[0].formula = roll.roll.split(operator)[0];
    renderedRoll.attack_rolls[0].parts[0].rolls = [];
    for (let i = 0; i < rolledJson.data.rolls[0].result.values.length; i++) {
        renderedRoll.attack_rolls[0].parts[0].rolls.push({
            roll: rolledJson.data.rolls[0].result.values[i],
        });
    }
    renderedRoll.attack_rolls[0].parts[0].amount = rolledJson.data.rolls[0].result.values.length;
    renderedRoll.attack_rolls[0].parts[0].faces = parseInt(rolledJson.data.rolls[0].diceNotation.set[0].dieType.split("d")[1]);
    renderedRoll.attack_rolls[0].parts[1] = operator;
    renderedRoll.attack_rolls[0].parts[2] = rolledJson.data.rolls[0].result.constant;
    renderedRoll.attack_rolls[0].total = rolledJson.data.rolls[0].result.total;

    if (Object.keys(currentlyExpectedRoll).length > 0 && currentlyExpectedRoll.damageType !== "") {
        renderedRoll.damage_rolls[0] = [];
        renderedRoll.damage_rolls[0][0] = capitalizeFirstLetter(currentlyExpectedRoll.damageType) + " Damage";
        renderedRoll.damage_rolls[0][1] = renderedRoll.attack_rolls[0];
        renderedRoll.damage_rolls[0][2] = roll.roll.split("d")[0];
        renderedRoll.attack_rolls = [];
        roll["damage-types"] = [capitalizeFirstLetter(currentlyExpectedRoll.damageType)];
        roll["critical-damage-types"] = [capitalizeFirstLetter(currentlyExpectedRoll.damageType)];
        delete roll.ability;
        roll.type = "digital-dice";
    }

    renderedRoll.character = roll.character.name;
    if (isEncounterBuilder || (rolledJson.messageScope === "userId" && rolledJson.messageTarget !== getUserId())) {
        renderedRoll.whisper = 1;
        roll.whisper = 1;
    }
    if (rolledJson.data.rolls[0].rollKind === "advantage") {
        roll.advantage = 3;
    } else if (rolledJson.data.rolls[0].rollKind === "disadvantage") {
        roll.advantage = 4;
    }

    if (rolledJson.data.rolls[0].rollKind === "advantage" || rolledJson.data.rolls[0].rollKind === "disadvantage") {
        renderedRoll.damage_rolls = [];
        for (let i = 0; i < rolledJson.data.rolls[0].result.values.length; i++) {
            renderedRoll.attack_rolls[i] = JSON.parse(JSON.stringify(beyond20RenderedRoll.attack_rolls[0]));
            renderedRoll.attack_rolls[i].formula = roll.roll;
            renderedRoll.attack_rolls[i].total = rolledJson.data.rolls[0].result.values[i] + rolledJson.data.rolls[0].result.constant;
            renderedRoll.attack_rolls[i].parts[0].total = rolledJson.data.rolls[0].result.values[i];
            renderedRoll.attack_rolls[i].parts[0].formula = roll.roll.split(operator)[0];
            renderedRoll.attack_rolls[i].parts[0].rolls = [];
            renderedRoll.attack_rolls[i].parts[0].rolls.push({
                roll: rolledJson.data.rolls[0].result.values[i],
            });
            renderedRoll.attack_rolls[i].parts[0].amount = rolledJson.data.rolls[0].result.values.length;
            renderedRoll.attack_rolls[i].parts[0].faces = parseInt(rolledJson.data.rolls[0].diceNotation.set[0].dieType.split("d")[1]);
            renderedRoll.attack_rolls[i].parts[1] = operator;
            renderedRoll.attack_rolls[i].parts[2] = rolledJson.data.rolls[0].result.constant;
        }
    }

    renderedRoll.request = roll;

    if ((beyond20CustomRollNoSend && Object.keys(currentlyExpectedRoll).length === 0) || (rolledJson.messageScope === "userId" && rolledJson.messageTarget === getUserId())) {
        return;
    }
    sendBeyond20Event("SendMessage", renderedRoll);
}

addBeyond20EventListener("rendered-roll", (...args) => {
    console.log("Rendered Roll");
    console.log(args);
});