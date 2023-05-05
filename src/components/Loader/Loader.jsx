/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-20 19:00:40
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-20 19:00:49
 * @FilePath: /study-cloud-doc/src/components/Loader/Loader.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import './Loader.scss'

const Loader = ({ text = '处理中' }) => (
    <div className="loading-component text-center">
        <div className="spinner-grow text-primary" role="status">
            <span className="sr-only">{text}</span>
        </div>
        <h5 className="text-primary">{text}</h5>
    </div>
)

export default Loader
