/*
 * @Author: wjw
 * @Date: 2020-08-05 10:48:31
 * @LastEditTime: 2020-08-05 13:01:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\Factory\Workbench\Detail.js
 */

import React, { useState, useRef } from 'react';
import { Radio, Drawer } from 'antd';
// 需求单详情组件
import DemandDetail from '../DemandDetail';
// 生产单详情组件
import ProductionDetail from '../ProductionDetail';

const Detail = props => {
  const childRef = useRef();
  const [current, setCurrent] = useState('DemandDetail');
  const { detail, setDetail } = props;
  const { id: detailId = '' } = detail;
  const closeDetail = () => {
    childRef.current.closeDetail();
  };
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
      visible={!!detailId}
      placement="right"
      onClose={closeDetail}
    >
      <Radio.Group
        value={current}
        onChange={e => {
          setCurrent(e.target.value);
        }}
        buttonStyle="solid"
      >
        <Radio.Button value="DemandDetail">需求单明细</Radio.Button>
        <Radio.Button value="ProductionDetail">生产单明细</Radio.Button>
      </Radio.Group>
      {current === 'DemandDetail' ? (
        <DemandDetail demandDetail={detail} setDemandDetail={setDetail} cref={childRef} />
      ) : (
        <ProductionDetail
          productionDetail={detail}
          setProductionDetail={setDetail}
          cref={childRef}
        />
      )}
    </Drawer>
  );
};

export default Detail;
