import React, { useEffect, useState, useImperativeHandle, useCallback, useRef } from 'react';
import { AbortController } from 'umi-request';
import { Table } from 'antd';
import { TableProps } from './StandardTable';

const StandardTable: React.FC<TableProps> = (props) => {
  const controller = useRef<any>();
  const {
    rowKey,
    request,
    filters: initFilters,
    sorter: initSorter,
    pagination: initPagination,
    cref,
    paginationConfig,
    children,
    ...rest
  } = props;
  const [pagination, setPagination] = useState<API.Pagination>(initPagination || { current: 1, pageSize: 10 });
  const [tableFilters, setTableFilters] = useState(initFilters);
  const [sorter, setSorter] = useState(initSorter);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);

  // 请求的方法
  const fetchRequest = useCallback(async () => {
    controller.current = new AbortController();
    const { signal } = controller.current;
    setLoading(true);
    const { status, data, total: totalNum } =
      (await request({ ...pagination, tableFilters, sorter, signal })) || {};
    if (status !== 'error') {
      setLoading(false);
      setDataSource(data);
      setTotal(totalNum);
    }
  }, [pagination, tableFilters, sorter]);

  // 发送request请求
  useEffect(() => {
    if (typeof request === 'function') {
      fetchRequest();
    }
    return () => {
      controller?.current?.abort();
    };
  }, [fetchRequest]);

  useEffect(() => {
    if (typeof request !== 'function') {
      setDataSource([]);
      setTotal(0);
      controller?.current?.abort();
    }
  }, [request]);

  // 搜索
  const onSearch = ({
    searchFilters,
    searchSorter,
  }: {
    searchFilters: Record<string, any>;
    searchSorter: Record<string, string>;
  }) => {
    if (searchFilters) {
      setTableFilters(searchFilters);
      setPagination((prePagination) => ({ ...prePagination, current: 1 }));
    }
    if (searchSorter) {
      setSorter(searchSorter);
    }
  };

  // 重置
  const reset = (isOnlyPagination = false) => {
    if (isOnlyPagination === false) {
      setTableFilters(initFilters);
      setSorter(initSorter);
    }
    setPagination((prePagination) => ({ ...prePagination, current: 1 }));
  };

  // 表格变化
  const handleTableChange = (newPagination: any, newFilters: any, newSorter: any, extra: any) => {
    const { action } = extra;
    // pagination发生了变化
    if (action === 'paginate') {
      const { current, pageSize } = newPagination
      setPagination({ current, pageSize });
      return;
    }
    // 只有pagination没发生变化才需要继续往下执行,如果filters发生变化
    if (action === 'filter') {
      setTableFilters(newFilters);
      setPagination({ ...pagination, current: 1 });
      return;
    }
    // 排序发生了变化
    if (action === 'sort') {
      if (newSorter.order !== undefined) {
        setSorter({ [newSorter.field]: newSorter.order });
      } else {
        setSorter(initSorter);
      }
    }
  };

  const showTotal = (totalNum: number) => {
    return `总计：${totalNum}条`;
  };

  let paginationProps

  if (paginationConfig === false) {
    paginationProps = false
  } else {
    paginationProps = {
      size: 'small',
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal,
      total,
      ...pagination,
      ...paginationConfig,
    }
  }

  useImperativeHandle(cref, () => ({
    onSearch,
    reset,
    fetchRequest,
    setDataSource
  }));

  return (
    <>
      {children}
      <Table
        onChange={handleTableChange}
        size="small"
        loading={loading}
        dataSource={dataSource}
        rowKey={rowKey || 'id'}
        pagination={paginationProps}
        {...rest}
      />
    </>

  );
};

export default StandardTable;
