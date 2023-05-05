/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-20 18:56:32
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-21 22:53:04
 * @FilePath: /study-cloud-doc/src/utils/fileHelper.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const file = window.require('fs');
const fs = file.promises;

const fileHelper = {
    readFile: (path) => {
        return fs.readFile(path, { encoding: 'utf8' })
    },
    writeFile: (path, content) => {
        let filePromise = fs.writeFile(path, content, { encoding: 'utf8' });
        filePromise.then((arg) => console.log(`文件创建成功:`, `地址：`, path, arg));
        return filePromise;
    },
    renameFile: (path, newPath) => {
        return fs.rename(path, newPath)
    },
    deleteFile: (path) => {
        return fs.unlink(path)
    }
}
// const fileHelper = {}
export default fileHelper

