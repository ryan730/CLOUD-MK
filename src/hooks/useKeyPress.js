/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-19 11:45:41
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-19 12:00:06
 * @FilePath: /study-cloud-doc/src/hooks/useKeyPress.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from 'react'

const useKeyPress = (targetKeyCode) => {
    const [keyPressed, setKeyPressed] = useState(false)

    const keyDownHandler = ({ keyCode }) => {
        if (keyCode === targetKeyCode) {
            setKeyPressed(true)
        }
    }
    const keyUpHandler = ({ keyCode }) => {
        if (keyCode === targetKeyCode) {
            setKeyPressed(false)
        }
    }
    useEffect(() => {
        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)
        console.log('addEventListener::');
        return () => {
            console.log('removeEventListener::');
            document.removeEventListener('keydown', keyDownHandler)
            document.removeEventListener('keyup', keyUpHandler)
        }
    }, [])
    return keyPressed
}

export default useKeyPress