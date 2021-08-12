/*
 * @Author: wjw
 * @Date: 2020-09-01 17:58:05
 * @LastEditTime: 2020-09-17 10:45:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Inventory\Vendibility\UnMatch.js
 */
import React, { useEffect, useMemo, useImperativeHandle, useRef } from 'react';
import { connect } from 'dva';
import useInitTable from '@/customHook/useInitTable';
import CommonUnMatch from '../../CommonUnMatch';

const storages = [];

const CNUnMatch = props => {
  const childRef = useRef();
  const { loading, dispatch, list, searchSku, cref } = props;
  const initTableData = useMemo(
    () => ({
      initFilters: { is_match: 'no' },
    }),
    []
  );
  const {
    pagination,
    setPagination,
    filters,
    setFilters,
    getTableList,
    handleStandardTableChange,
  } = useInitTable(initTableData); // 自定义table hook

  const saveCallback = () => {
    childRef.current.setSelectedRowList([]);
    setPagination({ ...pagination, current: 1 });
  };

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    startSearch: childRef?.current?.startSearch,
  }));

  // 获取表格列表
  useEffect(() => {
    childRef.current.setSelectedRowList([]);
    getTableList({
      dispatch,
      type: 'storage/getCNUnMatched',
      payload: { pagination, filters },
    });
  }, [pagination, filters, dispatch, getTableList]);

  return (
    <>
      <CommonUnMatch
        witchComponent="singleItem_cn"
        saveCallback={saveCallback}
        cref={childRef}
        searchSku={searchSku}
        list={list}
        loading={loading}
        storages={storages}
        pagination={pagination}
        setPagination={setPagination}
        filters={filters}
        setFilters={setFilters}
        handleStandardTableChange={handleStandardTableChange}
      />
    </>
  );
};

export default connect(({ loading, storage: { cnUnMatched: list } }) => ({
  loading: loading.effects['storage/getCNUnMatched'],
  list,
}))(CNUnMatch);
