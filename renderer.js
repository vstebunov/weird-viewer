const fileList = document.getElementById('files');

const canvas = document.getElementById('canvas');
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
        // Create an ImageData object.
        const imgd = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
        // context.canvas.width = imgd.width;
        // context.canvas.height = imgd.height;

        const pix = imgd.data;

        console.log(image.naturalWidth * image.naturalHeight * 4, pix.length);
        // Loop over each pixel and set a transparent red.
        for (let i = 0; n = pix.length, i < n; i += 4) {
            pix[i  ] = 255 - pix[i  ];
            pix[i+1] = 255 - pix[i+1];
            pix[i+2] = 255 - pix[i+2];
            // pix[i+3] = 127; // alpha channel
        }

        // Draw the ImageData object at the given (x,y) coordinates.
        context.putImageData(imgd, 0,0);
    };
});

const renderDir = async () => {
    const response = await window.files.getAllFiles();
    const newList = response.map(file => `<option value='${file.path}'>${file.name}</option>`);
    const fileList = document.getElementById('files');
    fileList.innerHTML = newList.join();
}

renderDir();
