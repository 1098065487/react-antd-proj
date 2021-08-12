import React, { useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import StandardTable from '@/components/StandardTable';
import { getFollowSaleList } from './service';
import styles from './index.less';
import DetailDrawer from './DetailDrawer';

const FollowSale: React.FC = () => {
  const [form] = Form.useForm();
  const ref: any = useRef();

  const [asin, setAsin] = useState<string | undefined>(undefined);
  const [firstLoad, setFirstLoad] = useState(true);

  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<any>();

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    } else {
      if (ref.current) {
        ref.current.reset(true);
      }
    }
  }, [asin]);

  const handleSearch = () => {
    setAsin(form.getFieldValue('asin'));
  };

  const handleDetailClick = (flag: boolean, record: any) => {
    setVisible(flag);
    setCurrent(record);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      align: 'center',
      render: (_: any, record: any) => (
        <a href={record.url} target="_blank">
          {record.asin}
        </a>
      ),
    },
    {
      title: '卖家',
      dataIndex: 'seller',
      align: 'center',
      render: (_: any, record: any) => (
        <a href={record.seller_url} target="_blank">
          {record.seller}
        </a>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      render: (_: any, record: any) => {
        return <a onClick={() => handleDetailClick(true, record)}>详情</a>;
      },
    },
  ];

  return (
    <div className={styles.contentContainer}>
      <div className={styles.searchContainer}>
        <Form
          form={form}
          initialValues={{
            asin: asin,
          }}
        >
          <div className={styles.formContainer}>
            <Form.Item name="asin" style={{ width: 210, marginBottom: 5, marginLeft: 10 }}>
              <Input.Search placeholder="请输入asin" allowClear onSearch={handleSearch} />
            </Form.Item>
          </div>
        </Form>
      </div>
      <StandardTable
        request={(params: any) =>
          getFollowSaleList({
            ...params,
            filters: {
              asin,
            },
            sorter: { updated_at: 'desc' },
          })
        }
        cref={ref}
        columns={columns}
        bordered
        sticky
        pagination={{ current: 1, pageSize: 20 }}
        paginationConfig={{ pageSizeOptions: [10, 20, 50, 100] }}
      />
      <DetailDrawer visible={visible} asinId={current?.id} handleVisible={handleDetailClick} />
    </div>
  );
};

export default FollowSale;
