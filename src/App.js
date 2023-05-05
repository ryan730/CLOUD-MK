import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'

import { v4 as uuidv4 } from 'uuid'
import { flattenArr, objToArr, timestampToString } from './utils/helper'
import fileHelper from './utils/fileHelper'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import "easymde/dist/easymde.min.css"

import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import Loader from './components/Loader'
import useIpcRenderer from './hooks/useIpcRenderer'
import defaultFiles from './utils/defaultFiles'

//import SimpleMDE from "./utils/SimpleMde/SimpleMdeReact"
//const SimpleMDE = require('./utils/SimpleMde/SimpleMdeReact');
import SimpleMDE from "react-simplemde-editor"

// require node.js modules
const { join, basename, extname, dirname } = window.require('path')

// 在渲染器进程中使用主进程端模块=>remote
const { remote, ipcRenderer, dialog } = window.require('electron');

const Store = window.require('electron-store')

const fileStore = new Store({ 'name': 'Files Data' });
// 保存目录：;/Users/ryan/Library/Application Support/cloud-mk
const settingsStore = new Store({ name: 'Settings' })
const getAutoSync = () => {
    return ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(key => {
        console.log('getAutoSync::', settingsStore.get(key));
        return !!settingsStore.get(key)
    })
}
const saveFilesToStore = (files) => {
    // we don't have to store any info in file system, eg: isNew, body ,etc
    // real address: /Users/ryan/Library/Application\ Support/cloud-mk/config.json
    const filesStoreObj = objToArr(files).reduce((result, file) => {
        const { id, path, title, createdAt, isSynced, updatedAt } = file
        result[id] = {
            id,
            path,
            title,
            createdAt,
            isSynced,
            updatedAt
        }
        return result
    }, {})
    fileStore.set('files', filesStoreObj)
}

console.log('fileStore.gset', fileStore.get('files'));

function App() {
    const [files, setFiles] = useState(fileStore.get('files') || {})// flattenArr(defaultFiles) 整个应用的临时数据
    const [activeFileID, setActiveFileID] = useState('')// 选择的文件的id
    const [openedFileIDs, setOpenedFileIDs] = useState([]) // 打开的文件的id列表
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([]) // 未保存的文件的id列表
    const [searchedFiles, setSearchedFiles] = useState([]) // 搜索的文件列表
    const [isLoading, setLoading] = useState(false) // 加载中
    const filesArr = objToArr(files) // 将文件对象转换为数组

    //const savedLocation = remote.app.getPath('documents');
    const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents') // 保存文件位置

    console.log('files:', files);

    const activeFile = files[activeFileID];
    //const activeFile = files.find(file => file.id === activeFileID); // 根据文件id 打开文件

    const openedFiles = openedFileIDs.map(openID => { // 打开的文件列表
        return files[openID]
        //return files.find(file => file.id === openID);
    })

    const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr // 搜索的文件列表

    const [lineAndCursor, setLineAndCursor] = useState(null);
    const getLineAndCursorCallback = useCallback((position) => {
        //setLineAndCursor(position);
    }, []);
    useEffect(() => {
        lineAndCursor &&
            console.info("Hey I'm line and cursor info!", lineAndCursor);
    }, [lineAndCursor]);


    const fileClick = (fileID) => {
        // set current active file
        setActiveFileID(fileID)
        const currentFile = files[fileID]
        const { id, title, path, isLoaded } = currentFile;
        console.log('file-click:', currentFile, getAutoSync());
        if (!isLoaded) { // 没有和云同步
            if (getAutoSync()) { // 自动同步
                ipcRenderer.send('download-file', { key: `docs/${title}.md`, path, id })
            } else {
                fileHelper.readFile(currentFile.path).then(value => {
                    const newFile = { ...files[fileID], body: value, isLoaded: true }
                    setFiles({ ...files, [fileID]: newFile })
                })
            }
        }

        // if openedFiles don't have the current ID
        // then add new fileID to openedFiles
        if (!openedFileIDs.includes(fileID)) {
            setOpenedFileIDs([...openedFileIDs, fileID])
        }
    }

    const tabClick = (fileID) => {
        // set current active file
        setActiveFileID(fileID)
    }

    const tabClose = (id) => {
        //remove current id from openedFileIDs
        const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
        setOpenedFileIDs(tabsWithout)
        // set the active to the first opened tab if still tabs left

        if (tabsWithout.length > 0) {
            setActiveFileID(tabsWithout[0])
        } else {
            setActiveFileID('')
        }
    }

    const fileChange = (id, value) => {
        if (value !== files[id].body) {
            const newFile = { ...files[id], body: value }
            setFiles({ ...files, [id]: newFile })
            // update unsavedIDs
            if (!unsavedFileIDs.includes(id)) {
                setUnsavedFileIDs([...unsavedFileIDs, id])
            }
        }
    }

    const onChangeHandler = useCallback((value) => {
        //console.log('changed', activeFile);
        fileChange(activeFile.id, value)
    }, [activeFile])

    const deleteFile = (id) => {
        if (files[id].isNew) { // 如果还在内存中，则不能删除文件,比如：点击esc的情况
            const { [id]: value, ...afterDelete } = files;// 去掉[id]这一项，展开其他属性，省去手动新建对象副本
            setFiles(afterDelete);
        } else {
            fileHelper.deleteFile(files[id].path).then(() => {
                const { [id]: value, ...afterDelete } = files; // 去掉[id]这一项，展开其他属性，省去新建对象副本
                setFiles(afterDelete)
                saveFilesToStore(afterDelete)
                // close the tab if opened
                tabClose(id)
                // 是否勾选自动同步
                if (getAutoSync()) {
                    console.log('deleteFile:', files[id]);
                    const { path, body, title } = files[id];
                    // 删除云上数据
                    ipcRenderer.send('delete-file', { key: `docs/${title}.md`, path })
                }
            })
        }
    }
    const updateFileName = (id, title, isNew) => {
        // newPath should be different based on isNew
        // if isNew is false, path should be old dirname + new title

        console.log('newPath:', savedLocation);
        const newPath = isNew ? join(savedLocation, `${title}.md`)// 新文件地址
            : join(dirname(files[id].path), `${title}.md`) // 旧文件地址，更新

        const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
        const newFiles = { ...files, [id]: modifiedFile }
        if (isNew) {
            // 文件写入
            fileHelper.writeFile(newPath, files[id].body).then(() => {
                setFiles(newFiles)
                saveFilesToStore(newFiles)
                saveCurrentFile(null, newFiles);// 创建就保存在云上
            })
        } else {
            // 文件改名
            const oldPath = files[id].path
            fileHelper.renameFile(oldPath, newPath).then(() => {
                setFiles(newFiles)
                saveFilesToStore(newFiles)
            })
        }
    }

    const fileSearch = (keyword) => {
        // filter out the new files based on the keyword
        const newFiles = filesArr.filter(file => file.title.includes(keyword));
        console.log("=======<>", newFiles);
        setSearchedFiles(newFiles);
    }

    const createNewFile = () => {
        const newID = uuidv4()
        const newFile = {
            id: newID,
            title: '',
            body: '## 请输出 Markdown',
            createdAt: new Date().getTime(),
            isNew: true,// 这里写入自定义的文件名称
        }
        setFiles({ ...files, [newID]: newFile });
    }
    const saveCurrentFile = (emit, newFile) => {
        console.log('activeFile=>', newFile, activeFile, files, getAutoSync());
        // 参数 >> 最近一次创建
        let tempFile = activeFile;
        if (newFile) {
            // 如果没有当前打开的tab,按创建时间保存;
            const lastFile = Object.values(newFile).sort((a, b) => {
                return a.createdAt > b.createdAt;
            })
            tempFile = (lastFile || []).slice(-1)[0];
        }
        if (!tempFile) {
            remote.dialog.showMessageBox({
                type: 'info',
                title: `选择要保存的文件`,
                message: `选择要保存的文件`,
            })
            return;
        }

        console.log('lastFile=>', tempFile);
        const { path, body, title } = tempFile;

        fileHelper.writeFile(path, body).then(() => {
            // 设置是否已经保存的标识
            setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id));
            console.log('unsavedFileIDs:::', unsavedFileIDs);
            // 是否勾选自动同步
            if (getAutoSync()) {
                ipcRenderer.send('upload-file', { key: `docs/${title}.md`, path })
            }
        })
    }


    const importFiles = () => {
        console.log('importFiles:');

        const loadImportFile = (paths) => {
            console.log('paths:', paths);
            if (Array.isArray(paths)) {
                // filter out the path we already have in electron store
                // ["/Users/liusha/Desktop/name1.md", "/Users/liusha/Desktop/name2.md"]
                const filteredPaths = paths.filter(path => { // 去重
                    const alreadyAdded = Object.values(files).find(file => {
                        return file.path === path
                    })
                    return !alreadyAdded
                })
                // extend the path array to an array contains files info
                // [{id: '1', path: '', title: ''}, {}]
                const importFilesArr = filteredPaths.map(path => {
                    return {
                        id: uuidv4(),
                        title: basename(path, extname(path)),
                        path,
                    }
                })
                // get the new files object in flattenArr
                const newFiles = { ...files, ...flattenArr(importFilesArr) }
                // setState and update electron store
                setFiles(newFiles);// 内存
                saveFilesToStore(newFiles);// 持久化
                if (importFilesArr.length > 0) {
                    remote.dialog.showMessageBox({
                        type: 'info',
                        title: `成功导入了${importFilesArr.length}个文件`,
                        message: `成功导入了${importFilesArr.length}个文件`,
                    })
                }
            }
        }

        remote.dialog.showOpenDialog({
            title: '选择导入的 Markdown 文件',
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Markdown files', extensions: ['md'] }
            ]
        }).then((result) => {
            //console.log(result.canceled)
            loadImportFile(result.filePaths);
        }).catch(err => {
            console.log(err)
        })
    }

    // 更新当前tab文件内容
    const activeFileUploaded = () => {
        if (!activeFile) {
            return;
        }
        const { id } = activeFile;
        const modifiedFile = { ...files[id], isSynced: true, updatedAt: new Date().getTime() }
        const newFiles = { ...files, [id]: modifiedFile }
        console.log('更新当前tab文件内容-activeFileUploaded:', newFiles);
        setFiles(newFiles)
        saveFilesToStore(newFiles)
    }

    const activeFileDownloaded = (event, message) => {
        const currentFile = files[message.id]
        const { id, path } = currentFile
        fileHelper.readFile(path).then(value => {
            let newFile
            if (message.status === 'download-success') {
                // 使用云数据
                newFile = { ...files[id], body: value, isLoaded: true, isSynced: true, updatedAt: new Date().getTime() }
            } else {
                // 继续使用本地数据
                newFile = { ...files[id], body: value, isLoaded: true }
            }
            const newFiles = { ...files, [id]: newFile }
            setFiles(newFiles)
            saveFilesToStore(newFiles)
        })
    }
    const filesUploaded = () => {
        const newFiles = objToArr(files).reduce((result, file) => {
            const currentTime = new Date().getTime()
            result[file.id] = {
                ...files[file.id],
                isSynced: true,
                updatedAt: currentTime,
            }
            return result
        }, {})
        setFiles(newFiles)
        saveFilesToStore(newFiles)
    }

    useIpcRenderer({
        'create-new-file': createNewFile,
        'import-file': importFiles,
        'save-edit-file': saveCurrentFile,
        'active-file-uploaded': activeFileUploaded,
        'file-downloaded': activeFileDownloaded,
        'files-uploaded': filesUploaded,
        'loading-status': (message, status) => { setLoading(status) }
    })


    const autofocusNoSpellcheckerOptions = useMemo(() => {
        return {
            autofocus: true,// 如果设置为true，自动聚焦编辑器。默认为false.
            spellChecker: false,// 如果设置为false，则禁用拼写检查器。默认为true. 可选地传递一个符合 CodeMirrorSpellChecker 的函数。
            minHeight: '515px',// 在开始自动增长之前设置合成区域的最小高度。应该是一个包含有效 CSS 值的字符串，例如"500px". 默认为"300px".
        }
    }, []);

    return (
        <div className="App container-fluid px-0">
            {isLoading &&
                <Loader />
            }
            <div className="row no-gutters">
                <div className="col-3 bg-light left-panel">
                    <FileSearch
                        title='My Document'
                        onFileSearch={fileSearch}
                    />
                    <FileList
                        files={fileListArr}
                        onFileClick={fileClick}
                        onFileDelete={deleteFile}
                        onSaveEdit={updateFileName}
                    />
                    <div className="row no-gutters button-group ">
                        <div className="col">
                            <BottomBtn
                                text="新建"
                                colorClass="btn-primary"
                                icon={faPlus}
                                onBtnClick={createNewFile}
                            />
                        </div>
                        <div className="col">
                            <BottomBtn
                                text="导入"
                                colorClass="btn-success"
                                icon={faFileImport}
                                onBtnClick={importFiles}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-9 right-panel">
                    {/* {
                        console.log('activeFile====', openedFiles, activeFile, activeFileID, unsavedFileIDs)
                    } */}
                    {!activeFile &&
                        <div className="start-page">
                            选择或者创建新的 Markdown 文档--
                        </div>
                    }
                    {activeFile &&
                        <>
                            <TabList
                                files={openedFiles}
                                activeId={activeFileID}
                                unsaveIds={unsavedFileIDs}
                                onTabClick={tabClick}
                                onCloseTab={tabClose}
                            />
                            <SimpleMDE
                                key={activeFile && activeFile.id}
                                value={activeFile && activeFile.body}
                                //onChange={(value) => { fileChange(activeFile.id, value) }}
                                onChange={onChangeHandler}
                                //getLineAndCursor={getLineAndCursorCallback}
                                options={autofocusNoSpellcheckerOptions}
                            // options={{
                            //     minHeight: '515px',
                            // }}
                            />
                            {activeFile.isSynced &&
                                <span className="sync-status">已同步，上次同步{timestampToString(activeFile.updatedAt)}</span>
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    );
}

export default App;
