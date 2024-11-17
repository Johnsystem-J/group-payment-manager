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
const currentRoomId = document.getElementById("current-room-id");
const playerList = document.getElementById("player-list");
const receiverSelect = document.getElementById("receiver");

// Event Listener for Room Form
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const playerName = document.getElementById("playerName").value;
    const roomId = document.getElementById("roomId").value || Math.random().toString(36).substr(2, 6);

    // Save player to Firebase
    const playerRef = db.ref(`rooms/${roomId}/players/${playerName}`);
    playerRef.set(0); // Default balance is 0

    // Update UI
    roomForm.classList.add("hidden");
    roomSection.classList.remove("hidden");
    currentRoomId.textContent = roomId;

    // Listen for room updates
    listenToRoom(roomId);
});

// Listen to Room Changes
function listenToRoom(roomId) {
    db.ref(`rooms/${roomId}/players`).on("value", (snapshot) => {
        const players = snapshot.val();
        playerList.innerHTML = ""; // Clear list
        receiverSelect.innerHTML = ""; // Clear select options

        if (players) {
            Object.keys(players).forEach((playerName) => {
                const balance = players[playerName];
                
                // Update Player List
                const li = document.createElement("li");
                li.textContent = `${playerName}: ${balance} ฿`;
                playerList.appendChild(li);

                // Update Receiver Select
                const option = document.createElement("option");
                option.value = playerName;
                option.textContent = playerName;
                receiverSelect.appendChild(option);
            });
        }
    });
}

// Add Payment
document.getElementById("add-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;
    const roomId = currentRoomId.textContent;
    const sender = document.getElementById("playerName").value;

    if (sender === receiver) {
        alert("You cannot send money to yourself!");
        return;
    }

    // Update balances
    const senderRef = db.ref(`rooms/${roomId}/players/${sender}`);
    const receiverRef = db.ref(`rooms/${roomId}/players/${receiver}`);

    senderRef.transaction((balance) => (balance || 0) - amount);
    receiverRef.transaction((balance) => (balance || 0) + amount);

    // Clear Form
    document.getElementById("add-payment-form").reset();
});
