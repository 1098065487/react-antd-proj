import React, { useRef, useState } from 'react';
import { Button, Card, Divider, message, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import StandardTable from '@/components/StandardTable';
import styles from './style.less';
import { getStoreList, removeStore } from './service';
import StoreForm from './StoreForm';

const Store: React.FC<any> = () => {
  const tableRef = useRef<any>();

  // form显隐即当前选中值
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<any>({});

  // 控制form操作
  const handleVisible = (flag: boolean, record: any, refresh?: boolean) => {
    setVisible(flag);
    setCurrent(record);
    // 刷新列表
    if (refresh && tableRef.current) {
      tableRef.current.reset(true);
    }
  };

  // 删除操作
  const handleRemove = async (id: number) => {
    const res = await removeStore(id);
    if (res.status === 'ok') {
      message.success('删除成功！');
      if (tableRef.current) {
        tableRef.current.reset(true);
      }
      return;
    }
    message.error('删除失败！');
    return;
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: '店铺名称',
      dataIndex: 'name',
    },
    {
      title: '站点',
      dataIndex: 'sites',
      render: (_: any, { sites = [] }: any) => {
        if (sites.length !== 0) {
          return sites.map((e: any) => {
            return (
              <Tag color="blue" key={e.id}>
                {e.name}
              </Tag>
            );
          });
        }
      },
    },
    {
      title: '店铺描述',
      dataIndex: 'description',
    },
    {
      title: '健康度',
      dataIndex: 'is_healthy',
      render: (_: any, record: any) => {
        return (
          <Tag color={record.is_healthy ? '#87d068' : '#f50'}>
            {record.is_healthy ? '健康' : '异常'}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_: any, record: any) => (
        <>
          <Button type="primary" size="small" onClick={() => handleVisible(true, record)}>
            <EditOutlined />
          </Button>
          <Divider type="vertical" />
          <Popconfirm
            title="确认删除吗？"
            okText="确认"
            cancelText="取消"
            onConfirm={() => handleRemove(record.id)}
          >
            <Button type="primary" danger size="small">
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Card bodyStyle={{ padding: '10px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <p
          style={{
            fontSize: '22px',
            fontWeight: 500,
            marginRight: 20,
          }}
        >
          店铺管理{' '}
        </p>
        <Button
          type="primary"
          className={styles.startSearch}
          onClick={() => handleVisible(true, {})}
        >
          添加
        </Button>
      </div>
      <StandardTable
        request={(params: any) => getStoreList({ ...params, with: 'sites' })}
        cref={tableRef}
        bordered
        size="default"
        columns={columns}
      />
      {visible ? (
        <StoreForm visible={visible} record={current} handleVisible={handleVisible} />
      ) : null}
    </Card>
  );
};

export default Store;
