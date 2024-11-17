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
