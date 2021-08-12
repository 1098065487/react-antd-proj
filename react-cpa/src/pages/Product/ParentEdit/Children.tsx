import React, { Fragment, useState } from 'react';
import { Table, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import SelectChildren from './SelectChildren';
import type { ChildrenProps, ChildList } from './data.d';

// 表单子产品项组件
const Children: React.FC<ChildrenProps> = (props) => {
  // 父组件传入默认的子产品列表，子产品变化方法，由于有更深一层选择子产品组件，默认和处理方法直接下传
  const { store, site, data, handleChange } = props;

  // 深层子产品选择组件可见状态
  const [selectVisible, setSelectVisible] = useState(false);

  // 列表中删除子产品，改变后传回上层组件
  const handleDelete = (record: ChildList) => {
    const list = data.slice();
    const newList = list.filter((e: any) => e.id !== record.id);
    handleChange(newList);
  };

  // 深层子产品选择组件显隐方法
  const handleSelectVisible = (flag: boolean) => {
    setSelectVisible(flag);
  };

  const columns: any[] = [
    {
      title: 'id',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      render: (_: any, record: ChildList) => {
        return (
          <Button type="primary" danger size="small" onClick={() => handleDelete(record)}>
            <DeleteOutlined />
          </Button>
        );
      },
    },
  ];

  return (
    <Fragment>
      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ y: 420 }}
        footer={() => <Button onClick={() => handleSelectVisible(true)}>添加子产品</Button>}
      />
      {selectVisible ? (
        <SelectChildren
          store={store}
          site={site}
          visible={selectVisible}
          current={data}
          handleSelectChange={handleChange}
          handleSelectVisible={handleSelectVisible}
        />
      ) : null}
    </Fragment>
  );
};

export default Children;
