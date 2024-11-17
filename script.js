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
const playerTable = document.querySelector("#player-table tbody");

// Create or Join Room
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roomName = document.getElementById("roomName").value;
    const roomId = document.getElementById("roomId").value || Math.random().toString(36).substr(2, 6);

    // Save room details to Firebase
    db.ref(`rooms/${roomId}`).set({
        roomName: roomName,
        createdAt: Date.now(),
    });

    // Update UI
    roomForm.classList.add("hidden");
    roomSection.classList.remove("hidden");
    roomTitle.textContent = roomName;
    currentRoomId.textContent = roomId;

    // Listen for room updates
    listenToRoom(roomId);
});

// Listen for payments in the room
function listenToRoom(roomId) {
    db.ref(`rooms/${roomId}/payments`).on("value", (snapshot) => {
        const payments = snapshot.val();
        playerTable.innerHTML = ""; // Clear table
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

// Add payment to Firebase
document.getElementById("add-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const payer = document.getElementById("payer").value;
    const amount = document.getElementById("amount").value;
    const receiver = document.getElementById("receiver").value;
    const roomId = currentRoomId.textContent;

    db.ref(`rooms/${roomId}/payments`).push({
        payer: payer,
        amount: amount,
        receiver: receiver,
    });

    // Clear form
    document.getElementById("add-payment-form").reset();
});

// Generate QR Code
document.getElementById("generate-qr").addEventListener("click", () => {
    const promptpayNumber = document.getElementById("promptpay-number").value;
    const amount = document.getElementById("amount").value;
    const qrCodeUrl = `https://promptpay.io/${promptpayNumber}/${amount}`;
    const qrCodeContainer = document.getElementById("qr-code-container");
    qrCodeContainer.innerHTML = `<img src="${qrCodeUrl}" alt="PromptPay QR Code">`;
});
