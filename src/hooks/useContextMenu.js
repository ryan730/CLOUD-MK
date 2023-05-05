/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-21 17:33:37
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-23 19:09:07
 * @FilePath: /cloud-mk/src/hooks/useContextMenu.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useEffect, useRef } from 'react'
const { remote } = window.require('electron')
const { Menu, MenuItem } = remote

const useContextMenu = (itemArr, targetSelector, deps) => {
  let clickedElement = useRef(null)
  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })
    const handleContextMenu = (e) => {
      // only show the context menu on current dom element or targetSelector contains target
      if (document.querySelector(targetSelector).contains(e.target)) {// 限定右键相应范围
        clickedElement.current = e.target
        menu.popup({ window: remote.getCurrentWindow() })// 在哪个window 弹出
      }
    }
    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, deps)
  return clickedElement
}

export default useContextMenu