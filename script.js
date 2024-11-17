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

// Create or Join Room
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const playerName = document.getElementById("playerName").value;
    const roomId = document.getElementById("roomId").value || Math.random().toString(36).substr(2, 6);

    // Save room details and player to Firebase
    db.ref(`rooms/${roomId}/players/${playerName}`).set(true);

    // Initialize balances if not exists
    db.ref(`rooms/${roomId}/balances/${playerName}`).transaction((current) => current || 0);

    // Update UI
    roomForm.classList.add("hidden");
    roomSection.classList.remove("hidden");
    roomTitle.textContent = `Room ID: ${roomId}`;
    currentRoomId.textContent = roomId;

    // Listen for room updates
    listenToRoom(roomId);
});

// Listen for room updates
function listenToRoom(roomId) {
    // Update player list and balances
    db.ref(`rooms/${roomId}/balances`).on("value", (snapshot) => {
        const balances = snapshot.val();

        // Clear player list and summary table
        playerList.innerHTML = "";
        summaryTable.innerHTML = "";

        if (balances) {
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
        }
    });
}

// Add payment to Firebase
document.getElementById("add-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const payer = document.getElementById("payer").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;
    const roomId = currentRoomId.textContent;

    if (!payer || !receiver || isNaN(amount)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    // Update balances
    db.ref(`rooms/${roomId}/balances/${payer}`).transaction((current) => (current || 0) - amount);
    db.ref(`rooms/${roomId}/balances/${receiver}`).transaction((current) => (current || 0) + amount);

    // Clear form
    document.getElementById("add-payment-form").reset();
});

// Remove room data if all players leave
function checkRoomEmpty(roomId) {
    db.ref(`rooms/${roomId}/players`).on("value", (snapshot) => {
        const players = snapshot.val();
        if (!players) {
            db.ref(`rooms/${roomId}`).remove();
        }
    });
}
