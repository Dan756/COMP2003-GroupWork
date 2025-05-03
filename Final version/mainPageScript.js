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

const addImageButton = document.getElementById('add-image-button');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imageUploaded')
const dropZone = document.getElementById('dropZone');
const vinylCanvas = document.getElementById('vinylCanvas');
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
    imagePreview.style.pointerEvents = 'auto';
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
        drawCanvas();
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
            imagePreview.src = "";
            imagePreview.style.display = "none";

            // Reset file input so the same file can be uploaded again
            fileInput.value = "";

            console.log("Image removed and input reset!");
        }
    }
});

const format = document.getElementById('format').value;
const generatedVinyl = document.getElementById('generated-vinyl');
const saveButton = document.getElementById('save-button');
const clearButton = document.getElementById('clear-button');
document.getElementById('download-button').addEventListener('click', () => {

    html2canvas(dropZone).then((canvas) => {
        let imageType = image / '${ format }';
        let image = canvas.toDataURL(imageType);

        // Create a download link
        const link = document.createElement('a');
        link.href = image;
        link.download = 'vinyl-creation.' + format;

        // Trigger a click to start the download
        link.click();

        console.log('Vinyl image downloaded!');
    }).catch((error) => {
        console.error('Error capturing the vinyl:', error);
    });
});

window.addEventListener('load', () => {
    const savedImage = localStorage.getItem('savedVinyl');
    if (savedImage) {
        generatedVinyl.src = savedImage;
        generatedVinyl.style.display = 'block';
    }
});

saveButton.addEventListener('click', () => {
    html2canvas(dropZone).then(canvas => {
        const vinyl = canvas.toDataURL('image/png');
        localStorage.setItem('savedVinyl', vinyl);
        alert('Vinyl design saved!');
    }).catch(error => {
        console.error('Error capturing canvas:', error);
        alert('Failed to save the vinyl.');
    });
});

clearButton.addEventListener('click', () => {
    localStorage.removeItem('savedVinyl');
    generatedVinyl.style.display = 'none';
    alert('Saved vinyl cleared.');
});

document.addEventListener('DOMContentLoaded', () => {
    const vinylCanvas = document.getElementById('vinylCanvas');
    const dropZone = document.getElementById('dropZone');
    const ctx = vinylCanvas.getContext('2d');
    const uploadedImage = document.getElementById('imageUploaded');
    const fileInput = document.getElementById('fileInput');

    vinylCanvas.width = dropZone.clientWidth;
    vinylCanvas.height = dropZone.clientHeight;

    let painting = false;
    let brushColour = document.getElementById('colourPicker').value;
    let brushSize = parseInt(document.getElementById('sizeSlider').value);
    let imageLoaded = false;

    function startPainting(e) {
        painting = true;
        draw(e);
    }
    function stopPainting() {
        painting = false;
        ctx.beginPath();
    }
    function draw(e) {
        if (!painting) return;
        ctx.strokeStyle = brushColour;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

    vinylCanvas.addEventListener('mousedown', startPainting);
    vinylCanvas.addEventListener('mouseup', stopPainting);
    vinylCanvas.addEventListener('mouseleave', stopPainting);
    vinylCanvas.addEventListener('mousemove', draw);

    document.getElementById('draw-button').addEventListener('click', () => {
        ctx.globalCompositeOperation = 'source-over';
        vinylCanvas.style.pointerEvents = 'auto';
        imagePreview.style.pointerEvents = 'none';
    });

    document.getElementById('erase-button').addEventListener('click', () => {
        ctx.globalCompositeOperation = 'destination-out';
        brushSize = brushSize * 2;
        vinylCanvas.style.pointerEvents = 'auto';
        imagePreview.style.pointerEvents = 'none';
    });

    document.getElementById('colourPicker').addEventListener('input', (e) => {
        brushColour = e.target.value;
    });

    document.getElementById('sizeSlider').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
    });

    document.getElementById('clear-button').addEventListener('click', () => {
        ctx.clearRect(0, 0, vinylCanvas.width, vinylCanvas.height);
        drawImage();
    });
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImage.src = event.target.result;
                imageLoaded = true;
                uploadedImage.onload = () => {
                    let imgWidth = uploadedImage.width;
                    let imgHeight = uploadedImage.height;
                    let x = (vinylCanvas.width - imgWidth) / 2;
                    let y = (vinylCanvas.height - imgHeight) / 2;
                    drawCanvas();
                };
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('sticker-button').addEventListener('click', () => {
        ctx.globalCompositeOperation = 'source-over';
        vinylCanvas.style.pointerEvents = 'none';
        imagePreview.style.pointerEvents = 'auto';
        imagePreview.style.display = 'auto';
    });
});
