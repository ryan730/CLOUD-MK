const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')
class QiniuManager {
  constructor(accessKey, secretKey, bucket) {
    //generate mac
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    this.bucket = bucket

    // init config class
    this.config = new qiniu.conf.Config()
    // 空间对应的机房
    this.config.zone = qiniu.zone.Zone_z1

    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
  }
  uploadFile(key, localFilePath) {
    // generate uploadToken
    const options = {
      scope: this.bucket + ":" + key,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(this.mac)
    const formUploader = new qiniu.form_up.FormUploader(this.config)
    const putExtra = new qiniu.form_up.PutExtra()
    //文件上传
    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject));
    })

  }
  deleteFile(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject))
    })
  }
  getBucketDomain() {
    const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
    const digest = qiniu.util.generateAccessToken(this.mac, reqURL)
    console.log('trigger here1')
    return new Promise((resolve, reject) => {
      console.log('trigger here2:', reqURL, digest)
      qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject))
    })
  }
  getStat(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.stat(this.bucket, key, this._handleCallback(resolve, reject))
    })
  }

  /** 动态获取下载域名 */
  generateDownloadLink(key) {
    const domainPromise = this.publicBucketDomain ?
      Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
    console.log('domainPromise1:', domainPromise, this.publicBucketDomain);
    return domainPromise.then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const pattern = /^https?/
        this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
        console.log('generateDownloadLink:', this.publicBucketDomain, key, data);
        return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key);
      } else {
        throw Error('域名未找到，请查看存储空间是否已经过期')
      }
    })
  }

  /**通过pipe 写入 stream 到本地 */
  downloadFile(key, downloadPath) {
    // step 1 get the download link
    // step 2 send the request to download link, return a readable stream
    // step 3 create a writable stream and pipe to it
    // step 4 return a promise based result
    console.log('this.generateDownloadLink(key):', this.generateDownloadLink(key));
    return this.generateDownloadLink(key)
      .then(link => {
        const timeStamp = new Date().getTime()
        const url = `${link}?timestamp=${timeStamp}`
        console.log('url:', url);
        return axios({
          url,
          method: 'GET',
          responseType: 'stream',
          headers: { 'Cache-Control': 'no-cache' }
        })
      })
      .then(response => {
        //console.log('response:', response);
        const writer = fs.createWriteStream(downloadPath)
        response.data.pipe(writer)
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })
      }).catch(err => {
        //console.log('err:', err);
        return Promise.reject({ err: err.response })
      })
    //return this.generateDownloadLink(key);
  }
  _handleCallback(resolve, reject) {
    return (respErr, respBody, respInfo) => {
      ///console.log('_handleCallback:', respErr, respBody, respInfo)
      if (respErr) {
        throw respErr;
      }
      if (respInfo.statusCode === 200) {
        resolve(respBody)
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody
        })
      }
    }
  }
}

module.exports = QiniuManager