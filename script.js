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
const roomTitle = document.getElementById("room-name");
const currentRoomId = document.getElementById("current-room-id");
const playerTable = document.querySelector("#player-table tbody");
const leaveRoomButton = document.getElementById("leave-room-button");
const playerNameInput = document.getElementById("player-name");

// Variables
let roomId = null;
let roomName = null;
let roomTimeout = null; // Variable to store the timeout for room deletion

// Create or Join Room
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    roomName = document.getElementById("roomName").value;
    roomId = document.getElementById("roomId").value || Math.random().toString(36).substr(2, 6);

    // Check if player name is entered
    if (!playerNameInput.value) {
        alert("Please enter your name.");
        return;
    }

    // Save room details to Firebase
    db.ref(`rooms/${roomId}`).set({
        roomName: roomName,
        createdAt: Date.now(),
        players: {}
    });

    // Add player to room
    addPlayerToRoom(playerNameInput.value);

    // Update UI
    roomForm.classList.add("hidden");
    roomSection.classList.remove("hidden");
    roomTitle.textContent = roomName;
    currentRoomId.textContent = roomId;

    // Listen for room updates
    listenToRoom(roomId);
});

// Listen for players and payments in the room
function listenToRoom(roomId) {
    db.ref(`rooms/${roomId}`).on("value", (snapshot) => {
        const roomData = snapshot.val();
        if (roomData) {
            updatePlayerList(roomData.players);
            // If no players are in the room, start the timeout to delete the room
            if (Object.keys(roomData.players).length === 0) {
                startRoomTimeout(roomId);
            } else {
                resetRoomTimeout(); // Reset the timeout if players are present
            }
        }
    });
}

// Add player to room
function addPlayerToRoom(playerName) {
    const playerId = Math.random().toString(36).substr(2, 6); // Generate a unique player ID

    db.ref(`rooms/${roomId}/players/${playerId}`).set({
        name: playerName,
        joinedAt: Date.now()
    });

    playerNameInput.value = ""; // Clear the input field
}

// Update player list in the room
function updatePlayerList(players) {
    playerTable.innerHTML = ""; // Clear previous list
    Object.keys(players).forEach(playerId => {
        const player = players[playerId];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${player.name}</td>
        `;
        playerTable.appendChild(row);
    });
}

// Start the room deletion timeout (1 minute)
function startRoomTimeout(roomId) {
    if (roomTimeout) clearTimeout(roomTimeout); // Clear any existing timeout

    roomTimeout = setTimeout(() => {
        deleteRoom(roomId); // Delete room after 1 minute
    }, 60000); // 60 seconds (1 minute)
}

// Reset the room deletion timeout if there are players in the room
function resetRoomTimeout() {
    if (roomTimeout) {
        clearTimeout(roomTimeout); // Reset timeout if players are still in the room
    }
}

// Delete room from Firebase
function deleteRoom(roomId) {
    db.ref(`rooms/${roomId}`).remove()
        .then(() => {
            alert("Room has been deleted due to inactivity.");
            window.location.href = '/'; // Redirect to home page or reset the app state
        })
        .catch((error) => {
            console.error("Error deleting room:", error);
        });
}

// Leave Room
leaveRoomButton.addEventListener("click", () => {
    const playerName = playerNameInput.value;
    if (playerName) {
        const playerRef = db.ref(`rooms/${roomId}/players`);
        playerRef.once('value', (snapshot) => {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.val().name === playerName) {
                    childSnapshot.ref.remove();
                }
            });
        });
    }

    // Reset the UI and Firebase references
    roomForm.classList.remove("hidden");
    roomSection.classList.add("hidden");
    document.getElementById("player-name").value = ""; // Clear input
    currentRoomId.textContent = "";
    roomId = null;
});
