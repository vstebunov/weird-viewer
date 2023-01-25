const fileList = document.getElementById('files');

fileList.addEventListener('change', event => {
    const fileName = event.target.value;
    console.log('fileName', fileName);
    const image = document.getElementById('image');
    image.src = fileName;
});

const renderDir = async () => {
    const response = await window.files.getAllFiles();
    const newList = response.map(file => `<option value='${file.path}'>${file.name}</option>`);
    const fileList = document.getElementById('files');
    fileList.innerHTML = newList.join();
}

renderDir();
