const fileList = document.getElementById('files');
const imageMode = "ditherFloydSteinberg";

const canvas = document.getElementById('canvas');
// resize work with problems
canvas.setAttribute('width', 10000);
canvas.setAttribute('height', 10000);

fileList.addEventListener('change', event => {
    const fileName = event.target.value;
    const image = document.getElementById('image');
    image.src = fileName;
    image.onload = () => {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d', {willReadFrequently: true});    

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);  
        const imgd = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
        let filteredImageData;
        switch (imageMode) {
            case "invert": 
                filteredImageData = invertColors(imgd);
                break;
            case "gray":
                filteredImageData = gray(imgd);
                break;
            case "ditherFloydSteinberg":
                const grays = toGray(imgd);
                const flGrays = ditherFloydSteinberg(grays, image.naturalWidth, image.naturalHeight);
                filteredImageData = toRGB(grays, imgd);
                break;
            default:
                filteredImageData = imgd;
        }
        // Draw the ImageData object at the given (x,y) coordinates.
        context.putImageData(filteredImageData, 0,0);
    };
});

const renderDir = async () => {
    const response = await window.files.getAllFiles();
    const newList = response.map(file => `<option value='${file.path}'>${file.name}</option>`);
    const fileList = document.getElementById('files');
    fileList.innerHTML = newList.join();
}

renderDir();

function invertColors(imgd) {
    const pix = imgd.data;
    // Loop over each pixel and set a transparent red.
    for (let i = 0; n = pix.length, i < n; i += 4) {
        pix[i  ] = 255 - pix[i  ];
        pix[i+1] = 255 - pix[i+1];
        pix[i+2] = 255 - pix[i+2];
        // pix[i+3] = 127; // alpha channel
    }
    return imgd;
}

function gray(imgd) {
    const pix = imgd.data;
    for (let i = 0; n = pix.length, i < n; i += 4) {
        const gray = Math.floor((pix[i] + pix[i+1]  + pix[i+2]) / 3);
        pix[i  ] = gray;
        pix[i+1] = gray;
        pix[i+2] = gray;
        // pix[i+3] = 127; // alpha channel
    }
    return imgd;
}

function toGray(imgd) {
    const pix = imgd.data;
    const grayPix = [];
    for (let i = 0; n = pix.length, i < n; i += 4) {
        grayPix.push(Math.floor((pix[i] + pix[i+1]  + pix[i+2]) / 3));
    }
    return grayPix;
}

function toRGB(grayPix, finalCanvas) {
    const pix = finalCanvas.data;
    let j = 0;
    for (let i = 0; n = pix.length, i < n; i += 4) {
        let gray = grayPix[j];
        pix[i  ] = gray;
        pix[i+1] = gray;
        pix[i+2] = gray;
        pix[i+3] = 255;
        j = j + 1;
    }
    return finalCanvas;
}

function findClosestPaletteColor(color) {
    return Math.floor(color / 255) * 255;
}

function ditherFloydSteinberg(pixels, width, height) {
    for (let y = 0; y < height-1; y = y + 1) {
        for (let x = 0; x < width-1; x = x + 1) {
            const old_pixel = pixels[x + y * width];
            const new_pixel = findClosestPaletteColor(old_pixel);    

            pixels[x + y * width] = new_pixel;

            const quant_error = old_pixel - new_pixel;
            pixels[x + 1 + y * width]       = pixels[x + 1 + y * width]       + quant_error * 7 / 16;      
            pixels[x - 1 + (y + 1) * width] = pixels[x - 1 + (y + 1) * width] + quant_error * 3 / 16;      
            pixels[x     + (y + 1) * width] = pixels[x     + (y + 1) * width] + quant_error * 5 / 16;
            pixels[x + 1 + (y + 1) * width] = pixels[x + 1 + (y + 1) * width] + quant_error * 1 / 16;      
        }
    }
    return pixels;
}
