document.addEventListener("DOMContentLoaded", () => {
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

    let currentRoomId = null;
    let currentPlayerName = null;

    const homePage = document.getElementById("home-page");
    const roomPage = document.getElementById("room-page");
    const roomIdDisplay = document.getElementById("room-id");
    const playerNameDisplay = document.getElementById("player-name");
    const playerList = document.getElementById("player-list");
    const balanceSummary = document.getElementById("balance-summary");
    const transactionList = document.getElementById("transaction-list");
    const roomsList = document.getElementById("rooms-list");

    document.getElementById("create-room-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const playerName = document.getElementById("playerName").value.trim();
        if (!playerName) {
            alert("Please enter your name.");
            return;
        }

        currentPlayerName = playerName;
        const roomId = Math.random().toString(36).substr(2, 6);

        db.ref(`rooms/${roomId}`).set({
            createdAt: Date.now()
        });

        joinRoom(roomId, playerName);
    });

    roomsList.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            const roomId = e.target.dataset.roomId;
            const playerName = document.getElementById("playerName").value.trim();

            if (!playerName) {
                alert("Please enter your name.");
                return;
            }

            currentPlayerName = playerName;
            joinRoom(roomId, playerName);
        }
    });

    function joinRoom(roomId, playerName) {
        currentRoomId = roomId;
        db.ref(`rooms/${roomId}/players/${playerName}`).set(true);

        homePage.classList.add("hidden");
        roomPage.classList.remove("hidden");
        roomIdDisplay.textContent = roomId;
        playerNameDisplay.textContent = playerName;

        listenToRoom(roomId);
    }

    function listenToRoom(roomId) {
        db.ref(`rooms/${roomId}/players`).on("value", (snapshot) => {
            const players = snapshot.val();
            playerList.innerHTML = "";
            if (players) {
                Object.keys(players).forEach((player) => {
                    const li = document.createElement("li");
                    li.textContent = player;
                    playerList.appendChild(li);
                });
            }
        });

        db.ref(`rooms/${roomId}/transactions`).on("value", (snapshot) => {
            const transactions = snapshot.val();
            transactionList.innerHTML = "";
            if (transactions) {
                Object.values(transactions).forEach((transaction) => {
                    const li = document.createElement("li");
                    li.textContent = `${transaction.date} - ${transaction.sender} paid ${transaction.receiver} ${transaction.amount} ฿`;
                    transactionList.appendChild(li);
                });
            }
        });
    }

    document.getElementById("add-transaction-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const receiver = document.getElementById("receiver").value.trim();
        const amount = parseFloat(document.getElementById("amount").value);

        if (!receiver || isNaN(amount)) {
            alert("Please provide valid inputs.");
            return;
        }

        const transaction = {
            sender: currentPlayerName,
            receiver: receiver,
            amount: amount,
            date: new Date().toLocaleString()
        };

        db.ref(`rooms/${currentRoomId}/transactions`).push(transaction);
        document.getElementById("add-transaction-form").reset();
    });

    document.getElementById("leave-room").addEventListener("click", () => {
        db.ref(`rooms/${currentRoomId}/players/${currentPlayerName}`).remove();
        currentPlayerName = null;
        currentRoomId = null;
        homePage.classList.remove("hidden");
        roomPage.classList.add("hidden");
    });

    db.ref("rooms").on("value", (snapshot) => {
        const rooms = snapshot.val();
        roomsList.innerHTML = "";
        if (rooms) {
            Object.keys(rooms).forEach((roomId) => {
                const li = document.createElement("li");
                li.textContent = `Room ID: ${roomId}`;
                li.dataset.roomId = roomId;
                roomsList.appendChild(li);
            });
        }
    });
});
