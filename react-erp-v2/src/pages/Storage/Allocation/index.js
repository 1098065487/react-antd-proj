/*
 * @Author: wjw
 * @Date: 2020-09-01 15:44:31
 * @LastEditTime: 2020-09-23 15:34:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\index.js
 */
import React, { useState } from 'react';
import { Radio } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import AllocationTab from './AllocationTab'
import StatisticsTab from './StatisticsTab'

const Allocation = () => {
  const [currentTab, setCurrentTab] = useState('allocation');
  const renderContent = () => {
    return (
      <Radio.Group
        value={currentTab}
        onChange={e => setCurrentTab(e.target.value)}
        buttonStyle="solid"
      >
        <Radio.Button value="allocation">调拨</Radio.Button>
        <Radio.Button value="statistics">统计</Radio.Button>
      </Radio.Group>
    );
  };
  return (
    <PageHeaderWrapper title="调拨" content={renderContent()}>
      { currentTab === 'allocation' ? (<AllocationTab />) : (<StatisticsTab />) }
    </PageHeaderWrapper>
  );
};

export default Allocation;
