/*
 * @Author: wjw
 * @Date: 2020-09-01 17:57:56
 * @LastEditTime: 2020-09-23 10:17:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\Matched.js
 */
import React, { useMemo, useEffect, useImperativeHandle, useRef } from 'react';
import { connect } from 'dva';
import useInitTable from '@/customHook/useInitTable';
import { Menu, Dropdown, Button, Icon, Popover } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import CommonMatched from '../../CommonMatched';

const InflowStorages = [
  { id: '1', value: 'total' },
  { id: '2', value: 'LB' },
  { id: '3', value: 'LG' },
  { id: '4', value: 'CN' },
];

const InflowStoragesRowHeader = {
  key: 'InflowStoragesRowHeader',
  title: '仓库',
  align: 'center',
  width: '100px',
  render: () => (
    <ul className={styles.tableUl}>
      <li className={styles.tableLi}>仓库sku</li>
      <li className={styles.tableLi}>库存</li>
      <li className={styles.tableLi}>订单锁库</li>
      <li className={styles.tableLi}>调拨锁库</li>
      <li className={styles.tableLi}>合计</li>
    </ul>
  ),
};

const Matched = props => {
  const childRef = useRef();
  const { loading, dispatch, searchSku, list, cref } = props;

  const initTableData = useMemo(() => ({}), []);
  const {
    pagination,
    setPagination,
    filters,
    setFilters,
    getTableList,
    handleStandardTableChange,
  } = useInitTable(initTableData);

  // 获取表格列表
  useEffect(() => {
    getTableList({
      dispatch,
      type: 'storage/getMatchedSingleItem',
      payload: { pagination, filters },
    });
  }, [pagination, filters, dispatch, getTableList]);

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    startSearch: childRef?.current?.startSearch,
    category: filters.category,
  }));

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
      width: '150px',
    },
    {
      title: '产品线',
      dataIndex: 'category',
      width: '100px',
      render: (_, record) => record.category_name,
      filters: childRef?.current?.getFilterCategoryOptions(),
      filteredValue: filters.category || [],
      align: 'center',
    },
    {
      title: '自有仓库',
      align: 'center',
      dataIndex: 'InflowStorage',
      children: [
        InflowStoragesRowHeader,
        ...InflowStorages.map(storage => {
          const { id, value } = storage;
          return {
            key: id + value,
            title: value,
            align: 'center',
            width: value === 'total' ? '100px' : '250px',
            render: (_, record) => {
              const { sku, quantity, order_quantity, transfer_quantity, total_quantity } =
                record.self_storage?.[value] || {};
              return (
                <ul className={classNames(styles.tableUl)}>
                  {sku ? (
                    <Popover content={<div className={styles.popWrap}>{sku}</div>}>
                      <li
                        className={classNames(styles.tableLi, styles.ellipsis, {
                          [styles.tableTotalLi]: value === 'total',
                        })}
                      >
                        {sku}
                      </li>
                    </Popover>
                  ) : (
                    <li
                      className={classNames(styles.tableLi, styles.ellipsis, {
                        [styles.tableTotalLi]: value === 'total',
                      })}
                    >
                      {sku}
                    </li>
                  )}
                  <li className={styles.tableLi}>{quantity}</li>
                  <li className={styles.tableLi}>{order_quantity}</li>
                  <li className={styles.tableLi}>{transfer_quantity}</li>
                  <li className={styles.tableLi}>{total_quantity}</li>
                </ul>
              );
            },
          };
        }),
      ],
    },
    {
      title: '生产中',
      dataIndex: 'production_quantity',
      align: 'center',
      width: '100px',
    },
    {
      title: '操作',
      dataIndex: 'options',
      align: 'center',
      render: (_, record) => {
        const { id } = record;
        const menu = (
          <Menu
            onClick={({ key }) => {
              childRef.current.handleManage({ key, id });
            }}
          >
            <Menu.Item key="edit">
              <span>编辑</span>
            </Menu.Item>
            <Menu.Item key="empty">
              <span>清空关系</span>
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

  return (
    <>
      <CommonMatched
        scroll={
          window.outerWidth > 1920
            ? null
            : {
                y: '700px',
                scrollToFirstRowOnChange: true,
              }
        }
        whichComponent="SingleItem"
        pagination={pagination}
        setPagination={setPagination}
        filters={filters}
        setFilters={setFilters}
        getTableList={getTableList}
        handleStandardTableChange={handleStandardTableChange}
        columns={columns}
        list={list}
        loading={loading}
        cref={childRef}
        searchSku={searchSku}
      />
    </>
  );
};

export default connect(({ loading, storage: { singleItemList: list } }) => ({
  list,
  loading: loading.effects['storage/getMatchedSingleItem'],
}))(Matched);
