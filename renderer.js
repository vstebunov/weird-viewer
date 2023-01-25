
const fileList = document.getElementById('files');

fileList.addEventListener('change', event => {
    const fileName = event.target.value;
    const image = document.getElementById('image');
    image.src = fileName;
    image.onload = () => {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');    
        context.drawImage(image, 0, 0);  
        console.log(image.width, image.height);
        // Create an ImageData object.
        var imgd = context.getImageData(0, 0, image.width, image.height);
        var pix = imgd.data;

        // Loop over each pixel and set a transparent red.
        for (let i = 0; n = pix.length, i < n; i += 4) {
            pix[i  ] = 255 - pix[i  ];
            pix[i+1] = 255 - pix[i+1];
            pix[i+2] = 255 - pix[i+2];
            // pix[i+3] = 127; // alpha channel
        }

        // Draw the ImageData object at the given (x,y) coordinates.
        context.putImageData(imgd, 0,0);
        // canvas.width = image.width;
        // canvas.height = image.height;
    };
});

const renderDir = async () => {
    const response = await window.files.getAllFiles();
    const newList = response.map(file => `<option value='${file.path}'>${file.name}</option>`);
    const fileList = document.getElementById('files');
    fileList.innerHTML = newList.join();
}

renderDir();
