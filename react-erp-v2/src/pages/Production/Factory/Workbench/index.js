/*
 * @Author: wjw
 * @Date: 2020-07-20 10:58:32
 * @LastEditTime: 2020-09-14 16:45:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\Workbench\index.js
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Popover,
  Form,
  Button,
  Select,
  Input,
  Row,
  Col,
  DatePicker,
  Modal,
  Menu,
  Dropdown,
  Icon,
} from 'antd';
import { connect } from 'dva';
import { router } from 'umi';
// 防抖 用于下单人过滤搜索
import debounce from 'lodash/debounce';
// 表格公用组件
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
// 自定义table hook
import useInitTable from '@/customHook/useInitTable';
// 顶部数据分析
import Statistics from '../Statistics';
// 新建需求单组件
import AddDemand from '../AddDemand';
// 查看明细组件
import Detail from './Detail';
import style from './index.less';

const Workbench = props => {
  const { listLoading, addDemandLoading, demandList, dispatch } = props;
  const initTableData = useMemo(() => ({}), []);
  const {
    pagination,
    filters,
    getTableList,
    handleStandardTableChange,
    handleSearch,
  } = useInitTable(initTableData); // 自定义table hook
  const [selectedRowList, setSelectedRowList] = useState([]); // 选中的行
  const [newDemandId, setNewDemandId] = useState(); // 新建需求单Id
  const [detail, setDetail] = useState({}); // 当前点击的行
  const [userList, setUserList] = useState([]); // 下单人列表
  const [dataStatistics, setDataStatistics] = useState({}); // 数据统计信息
  const [isShowModal, setIsShowModal] = useState(false); // 新建需求单确认弹框

  useEffect(() => {
    setSelectedRowList([]);
    getTableList({
      dispatch,
      type: '_factory/getDemandList',
      payload: { pagination, filters, sorter: { field: 'order_date', order: 'descend' } },
    });
  }, [pagination, filters, dispatch, getTableList, handleSearch]);

  useEffect(() => {
    /**
     * @description: 获取数据统计
     * @return: void
     */
    const getDataStatistics = () => {
      dispatch({
        type: '_factory/getDemandDataStatistics',
        payload: {},
        callback: data => {
          const {
            new_factory_order_num,
            update_production_num,
            new_factory_order_sku_num,
            new_production_sku_num,
            new_factory_order_product_item_num,
            new_production_item_num,
            new_finished_num,
          } = data;
          setDataStatistics({
            leftData: [
              { name: '本月新增需求单', value: new_factory_order_num },
              { name: '本月有更新的生产单', value: update_production_num },
              {
                name: '本月新增需求单SKU/已接SKU',
                value: `${new_factory_order_sku_num} / ${new_production_sku_num}`,
              },
            ],
            rightData: [
              { name: '本月新增需求单的下单数量', value: new_factory_order_product_item_num },
              { name: '本月新增需求单的接单数量', value: new_production_item_num },
              { name: '本月新增需求单的实际完成量', value: new_finished_num },
            ],
          });
        },
      });
    };
    getDataStatistics();
  }, [dispatch]);

  /**
   * @description: 处理新建导入导出
   * @param {string} type 类型 [id: '仅仅在每条数据后面点击导出按钮才会传入']
   * @return: void
   */
  const handleActions = (type, id = '') => {
    if (type === 'add-demand') {
      dispatch({
        type: '_factory/getNewDemand',
        payload: {},
        callback: sn => {
          setNewDemandId(sn);
        },
      });
    } else if (type === 'import-demand') {
      router.push('/excel/imports/create?type=factory_order_product_item');
    } else if (type === 'import-production') {
      router.push('/excel/imports/create?type=factory_production');
    } else if (type.includes('export')) {
      // 用于判断是需求单导出还是生产单导出
      const exportType = type.split('/')[1];
      const dynamic = {};
      if (id) {
        dynamic.id = id;
      } else {
        dynamic.id = selectedRowList.join();
      }
      dispatch({
        type: 'system/createAnExport',
        payload: { type: exportType, dynamic },
      });
    }
  };

  /**
   * @description: 渲染头部搜索以及操作
   * @return: { JSX } 返回头部搜索以及操作的DOM树
   */
  const renderSearchForm = () => {
    /**
     * @description: 过滤中下单人搜索
     * @param {string} name 下单人名字
     * @return: void
     */
    const searchUser = name => {
      dispatch({
        type: 'user/fetchUsers',
        payload: { filters: { name } },
        callback: res => setUserList(res.body),
      });
    };
    const statusList = [
      { key: 1, status: 'received', value: '已接单' },
      { key: 2, status: 'placed', value: '待接单' },
      { key: 3, status: 'finished', value: '已完成' },
    ];
    const {
      form: { getFieldDecorator, validateFieldsAndScroll, resetFields },
    } = props;
    const { RangePicker } = DatePicker;
    const content = (
      <>
        <Form.Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('range')(<RangePicker size="small" />)}
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          {getFieldDecorator('user_id')(
            <Select
              size="small"
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="下单人搜索"
              filterOption={false}
              onSearch={debounce(searchUser, 500)}
            >
              {userList.map(orderer => (
                <Select.Option key={orderer.value} value={orderer.value}>
                  {orderer.label}
                </Select.Option>
              ))}
            </Select>
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
            {getFieldDecorator('keywords')(
              <Input
                style={{ width: '300px' }}
                placeholder="需求单号、单品SKU、生产单号综合搜索"
                onPressEnter={() => {
                  handleSearch('submit', validateFieldsAndScroll);
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

  // 渲染表格列
  const columns = [
    { title: '需求单号', dataIndex: 'sn' },
    {
      title: '实际完成量/下单数量',
      render: (_, record) =>
        record.factory_qty
          ? `${Math.round((record.finished_qty / record.factory_qty) * 100)}%`
          : '0%',
    },
    {
      title: '实际完成量/接单数量',
      render: (_, record) =>
        record.production_qty
          ? `${Math.round((record.finished_qty / record.production_qty) * 100)}%`
          : '0%',
    },
    { title: '下单SKU量', dataIndex: 'factory_sku' },
    { title: '接单SKU量', dataIndex: 'production_sku' },
    { title: '下单数量', dataIndex: 'factory_qty' },
    { title: '接单数量', dataIndex: 'production_qty' },
    { title: '实际完成量', dataIndex: 'finished_qty' },
    {
      title: '状态',
      dataIndex: 'status_str',
      render: text => {
        let color = '#1890FF';
        if (text === '待接单') {
          color = '#a7a7a7';
        } else if (text === '已完成') {
          color = '#20c5c5';
        }
        return <span style={{ color }}>{text}</span>;
      },
    },
    { title: '下单日期', dataIndex: 'order_date' },
    {
      title: '下单人',
      render: (_, record) => record.user?.name,
    },
    {
      render: (_, record) => {
        const { id } = record;
        const menu = (
          <Menu
            onClick={({ key, domEvent }) => {
              domEvent.stopPropagation();
              handleActions(key, id);
            }}
          >
            <Menu.Item key="export/factoryOrderProduct">
              <span>导出需求单</span>
            </Menu.Item>
            <Menu.Item key="export/factoryOrderStatus">
              <span>导出生产单</span>
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu}>
            <Button>
              管理
              <Icon type="down" />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  // 定义表格选择框
  const rowSelection = {
    onChange: selectedRowKeys => {
      setSelectedRowList(selectedRowKeys);
    },
    selectedRowKeys: selectedRowList,
  };

  return (
    <>
      <Modal
        width="400px"
        centered
        visible={isShowModal}
        onOk={() => {
          setIsShowModal(false);
          handleActions('add-demand');
        }}
        onCancel={() => {
          setIsShowModal(false);
        }}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要新建吗?</p>
      </Modal>
      <Statistics dataStatistics={dataStatistics} />
      <Card bordered={false} style={{ margin: '20px 0' }}>
        <Row type="flex" align="middle" justify="space-between">
          <Col>{renderSearchForm()}</Col>
          <Col>
            <Button
              loading={addDemandLoading}
              type="primary"
              className={style.actions}
              onClick={() => {
                setIsShowModal(true);
              }}
            >
              新建需求单
            </Button>
            <Button
              className={style.actions}
              onClick={() => {
                handleActions('import-demand');
              }}
            >
              导入需求单
            </Button>
            <Button
              className={style.actions}
              disabled={!selectedRowList.length}
              onClick={() => {
                handleActions('export/factoryOrderProduct');
              }}
            >
              导出需求单
            </Button>
            <Button
              className={style.actions}
              onClick={() => {
                handleActions('import-production');
              }}
            >
              导入生产单
            </Button>
            <Button
              className={style.actions}
              disabled={!selectedRowList.length}
              onClick={() => {
                handleActions('export/factoryOrderStatus');
              }}
            >
              导出生产单
            </Button>
          </Col>
        </Row>
        <StandardTable
          style={{ marginTop: '20px' }}
          loading={listLoading}
          columns={columns}
          dataSource={demandList}
          rowSelection={rowSelection}
          onChange={handleStandardTableChange}
          onRow={record => {
            let flag = true;
            let startPosition;
            let timer = null;
            const slowestTime = 150;
            return {
              onClick: () => {
                if (timer) {
                  clearTimeout(timer);
                }
                timer =
                  flag &&
                  setTimeout(() => {
                    const { id, sn } = record;
                    setDetail({ id, sn });
                  }, slowestTime);
                // 需要将flag重新赋值为true
                flag = true;
              },
              onMouseDown: event => {
                // react事件池  出于性能考虑 如需异步访问事件 需要此操作
                event.persist();
                const { pageX, pageY } = event;
                startPosition = { startX: pageX, startY: pageY };
              },
              onMouseUp: event => {
                event.persist();
                const { pageX, pageY } = event;
                const { startX, startY } = startPosition;
                if (startX !== pageX || startY !== pageY) {
                  flag = false;
                }
              },
              onDoubleClick: () => {
                clearTimeout(timer);
              },
            };
          }}
        />
        <AddDemand
          newDemandId={newDemandId}
          setNewDemandId={setNewDemandId}
          getTableList={getTableList}
          dispatch={dispatch}
        />
        <Detail detail={detail} setDetail={setDetail} />
      </Card>
    </>
  );
};

export default connect(({ loading, _factory: { demandList } }) => ({
  demandList,
  listLoading: loading.effects['_factory/getDemandList'],
  addDemandLoading: loading.effects['_factory/getNewDemand'],
}))(Form.create()(Workbench));
