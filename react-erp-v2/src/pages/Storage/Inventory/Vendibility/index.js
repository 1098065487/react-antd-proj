/*
 * @Author: wjw
 * @Date: 2020-09-01 16:18:09
 * @LastEditTime: 2020-09-10 10:29:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Stock\Vendibility\index.js
 */
import React, { useState, useRef } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Card, Radio, Input, Button } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Matched from './Matched';
import Unmatch from './UnMatch';
import styles from './index.less';

const Vendibility = props => {
  const childRef = useRef();
  const [isMatch, setIsMatch] = useState('matched');
  const [searchSku, setSearchSku] = useState('');

  // 搜索
  const search = () => {
    childRef.current.startSearch({ type: 'search' });
  };

  // 重置
  const reset = () => {
    setSearchSku('');
    childRef.current.startSearch({ type: 'reset' });
  };

  const exportVendibility = () => {
    const { dispatch } = props;
    dispatch({
      type: 'system/createAnExport',
      payload: {
        type: 'sellerProductInventory',
        dynamic: { category: childRef?.current?.category || [], keyword: searchSku },
      },
    });
  };

  return (
    <PageHeaderWrapper title="可售库存">
      <div className={styles.filter}>
        <Radio.Group
          value={isMatch}
          onChange={e => {
            setSearchSku('');
            setIsMatch(e.target.value);
          }}
          buttonStyle="solid"
        >
          <Radio.Button value="matched">已匹配</Radio.Button>
          <Radio.Button value="unMatch">未匹配</Radio.Button>
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
          <Button
            className={styles.button}
            onClick={() => {
              router.push('/excel/imports/create?type=warehouse_inventory');
            }}
          >
            导入可售
          </Button>
          <Button
            className={styles.button}
            onClick={exportVendibility}
            style={{ display: isMatch === 'matched' ? 'inline-block' : 'none' }}
          >
            导出可售
          </Button>
        </div>
      </div>
      <Card className={styles.card}>
        {isMatch === 'matched' ? (
          <Matched searchSku={searchSku} cref={childRef} />
        ) : (
          <Unmatch searchSku={searchSku} cref={childRef} />
        )}
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect()(Vendibility);
