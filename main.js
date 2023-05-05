/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-20 23:05:34
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-05-05 12:56:21
 * @FilePath: /cloud-mk/main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, Menu, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
const menuTemplate = require('./src/template/menuTemplate');
const AppWindow = require('./src/template/AppWindow');
const path = require('path');
const Store = require('electron-store')
const settingsStore = new Store({ name: 'Settings' });
const QiniuManager = require('./src/utils/QiniuManager');
const { error } = require('console');
const fileStore = new Store({ name: 'Files Data' })

let mainWindow, settingsWindow;

const createManager = () => {
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')
    return new QiniuManager(accessKey, secretKey, bucketName)
}

app.on('ready', function () {
    // mainWindow = new BrowserWindow({
    //     width: 1024, height: 680,
    //     webPreferences: {
    //         nodeIntegration: true,
    //         //contextIsolation: false
    //     }
    // });

    const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './index.html')}`;
    //mainWindow.loadURL(urlLocation);

    // set the menu
    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    const mainWindowConfig = {
        width: 1440,
        height: 768
    }

    mainWindow = new AppWindow(mainWindowConfig, urlLocation);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.openDevTools({
        mode: 'bottom'
    });

    // 保存设置
    ipcMain.on('config-is-saved', () => {
        let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2];
        const switchItems = (toggle) => {
            [1, 2, 3].forEach(number => {
                qiniuMenu.submenu.items[number].enabled = toggle
            })
        }
        const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
        if (qiniuIsConfiged) {
            switchItems(true)
        } else {
            switchItems(false)
        }
    })

    // 弹出设置的窗口
    ipcMain.on('open-settings-window', () => {
        settingsWindow = new AppWindow(
            {
                width: 500,
                height: 400,
                parent: mainWindow
            },
            `file://${path.join(__dirname, './resource/settings/settings.html')}`
        );

        settingsWindow.webContents.openDevTools({
            mode: 'bottom'
        });

        settingsWindow.removeMenu();

        settingsWindow.on('closed', function () {
            settingsWindow = null;
        });
    })

    // 上传到七牛云
    ipcMain.on('upload-file', (event, sourceData) => {
        const manager = createManager();
        console.log('upload-file:', sourceData);
        manager.uploadFile(sourceData.key, sourceData.path).then(data => {
            console.log('上传到七牛云', sourceData, data)
            mainWindow.webContents.send('active-file-uploaded');// 远程文件同步到本地
            dialog.showMessageBox({
                type: 'info',
                title: `上传到七牛云:`,
                message: `地址:${sourceData.path}\n key:${sourceData.key}`,
            })
        }).catch((err) => {
            console.error('upload-file:', err);
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确');
        })
    })

    // 文件下载（同步到本地）
    ipcMain.on('download-file', (event, sourceData) => {
        const { key, path, id } = sourceData;
        const manager = createManager();
        console.log('downlaod-file:', sourceData);
        const filesObj = fileStore.get('files');

        manager.getStat(sourceData.key).then(state => {
            // 比较时间确定谁更新
            const serverUpdatedTime = Math.round(state.putTime / 10000);// 纳秒转毫秒
            const localUpdatedTime = filesObj[id].updatedAt;
            // TODO 七牛的缓存在测试域名下,要手动刷新,所以这里要在cdn缓存平台操作后才是最新
            if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
                console.log('downlaod-file 使用云数据', state);
                manager.downloadFile(key, path).then(() => {
                    // 云上的更新，就使用云上数据同步到本地
                    mainWindow.webContents.send('file-downloaded', { status: 'download-success', id })
                })
            } else {
                console.log('downlaod-file 使用本地数据', state);
                mainWindow.webContents.send('file-downloaded', { status: 'no-new-file', id })
            }

        }).catch((error) => {
            console.log('downlaod-file-error:', error);
            if (error.statusCode == 612) {
                dialog.showErrorBox('读取七牛云失败', JSON.stringify(error));
                mainWindow.webContents.send('file-downloaded', { status: 'no-file', id });// 远程文件同步到本地
            }
        })
    })

    // 删除云端文件
    ipcMain.on('delete-file', (event, sourceData) => {
        const { key, path, id } = sourceData;
        const manager = createManager();
        console.log('delete-file:', sourceData);
        manager.deleteFile(key).then((result) => {
            dialog.showMessageBox({
                type: 'info',
                title: `删除七牛云文件成功:`,
                message: `地址:${sourceData.path}\n key:${sourceData.key}`,
            })
        }).catch((err) => {
            console.error('delete-file:', err);

            if (error.statusCode == 612) {
                dialog.showErrorBox('删除失败', JSON.stringify(error));
            } else {
                dialog.showErrorBox('删除失败', '请检查七牛云参数是否正确');
            }
        })
    })

    // 文件所有文件（更新到云上）
    ipcMain.on('upload-all-to-qiniu', () => {
        console.log('upload-all-to-qiniu');
        mainWindow.webContents.send('loading-status', true);
        const filesObj = fileStore.get('files') || {};
        const manager = createManager();

        const uploadPromises = Object.keys(filesObj).map(id => {
            const file = filesObj[id];
            const key = file.key;
            return manager.uploadFile(`docs/${file.title}.md`, file.path);
        })

        Promise.all(uploadPromises).then((result) => {
            console.log('upload-all-to-qiniu-success:', result);
            dialog.showMessageBox({
                type: 'info',
                title: `成功上传了${result.length}个文件`,
                message: `成功上传了${result.length}个文件`,
                buttons: ['OK']
            })
        }).catch((err) => {
            console.log('upload-all-to-qiniu-err:', err);
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        }).finally(() => {
            mainWindow.webContents.send('loading-status', false)
        })
    })

});