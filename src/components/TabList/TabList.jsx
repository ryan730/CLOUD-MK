/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-19 14:38:38
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-21 17:15:28
 * @FilePath: /study-cloud-doc/src/components/TabList/TabList.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import './TabList.scss'

const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {
    return (
        <ul className="nav nav-pills tablist-component">
            {!files?.length ? <></> : files.map(file => {
                const withUnsavedMark = unsaveIds.includes(file.id)
                const fClassName = classNames({
                    'nav-link': true,
                    'active': file.id === activeId,
                    'withUnsaved': withUnsavedMark
                })
                return (
                    <li className="nav-item" key={file.id}>
                        <a
                            href="#"
                            className={fClassName}
                            onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
                        >
                            {file.title}
                            <span
                                className="ml-2 close-icon"
                                onClick={(e) => { e.stopPropagation(); onCloseTab(file.id) }}
                            >
                                <FontAwesomeIcon
                                    icon={faTimes}
                                />
                            </span>
                            {withUnsavedMark && <span className="rounded-circle ml-2 unsaved-icon"></span>}
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}

TabList.propTypes = {
    files: PropTypes.array,
    activeId: PropTypes.string,
    unsaveIds: PropTypes.array,
    onTabClick: PropTypes.func,
    onCloseTab: PropTypes.func,
}
TabList.defaultProps = {
    unsaveIds: []
}

export default TabList