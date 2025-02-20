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

const addImageButton = document.getElementById('add-image-button');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imageUploaded')
const dropZone = document.getElementById('dropZone');
addImageButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imagePreview.style.left = '50px';
            imagePreview.style.top = '50px';
            imagePreview.style.position = 'absolute';
        };
        reader.readAsDataURL(file);
    }
});
let isDragging = false;
let offsetX, offsetY;

imagePreview.addEventListener('mousedown', (event) => {
    isDragging = true;
    offsetX = event.clientX - imagePreview.getBoundingClientRect().left;
    offsetY = event.clientY - imagePreview.getBoundingClientRect().top;
    imagePreview.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const x = event.clientX - offsetX;
        const y = event.clientY - offsetY;

        const dropZoneRect = dropZone.getBoundingClientRect();
        const imageWidth = imagePreview.offsetWidth;
        const imageHeight = imagePreview.offsetHeight;

        const constrainedX = Math.min(
            Math.max(dropZoneRect.left, x),
            dropZoneRect.right - imageWidth
        );
        const constrainedY = Math.min(
            Math.max(dropZoneRect.top, y),
            dropZoneRect.bottom - imageHeight
        );

        imagePreview.style.left = `${constrainedX - dropZoneRect.left}px`;
        imagePreview.style.top = `${constrainedY - dropZoneRect.top}px`;
    }
});

document.addEventListener('mouseup', (event) => {
    if (isDragging) {
        isDragging = false;
        imagePreview.style.cursor = 'grab';

        const dropZoneRect = dropZone.getBoundingClientRect();
        const imageRect = imagePreview.getBoundingClientRect();

        const isInsideDropZone =
            imageRect.left >= dropZoneRect.left &&
            imageRect.right <= dropZoneRect.right &&
            imageRect.top >= dropZoneRect.top &&
            imageRect.bottom <= dropZoneRect.bottom;
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
        const imagePreview = document.getElementById("imageUploaded");
        const fileInput = document.getElementById("fileInput");

        if (imagePreview && imagePreview.style.display !== "none") {
            imagePreview.src = ""; // Clears the image
            imagePreview.style.display = "none"; // Hides it

            // Reset file input so the same file can be uploaded again
            fileInput.value = "";

            console.log("Image removed and input reset!");
        }
    }
});
