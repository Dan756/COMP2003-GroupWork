async function generateImage() {
    try {
        // Get values from the form
        const prompt = document.getElementById("prompt").value;
        const size = document.getElementById("size").value;

        console.log("Prompt:", prompt);
        console.log("Selected Size:", size); //Debugging

        if (!size) {
            alert("Please select a valid image size.");
            return;
        }
        const response = await fetch("http://localhost:3000/api/generate-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, size }), // Send both prompt and size
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Generated Image Data:", data);

        // Display the generated image on the page using the url sent back from OpenAI
        const imageUrl = data.data[0].url;
        document.getElementById("generated-image").src = imageUrl;
    } catch (error) {
        console.error("Error generating image:", error);
        alert(`Error: ${error.message}`);
    }
}

// Event listener for form submission
document.getElementById("image-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    await generateImage();
});

document.getElementById("resetImage").addEventListener("click", async () => {
    const noSetImage = "";
    document.getElementById("generated-image").src = noSetImage;
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("image-form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        let button = document.getElementById("genButton");
        button.disabled = true;

        let cooldown = 30; // Cooldown duration in seconds
        button.textContent = `This Button is on cooldown. (${cooldown}s)`;

        let countdown = setInterval(() => {
            cooldown--;
            button.textContent = `This Button is on cooldown. (${cooldown}s)`;

            if (cooldown <= 0) {
                clearInterval(countdown);
                button.disabled = false;
                button.textContent = "Generate";
            }
        }, 1000); // Update every second
    });
});
