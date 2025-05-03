document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Error message container
    const errorMessage = document.getElementById("errorMessage");

    // Validate inputs
    if (!email || !password) {
        errorMessage.textContent = "Please enter both email and password.";
        errorMessage.style.display = "block";
        return;
    }

    try {
        // Send login request to the server
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Login successful
            alert("Login successful!");
            // Redirect to another page
            window.location.href = "main page.html";
        } else {
            // Show error message
            errorMessage.textContent = data.message || "Invalid login credentials.";
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Error logging in:", error);
        errorMessage.textContent = "An error occurred. Please try again later.";
        errorMessage.style.display = "block";
    }
});
