// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD71BpGMZ0QbXdgvc73-L7SdVSWmacuohM",
    authDomain: "group-payment-manager.firebaseapp.com",
    databaseURL: "https://group-payment-manager-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "group-payment-manager",
    storageBucket: "group-payment-manager.firebasestorage.app",
    messagingSenderId: "829025220060",
    appId: "1:829025220060:web:49fc46e0970d5385efcb19",
    measurementId: "G-L7X9YMRE8Q"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const joinForm = document.getElementById("join-room-form");
const homePage = document.getElementById("home-page");
const roomPage = document.getElementById("room-page");
const roomIdDisplay = document.getElementById("current-room-id");
const playerNameDisplay = document.getElementById("current-player-name");
const playerList = document.getElementById("player-list");
const transactionsList = document.getElementById("transactions-list");
const summaryList = document.getElementById("summary-list");
const receiverDropdown = document.getElementById("receiver");
const leaveRoomButton = document.getElementById("leave-room");

// State
let currentRoomId = null;
let currentPlayerName = null;

// Fetch available rooms
db.ref("rooms").on("value", (snapshot) => {
    const roomsList = document.getElementById("rooms-list");
    roomsList.innerHTML = "";
    const rooms = snapshot.val();
    if (rooms) {
        Object.keys(rooms).forEach((roomId) => {
            const li = document.createElement("li");
            li.textContent = `Room ID: ${roomId}`;
            li.addEventListener("click", () => joinRoom(roomId));
            roomsList.appendChild(li);
        });
    }
});

// Join or create room
joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const playerName = document.getElementById("playerName").value;
    const roomId = document.getElementById("roomId").value || Math.random().toString(36).substr(2, 6);

    joinRoom(roomId, playerName);
});

function joinRoom(roomId, playerName = null) {
    if (playerName) currentPlayerName = playerName;
    currentRoomId = roomId;

    db.ref(`rooms/${roomId}/players/${currentPlayerName}`).set(true);

    homePage.classList.add("hidden");
    roomPage.classList.remove("hidden");
    roomIdDisplay.textContent = roomId;
    playerNameDisplay.textContent = currentPlayerName;

    updateRoomData();
}

leaveRoomButton.addEventListener("click", () => {
    db.ref(`rooms/${currentRoomId}/players/${currentPlayerName}`).remove().then(() => {
        homePage.classList.remove("hidden");
        roomPage.classList.add("hidden");
        currentRoomId = null;
        currentPlayerName = null;
    });
});

function updateRoomData() {
    db.ref(`rooms/${currentRoomId}`).on("value", (snapshot) => {
        const roomData = snapshot.val();
        updatePlayerList(roomData.players || {});
        updateTransactions(roomData.transactions || {});
        updateSummary(roomData.players || {});
    });
}

function updatePlayerList(players) {
    playerList.innerHTML = "";
    receiverDropdown.innerHTML = "";
    Object.keys(players).forEach((player) => {
        const li = document.createElement("li");
        li.textContent = player;
        playerList.appendChild(li);

        if (player !== currentPlayerName) {
            const option = document.createElement("option");
            option.value = player;
            option.textContent = player;
            receiverDropdown.appendChild(option);
        }
    });
}

document.getElementById("add-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    const receiver = receiverDropdown.value;

    db.ref(`rooms/${currentRoomId}/transactions`).push({
        payer: currentPlayerName,
        receiver: receiver,
        amount: amount,
    });

    document.getElementById("add-payment-form").reset();
});

function updateTransactions(transactions) {
    transactionsList.innerHTML = "";
    Object.values(transactions).forEach((transaction) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${transaction.payer}</td>
            <td>${transaction.amount} ฿</td>
            <td>${transaction.receiver}</td>
        `;
        transactionsList.appendChild(tr);
    });
}

function updateSummary(players) {
    const balances = {};
    Object.keys(players).forEach((player) => (balances[player] = 0));

    db.ref(`rooms/${currentRoomId}/transactions`).once("value", (snapshot) => {
        const transactions = snapshot.val();
        if (transactions) {
            Object.values(transactions).forEach((transaction) => {
                balances[transaction.payer] -= transaction.amount;
                balances[transaction.receiver] += transaction.amount;
            });
        }

        summaryList.innerHTML = "";
        Object.keys(balances).forEach((player) => {
            const li = document.createElement("li");
            li.textContent = `${player}: ${balances[player]} ฿`;
            summaryList.appendChild(li);
        });
    });
}
