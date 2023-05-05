/*
 * @Author: ryan zhuyan730@163.com
 * @Date: 2023-04-19 12:02:51
 * @LastEditors: ryan zhuyan730@163.com
 * @LastEditTime: 2023-04-26 08:57:09
 * @FilePath: /study-cloud-doc/src/components/BottomBtn/BottomBtn.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './BottomBtn.scss';

const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => (
    <button
        type="button"
        className={`btn btn-block no-border ${colorClass} button-width`}
        onClick={onBtnClick}
    >
        <FontAwesomeIcon
            className="mr-2"
            size="lg"
            icon={icon}
        />
        {text}
    </button>
)

BottomBtn.propTypes = {
    text: PropTypes.string,
    colorClass: PropTypes.string,
    icon: PropTypes.object.isRequired,
    onBtnClick: PropTypes.func
}

BottomBtn.defaultProps = {
    text: '新建'
}
export default BottomBtn