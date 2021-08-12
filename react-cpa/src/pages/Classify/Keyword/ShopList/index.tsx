/*
 * @Author: wjw
 * @Date: 2021-01-29 09:53:33
 * @LastEditTime: 2021-02-04 10:16:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\ShopList\index.tsx
 */
import React, { useState, useRef } from 'react';
import { Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import StandardTable from '@/components/StandardTable';
import { getShopList, reGetClassifyList } from './service';
import { KeywordListProps } from '../KeywordList/keywordList.d';
import { WithStatusShop } from './shopList.d';

const ShopList: React.FC<KeywordListProps> = ({ siteId, reSearch }) => {
  const tableRef: any = useRef(null);
  // 重新抓取的店铺asin
  const [shop_asin, setShopAsin] = useState('');
  // 重新抓取loading
  const [loading, setLoading] = useState(false);
  // 获取店铺列表
  const fetchShopList = (params: any) => {
    const newParams = params;
    delete newParams.current;
    delete newParams.pageSize;
    return getShopList({ ...newParams, filters: { site_id: siteId }, with: 'shop,progress' });
  };
  // 重新抓取该店铺
  const reFetchClassifyList = async () => {
    setLoading(true);
    const { status } = await reGetClassifyList({
      filters: {
        shop_asin,
        site_id: siteId,
      },
    });
    if (status === 'ok') {
      tableRef.current.setDataSource((data: WithStatusShop[]) => {
        const shopList = data;
        for (let i = 0, { length } = shopList; i < length; i += 1) {
          if (shopList[i].shop.asin === shop_asin) {
            if (shopList[i].progress) {
              shopList[i].progress.finished = 0;
            }
            break;
          }
        }
        return shopList;
      });
      setLoading(false);
      setShopAsin('');
      message.success('重新抓取成功。');
    } else {
      message.error('重新抓取失败!');
    }
  };
  const columns: ColumnsType<WithStatusShop> = [
    {
      title: '店铺名',
      dataIndex: ['shop', 'name'],
      // sorter: true,
      render(name, record) {
        const {
          progress,
          shop: { asin },
        } = record;
        const { finished, total } = progress || { finished: 0, total: 0 };
        return total && finished === total ? (
          <span
            style={{ color: 'var(--checked-bd)', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => {
              reSearch(asin);
            }}
          >
            {name}
          </span>
        ) : (
          <span>{name}</span>
        );
      },
    },
    {
      title: '店铺asin',
      dataIndex: ['shop', 'asin'],
      // sorter: true,
      render(asin, record) {
        const { progress } = record;
        const { finished, total } = progress || { finished: 0, total: 0 };
        return total && finished === total ? (
          <span
            style={{ color: 'var(--checked-bd)', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => {
              reSearch(asin);
            }}
          >
            {asin}
          </span>
        ) : (
          <span>{asin}</span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'progress',
      render(progress) {
        const { finished, total } = progress || { finished: 0, total: 0 };
        return (
          <span
            style={{
              color: total && finished === total ? 'var(--checked-bd)' : 'var(--down-color)',
            }}
          >
            {parseInt((total && (finished / total) * 100).toString(), 10) || 0}%
            {total && finished === total ? '(完成)' : '(抓取中)'}
          </span>
        );
      },
    },
    {
      dataIndex: 'options',
      render(_, record) {
        const {
          shop: { asin },
        } = record;
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setShopAsin(asin);
            }}
          >
            重新抓取
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        confirmLoading={loading}
        width={290}
        visible={!!shop_asin}
        closable={false}
        style={{ textAlign: 'center' }}
        onCancel={() => setShopAsin('')}
        onOk={reFetchClassifyList}
      >
        <p style={{ textAlign: 'center', marginBottom: '10px', marginRight: '5px' }}>
          是否重新抓取asin为 {shop_asin} 的店铺?
        </p>
      </Modal>
      <StandardTable
        cref={tableRef}
        paginationConfig={false}
        request={fetchShopList}
        bordered={false}
        columns={columns}
      />
    </>
  );
};

export default ShopList;
