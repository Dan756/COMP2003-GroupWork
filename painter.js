document.addEventListener('DOMContentLoaded', () => {  //dynamically update webpage by user actions
    const paintCanvas = document.getElementById('paintCanvas');

    const ctx = paintCanvas.getContext('2d');
    const colourPicker = document.getElementById('colour');
    const sizeSlider = document.getElementById('size');
    const clearCanvas = document.getElementById('clear');

    paintCanvas.width = 400;  // canvas size set
    paintCanvas.height = 400;

    let painting = false;
    let brushColor = colorPicker.value;
    let brushSize = sizeSlider.value;

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
            colourPicker.value; //pick brush colour
        ctx.lineWidth =
            brushSize.value;
        ctx.lineTo(
            e.clientX - paintCanvas.offsetleft,
            e.clientY - paintCanvas.offsetTop
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(
            e.clientX - paintCanvas.offsetleft,
            e.clientY - paintCanvas.offsetTop);
    }

canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousemove', draw);
clearCanvas.addEventListener('click', () => {
    ctx.clearRect(
        0, 0, canvas.width,
        canvas, height
    );
})

    brushSize.addEventListener('input', () => {
        ctx.brushSize = sizeSlider.value;
        
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
    ctx.brushColor = colourPicker.value;
    }

    function rubberOn() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
    }

    penButton.addEventListener('click', () => {
        penOn();
    });

    rubberButton.addEventListener('click', () => {
        rubberOn();
    });
}
