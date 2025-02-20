document.addEventListener('DOMContentLoaded', () => {  //dynamically update webpage by user actions
    const paintCanvas = document.getElementById('paintCanvas');

    const ctx = paintCanvas.getContext('2d');
    const colourPicker = document.getElementById('colour');
    const sizeSlider = document.getElementById('size');
    const clearCanvas = document.getElementById('clear');

    paintCanvas.width = 400;  // canvas size set
    paintCanvas.height = 400;

    let painting = false;
    let brushColour = colourPicker.value;
    let brushSize = parseInt(sizeSlider.value);

    function startPainting(e) {
        painting = true;
        draw(e);
    };
    function stopPainting() {
        painting = false;
        ctx.beginPath();
    };

    function draw(e) {
        if (!painting) return;
        ctx.strokeStyle =
            brushColour; //pick brush colour
        ctx.lineWidth =
            brushSize;
        ctx.lineTo(
            e.clientX - paintCanvas.offsetLeft,
            e.clientY - paintCanvas.offsetTop
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(
            e.clientX - paintCanvas.offsetLeft,
            e.clientY - paintCanvas.offsetTop);
    }

    paintCanvas.addEventListener('mousedown', startPainting);
    paintCanvas.addEventListener('mouseup', stopPainting);
    paintCanvas.addEventListener('mousemove', draw);
    clearCanvas.addEventListener('click', () => {
        ctx.clearRect(
            0, 0, paintCanvas.width,
            paintCanvas.height
        );
    })

    sizeSlider.addEventListener('input', () => {
        brushSize = parseInt(sizeSlider.value);
        newBrushSizeLabel(brushSize);
    });


    function newBrushSizeLabel(size) {
        const BrushSizeLabel = document.getElementById('brush-size-label');
        if (BrushSizeLabel) {
            BrushSizeLabel.textContent =
                `Brush Size: ${size}`;
        }
    }

    const penButton = document.getElementById('penButton');
    const rubberButton = document.getElementById('rubberButton');

    function penOn() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colourPicker.value;
    }

    function rubberOn() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 2;
    }

    penButton.addEventListener('click', () => {
        penOn();
    });

    rubberButton.addEventListener('click', () => {
        rubberOn();
    });

    colourPicker.addEventListener('input', () => {
        brushColour = colourPicker.value;
    });
})
