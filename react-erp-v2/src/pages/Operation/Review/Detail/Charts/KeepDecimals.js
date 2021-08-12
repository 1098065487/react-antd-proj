/*
 * @Author: wjw
 * @Date: 2020-08-07 15:43:07
 * @LastEditTime: 2020-08-07 15:43:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\Charts\KeepDecimals.js
 */

const KeepDecimals = val => {
  const per = val * 100;
  const perStr = per.toString();
  const index = perStr.indexOf('.');
  return index === -1 ? `${per}%` : `${perStr.slice(0, index + 3)}%`;
};
export default KeepDecimals;
