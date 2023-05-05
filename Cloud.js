/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-26 18:55:52
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-26 20:23:47
 * @FilePath: /cloud-mk/Cloud.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const qiniu = require('qiniu')
const path = require('path')
//generate mac
const accessKey = 'PfaKYvStVmJzR2Tt7Gr9CQ513-EmPb5hJAWO6Sgh'
const secretKey = 'bc3moUmxSlpQBX_N0iT1b638PmPRuL-97Uikytco'
const localFile = "/Users/ryan/Documents/f1.md";
const key = 'docs/f1.md'
const downloadPath = path.join(__dirname, key)


var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

var options = {
    scope: 'cloudmk',
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z1;
// 是否使用https域名
//config.useHttpsDomain = true;
// 上传是否使用cdn加速
//config.useCdnDomain = true;

//var localFile = "/Users/jemy/Documents/qiniu.mp4";
var formUploader = new qiniu.form_up.FormUploader(config);
var putExtra = new qiniu.form_up.PutExtra();
//var key='test.mp4';
// 文件上传
formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr,
    respBody, respInfo) {
    if (respErr) {
        throw respErr;
    }

    if (respInfo.statusCode == 200) {
        console.log(respBody);
    } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
    }
});

var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var config = new qiniu.conf.Config();
var bucketManager = new qiniu.rs.BucketManager(mac, config);
var publicBucketDomain = 'http://rtpx9xnaq.hb-bkt.clouddn.com';
// 公开空间访问链接
var publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key);
console.log('downloadfile===', publicDownloadUrl);