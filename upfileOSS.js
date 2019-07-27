import axios from "axios";
const OSS = require('ali-oss');
// export default function upFileOSS(fileObj, callback) {
//   const appServer = 'http://localhost:9000/sts';
//   const bucket = 'linkkt';
//   const region = 'oss-cn-hangzhou';
//   let uploadFileClient;
//   let retryCount = 0;
//   const retryCountMax = 3;
// }

//sts角色扮演方式，还有一种是签名直传方式
export default class upfileOSS {
  constructor(obj = {}){
    this.appServer = obj.appServer || 'http://localhost:9000/sts';
    this.bucket = obj.bucket || 'linkkt';
    this.region = obj.region || 'oss-cn-hangzhou';
    this.uploadFileClient = null;
    this.retryCount = 0;
    this.retryCountMax = 3;
    this.currentCheckpoint = null;
  }

  async applyTokenDo(file, refreshSts) {
    const func = this.uploadFileOSS;
    const refresh = typeof (refreshSts) !== 'undefined' ? refreshSts : true;
    if (refresh) {
      const url = this.appServer;
      const result =  await axios({ url });
      const creds = (result && result.data) || {};
      //const client = new TinyOSS({
      const client = new OSS({
        accessKeyId: creds.AccessKeyId,
        accessKeySecret: creds.AccessKeySecret,
        stsToken: creds.SecurityToken,
        region: this.region,
        bucket: this.bucket
      });
      return await func(client, file);
    }
    return await func();
  }

  urlOSS(client, imgName) {
    const _url = client.signatureUrl(imgName, {
      expires: 120
    });
    console.log("_url:", _url);
    return _url;
  }

  uploadFileOSS = async (client, file) => {
    if (!this.uploadFileClient || Object.keys(this.uploadFileClient).length === 0) {
      this.uploadFileClient = client;
    }

    let key = Date.now() + '.' + (file.type ? (file.type.split("/"))[1] : "jpg");

    console.log(`${file.name} => ${key}`);

    try {
      const res = await this.uploadFileClient.put(key, file);
      console.log('upload success: %j', res);
      res.res._url = this.urlOSS(this.uploadFileClient, key);
      return res.res;
    }catch (err) {
      console.log(err);
      console.log(`err.name : ${err.name}`);
      console.log(`err.message : ${err.message}`);
      if (err.name.toLowerCase().indexOf('connectiontimeout') !== -1) {
        // timeout retry
        if (retryCount < retryCountMax) {
          retryCount++;
          console.error(`retryCount : ${retryCount}`);
          await this.uploadFileOSS('');
        }
      }else{
        return null;
      }
    }

    // this.uploadFileClient.put(key, file).then((res) => {
    //   console.log('upload success: %j', res);
    //   const _url = this.urlOSS(this.uploadFileClient, key);
    //
    //   // currentCheckpoint = null;
    //   // uploadFileClient = null;
    // }).catch((err) => {
    //   console.log(err);
    //   console.log(`err.name : ${err.name}`);
    //   console.log(`err.message : ${err.message}`);
    //   if (err.name.toLowerCase().indexOf('connectiontimeout') !== -1) {
    //     // timeout retry
    //     if (this.retryCount < this.retryCountMax) {
    //       this.retryCount++;
    //       console.error(`retryCount : ${this.retryCount}`);
    //       this.uploadFileOSS('');
    //     }
    //   }else{
    //
    //   }
    // });
  }

}

