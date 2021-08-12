import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Form, Steps, Card, Input, Button, List, Row, Col, Cascader, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'dva';
import useIsUnMountedRef from '@/customHook/useIsUnMountedRef';
import styles from './index.less';

const { Step } = Steps;
const statusList = [
  '已下单',
  '备货中',
  '提交物流',
  '离岸(已发货)',
  '到亚马逊仓(已发货)',
  '正在接受中(已发货)',
  '已入库(已发货)',
  '接收异常(已发货)',
];

const Statistics = props => {
  const scrollRef = useRef(null);
  const isUnMountedRef = useIsUnMountedRef();
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });
  const [statisticsList, setStatisticsList] = useState([]);
  const [sumData, setSumData] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const { dispatch, categoryOptions, platformTree } = props;

  //   获取平台及产品线
  useEffect(() => {
    dispatch({ type: 'platform/fetchTree' }); // 获取平台
    dispatch({ type: 'category/fetchOptions' }); // 获取产品线
  }, [dispatch]);

  // 获取统计列表
  const fetchList = useCallback(() => {
    setFetchLoading(true);
    dispatch({
      type: 'allocation/getStatisticsList',
      payload: {
        with: 'sellerItem,product.category,product.platform',
        pagination,
        filters,
      },
      callback: response => {
        if (!isUnMountedRef.current) {
          const {
            body: { data, total },
          } = response;
          if (!data.length && pagination.current !== 1) {
            setHasMore(false);
          } else if (pagination.current === 1) {
            setStatisticsList(data);
            setSumData(total);
          } else {
            setStatisticsList(preList => [...preList, ...data]);
            if (Object.keys(sumData).length) {
              const newData = { ...sumData };
              Object.keys(newData).forEach(item => {
                if (item === 'statuses') {
                  Object.keys(newData[item]).forEach(status => {
                    newData[item][status] += total[item][status];
                  });
                } else {
                  newData[item] += total[item];
                }
              });
              setSumData(newData);
            } else {
              setSumData(total);
            }
          }
          setFetchLoading(false);
        }
      },
    });
  }, [dispatch, filters, pagination]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 处理搜索
  const handleSearch = (searchType, validateFieldsAndScroll, resetFields) => {
    scrollRef.current.scrollIntoView();
    setPagination({ current: 1, pageSize: 50 });
    setHasMore(true);
    if (searchType === 'submit') {
      validateFieldsAndScroll((err, values) => {
        if (err) {
          return;
        }
        setFilters(preFilters => ({ ...preFilters, ...values }));
      });
    } else if (searchType === 'reset') {
      resetFields();
      setFilters({});
    }
  };

  // 重置
  const reset = () => {
    const {
      form: { validateFieldsAndScroll, resetFields },
    } = props;
    handleSearch('reset', validateFieldsAndScroll, resetFields);
  };

  const exportList = () => {
    const {
      form: { validateFieldsAndScroll },
    } = props;
    let dynamic = {};
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      dynamic = { ...values };
    });
    dispatch({
      type: 'system/createAnExport',
      payload: {
        type: 'transfer_statistics',
        dynamic,
      },
    });
  };

  // 渲染搜索
  const renderSearch = () => {
    const {
      form: { getFieldDecorator, validateFieldsAndScroll },
    } = props;
    return (
      <Form
        layout="inline"
        style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end' }}
      >
        <Form.Item>
          {getFieldDecorator('keyword')(<Input placeholder="平台、可售SKU搜索" />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('platform')(
            <Cascader options={platformTree} placeholder="平台选择" />
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('category')(
            <Cascader options={categoryOptions} placeholder="产品线选择" />
          )}
        </Form.Item>
        <Form.Item style={{ marginRight: 0 }}>
          <Button
            style={{ marginLeft: 8 }}
            type="primary"
            htmlType="submit"
            onClick={() => {
              handleSearch('submit', validateFieldsAndScroll);
            }}
          >
            搜索
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={reset}>
            重置
          </Button>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={exportList}>
            导出
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 渲染List Header
  const renderListHeader = () => {
    return (
      <Row
        gutter={16}
        style={{
          width: '100%',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        <Col span={2}>平台SKU</Col>
        <Col span={2}>可售SKU</Col>
        <Col span={1}>平台</Col>
        <Col span={1}>产品线</Col>
        <Col span={1}>需求</Col>
        <Col span={1}>下单</Col>
        <Col span={1}>实际发货</Col>
        <Col span={12}>
          <Steps progressDot current={null} size="small">
            {statusList.map((value, index) => {
              // eslint-disable-next-line react/no-array-index-key
              return <Step key={index} title={value} />;
            })}
          </Steps>
        </Col>
        <Col span={1}>Inbound</Col>
        <Col span={1}>Reserved</Col>
        <Col span={1}>Fulfillable</Col>
      </Row>
    );
  };

  // 渲染List Footer
  const renderListFooter = () => {
    const {
      need_quantity,
      quantity,
      true_quantity,
      statuses,
      inbound_qty,
      reserved_qty,
      total_qty,
    } = sumData;
    const footer =
      statuses?.length === undefined && statuses ? (
        <Row
          gutter={16}
          style={{
            width: '100%',
            height: '40px',
            lineHeight: '40px',
            borderTop: '1px solid #e8e8e8',
          }}
        >
          <Col span={2}>本页合计</Col>
          <Col span={2} />
          <Col span={1} />
          <Col span={1} />
          <Col span={1}>{need_quantity}</Col>
          <Col span={1}>{quantity}</Col>
          <Col span={1}>{true_quantity}</Col>
          <Col span={12}>
            <Row>
              {Object.keys(statuses).map(status => {
                return (
                  <Col span={3} key={status} style={{ textAlign: 'center' }}>
                    {statuses[status]}
                  </Col>
                );
              })}
            </Row>
          </Col>
          <Col span={1}>{inbound_qty}</Col>
          <Col span={1}>{reserved_qty}</Col>
          <Col span={1}>{total_qty}</Col>
        </Row>
      ) : null;
    return footer;
  };

  return (
    <Card>
      {renderSearch()}
      <Spin spinning={fetchLoading}>
        <div
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          <header style={{ width: '2300px' }}>{renderListHeader()}</header>
          <div
            style={{ overflowY: 'auto', width: '2300px', overflowX: 'hidden' }}
            className={styles.hideScroll}
          >
            {/* 用于滚动到最顶部 */}
            <div ref={scrollRef} />
            <InfiniteScroll
              threshold={20}
              initialLoad={false}
              pageStart={0}
              loadMore={() => {
                setFetchLoading(true);
                setPagination({ current: pagination.current + 1, pageSize: 50 });
              }}
              hasMore={!fetchLoading && hasMore}
              useWindow={false}
              style={{ maxHeight: '700px' }}
            >
              <List
                dataSource={statisticsList}
                renderItem={item => {
                  const {
                    id,
                    platform_sku,
                    seller_item,
                    product,
                    need_quantity,
                    quantity,
                    true_quantity,
                    statuses,
                    inbound_qty,
                    reserved_qty,
                    total_qty,
                  } = item;
                  const seller_item_sku = seller_item?.sku;
                  const platform_name = product?.platform?.name;
                  const category_name = product?.category?.name;
                  return (
                    <List.Item key={id}>
                      <Row gutter={16} style={{ width: '100%' }} type="flex" align="middle">
                        <Col span={2}>{platform_sku}</Col>
                        <Col span={2}>{seller_item_sku}</Col>
                        <Col span={1}>{platform_name}</Col>
                        <Col span={1}>{category_name}</Col>
                        <Col span={1}>{need_quantity}</Col>
                        <Col span={1}>{quantity}</Col>
                        <Col span={1}>{true_quantity}</Col>
                        <Col span={12}>
                          <Row>
                            {Object.keys(statuses).map(status => {
                              if (statuses[status] instanceof Array) {
                                return <Col key={status} span={3} />;
                              }
                              if (typeof statuses[status] === 'number') {
                                return (
                                  <Col span={3} key={status}>
                                    {statuses[status]}
                                  </Col>
                                );
                              }
                              return (
                                <Col
                                  span={3}
                                  key={status}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {Object.keys(statuses[status]).map(allocation => {
                                    return (
                                      <span
                                        key={allocation}
                                        style={{
                                          display: 'inline-block',
                                          width: '100%',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {`${statuses[status][allocation]}*${allocation}`}
                                      </span>
                                    );
                                  })}
                                </Col>
                              );
                            })}
                          </Row>
                        </Col>
                        <Col span={1}>{inbound_qty}</Col>
                        <Col span={1}>{reserved_qty}</Col>
                        <Col span={1}>{total_qty}</Col>
                      </Row>
                    </List.Item>
                  );
                }}
              />
            </InfiniteScroll>
          </div>

          <footer style={{ width: '2300px' }}>{renderListFooter()}</footer>
        </div>
      </Spin>
    </Card>
  );
};

export default connect(
  ({ category: { options: categoryOptions }, platform: { platformTree } }) => ({
    categoryOptions,
    platformTree,
  })
)(Form.create()(Statistics));
