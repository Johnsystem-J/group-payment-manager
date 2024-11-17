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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const roomForm = document.getElementById("room-form");
const roomSection = document.getElementById("room-section");
const roomTitle = document.getElementById("room-title");
const currentRoomId = document.getElementById("current-room-id");
const playerList = document.getElementById("player-list");
const receiverList = document.getElementById("receiver");
const playerTable = document.querySelector("#player-table tbody");

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
    db.ref(`rooms/${roomId}/players/${playerName}`).set(true);

    // Remove player on disconnect
    db.ref(`rooms/${roomId}/players/${playerName}`).onDisconnect().remove();

    // Update UI
    roomForm.classList.add("hidden");
    roomSection.classList.remove("hidden");
    roomTitle.textContent = roomId;
    currentRoomId.textContent = roomId;

    listenToRoom(roomId);
});

// Listen for room updates
function listenToRoom(roomId) {
    // Update player list
    db.ref(`rooms/${roomId}/players`).on("value", (snapshot) => {
        const players = snapshot.val();
        playerList.innerHTML = "";
        receiverList.innerHTML = "";

        if (players) {
            Object.keys(players).forEach((player) => {
                const li = document.createElement("li");
                li.textContent = player;
                playerList.appendChild(li);

                const option = document.createElement("option");
                option.value = player;
                option.textContent = player;
                receiverList.appendChild(option);
            });
        }
    });

    // Update payment history
    db.ref(`rooms/${roomId}/payments`).on("value", (snapshot) => {
        const payments = snapshot.val();
        playerTable.innerHTML = "";
        if (payments) {
            Object.keys(payments).forEach((key) => {
                const payment = payments[key];
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${payment.payer}</td>
                    <td>${payment.amount} ฿</td>
                    <td>${payment.receiver}</td>
                `;
                playerTable.appendChild(row);
            });
        }
    });
}

// Add payment
document.getElementById("add-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = document.getElementById("amount").value;
    const receiver = receiverList.value;

    if (!amount || !receiver) {
        alert("Please fill all fields.");
        return;
    }

    db.ref(`rooms/${currentRoomID}/payments`).push({
        payer: currentPlayerName,
        amount,
        receiver,
    });

    document.getElementById("add-payment-form").reset();
});
