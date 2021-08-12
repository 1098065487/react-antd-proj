/*
 * @Author: wjw
 * @Date: 2020-09-01 16:18:09
 * @LastEditTime: 2020-09-23 13:23:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Stock\SingleItem\index.js
 */
import React, { useState, useRef } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Card, Radio, Input, Button } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Matched from './Matched';
import InflowUnmatch from './InflowUnMatch';
import CNUnmatch from './CNUnMatch';
import styles from './index.less';

const SingleItem = props => {
  const childRef = useRef();
  const [searchSku, setSearchSku] = useState('');
  const [currentTab, setCurrentTab] = useState('matched');
  // 搜索
  const search = () => {
    childRef.current.startSearch({ type: 'search' });
  };

  // 重置
  const reset = () => {
    setSearchSku('');
    childRef.current.startSearch({ type: 'reset' });
  };

  // 导出单品
  const exportSingleItem = () => {
    const { dispatch } = props;
    dispatch({
      type: 'system/createAnExport',
      payload: {
        type: 'factoryProductInventory',
        dynamic: { category: childRef?.current?.category || [], keyword: searchSku },
      },
    });
  };

  const renderTab = () => {
    switch (currentTab) {
      case 'matched':
        return <Matched searchSku={searchSku} cref={childRef} />;
      case 'inflowUnMatch':
        return <InflowUnmatch searchSku={searchSku} cref={childRef} />;
      case 'cnUnMatch':
        return <CNUnmatch searchSku={searchSku} cref={childRef} />;
      default:
        return <Matched searchSku={searchSku} cref={childRef} />;
    }
  };

  return (
    <PageHeaderWrapper title="单品库存">
      <div className={styles.filter}>
        <Radio.Group
          value={currentTab}
          onChange={e => {
            setSearchSku('');
            setCurrentTab(e.target.value);
          }}
          buttonStyle="solid"
        >
          <Radio.Button value="matched">已匹配</Radio.Button>
          <Radio.Button value="inflowUnMatch">Inflow未匹配</Radio.Button>
          <Radio.Button value="cnUnMatch">CN未匹配</Radio.Button>
        </Radio.Group>

        <div>
          <Input
            style={{ width: '300px' }}
            value={searchSku}
            onChange={e => setSearchSku(e.target.value)}
            placeholder="SKU、仓库SKU综合搜索"
            onPressEnter={search}
          />
          <Button className={styles.button} type="primary" onClick={search}>
            搜索
          </Button>
          <Button className={styles.button} onClick={reset}>
            重置
          </Button>
          {/*<Button*/}
          {/*  className={styles.button}*/}
          {/*  onClick={() => {*/}
          {/*    router.push('/excel/imports/create?type=product_inflow_warehouse_inventory');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  导入Inflow单品*/}
          {/*</Button>*/}
          <Button
            className={styles.button}
            onClick={() => {
              router.push('/excel/imports/create?type=factory_inventory');
            }}
          >
            导入CN单品
          </Button>
          <Button
            className={styles.button}
            onClick={exportSingleItem}
            style={{ display: currentTab === 'matched' ? 'inline-block' : 'none' }}
          >
            导出单品
          </Button>
        </div>
      </div>
      <Card className={styles.card}>{renderTab()}</Card>
    </PageHeaderWrapper>
  );
};

export default connect()(SingleItem);
