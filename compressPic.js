export default function compress(file, obj={}, callback) {
  //obj参数格式：{scale: 0.5, quality: 0.7}
  try {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function() {
      const that = this;
      // 默认按比例压缩
      let w = that.width;
      let h = that.height;
      const scale = w / h;
      w = obj.scale?obj.scale*w:w;
      h = (w / scale);
      let quality = obj.quality || 0.7; // 默认图片质量为0.7
      // 生成canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // 创建属性节点
      const anw = document.createAttribute('width');
      anw.nodeValue = w;
      const anh = document.createAttribute('height');
      anh.nodeValue = h;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh);
      ctx.drawImage(that, 0, 0, w, h);
      // 图像质量
      if (file.quality && file.quality <= 1 && file.quality > 0) {
        quality = file.quality
      }
      // quality值越小，所绘制出的图像越模糊
      const data = canvas.toDataURL('image/jpeg', quality);
      // 压缩完成执行回调
      const newFile = convertBase64UrlToBlob(data);
      callback(newFile)
    }
  } catch (e) {
    console.log('压缩失败!');
    callback(file);
  }
}

function convertBase64UrlToBlob(urlData){
  const arr = urlData.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bt = atob(arr[1]);
  const ab = new ArrayBuffer(bt.length);
  const u8arr = new Uint8Array(ab);
  let n = bt.length;
  while(n--){
    u8arr[n] = bt.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}
