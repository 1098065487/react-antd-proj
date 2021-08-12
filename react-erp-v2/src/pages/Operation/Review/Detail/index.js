/*
 * @Author: wjw
 * @Date: 2020-08-06 09:47:49
 * @LastEditTime: 2020-08-10 09:04:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\Detail\index.js
 */

import React, { Suspense } from 'react';
import { Drawer } from 'antd';

// 评论概览组件
const ReviewOverview = React.lazy(() => import('./ReviewOverview'));
// 评论详情组件
const ReviewDetail = React.lazy(() => import('./ReviewDetail'));

const Detail = props => {
  const {
    currentSku: { id: currentId, spu: currentSku, platform_id = '', platform_sn = '', type },
    setCurrentSku,
  } = props;

  /**
   * @description: 弹出动画完成时的回调函数
   * @param {boolean} visible
   * @return: void
   */
  const handleAfterVisibleChange = visible => {
    if (!visible) {
      setCurrentSku({});
    }
  };
  let currentCom;
  if (type === 'overview') {
    currentCom = <ReviewOverview currentId={currentId} currentSku={currentSku} />;
  } else if (type === 'detail') {
    currentCom = (
      <ReviewDetail
        currentId={currentId}
        currentSku={currentSku}
        platform_id={platform_id}
        platform_sn={platform_sn}
      />
    );
  }
  return (
    <Drawer
      drawerStyle={{ display: 'flex', flexDirection: 'column' }}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        backgroundColor: '#f0f2f5',
      }}
      closable={false}
      width="80%"
      visible={!!currentId}
      placement="right"
      onClose={() => {
        setCurrentSku({ type });
      }}
      afterVisibleChange={handleAfterVisibleChange}
    >
      <Suspense fallback={null}>
        {currentCom}
      </Suspense>
    </Drawer>
  );
};

export default Detail;
