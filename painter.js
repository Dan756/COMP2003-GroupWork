document.addEventListener('DOMContentLoaded', () => {  //dynamically update webpage by user actions
    const paintCanvas = document.getElementById('paintCanvas');

    const ctx = paintCanvas.getContext('2d');
    const colourPicker = document.getElementById('colour');
    const sizeSlider = document.getElementById('size');
    const clearButton = document.getElementById('clear');

    paintCanvas.width = 400;  // canvas size set
    paintCanvas.height = 400;

    let painting = false;
    let brushColor = colorPicker.value;
    let brushSize = sizeSlider.value;

    function startPainting = (e) => {
        painting = true;
        draw(e);
    };
    function stopPainting = () => {
        painting = false;
        ctx.beginPath();
    };

    function draw(e) {
        if (!painting) return;
        ctx.brushColor =
            colourPicker.value; //pick brush colour
        ctx.brushSize =
            brushSize.value;
        ctx.lineTo(
            e.clientX - canvas.offsetleft,
            e.clientY - canvas.offsetTop
        );
    }
}
canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousemove', draw);
clearCanvas.addEventListener('click', () => {
    ctx.clearCanvas(
        0, 0, canvas.width,
        canvas, height
    );
})
