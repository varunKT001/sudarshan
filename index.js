var GLOBAL_HEIGHT = 450;
var GLOBAL_WIDTH = 450;
var GLOBAL_COMPRESSION_CONSTANT = 0;

var HEIGHT = 450;
var WIDTH = 450;
var COMPRESSION_CONSTANT = 0;

var TIMEOUT;

const resizeImage = async () => {
  const file = document.getElementById('file').files[0];
  const width = document.getElementById('width').value;
  const height = document.getElementById('height').value;

  HEIGHT = height ? parseInt(height) : GLOBAL_HEIGHT;
  WIDTH = width ? parseInt(width) : GLOBAL_WIDTH;

  if (file) {
    initLoader(0);
    const base64 = await convertBase64(file);
    const resized_base64 = await processImage(base64);
    displayImages(base64, resized_base64, 0);
  } else {
    openAlert(0);
  }
};

const compressImage = async () => {
  const file = document.getElementById('file1').files[0];
  const originalSize = document.getElementById('original-size').checked;
  if (file) {
    initLoader(1);
    const imageB64 = await convertBase64(file);
    if (originalSize) {
      document.getElementById('how').value = calculateImageSize(imageB64);
    }
    const options = {
      maxSizeMB: parseInt(document.getElementById('max-size').value) / 1024,
      maxWidthOrHeight: parseInt(document.getElementById('how').value),
      initialQuality:
        parseInt(document.getElementById('compression-const').value) / 100,
    };
    if (options.maxSizeMB > calculateImageSize(imageB64) / 1024) {
      openAlert(1, 'max size cannot be greater than original size');
      stopLoader(1);
      return;
    }
    if (options.initialQuality > 100) {
      openAlert(1, 'compression cannot be greater than 100');
      stopLoader(1);
      return;
    }
    if (options.initialQuality <= 0) {
      openAlert(1, 'compression cannot be less or equal to 0');
      stopLoader(1);
      return;
    }
    if (options.maxWidthOrHeight <= 1) {
      openAlert(1, 'width or heigth cannot be less or equal to 1');
      stopLoader(1);
      return;
    }

    const compressedImg = await imageCompression(file, options);
    const newB64 = await convertBase64(compressedImg);
    displayImages(imageB64, newB64, 1);
  } else {
    openAlert(1);
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
    let maintainAspectRatio = document.getElementById('aspect-ratio').checked;
    let img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let canvas = document.createElement('canvas');

      let width = img.width;
      let height = img.height;

      if (maintainAspectRatio) {
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
function displayImages(oldB64, newB64, number) {
  stopLoader(number);
  let paraOld = document.getElementsByClassName('old')[number];
  let paraNew = document.getElementsByClassName('new')[number];

  paraOld.innerText = `OLD SIZE : ${calculateImageSize(oldB64)}KB`;
  paraNew.innerText = `NEW SIZE : ${calculateImageSize(newB64)}KB`;

  //   let oldImg = document.getElementById('original');
  let newImg = document.getElementsByClassName('compressed')[number];

  //   oldImg.src = oldB64;
  newImg.src = newB64;

  let download = document.getElementsByClassName('download')[number];
  let downloadBtn = document.getElementsByClassName('download-btn')[number];
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
function onFileSelect(number) {
  document.getElementsByClassName('filename')[number].innerText =
    document.getElementsByClassName('file')[number].files[0].name;
}

function openAlert(number, text = 'please select an image') {
  clearTimeout(TIMEOUT);
  document.getElementsByClassName('alert')[number].style.display = 'flex';
  document.getElementsByClassName('alert-text')[number].innerText = text;
  console.log(number);
  TIMEOUT = setTimeout(() => {
    closeAlert(number);
  }, 3000);
}
function closeAlert(number) {
  document.getElementsByClassName('alert')[number].style.display = 'none';
}

function initLoader(number) {
  document.getElementsByClassName('loader')[number].style.display = 'flex';
}
function stopLoader(number) {
  document.getElementsByClassName('loader')[number].style.display = 'none';
}

function openResize() {
  document.getElementById('resize').classList.remove('hide');
  document.getElementById('compress').classList.add('hide');

  document.getElementById('resize-switch').classList.add('active');
  document.getElementById('compress-switch').classList.remove('active');
}
function openCompress() {
  document.getElementById('resize').classList.add('hide');
  document.getElementById('compress').classList.remove('hide');

  document.getElementById('compress-switch').classList.add('active');
  document.getElementById('resize-switch').classList.remove('active');
}
