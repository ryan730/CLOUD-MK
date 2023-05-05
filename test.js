/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2019-09-26 10:30:24
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-05-04 15:21:07
 * @FilePath: /cloud-mk/test.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')
//generate mac
const accessKey = 'PfaKYvStVmJzR2Tt7Gr9CQ513-EmPb5hJAWO6Sgh'
const secretKey = 'bc3moUmxSlpQBX_N0iT1b638PmPRuL-97Uikytco'
//const localFile = "/Users/ryan/Documents/f1.md";
const key = 'docs/f2.md'
const downloadPath = path.join(__dirname, key)

const manager = new QiniuManager(accessKey, secretKey, 'cloudmk')

manager.uploadFile(key, downloadPath).then((data) => {
  console.log('上传成功', downloadPath, data)
})

//manager.deleteFile(key)
// manager.generateDownloadLink(key).then(data => {
//   console.log(data)
//   return manager.generateDownloadLink('first.md')
// }).then(data => {
//   console.log(data)
// })
//const publicBucketDomain = 'http://pv8m1mqyk.bkt.clouddn.com';

// manager.downloadFile(key, downloadPath).then(() => {
//   console.log('下载写入文件完毕')
// }).catch((err) => {
//   console.log('下载错误：', err);
// })

