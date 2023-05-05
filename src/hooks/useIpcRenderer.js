/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-20 20:35:45
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-24 22:02:37
 * @FilePath: /study-cloud-doc/src/hooks/useIpcRenderer.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useEffect } from 'react'
const { ipcRenderer } = window.require('electron')


// 注册各种自定义事件
const useIpcRenderer = (keyCallbackMap) => {
  useEffect(() => {
    Object.keys(keyCallbackMap).forEach(key => {
      ipcRenderer.on(key, keyCallbackMap[key])
    })
    return () => {
      Object.keys(keyCallbackMap).forEach(key => {
        ipcRenderer.removeListener(key, keyCallbackMap[key])
      })
    }
  })
}

export default useIpcRenderer