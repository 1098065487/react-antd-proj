/*
 * @Author: wjw
 * @Date: 2020-09-16 09:24:59
 * @LastEditTime: 2020-09-22 09:58:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Competitor\index.js
 */
import React, { useMemo, useEffect, useRef, useState, lazy, Suspense } from 'react';
import PageLoading from '@/components/PageLoading';
import moment from 'moment';
import debounce from 'lodash/debounce';
import { Popover, Card, Form, Input, Button, DatePicker, Modal, message, Select } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import useInitTable from '@/customHook/useInitTable';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';
import AddProduct from './AddProduct';
import styles from './index.less';

// 星评分布图
const RatingDistributionChart = lazy(() => import('./Charts/RatingDistributionChart'));
// 颜色尺码分布图
const ColorSizeChart = lazy(() => import('./Charts/ColorSizeChart'));
// 评论详情表格
const ReviewDetail = lazy(() => import('./ReviewDetail'));
// 评论,星评,二级分类排名,售价统计图
const LineChart = lazy(() => import('./Charts/LineChart'));
// 评论星评统计图
const RatingProductionChart = lazy(() => import('./Charts/RatingProductionChart'));
// 星评监控图
const StarMonitor = lazy(() => import('./StarMonitor'));

const { RangePicker } = DatePicker;

const limitSelectDate = {
  min: moment().subtract(3, 'months'),
  max: moment().endOf('day'),
};

const Competitor = props => {
  // 星评监控图ref
  const childRef = useRef();
  // 评论、星评统计图ref
  const ratingProductionRef = useRef();
  // 判断是否是初次加载
  const isFirstLoad = useRef(true);
  const isUnMountedRef = useIsUnMountedRef();
  const [isShowAdd, setIsShowAdd] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(''); // 用于删除
  const [watchProductId, setWatchProductId] = useState(''); // 用于看其他数据
  const [dateRange, setDateRange] = useState([]);
  const { brandList, categoryList, competitiveProductList } = props;
  const {
    competitiveProductLoading,
    confirmDeleteLoading,
    searchBrandLoading,
    searchCategoryLoading,
  } = props;
  const { dispatch } = props;
  const initTableData = useMemo(() => ({}), []);
  const {
    pagination,
    setPagination,
    filters,
    sorter,
    getTableList,
    handleSearch,
    handleStandardTableChange,
  } = useInitTable(initTableData);

  // 获取表格列表
  useEffect(() => {
    const firstSetDateRange = list => {
      // 如果是初次渲染
      if (isFirstLoad.current) {
        // 初次渲染过后置为false
        isFirstLoad.current = false;
        if (list.length) {
          setWatchProductId(list[0].id);
          if (list[0].first_review_date !== '0000-00-00' && list[0].first_review_date !== null) {
            // 时区问题 差8小时
            setDateRange([moment(`${list[0].first_review_date} 08:00:00`), limitSelectDate.max]);
          } else {
            setDateRange([limitSelectDate.min, limitSelectDate.max]);
          }
        }
      }
    };
    dispatch({
      type: 'competitor/getCompetitiveProduct',
      payload: { pagination, filters, sorter, with: 'category,brand' },
      callback: firstSetDateRange,
    });
  }, [pagination, filters, dispatch, sorter]);

  // 关闭弹框
  const closeModal = () => {
    setCurrentProductId('');
  };

  // 获取竞品列表数据
  const getData = () => {
    getTableList({
      dispatch,
      type: 'competitor/getCompetitiveProduct',
      payload: { pagination, filters, with: 'category,brand' },
    });
  };

  // 确认删除
  const confirmDeleteProduct = () => {
    dispatch({
      type: 'competitor/deleteCompetitiveProduct',
      payload: {
        productId: currentProductId,
      },
      callback: response => {
        if (!isUnMountedRef.current) {
          const { status } = response;
          if (status === 'ok') {
            // 加入成功把弹框关闭 并重新获取数据
            closeModal();
            getData();
            message.success('删除成功');
          } else {
            message.success('删除失败');
          }
        }
      },
    });
  };

  // 获取品牌列表
  const getBrand = name => {
    dispatch({
      type: 'competitor/getBrand',
      payload: { filters: { name } },
    });
  };

  // 获取分类列表
  const getCategory = name => {
    dispatch({
      type: 'competitor/getCategory',
      payload: { filters: { name } },
    });
  };

  const columns = [
    {
      title: 'ASIN',
      dataIndex: 'asin',
      align: 'center',
      width: '150px',
      fixed: 'left',
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      align: 'center',
      width: '120px',
      render: (_, record) => record?.brand?.name,
    },
    {
      title: '分类',
      dataIndex: 'category',
      align: 'center',
      width: '120px',
      render: (_, record) => record?.category?.name,
    },
    {
      title: <Popover content="近3个月5星评论数量">5星评论</Popover>,
      dataIndex: 'five_star_count',
      align: 'center',
      sorter: true,
      width: '80px',
      sortOrder: sorter.columnKey === 'five_star_count' && sorter.order,
    },
    {
      title: <Popover content="近3个月4星评论数量">4星评论</Popover>,
      dataIndex: 'four_star_count',
      align: 'center',
      sorter: true,
      width: '80px',
      sortOrder: sorter.columnKey === 'four_star_count' && sorter.order,
    },
    {
      title: <Popover content="近3个月3星评论数量">3星评论</Popover>,
      dataIndex: 'three_star_count',
      align: 'center',
      sorter: true,
      width: '80px',
      sortOrder: sorter.columnKey === 'three_star_count' && sorter.order,
    },
    {
      title: <Popover content="近3个月2星评论数量">2星评论</Popover>,
      dataIndex: 'two_star_count',
      align: 'center',
      sorter: true,
      width: '80px',
      sortOrder: sorter.columnKey === 'two_star_count' && sorter.order,
    },
    {
      title: <Popover content="近3个月1星评论数量">1星评论</Popover>,
      dataIndex: 'one_star_count',
      align: 'center',
      sorter: true,
      width: '80px',
      sortOrder: sorter.columnKey === 'one_star_count' && sorter.order,
    },
    {
      title: '历史评论总数',
      dataIndex: 'review_count',
      align: 'center',
      sorter: true,
      width: '120px',
      sortOrder: sorter.columnKey === 'review_count' && sorter.order,
    },
    {
      title: '总评分',
      dataIndex: 'rating',
      align: 'center',
      sorter: true,
      width: '80px',
      sortOrder: sorter.columnKey === 'rating' && sorter.order,
    },
    {
      title: '最新更新时间',
      dataIndex: 'review_date',
      sorter: true,
      width: '150px',
      sortOrder: sorter.columnKey === 'review_date' && sorter.order,
      align: 'center',
    },
    {
      title: '首评时间',
      dataIndex: 'first_review_date',
      align: 'center',
      sorter: true,
      width: '150px',
      sortOrder: sorter.columnKey === 'first_review_date' && sorter.order,
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: '80px',
      render: (_, record) => (
        <span
          onClick={e => {
            e.stopPropagation();
            setCurrentProductId(record.id);
          }}
          style={{ color: '#1890ff', textDecoration: 'underline', cursor: 'pointer' }}
        >
          删除
        </span>
      ),
    },
  ];

  // 渲染搜索表单
  const renderSearch = () => {
    const {
      form: { getFieldDecorator, validateFieldsAndScroll, resetFields },
    } = props;
    return (
      <Form layout="inline">
        <Form.Item>{getFieldDecorator('asin')(<Input placeholder="ASIN搜索" />)}</Form.Item>
        <Form.Item>
          {getFieldDecorator('brand_id')(
            <Select
              loading={searchBrandLoading}
              placeholder="请选择品牌"
              filterOption={false}
              showSearch
              style={{ width: '174px' }}
              onSearch={debounce(getBrand, 1000)}
            >
              {brandList.map(brand => {
                const { id, name } = brand;
                return (
                  <Select.Option value={id} key={id}>
                    {name}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('category_id')(
            <Select
              loading={searchCategoryLoading}
              placeholder="请选择分类"
              filterOption={false}
              showSearch
              style={{ width: '174px' }}
              onSearch={debounce(getCategory, 1000)}
            >
              {categoryList.map(category => {
                const { id, name } = category;
                return (
                  <Select.Option value={id} key={id}>
                    {name}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              handleSearch('submit', validateFieldsAndScroll);
            }}
          >
            查询
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              handleSearch('reset', validateFieldsAndScroll, resetFields);
            }}
          >
            重置
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              setIsShowAdd(true);
            }}
          >
            新建
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 点击表格行元素
  const handleClickRow = (id, first_review_date) => {
    childRef.current.setPagination({ current: 1, pageSize: 10 });
    ratingProductionRef.current.setSorter({});
    setWatchProductId(id);
    if (first_review_date !== '0000-00-00' && first_review_date !== null) {
      // 时区问题 差8小时
      setDateRange([moment(`${first_review_date} 08:00:00`), limitSelectDate.max]);
    } else {
      setDateRange([limitSelectDate.min, limitSelectDate.max]);
    }
  };

  return (
    <PageHeaderWrapper title="竞品监测">
      <AddProduct
        isShowAdd={isShowAdd}
        setIsShowAdd={setIsShowAdd}
        setPagination={setPagination}
        pagination={pagination}
      />
      <div style={{ display: 'flex' }}>
        <div style={{ width: 'calc(50% - 10px)', marginRight: '20px' }}>
          {/* 顶部asin表格 */}
          <Card bodyStyle={{ padding: '6px 10px 10px' }}>
            <div style={{ marginBottom: '5px' }}>{renderSearch()}</div>
            <StandardTable
              scroll={{ x: '1370px' }}
              onChange={handleStandardTableChange}
              columns={columns}
              dataSource={competitiveProductList}
              loading={competitiveProductLoading}
              onRow={record => {
                let flag = true;
                let startPosition;
                const { id, first_review_date } = record;
                return {
                  onClick: () => {
                    if (flag) {
                      handleClickRow(id, first_review_date);
                    }
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
                };
              }}
            />
            <Modal
              width="400px"
              centered
              confirmLoading={confirmDeleteLoading}
              visible={!!currentProductId}
              onOk={confirmDeleteProduct}
              onCancel={closeModal}
              okText="确认"
              cancelText="取消"
            >
              <p>确定要删除吗?</p>
            </Modal>
          </Card>

          {/* 时间跨度以及饼图 */}
          <div style={{ marginTop: '20px', display: 'flex' }}>
            <div className={styles.leftMiddle} style={{ position: 'relative' }}>
              <h4>时间跨度</h4>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  padding: '0 10px',
                  transform: 'translateY(-50%)',
                }}
              >
                <RangePicker
                  allowClear={false}
                  value={dateRange}
                  onChange={(dates, datesString) => {
                    const [startTime, endTime] = datesString;
                    setDateRange([moment(`${startTime} 08:00:00`), moment(`${endTime} 08:00:00`)]);
                  }}
                />
              </div>
            </div>
            <div className={styles.leftMiddle} style={{ margin: '0 5%' }}>
              <h4>星评分布</h4>
              <Suspense fallback={<PageLoading />}>
                <RatingDistributionChart dateRange={dateRange} watchProductId={watchProductId} />
              </Suspense>
            </div>
            <div className={styles.leftMiddle}>
              <h4>颜色尺码组合分布</h4>
              <Suspense fallback={<PageLoading />}>
                <ColorSizeChart dateRange={dateRange} watchProductId={watchProductId} />
              </Suspense>
            </div>
          </div>

          {/* 评论详情 */}
          <Suspense fallback={null}>
            <ReviewDetail dateRange={dateRange} watchProductId={watchProductId} />
          </Suspense>
        </div>

        <div style={{ width: '50%' }}>
          {/* 评论,星评,二级分类排名,售价统计图 */}
          <Suspense fallback={<PageLoading />}>
            <LineChart dateRange={dateRange} watchProductId={watchProductId} />
          </Suspense>
          <div style={{ margin: '20px 0' }}>
            {/* 评论、星评统计 */}
            <Suspense fallback={<PageLoading />}>
              <RatingProductionChart
                cref={ratingProductionRef}
                dateRange={dateRange}
                watchProductId={watchProductId}
              />
            </Suspense>
          </div>
          {/* 星评监控 */}
          <Suspense fallback={<PageLoading />}>
            <StarMonitor cref={childRef} dateRange={dateRange} watchProductId={watchProductId} />
          </Suspense>
        </div>
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(
  ({ competitor: { competitiveProductList, brandList, categoryList }, loading }) => ({
    brandList,
    categoryList,
    competitiveProductList,
    competitiveProductLoading: loading.effects['competitor/getCompetitiveProduct'],
    confirmDeleteLoading: loading.effects['competitor/deleteCompetitiveProduct'],
    searchBrandLoading: loading.effects['competitor/getBrand'],
    searchCategoryLoading: loading.effects['competitor/getCategory'],
  })
)(Form.create()(Competitor));
