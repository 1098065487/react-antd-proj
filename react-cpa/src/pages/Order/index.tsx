import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Select } from 'antd';
import StandardTable from '@/components/StandardTable';
import { getOrderList, getStoreList } from './service';
import styles from './index.less';

const { Option } = Select;
const statusList = [
  { label: '待支付', value: 'Pending' },
  { label: '已发货', value: 'Shipped' },
  { label: '已取消', value: 'Canceled' },
];

const Order: React.FC = () => {
  const [form] = Form.useForm();
  const ref: any = useRef();
  const [firstLoad, setFirstLoad] = useState(true);

  // 店铺列表选项、站点列表选项
  const [storeList, setStoreList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);

  // 默认店铺选中、站点选中
  const [store, setStore] = useState<number | undefined>(1);
  const [site, setSite] = useState<number | undefined>(1);

  // 订单号
  const [order, setOrder] = useState<undefined | string>(undefined);
  // 状态
  const [status, setStatus] = useState<undefined | string>(undefined);

  // 获取店铺及站点列表选项
  useEffect(() => {
    (async () => {
      const res = await getStoreList({ pageSize: 100, with: 'sites' });
      if (res.status === 'ok') {
        setStoreList(res.data);
        if (res.data.length !== 0) {
          setStore(res.data[0].id);
          form.setFieldsValue({ store_id: res.data[0].id });
          if (res.data[0].sites) {
            setSiteList(res.data[0].sites);
            if (res.data[0].sites.length !== 0) {
              setSite(res.data[0].sites[0].id);
              form.setFieldsValue({ site_id: res.data[0].sites[0].id });
            }
          }
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    } else {
      if (ref.current) {
        ref.current.reset(true);
      }
    }
  }, [store, site, order, status]);

  const onStoreChange = (value: number) => {
    setStore(value);
    const currentStore = storeList.filter((e) => e.id === value);
    if (currentStore.length !== 0) {
      setSiteList(currentStore[0].sites);
      if (currentStore[0].sites.length !== 0) {
        setSite(currentStore[0].sites[0].id);
        form.setFieldsValue({ site_id: currentStore[0].sites[0].id });
      }
    }
  };

  const handleSearch = () => {
    setOrder(form.getFieldValue('order'));
  };

  const columns = [
    {
      title: '平台订单号',
      dataIndex: 'platform_order_id',
      align: 'center',
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      align: 'center',
      render: (_: any, record: any) => {
        const currentStatus = statusList.filter((e) => e.value === _);
        return currentStatus.length !== 0 ? currentStatus[0].label : null;
      },
    },
    {
      title: '订单类型',
      dataIndex: 'order_type',
      align: 'center',
    },
    {
      title: '订单价格',
      dataIndex: 'price',
      align: 'center',
      render: (_: any, record: any) => {
        const { currency_code, amount } = record;
        return currency_code ? `${currency_code}/${amount}` : amount;
      },
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      align: 'center',
    },
    {
      title: '下单时间',
      dataIndex: 'purchase_date',
      align: 'center',
    },
  ];

  return (
    <div className={styles.contentContainer}>
      <div className={styles.searchContainer}>
        <Form
          form={form}
          initialValues={{
            store_id: store,
            site_id: site,
            keywords: order,
          }}
        >
          <div className={styles.formContainer}>
            <Form.Item name="store_id" style={{ width: 120, marginBottom: 5, marginLeft: 10 }}>
              <Select onChange={(value: number) => onStoreChange(value)}>
                {storeList.map((e: any) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="site_id" style={{ width: 100, marginBottom: 5, marginLeft: 10 }}>
              <Select onChange={(value: number) => setSite(value)}>
                {siteList.map((e: any) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="order" style={{ width: 210, marginBottom: 5, marginLeft: 10 }}>
              <Input.Search placeholder="请输入订单号" allowClear onSearch={handleSearch} />
            </Form.Item>
            <Form.Item name="status" style={{ width: 150, marginBottom: 5, marginLeft: 10 }}>
              <Select
                onChange={(value: string) => setStatus(value)}
                allowClear
                placeholder="请选择订单状态"
              >
                {statusList.map((e: any) => (
                  <Option key={e.value} value={e.value}>
                    {e.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </div>
      <StandardTable
        request={(params: any) =>
          getOrderList({
            ...params,
            filters: {
              store: store,
              site: site,
              order,
              status,
            },
          })
        }
        cref={ref}
        columns={columns}
        bordered
        sticky
        pagination={{ current: 1, pageSize: 20 }}
      />
    </div>
  );
};

export default Order;
