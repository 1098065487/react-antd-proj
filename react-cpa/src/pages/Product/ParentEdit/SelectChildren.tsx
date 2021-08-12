import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Modal, Form, Input, Tag } from 'antd';
import StandardTable from '@/components/StandardTable';
import type { SelectChildProps } from './data.d';
import { getAllChildren } from './service';

// 选择子产品组件
const SelectChildren: React.FC<SelectChildProps> = (props) => {
  // 父组件获取该组件可见状态，默认选中，处理选中值变化，处理组件可见状态变化
  const { store, site, visible, current, handleSelectChange, handleSelectVisible } = props;

  const [form] = Form.useForm();
  const ref: any = useRef();

  // 缓存当前选中，不直接操作默认选中值，通过选中值变化方法传回
  const [select, setSelect] = useState<any>(current);
  // 表格搜索sku
  const [sku, setSku] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (ref.current) {
      ref.current.reset(true);
    }
  }, [sku]);

  // 确认时，将选中值传回，隐藏组件
  const handleConfirm = () => {
    handleSelectChange(select);
    handleSelectVisible(false);
  };

  const handleSearch = () => {
    setSku(form.getFieldValue('sku'));
  };

  // Tag可移除选中状态
  const handleRemoveSelect = (id: number) => {
    const newSelect = select.slice().filter((e: any) => e.id !== id);
    setSelect(newSelect);
  };

  const columns: any[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
    },
  ];

  // 表格选中状态
  const rowSelection = {
    // 表格选中值，根据选中对象数组过滤出number[]
    selectedRowKeys: select.map((e: any) => e.id),
    // 要将整个对象添加到选中状态中，不用onChange
    onSelect: (record: any, selected: boolean, selectedRows: any, nativeEvent: any) => {
      if (selected) {
        // 选中状态添加进select
        const newSelect = select.slice();
        newSelect.push(record);
        setSelect(newSelect);
      } else {
        // 取消状态从select中移除
        const newSelect = select.slice().filter((e: any) => e.id !== record.id);
        setSelect(newSelect);
      }
    },
  };

  return (
    <Modal
      destroyOnClose
      title="选择子产品"
      width={800}
      visible={visible}
      okText="确认"
      onOk={handleConfirm}
      onCancel={() => handleSelectVisible(false)}
    >
      <Row gutter={24}>
        <Col span={13}>
          <Form form={form} initialValues={{ sku }}>
            <Form.Item name="sku" style={{ width: '100%', marginBottom: 5 }}>
              <Input.Search placeholder="sku查询" allowClear onSearch={handleSearch} />
            </Form.Item>
          </Form>
          <StandardTable
            request={(params: any) => getAllChildren({ ...params, filters: { store, site, sku } })}
            columns={columns}
            cref={ref}
            bordered
            paginationConfig={{ pageSize: 10, simple: true }}
            rowSelection={rowSelection}
          />
        </Col>
        <Col span={11}>
          已选择子产品sku：
          <br />
          {select.map((e: any) => {
            return (
              <Tag
                key={e.id}
                color="#87d068"
                style={{ marginBottom: 5 }}
                closable
                onClose={() => handleRemoveSelect(e.id)}
              >
                {e.sku}
              </Tag>
            );
          })}
        </Col>
      </Row>
    </Modal>
  );
};

export default SelectChildren;
