const fileList = document.getElementById('files');
let imageMode = "orderedZX";
let globalThresold = 255 / 5;
let allFilesList = [];
let fileIndex = 0;
let renderQueue = [];

const canvas = document.getElementById('canvas');
// resize work with problems
canvas.setAttribute('width', 10000);
canvas.setAttribute('height', 10000);

const btnShowFileList = document.getElementById('btnShowFileList');
btnShowFileList.addEventListener('click', () => {
    fileList.style.display = 'block';
});

const btnAtkinson = document.getElementById('btnAtkinson');
btnAtkinson.addEventListener('click', () => {
    imageMode = 'ditherAtkinson';
    render();
});

const btnFloyd = document.getElementById('btnFloyd');
btnFloyd.addEventListener('click', () => {
    imageMode = 'ditherFloydSteinberg';
    render();
});

const btnOrdered = document.getElementById('btnOrdered');
btnOrdered.addEventListener('click', () => {
    imageMode = 'ordered';
    render();
});

const btnOrderedZX = document.getElementById('btnOrderedZX');
btnOrderedZX.addEventListener('click', () => {
    imageMode = 'orderedZX';
    render();
});

const btnGray = document.getElementById('btnGray');
btnGray.addEventListener('click', () => {
    imageMode = 'gray';
    render();
});

const btnNext = document.getElementById('btnNext');
btnNext.addEventListener('click', () => {
    nextImage();
});

const btnLast = document.getElementById('btnLast');
btnLast.addEventListener('click', () => {
    lastImage();
});

const btnThresoldPlus = document.getElementById('btnThresoldPlus');
btnThresoldPlus.addEventListener('click', () => {
    plusThersold();
    render();
});

function plusThersold() {
    globalThresold++;
    if (globalThresold > 255) {
        globalThresold = 255;
    }
}

const btnThresoldMinus = document.getElementById('btnThresoldMinus');
btnThresoldMinus.addEventListener('click', () => {
    minusThresold();
    render();
});

function minusThresold() {
    globalThresold--;
    if (globalThresold <= 0) {
        globalThresold = 0;
    }
}

const btnThresoldReset = document.getElementById('btnThresoldReset');
btnThresoldReset.addEventListener('click', () => {
    globalThresold = 255 / 5;
});

function nextImage() {
    fileIndex++;
    if (fileIndex > allFilesList.length) {
        fileIndex = allFilesList.length - 1;
    }
    loadByIndex(fileIndex);
}

function lastImage() {
    fileIndex--;
    if (fileIndex < 0) {
        fileIndex = 0;
    }
    loadByIndex(fileIndex);
}

document.addEventListener('keypress', event => {
    event.stopPropagation();
    if (event.key === 'a') {
        imageMode = 'ditherAtkinson';
    } else if (event.key === 'f') {
        imageMode = 'ditherFloydSteinberg'
    } else if (event.key === 'g') {
        imageMode = 'gray'
    } else if (event.key === 's') {
        imageMode = 'ordered'
    } else if (event.key === 'z') {
        imageMode = 'orderedZX'
    } else if (event.key === 'q') {
        plusThersold();
    } else if (event.key === 'w') {
        minusThresold();
    } else if (event.key === 'j') {
        lastImage();
        return;
    } else if (event.key === 'k') {
        nextImage();
        return;
    }
    render();
});

function showThresoldButton() {
    btnThresoldPlus.style.display = 'inline-block';
    btnThresoldMinus.style.display = 'inline-block';
    btnThresoldReset.style.display = 'inline-block';
}

function hideThresoldButton() {
    btnThresoldPlus.style.display = 'none';
    btnThresoldMinus.style.display = 'none';
    btnThresoldReset.style.display = 'none';
}

function blockButtons() {
    [btnGray, btnLast, btnNext, btnFloyd, btnOrdered, btnAtkinson,btnOrderedZX, btnShowFileList, btnThresoldPlus, btnThresoldMinus, btnThresoldReset].forEach( button => button.setAttribute('disabled', 'disabled'));
}

function unblockButtons() {
    [btnGray, btnLast, btnNext, btnFloyd, btnOrdered, btnAtkinson,btnOrderedZX, btnShowFileList, btnThresoldPlus, btnThresoldMinus, btnThresoldReset].forEach( button => button.removeAttribute('disabled'));
}

function render () {
    if (renderQueue.length > 0) {
        renderQueue.push(true);
        return;
    }
    const image = document.getElementById('image');
    const canvas = document.getElementById('canvas');
    const imageModeTitle = document.getElementById('modename');
    imageModeTitle.innerHTML = (imageMode === 'ordered' || imageMode === 'orderedZX') ?
        `${imageMode}(${globalThresold})` : imageMode;
    imageModeTitle.classList.remove('title-animation');
    /// -> triggering reflow /* The actual magic */
    imageModeTitle.offsetWidth;
    imageModeTitle.classList.add('title-animation');
    if (imageMode === 'ordered' || imageMode == 'orderedZX') {
        showThresoldButton();
    } else {
        hideThresoldButton();
    }
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
            filteredImageData = toRGB(flGrays, imgd);
            break;
        case "ditherAtkinson":
            const flAtk = ditherAtkinson(toGray(imgd), image.naturalWidth, image.naturalHeight);
            filteredImageData = toRGB(flAtk, imgd);
            break;
        case "ordered":
            const ordered = ditherOrdered(toGray(imgd), image.naturalWidth, image.naturalHeight);
            filteredImageData = toRGB(ordered, imgd);
        case "orderedZX":
            filteredImageData = ditherOrderedZX(imgd, image.naturalWidth, image.naturalHeight);
            
        default:
            filteredImageData = imgd;
    }
    // Draw the ImageData object at the given (x,y) coordinates.
    context.putImageData(filteredImageData, 0,0);
    if (renderQueue.length > 0) {
        console.log({renderQueue});
        renderQueue = [];
        render();
    }
}

fileList.addEventListener('change', event => {
    const filePath = event.target.value;
    const image = document.getElementById('image');
    const title = document.getElementById('imagename');
    fileIndex = allFilesList.findIndex(file => file.path === filePath);
    if (!fileIndex) {
        console.log('wrong path!', filePath);
    }
    image.src = filePath;
    image.onload = () => {
        title.innerHTML = allFilesList.find(file => file.path === filePath).name || '';
        title.classList.remove('title-animation');
        /// -> triggering reflow /* The actual magic */
        title.offsetWidth;
        title.classList.add('title-animation');
        render();
    };
});

function loadByIndex(index) {
    if (!allFilesList[index]) {
        console.log('file not have path', allFilesList, index);
        return;
    }
    if (index < 0 || index > allFilesList.length) {
        console.log('wrong index', index);
        return;
    }
    const filePath = allFilesList[index].path;
    const image = document.getElementById('image');
    const title = document.getElementById('imagename');
    blockButtons();
    image.src = filePath;
    image.onload = () => {
        title.innerHTML = allFilesList.find(file => file.path === filePath).name || '';
        title.classList.remove('title-animation');
        /// -> triggering reflow /* The actual magic */
        title.offsetWidth;
        title.classList.add('title-animation');
        render();
        unblockButtons();
    };
}

const renderDir = async () => {
    allFilesList = (await window.files
        .getAllFiles())
        .filter( file => file.name.match(/\.jpe?g$/));
    // const filteredAllFileList = allFilesList.filter();
    const newList = allFilesList.map(file => `<option value='${file.path}'>${file.name}</option>`);
    const fileList = document.getElementById('files');
    fileList.innerHTML = newList.join();
    loadByIndex(0);
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

function ditherAtkinson(pixels, width, height) {
    for (let y = 0; y < height-1; y = y + 1) {
        for (let x = 0; x < width-1; x = x + 1) {
            const old_pixel = pixels[x + y * width];
            const new_pixel = findClosestPaletteColor(old_pixel);    

            pixels[x + y * width] = new_pixel;

            const quant_error = old_pixel - new_pixel;
            pixels[x + 1 + y * width]       = pixels[x + 1 + y * width]       + quant_error * 1 / 8;      
            pixels[x + 2 + y * width]       = pixels[x + 2 + y * width]       + quant_error * 1 / 8;      
            pixels[x - 1 + (y + 1) * width] = pixels[x - 1 + (y + 1) * width] + quant_error * 1 / 8;      
            pixels[x     + (y + 1) * width] = pixels[x     + (y + 1) * width] + quant_error * 1 / 8;
            pixels[x + 1 + (y + 1) * width] = pixels[x + 1 + (y + 1) * width] + quant_error * 1 / 8;      
            if (y+2 < height) {
                pixels[x + (y + 2) * width] = pixels[x + (y + 2) * width] + quant_error * 1 / 8;      
            }
        }
    }
    return pixels;
}


function findClosestPaletteColorBW(color, map_value, thresold) {
    const p = (color + map_value * thresold);
    if (p < 128) {
        return 0;
    } else {    
        return 255;
    }
}


function ditherOrdered(pixels, width, height) {
    const map = [];
    map[0] = 1.0 / 17;
    map[1] = 9.0 / 17;
    map[2] = 3.0 / 17;
    map[3] = 11.0 / 17;
    map[4] = 14.0 / 17;
    map[5] = 5.0 / 17;
    map[6] = 16.0 / 17;
    map[7] = 7.0 / 17;
    map[8] = 4.0 / 17;
    map[9] = 12.0 / 17;
    map[10] = 2.0 / 17;
    map[11] = 10.0 / 17;
    map[12] = 16.0 / 17;
    map[13] = 8.0 / 17;
    map[14] = 14.0 / 17;
    map[15] = 6.0 / 17;
    const thresold = globalThresold;
    for (let y = 0; y < height-1; y = y + 1) {
        for (let x = 0; x < width-1; x = x + 1) {
            const map_value = map[(x & 3) + ((y & 3) << 2)];
            const old_pixel = pixels[x + y * width];      
            const new_pixel = findClosestPaletteColorBW(old_pixel, map_value, thresold);
            pixels[x + y * width] = new_pixel;  
        }
    }

    return pixels;
}

function findClosestPaletteColorZX(red, green, blue, map_value, thresold) {
  let r = red + map_value * thresold;
  let g = green + map_value * thresold;
  let b = blue + map_value * thresold;
  const m = Math.max(r,g,b);
  
  if (m < 0xD7) {
    r = 0;
    g = 0;
    b = 0;
  } else if (m != 0xFF) {
    r = r >= 0xD7 ? 0xD7 : 00;
    g = g >= 0xD7 ? 0xD7 : 00;
    b = b >= 0xD7 ? 0xD7 : 00;
  }
  
  return [r,g,b];
}

function ditherOrderedZX(imgd, width, height) {
    const map = [];
    map[0] = 1.0 / 17;
    map[1] = 9.0 / 17;
    map[2] = 3.0 / 17;
    map[3] = 11.0 / 17;
    map[4] = 14.0 / 17;
    map[5] = 5.0 / 17;
    map[6] = 16.0 / 17;
    map[7] = 7.0 / 17;
    map[8] = 4.0 / 17;
    map[9] = 12.0 / 17;
    map[10] = 2.0 / 17;
    map[11] = 10.0 / 17;
    map[12] = 16.0 / 17;
    map[13] = 8.0 / 17;
    map[14] = 14.0 / 17;
    map[15] = 6.0 / 17;
    const thresold = globalThresold;
    const pixels = imgd.data;
    for (let y = 0; y < height * 4; y = y + 4) {
        for (let x = 0; x < width * 4; x = x + 4) {
            const nx = x / 4;
            const ny = y / 4;
            const map_value = map[(nx & 3) + ((ny & 3) << 2)];
            const new_pixel = findClosestPaletteColorZX(
                pixels[x + y * width],
                pixels[x + y * width + 1],
                pixels[x + y * width + 2],
                map_value, 
                thresold
            );
            pixels[x + y * width] = new_pixel[0];  
            pixels[x + y * width + 1] = new_pixel[1];  
            pixels[x + y * width + 2] = new_pixel[2];  
        }
    }

    return pixels;
}
