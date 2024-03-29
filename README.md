<!--
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-20 22:42:01
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-05-06 18:52:23
 * @FilePath: /cloud-mk/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
### 开发命令
```
npm run dev
```

### 打包成文件夹
```
// 自动先执行 prepack 然后 pack 
npm run pack
```

### 打包成可执行文件
```
// 自动先执行 predist 然后 dist 
npm run dist
```

### 生成 release 版本, 用于自动更新并发布
```
// 自动先执行 prerelease 然后 release 
npm run release
```

### 查看工程目录结构
```
tree -L 2 -I "node_modules"
```
```
├── README.md
├── app // 反编译asar 文件
│   ├── build
│   ├── package.json
│   └── resource
├── assets // 应用图标资源
│   ├── appdmg.png
│   ├── icon.icns
│   └── icon.ico
├── build // webpack 编译的文件
│   ├── asset-manifest.json
│   ├── css
│   ├── favicon.ico
│   ├── fonts
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── main.js // 主进程文件合并
│   ├── main.js.LICENSE.txt
│   ├── manifest.json
│   ├── resource // 其他进程文件
│   ├── robots.txt
│   └── static
├── dist // 可执行文件
│   ├── builder-debug.yml
│   ├── builder-effective-config.yaml
│   ├── mac // asar 所在目录
│   ├── 七牛云-文档-0.1.0-x64.dmg // 最终文件
│   ├── 七牛云-文档-0.1.0-x64.dmg.blockmap
│   ├── 七牛云-文档-0.1.0-x64.zip
│   └── 七牛云-文档-0.1.0-x64.zip.blockmap
├── docs
│   └── f2.md
├── main.js
├── package-lock.json
├── package.json
├── public
│   ├── css
│   ├── favicon.ico
│   ├── fonts
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── resource // 其他进程开发文件
│   └── settings
├── src
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── components
│   ├── hooks
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   ├── template
│   └── utils
├── test // 多继承文件，和本项目无关
│   ├── compiled.js
│   ├── implement.js
│   ├── package-lock.json
│   ├── package.json
│   ├── readMe.md
│   ├── run.js
│   └── test.js
├── qiniu_test // 七牛云的测试文件
│   ├── test.gz
│   ├── test.js
│   ├── testServer.js
│   ├── testStream.js
│   └── writeFile.js
├── webpack.config.js
├── dev-app-update.yml // 本地模拟在线更新 功能
└── yarn.lock
```

### 七牛云相关
```
https://portal.qiniu.com/kodo/bucket/resource-v2?bucketName=cloudmk
```
### asar 文件反编译
```
npm i -g asar 

// 解压 asar 文件
asar extract /Users/ryan/work/electron-project/cloud-mk/dist/mac/七牛云-文档.app/Contents/Resources/app.asar ./app

// 有道
asar extract /Applications/有道云笔记.app/Contents/Resources/app.asar ./app2
```

### github 发布更新相关
```
1. 保证提交到 github realease 里有 latest-mac.yml 这个文件( 目前命令行还有报错，导致提交中断，所有手动上传 latest-mac.yml )。
2. 本地文件需要有 Contents/Resources/app-update.yml 。目前只有 npm run dist 才会生成这个文件.
owner: ryan730
repo: CLOUD-MK
provider: github
updaterCacheDirName: cloud-mk-updater
3. dev 环境下测试发布更新，需要手动创建 dev-app-update.yml。当设置 autoUpdater.forceDevUpdateConfig = true; 程序会去找 dev-app-update.yml。
4. npm run release 后一直没有 latest-mac.yml. 而且 日志报错：Request path contains unescaped characters 
原因，生成的应用使用了中文或其他字符，造成提交到 github 不成功. 
5. mac 签名证书问题：
 cd ~/Library/MobileDevice/Provisioning\ Profiles/
 /Users/ryan/Downloads/apple_profile.p1
 
 // 设置环境变量
 vim ~/.bash_profile
 >> CSC_LINK=/Users/ryan/Downloads/apple_profile.p12
 source ~/.bash_profile
 env
```