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
const roomForm = document.getElementById("room-form");
const roomSection = document.getElementById("room-section");
const roomTitle = document.getElementById("room-title");
const currentRoomId = document.getElementById("current-room-id");
const playerList = document.getElementById("player-list");
const summaryTable = document.querySelector("#summary-table tbody");

let currentRoomID = null;
let currentPlayerName = null;

// Create or Join Room
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const playerName = document.getElementById("playerName").value.trim();
    const roomId = document.getElementById("roomId").value.trim() || Math.random().toString(36).substr(2, 6);

    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    currentPlayerName = playerName;
    currentRoomID = roomId;

    // Add player to room
    db.ref(`rooms/${roomId}/balances/${playerName}`).set(0);

    // Remove player on disconnect
    db.ref(`rooms/${roomId}/balances/${playerName}`).onDisconnect().remove();

    // Update UI
    roomForm.classList.add("hidden");
    roomSection.classList.remove("hidden");
    roomTitle.textContent = `Room ID: ${roomId}`;
    currentRoomId.textContent = roomId;

    listenToRoom(roomId);
});

// Listen for room updates
function listenToRoom(roomId) {
    // Update player list and summary
    db.ref(`rooms/${roomId}/balances`).on("value", (snapshot) => {
        const balances = snapshot.val();
        if (!balances) return;

        // Clear old data
        playerList.innerHTML = "";
        summaryTable.innerHTML = "";

        Object.keys(balances).forEach((player) => {
            // Update player list
            const li = document.createElement("li");
            li.textContent = player;
            playerList.appendChild(li);

            // Update summary table
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${player}</td>
                <td>${balances[player]} ฿</td>
            `;
            summaryTable.appendChild(row);
        });
    });
}

// Add payment
document.getElementById("add-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;

    if (!amount || !receiver) {
        alert("Please fill all fields.");
        return;
    }

    // Update payer balance
    const payerRef = db.ref(`rooms/${currentRoomID}/balances/${currentPlayerName}`);
    payerRef.transaction((currentBalance) => (currentBalance || 0) - amount);

    // Update receiver balance
    const receiverRef = db.ref(`rooms/${currentRoomID}/balances/${receiver}`);
    receiverRef.transaction((currentBalance) => (currentBalance || 0) + amount);

    document.getElementById("add-payment-form").reset();
});
