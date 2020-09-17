function main() {
  const canvas = document.querySelector("canvas");
  const file = document.getElementById("file").files[0];
  const reader = new FileReader();

  reader.readAsDataURL(file);
  reader.onload = function (e) {

    // 读取图片
    const img = new Image;
    img.src = this.result;
    img.onload = async function () {
      let width, height;
      [width, height] = [img.width, img.height];
      const rowNumber = document.getElementById("row").value;
      const picHeight = height / rowNumber;
      const colNumber = Math.max(Math.round(width / picHeight), 1);
      const picWidth = width / colNumber;

      const images = [];
      const zip = new JSZip();
      let i = rowNumber * colNumber;
      const filenameLength = i.toString(2).length;

      for (let x = 0; x < colNumber; x++) {
        for (let y = rowNumber - 1; y >= 0; y--) {
          let picCanvas = document.createElement("canvas");
          picCanvas.width = picWidth;
          picCanvas.height = picHeight;
          let picCtx = picCanvas.getContext("2d");
          picCtx.drawImage(img, x * picWidth, y * picHeight, picWidth, picHeight, 0, 0, picWidth, picHeight);

          // 构造file name，使用lor和ror 让文件名隐藏
          let binary = i.toString(2);
          const zeroNumber = filenameLength - binary.length;
          for (let j = 0; j < zeroNumber; j++) {
            binary = '0' + binary;
          }
          binary = binary.replace(/0/g, '\u202D');
          binary = binary.replace(/1/g, '\u202E');

          await addToZip(picCanvas, zip, `${binary}.png`);
          i--;
        }
      }
      createZip(zip);
    }
  }
}

function addToZip(canvas, zip, name) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(function (blob) {
      zip.file(name, blob);  // 将每次不同的canvas数据添加到zip文件中
      resolve();
    });
  })
}

function createZip(zip) {
  zip.generateAsync({ type: 'blob' }).then(function (content) {
    saveAs(content, 'example.zip');
  });
}