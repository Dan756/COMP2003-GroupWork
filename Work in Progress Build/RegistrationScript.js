document.getElementById("registerButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");

    // Clear messages
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    function isPasswordStrong(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }

    // Validate inputs
    if (!email || !username || !password || !confirmPassword) {
        errorMessage.textContent = "All fields are required.";
        errorMessage.style.display = "block";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match.";
        errorMessage.style.display = "block";
        return;
    }

    if (!isPasswordStrong(password)) {
        errorMessage.textContent = "This Password Doesnt meet the requirements.It must include an Uppercase letter, a Lowercase letter, a Number, A Special Character(EG:!£$%^&), and be at least 8 Characters long.";
        errorMessage.style.display = "block";
        return;
    }

    try {
        // Send registration request to the server
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Registration successful
            successMessage.textContent = "Registration successful! You can now log in.";
            successMessage.style.display = "block";

            // Clear input fields
            document.getElementById("email").value = "";
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("confirmPassword").value = "";
        } else {
            // Show error message
            errorMessage.textContent = data.message || "Registration failed. Please try again.";
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Error during registration:", error);
        errorMessage.textContent = "An error occurred. Please try again later.";
        errorMessage.style.display = "block";
    }
});
