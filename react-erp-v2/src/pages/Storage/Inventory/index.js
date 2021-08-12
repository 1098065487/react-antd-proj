/*
 * @Author: wjw
 * @Date: 2020-09-01 15:44:31
 * @LastEditTime: 2020-09-01 17:25:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\index.js
 */
import React from 'react';
import { Radio } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';

const Inventory = props => {
  const { children } = props;
  const getCurrentRadio = () => {
    const {
      location: { pathname },
    } = props;
    const pathList = pathname.split('/');
    return pathList[pathList.length - 1];
  };

  const handleChange = e => {
    router.push(`/warehouse/inventory/${e.target.value}`);
  };

  const renderContent = () => {
    const current = getCurrentRadio();
    return (
      <Radio.Group value={current} onChange={handleChange} buttonStyle="solid">
        <Radio.Button value="vendibility">可售</Radio.Button>
        <Radio.Button value="singleItem">单品</Radio.Button>
      </Radio.Group>
    );
  };
  return (
    <PageHeaderWrapper title="库存" content={renderContent()}>
      {children}
    </PageHeaderWrapper>
  );
};

export default Inventory;
