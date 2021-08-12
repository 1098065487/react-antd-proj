import React, { useEffect, useRef, useState } from 'react';
import StandardTable from '@/components/StandardTable';

import EditChild from '../ChildEdit';
import { getFreeProduct } from './service';
import styles from '../index.less';
import { getStoreList } from '../service';

const Product: React.FC = () => {
  const ref: any = useRef();

  const [siteList, setSiteList] = useState<any[]>([]);

  // 默认店铺选中、站点选中
  const [store, setStore] = useState<number | undefined>(1);
  const [site, setSite] = useState<number | undefined>(1);

  const [parentCurrent, setParentCurrent] = useState<any>({});

  // 子产品编辑，添加
  const [childVisible, setChildVisible] = useState(false);
  const [childCurrent, setChildCurrent] = useState<any>(undefined);

  useEffect(() => {
    (async () => {
      const res = await getStoreList({ pageSize: 100, with: 'sites' });
      if (res.status === 'ok') {
        if (res.data.length !== 0) {
          if (res.data[0].sites) {
            setSiteList(res.data[0].sites);
          }
        }
      }
    })();
  }, []);

  const handleChildVisible = (flag: boolean, item: any, record: any, refresh?: boolean) => {
    setChildVisible(flag);
    setChildCurrent(item);
    setStore(item.store_id);
    setSite(item.site_id);
    setParentCurrent(record);
    if (refresh) {
      if (ref.current) {
        ref.current.reset();
      }
    }
  };

  const columns = [
    {
      title: '系统编号',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: '站点',
      dataIndex: 'site',
      align: 'center',
      render: (_: any, record: any) => {
        const { site = {} } = record;
        return Object.keys(site).length !== 0 ? site.name : null;
      },
    },
    {
      title: '店铺',
      dataIndex: 'store',
      align: 'center',
      render: (_: any, record: any) => {
        const { store = {} } = record;
        return Object.keys(store).length !== 0 ? store.name : null;
      },
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      align: 'center',
      render: (_: any, record: any) => {
        const currentSite: any[] = siteList.filter((e) => e.id === record.site_id);
        return currentSite.length !== 0 ? (
          <a
            href={`${currentSite[0].domain}dp/${record.asin}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.asin}
          </a>
        ) : (
          <span>{record.asin}</span>
        );
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      align: 'center',
    },
    {
      title: '库存量',
      dataIndex: 'fulfillable_qty',
      align: 'center',
    },
    {
      title: '操作人',
      dataIndex: 'user',
      align: 'center',
      render: (_: any, record: any) => {
        const { user } = record;
        return user && Object.keys(user).length !== 0 ? `${user?.name} (ID: ${user?.id})` : null;
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <a
            onClick={() => {
              handleChildVisible(true, record, {});
            }}
          >
            编辑
          </a>
        );
      },
    },
  ];

  return (
    <div className={styles.contentContainer}>
      <StandardTable
        request={(params: any) =>
          getFreeProduct({
            ...params,
            filters: {
              bind: false,
            },
            with: 'store, site, user',
          })
        }
        cref={ref}
        columns={columns}
        bordered
        pagination={{ current: 1, pageSize: 20 }}
        paginationConfig={{ pageSizeOptions: [10, 20, 50, 100] }}
      />
      {childVisible ? (
        <EditChild
          store={store as number}
          site={site as number}
          record={childCurrent}
          parent={parentCurrent}
          visible={childVisible}
          handleVisible={handleChildVisible}
        />
      ) : null}
    </div>
  );
};

export default Product;
