/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-05-05 12:50:37
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-05-05 18:26:04
 * @FilePath: /cloud-mk/webpack.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'electron-main',
  entry: './main.js',// 输入文件
  output: {
    path: path.resolve(__dirname, './build'),// 输出文件夹
    filename: 'main.js'
  },
  node: {
    __dirname: false // 不使用路径前缀
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './resource'),
          to: path.resolve(__dirname, './build/resource')
        },
      ],
    }),
  ]
}