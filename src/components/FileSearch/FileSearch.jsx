/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-18 16:02:40
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-26 08:53:40
 * @FilePath: /study-cloud-doc/src/components/FileSearch/FileSearch.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../../hooks/useKeyPress'
import useIpcRenderer from '../../hooks/useIpcRenderer'
import './FileSearch.scss'

const FileSearch = ({ title, onFileSearch }) => {
    const [inputActive, setInputActive] = useState(false)
    const [value, setValue] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    let node = useRef(null)
    const startSearch = () => {
        setInputActive(true)
    }
    const closeSearch = () => {
        setInputActive(false)
        setValue('')
        onFileSearch(false)
    }
    useIpcRenderer({
        'search-file': startSearch
    })
    useEffect(() => {
        if (enterPressed && inputActive) {
            onFileSearch(value)
        }
        if (escPressed && inputActive) {
            closeSearch()
        }
    })
    useEffect(() => {
        if (inputActive) {
            node.current.focus()
        }
    }, [inputActive])
    return (
        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
            {!inputActive &&
                <>
                    <span>{title}</span>
                    <button
                        type="button"
                        className="icon-button"
                        onClick={startSearch}
                    >
                        <FontAwesomeIcon
                            title="搜索"
                            size="lg"
                            icon={faSearch}
                        />
                    </button>
                </>
            }
            {inputActive &&
                <>
                    <input
                        className="form-control"
                        value={value}
                        ref={node}
                        onChange={(e) => { setValue(e.target.value) }}
                    />
                    <button
                        type="button"
                        className="icon-button"
                        onClick={closeSearch}
                    >
                        <FontAwesomeIcon
                            title="关闭"
                            size="lg"
                            icon={faTimes}
                        />
                    </button>
                </>
            }
        </div>
    )
}

FileSearch.propTypes = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired,
}

FileSearch.defaultProps = {
    title: '我的云文档'
}

export default FileSearch
