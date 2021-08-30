var GLOBAL_HEIGHT = 450;
var GLOBAL_WIDTH = 450;
var GLOBAL_COMPRESSION_CONSTANT = 0;

var HEIGHT = 450;
var WIDTH = 450;
var COMPRESSION_CONSTANT = 0;

var TIMEOUT;

const compressImage = async () => {
  const file = document.getElementById('file').files[0];
  const width = document.getElementById('width').value;
  const height = document.getElementById('height').value;

  HEIGHT = height ? parseInt(height) : GLOBAL_HEIGHT;
  WIDTH = width ? parseInt(width) : GLOBAL_WIDTH;

  if (file) {
    const base64 = await convertBase64(file);
    const resized_base64 = await processImage(base64);
    displayImages(base64, resized_base64);
  } else {
    openAlert();
  }
};

const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

async function reduceFileSize(
  base64Str,
  MAX_WIDTH = WIDTH,
  MAX_HEIGHT = HEIGHT
) {
  let resized_base64 = await new Promise((resolve) => {
    let img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let canvas = document.createElement('canvas');

      let width = img.width;
      let height = img.height;

      if (MAX_WIDTH === MAX_HEIGHT) {
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
      } else {
        width = MAX_WIDTH;
        height = MAX_HEIGHT;
      }
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL());
    };
  });
  return resized_base64;
}

async function processImage(res, min_image_size = COMPRESSION_CONSTANT * 100) {
  if (res) {
    const old_size = calculateImageSize(res);
    if (old_size > min_image_size) {
      const resized = await reduceFileSize(res);
      return resized;
    } else {
      return res;
    }
  } else {
    console.log('something went wrong');
    return null;
  }
}
function displayImages(oldB64, newB64) {
  let paraOld = document.getElementById('old');
  let paraNew = document.getElementById('new');

  paraOld.innerText = `OLD SIZE : ${calculateImageSize(oldB64)}KB`;
  paraNew.innerText = `NEW SIZE : ${calculateImageSize(newB64)}KB`;

  //   let oldImg = document.getElementById('original');
  let newImg = document.getElementById('compressed');

  //   oldImg.src = oldB64;
  newImg.src = newB64;

  let download = document.getElementById('download');
  let downloadBtn = document.getElementById('download-btn');
  download.setAttribute('href', newB64);
  downloadBtn.style.display = 'block';
}

function calculateImageSize(image) {
  let y = 1;
  if (image.endsWith('==')) {
    y = 2;
  }
  const x_size = image.length * (3 / 4) - y;
  return Math.round(x_size / 1024);
}
function onFileSelect() {
  document.getElementById('filename').innerText =
    document.getElementById('file').files[0].name;
}

function openAlert() {
  clearTimeout(TIMEOUT);
  document.getElementsByClassName('alert')[0].style.display = 'flex';
  TIMEOUT = setTimeout(() => {
    closeAlert();
  }, 3000);
}
function closeAlert() {
  document.getElementsByClassName('alert')[0].style.display = 'none';
}
