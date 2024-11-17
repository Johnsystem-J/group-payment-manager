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
const homePage = document.getElementById("home-page");
const roomPage = document.getElementById("room-page");
const roomIdDisplay = document.getElementById("room-id");
const playerNameDisplay = document.getElementById("player-name");
const playerList = document.getElementById("player-list");
const balanceSummary = document.getElementById("balance-summary");
const transactionList = document.getElementById("transaction-list");
const roomsList = document.getElementById("rooms-list");

let currentPlayerName = null;
let currentRoomId = null;

// Create Room
document.getElementById("create-room-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const playerName = document.getElementById("playerName").value.trim();
    const roomId = Math.random().toString(36).substr(2, 6);

    if (!playerName) {
        alert("Please enter your name before creating a room.");
        return;
    }

    currentPlayerName = playerName;
    currentRoomId = roomId;

    db.ref(`rooms/${roomId}`).set({
        createdAt: Date.now()
    });

    joinRoom(roomId, playerName);
});

// Join Room
function joinRoom(roomId, playerName = null) {
    if (!currentPlayerName && !playerName) {
        alert("Please enter your name before joining a room.");
        return;
    }

    if (playerName) currentPlayerName = playerName;
    currentRoomId = roomId;

    // Check for duplicate name
    db.ref(`rooms/${roomId}/players`).once("value", (snapshot) => {
        const players = snapshot.val();
        if (players && players[currentPlayerName]) {
            alert("This name is already in use. Please choose a different name.");
            return;
        }

        // Save player to Firebase
        db.ref(`rooms/${roomId}/players/${currentPlayerName}`).set(true);

        // Update UI
        homePage.classList.add("hidden");
        roomPage.classList.remove("hidden");
        roomIdDisplay.textContent = roomId;
        playerNameDisplay.textContent = currentPlayerName;

        updateRoomData();
    });
}

// Handle Room Click
function handleRoomClick(roomId) {
    const playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("Please enter your name before joining a room.");
        return;
    }

    joinRoom(roomId, playerName);
}

// Update Room Data
function updateRoomData() {
    const roomRef = db.ref(`rooms/${currentRoomId}`);

    // Listen for players
    roomRef.child("players").on("value", (snapshot) => {
        const players = snapshot.val();
        playerList.innerHTML = "";
        if (players) {
            Object.keys(players).forEach((player) => {
                const li = document.createElement("li");
                li.textContent = player;
                if (player !== currentPlayerName) {
                    li.style.color = "blue";
                } else {
                    li.style.color = "green";
                }
                playerList.appendChild(li);
            });
        }
    });

    // Listen for balances
    roomRef.child("balances").on("value", (snapshot) => {
        const balances = snapshot.val();
        balanceSummary.innerHTML = "";
        if (balances) {
            Object.keys(balances).forEach((player) => {
                const div = document.createElement("div");
                const balance = balances[player];
                div.textContent = `${player}: ${balance >= 0 ? "+" : ""}${balance} ฿`;
                div.style.color = balance >= 0 ? "green" : "red";
                balanceSummary.appendChild(div);
            });
        }
    });

    // Listen for transactions
    roomRef.child("transactions").on("value", (snapshot) => {
        const transactions = snapshot.val();
        transactionList.innerHTML = "";
        if (transactions) {
            Object.values(transactions).forEach((transaction) => {
                const li = document.createElement("li");
                li.textContent = `${transaction.payer} paid ${transaction.receiver} ${transaction.amount} ฿`;
                li.style.color = "purple";
                transactionList.appendChild(li);
            });
        }
    });
}

// Add Payment
document.getElementById("add-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;

    if (!amount || !receiver || receiver === currentPlayerName) {
        alert("Invalid payment details.");
        return;
    }

    const roomRef = db.ref(`rooms/${currentRoomId}`);
    roomRef.child("balances").transaction((balances) => {
        if (!balances) balances = {};
        balances[currentPlayerName] = (balances[currentPlayerName] || 0) - amount;
        balances[receiver] = (balances[receiver] || 0) + amount;
        return balances;
    });

    roomRef.child("transactions").push({
        payer: currentPlayerName,
        receiver: receiver,
        amount: amount
    });

    document.getElementById("add-payment-form").reset();
});

// Leave Room
document.getElementById("leave-room").addEventListener("click", () => {
    const roomRef = db.ref(`rooms/${currentRoomId}`);
    roomRef.child(`players/${currentPlayerName}`).remove();

    // Check if room is empty and schedule deletion
    roomRef.child("players").once("value", (snapshot) => {
        if (!snapshot.exists()) {
            setTimeout(() => {
                roomRef.remove();
            }, 300000); // 5 minutes
        }
    });

    currentPlayerName = null;
    currentRoomId = null;

    homePage.classList.remove("hidden");
    roomPage.classList.add("hidden");
});

// Display Rooms List
db.ref("rooms").on("value", (snapshot) => {
    roomsList.innerHTML = "";
    const rooms = snapshot.val();
    if (rooms) {
        Object.keys(rooms).forEach((roomId) => {
            const li = document.createElement("li");
            li.textContent = `Room: ${roomId}`;
            li.style.cursor = "pointer";
            li.addEventListener("click", () => handleRoomClick(roomId));
            roomsList.appendChild(li);
        });
    }
});
