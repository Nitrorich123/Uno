let partyCode = "";
let chatData = {};
let unoData = {};
let partyPlayers = {}; // Track number of players in each party

const colors = ["Red", "Yellow", "Green", "Blue"];
const values = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Draw 2", "Skip", "Reverse"];
let currentCard = "";
let playerCards = [];
let currentPlayer = 0;
let totalPlayers = 2;

// Max party limit
const maxPartyLimit = 10;

// Profanity and bypass detection
const badWords = [
    "fuck", "shit", "bitch", "asshole", "dick", "pussy", "cunt", "nigger", "nigga", "bastard", "fag", "faggot"
];
const allowedWords = ["damn", "hell"];

function censorMessage(message) {
    let words = message.split(" ");
    return words
        .map(word => {
            let cleanWord = removeBypass(word);
            if (isBadWord(cleanWord) && !allowedWords.includes(cleanWord)) {
                return "*".repeat(word.length);
            }
            return word;
        })
        .join(" ");
}

// Detect bypass by replacing symbols
function removeBypass(word) {
    return word
        .toLowerCase()
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/@/g, "a")
        .replace(/\$/g, "s")
        .replace(/0/g, "o")
        .replace(/!/g, "i");
}

// Check if a word is a bad word
function isBadWord(word) {
    return badWords.some(badWord => word.includes(badWord));
}

// ==================== PARTY CREATION ====================

function createParty() {
    partyCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    document.getElementById("currentCode").innerText = partyCode;
    showChatSection();
    chatData[partyCode] = [];
    unoData[partyCode] = {};
    partyPlayers[partyCode] = 1; // Creator joins the party automatically
    initUNO();
}

// ==================== JOIN PARTY ====================

function joinParty() {
    let inputCode = document.getElementById("partyCode").value;
    if (inputCode.length === 8 && !isNaN(inputCode)) {
        partyCode = inputCode;

        if (!partyPlayers[partyCode]) {
            alert("Invalid party code. Please create or join a valid party.");
            return;
        }

        if (partyPlayers[partyCode] >= maxPartyLimit) {
            alert("This party is full. Max limit is 10 players.");
            return;
        }

        partyPlayers[partyCode]++;
        document.getElementById("currentCode").innerText = partyCode;
        showChatSection();
        if (!chatData[partyCode]) {
            chatData[partyCode] = [];
            initUNO();
        } else {
            loadChat();
            loadUNO();
        }
    } else {
        alert("Please enter a valid 8-digit code.");
    }
}

function showChatSection() {
    document.getElementById("party-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
}

// ==================== CHAT ====================

function sendMessage() {
    let message = document.getElementById("messageInput").value;
    if (message.trim() !== "") {
        let censoredMessage = censorMessage(message);
        chatData[partyCode].push({ type: "text", content: censoredMessage });
        loadChat();
        document.getElementById("messageInput").value = "";
    }
}

function sendImage() {
    let file = document.getElementById("imageInput").files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            chatData[partyCode].push({ type: "image", content: e.target.result });
            loadChat();
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select an image to upload.");
    }
}

function loadChat() {
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    chatData[partyCode].forEach(msg => {
        if (msg.type === "text") {
            chatBox.innerHTML += `<p>${msg.content}</p>`;
        } else if (msg.type === "image") {
            chatBox.innerHTML += `<img src="${msg.content}" alt="Uploaded Image">`;
        }
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==================== UNO LOGIC ====================

function initUNO() {
    playerCards = generateHand(5);
    currentCard = drawRandomCard();
    currentPlayer = 0;
    unoData[partyCode] = {
        currentCard: currentCard,
        playerCards: playerCards,
        currentPlayer: currentPlayer
    };
    loadUNO();
}

function generateHand(num) {
    let hand = [];
    for (let i = 0; i < num; i++) {
        hand.push(drawRandomCard());
    }
    return hand;
}

function drawRandomCard() {
    let color = colors[Math.floor(Math.random() * colors.length)];
    let value = values[Math.floor(Math.random() * values.length)];
    return `${color} ${value}`;
}

function loadUNO() {
    document.getElementById("currentCard").innerText = unoData[partyCode].currentCard;
    document.getElementById("yourCards").innerText = unoData[partyCode].playerCards.join(", ");
    document.getElementById("currentTurn").innerText = unoData[partyCode].currentPlayer === 0 ? "Your Turn" : "Opponent's Turn";
}

function drawCard() {
    if (unoData[partyCode].currentPlayer === 0) {
        let newCard = drawRandomCard();
        unoData[partyCode].playerCards.push(newCard);
        loadUNO();
    } else {
        alert("Wait for your turn!");
    }
}

function playCard() {
    if (unoData[partyCode].currentPlayer !== 0) {
        alert("Wait for your turn!");
        return;
    }
    
    let cardInput = document.getElementById("playCardInput").value;
    let currentColor = unoData[partyCode].currentCard.split(" ")[0];
    let currentValue = unoData[partyCode].currentCard.split(" ")[1];
    
    if (unoData[partyCode].playerCards.includes(cardInput)) {
        let cardColor = cardInput.split(" ")[0];
        let cardValue = cardInput.split(" ")[1];
        
        if (cardColor === currentColor || cardValue === currentValue) {
            unoData[partyCode].currentCard = cardInput;
            unoData[partyCode].playerCards = unoData[partyCode].playerCards.filter(card => card !== cardInput);
            unoData[partyCode].currentPlayer = 1; // Switch turn to opponent
            loadUNO();
            
            if (unoData[partyCode].playerCards.length === 0) {
                alert("You win!");
                initUNO(); // Restart game
            }
        } else {
            alert("Invalid move. Card must match color or value.");
        }
    } else {
        alert("You don't have that card.");
    }
}