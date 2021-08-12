/*
 * @Author: wjw
 * @Date: 2020-07-20 10:58:46
 * @LastEditTime: 2020-09-15 15:13:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\dataAnylis.js
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Popover, Form, Button, Select, Input, DatePicker, Radio, Cascader } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
// 搜索行
import StandardFormRow from '@/components/StandardFormRow';
// 自定义table hook
import useInitTable from '@/customHook/useInitTable';
// 顶部数据分析
import Statistics from '../Statistics';
// 生产单明细组件
import ProductionOrderDetail from './ProductionOrderDetail';
// Sku明细组件
import SkuDetail from './SkuDetail';

const limitSelectDate = {
  min: moment()
    .month(0)
    .date(1)
    .hours(8)
    .minutes(0)
    .seconds(0)
    .milliseconds(0),
  max: moment(),
};

const DataAnalysis = props => {
  const { dispatch } = props;
  const initTableData = useMemo(
    () => ({ initFilters: { range: [limitSelectDate.min, limitSelectDate.max] } }),
    []
  );
  const {
    pagination,
    setPagination,
    filters,
    setFilters,
    sorter,
    setSorter,
    getTableList,
    handleSearch,
    handleStandardTableChange,
  } = useInitTable(initTableData); // 自定义table hook
  const [currentTab, setCurrentTab] = useState('production'); // 当前tab
  const [dataStatistics, setDataStatistics] = useState({}); // 数据统计信息

  /**
   * @description: tab切换 生产单明细与SkU明细切换的时候触发
   * @param {event} e 事件对象获取value值
   */
  const tabChange = e => {
    setCurrentTab(e.target.value);
    setPagination({ current: 1, pageSize: 20 });
    setSorter({});
  };

  useEffect(() => {
    dispatch({ type: 'category/fetchOptions' });
  }, [dispatch]);

  useEffect(() => {
    /**
     * @description: 获取数据统计
     * @return: void
     */
    const getDataStatistics = () => {
      dispatch({
        type: '_factory/getProductDataStatistics',
        payload: {
          filters,
        },
        callback: data => {
          const {
            total_production_count,
            product_sku_count,
            ahead_finished_rate,
            actual_finished_rate,
            order_count,
            pick_count,
            actual_finished_count,
          } = data;
          setDataStatistics({
            leftData: [
              { name: '生产单总数', value: total_production_count },
              { name: '接单SKU', value: product_sku_count },
              { name: '提前完成率', value: `${Math.round(ahead_finished_rate * 100)}%` },
              { name: '实际完成量占比', value: `${Math.round(actual_finished_rate * 100)}%` },
            ],
            rightData: [
              { name: '下单数量', value: order_count },
              { name: '接单数量', value: pick_count },
              { name: '实际完成量', value: actual_finished_count },
            ],
          });
        },
      });
    };
    getDataStatistics();
  }, [filters, dispatch]);

  const handleExport = () => {
    const {
      form: { validateFieldsAndScroll },
    } = props;
    const type = currentTab === 'production' ? 'productionDetail' : 'productionSkuDetail';
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const dynamic = { ...filters, ...values };
      dispatch({
        type: 'system/createAnExport',
        payload: { type, dynamic },
      });
    });
  };

  /**
   * @description: 渲染头部搜索以及操作
   * @return: { JSX } 返回头部搜索以及操作的DOM树
   */
  const renderSearchForm = () => {
    const {
      form: { getFieldDecorator, validateFieldsAndScroll, resetFields },
      categoryOptions,
    } = props;
    const { RangePicker } = DatePicker;
    const statusList = [
      { key: 0, status: 'create', value: '待生产' },
      { key: 1, status: 'producting', value: '生产中' },
      { key: 2, status: 'finished', value: '生产完成' },
      { key: 3, status: 'cancelled', value: '生产终止' },
    ];
    const content = (
      <>
        <Form.Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('sku')(
            <Input placeholder="单品SKU、工厂SKU搜索" size="small" style={{ width: '100%' }} />
          )}
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('sn')(
            <Input placeholder="需求单号、生产单号搜索" size="small" style={{ width: '100%' }} />
          )}
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('category')(
            <Cascader
              options={categoryOptions}
              style={{ width: '100%' }}
              placeholder="产品线搜索"
            />
          )}
        </Form.Item>
        <Form.Item style={{ marginBottom: 10 }}>
          {getFieldDecorator('status')(
            <Select size="small" allowClear style={{ width: '100%' }} placeholder="状态搜索">
              {statusList.map(item => (
                <Select.Option key={item.key} value={item.status}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Button
          type="primary"
          size="small"
          style={{ marginLeft: 120 }}
          onClick={() => {
            handleSearch('submit', validateFieldsAndScroll);
          }}
        >
          搜索
        </Button>
        <Button
          size="small"
          style={{ marginLeft: 15 }}
          onClick={() => {
            handleSearch('reset', validateFieldsAndScroll, resetFields);
          }}
        >
          重置
        </Button>
      </>
    );
    return (
      <Form layout="inline">
        <StandardFormRow last>
          <Form.Item>
            {getFieldDecorator('range', {
              initialValue: filters.range,
            })(
              <RangePicker
                onChange={dates => {
                  setFilters({ ...filters, range: dates });
                }}
              />
            )}
          </Form.Item>
          <Popover content={content} style={{ width: '70%' }} trigger="click">
            <Button icon="search">过滤</Button>
          </Popover>
        </StandardFormRow>
      </Form>
    );
  };

  return (
    <>
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>{renderSearchForm()}</div>
      <Statistics dataStatistics={dataStatistics} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
        }}
      >
        <Radio.Group value={currentTab} onChange={tabChange} buttonStyle="solid">
          <Radio.Button value="production">生产单明细</Radio.Button>
          <Radio.Button value="sku">SKU明细</Radio.Button>
        </Radio.Group>
        <Button type="primary" onClick={handleExport}>
          导出
        </Button>
      </div>
      <Card style={{ marginTop: '20px' }}>
        {currentTab === 'production' ? (
          <ProductionOrderDetail
            pagination={pagination}
            filters={filters}
            sorter={sorter}
            getTableList={getTableList}
            handleStandardTableChange={handleStandardTableChange}
          />
        ) : (
          <SkuDetail
            pagination={pagination}
            filters={filters}
            getTableList={getTableList}
            handleStandardTableChange={handleStandardTableChange}
          />
        )}
      </Card>
    </>
  );
};
export default connect(({ category: { options: categoryOptions } }) => ({ categoryOptions }))(
  Form.create()(DataAnalysis)
);
