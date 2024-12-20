document.addEventListener("DOMContentLoaded", () => {
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
    const playerColors = {};

    const homePage = document.getElementById("home-page");
    const roomPage = document.getElementById("room-page");
    const roomIdDisplay = document.getElementById("room-id");
    const playerNameDisplay = document.getElementById("player-name");
    const playerList = document.getElementById("player-list");
    const balanceSummaryList = document.getElementById("balance-summary-list");
    const transactionList = document.getElementById("transaction-list");
    const roomsList = document.getElementById("rooms-list");
    const receiverSelect = document.getElementById("receiver");

    // Create Room
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

    // Join Room
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

    // Function to join room and set player data
    function joinRoom(roomId, playerName) {
        currentRoomId = roomId;
        db.ref(`rooms/${roomId}/players/${playerName}`).set(true);

        homePage.classList.add("hidden");
        roomPage.classList.remove("hidden");
        roomIdDisplay.textContent = roomId;
        playerNameDisplay.textContent = playerName;

        listenToRoom(roomId);
    }

    // Listen to room for player data and transactions
    function listenToRoom(roomId) {
        db.ref(`rooms/${roomId}/players`).on("value", (snapshot) => {
            const players = snapshot.val();
            playerList.innerHTML = "";
            receiverSelect.innerHTML = `<option value="" disabled selected>Select Receiver</option>`;

            // Create player list and random colors for players
            if (players) {
                Object.keys(players).forEach((player) => {
                    const color = playerColors[player] || (playerColors[player] = getRandomColor());
                    const li = document.createElement("li");
                    li.textContent = player;
                    li.style.color = color;
                    playerList.appendChild(li);

                    if (player !== currentPlayerName) {
                        const option = document.createElement("option");
                        option.value = player;
                        option.textContent = player;
                        receiverSelect.appendChild(option);
                    }
                });
            }
        });

        // Listening for transactions and updating Balance Summary
        db.ref(`rooms/${roomId}/transactions`).on("value", (snapshot) => {
            const transactions = snapshot.val();
            transactionList.innerHTML = "";
            balanceSummaryList.innerHTML = "";
            const balances = {};

            // Populate transactions and calculate balances
            if (transactions) {
                Object.values(transactions).forEach((transaction) => {
                    const li = document.createElement("li");
                    li.textContent = `${transaction.date} - ${transaction.sender} paid ${transaction.receiver} ${transaction.amount} ฿`;
                    transactionList.appendChild(li);

                    balances[transaction.sender] = (balances[transaction.sender] || 0) - transaction.amount;
                    balances[transaction.receiver] = (balances[transaction.receiver] || 0) + transaction.amount;
                });
            }

            // Create Balance Summary Table
            const players = Object.keys(balances);
            const table = document.createElement('table');
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<th>Player</th>` + players.map(player => `<th>${player}</th>`).join('');
            table.appendChild(headerRow);

            players.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${player}</td>` + players.map(otherPlayer => {
                    const amount = (balances[otherPlayer] || 0) - (balances[player] || 0);
                    const color = amount < 0 ? 'red' : 'green';
                    return `<td style="color:${color}">${amount} ฿</td>`;
                }).join('');
                table.appendChild(row);
            });

            balanceSummaryList.appendChild(table);
        });
    }

    // Add transaction
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

    // Leave Room
    document.getElementById("leave-room").addEventListener("click", () => {
        db.ref(`rooms/${currentRoomId}/players/${currentPlayerName}`).remove();
        db.ref(`rooms/${currentRoomId}/players`).once("value", (snapshot) => {
            if (!snapshot.exists()) {
                db.ref(`rooms/${currentRoomId}`).remove();
            }
        });

        homePage.classList.remove("hidden");
        roomPage.classList.add("hidden");
        currentRoomId = null;
        currentPlayerName = null;
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

    // Function to generate random color for players
    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
