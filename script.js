document.addEventListener("DOMContentLoaded", () => {
    const roomForm = document.getElementById("room-form");
    const paymentTableBody = document.querySelector("#paymentTable tbody");

    // Sample data for payment table
    const payments = [
        { player: "Player A", owes: "100", to: "Player B" },
        { player: "Player C", owes: "50", to: "Player A" },
    ];

    // Populate the table with sample data
    function populateTable() {
        paymentTableBody.innerHTML = ""; // Clear existing rows
        payments.forEach((payment) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${payment.player}</td>
                <td>${payment.owes} ฿</td>
                <td>${payment.to}</td>
            `;
            paymentTableBody.appendChild(row);
        });
    }

    // Handle form submission
    roomForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const roomName = document.getElementById("roomName").value;
        const roomId = document.getElementById("roomId").value || Math.floor(1000 + Math.random() * 9000);
        alert(`Room Created/Joined Successfully!\nRoom Name: ${roomName}\nRoom ID: ${roomId}`);
    });

    // Initial population of the table
    populateTable();
});

// Include Firebase CDN in your HTML file
// Add this script tag in your <head> section of index.html:
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"></script>

// Your web app's Firebase configuration
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

// Initialize Realtime Database
const database = firebase.database();
