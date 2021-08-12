/*
 * @Author: wjw
 * @Date: 2020-09-25 17:11:45
 * @LastEditTime: 2020-10-27 13:57:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Storage\Allocation\AllocationTab\DemandDetail\index.js
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Row, Col, Empty, Spin, Popover } from 'antd';
import { connect } from 'dva';
import styles from './index.less';

const DemandDetail = props => {
  const { dispatch, currentDemandId, demandDetail, loading, currentAllocationType } = props;
  const [keyword, setKeyword] = useState('');
  const [fba_code, setFbaCode] = useState('');
  const [filters, setFilters] = useState({});
  const [isMatch, setIsMatch] = useState(true);
  const currentDemandIdRef = useRef(currentDemandId);

  useEffect(() => {
    currentDemandIdRef.current = currentDemandId;
    // 获取详情
    const getDemandDetail = () => {
      if (currentDemandId) {
        dispatch({
          type: 'allocation/getDemandDetail',
          payload: {
            id: currentDemandId,
            filters,
          },
          callback: id => setIsMatch(id === currentDemandIdRef.current),
        });
      }
    };
    if (currentDemandId) {
      getDemandDetail();
    }
  }, [dispatch, currentDemandId, filters]);

  // 导出需求单详情
  const exportDemandDetail = () => {
    dispatch({
      type: 'system/createAnExport',
      payload: {
        type: 'transfer_detail_and_insufficiency',
        dynamic: { id: currentDemandId, ...{ keyword, fba_code } },
      },
    });
  };

  // 搜索
  const handleSearch = () => {
    setFilters(preFilters => ({ ...preFilters, keyword, fba_code }));
  };

  // 重置
  const reset = () => {
    setKeyword('');
    setFbaCode('');
    setFilters({});
  };

  // 渲染详情搜索
  const renderSearch = () => {
    return (
      <div>
        <Input
          placeholder="平台，可售SKU搜索"
          style={{ width: '174px' }}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <Input
          placeholder="FBA码搜索"
          style={{ width: '174px', marginLeft: '10px' }}
          value={fba_code}
          onChange={e => setFbaCode(e.target.value)}
        />
        <Button type="primary" style={{ marginLeft: 8 }} onClick={handleSearch}>
          搜索
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={reset}>
          重置
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={exportDemandDetail}>
          导出
        </Button>
      </div>
    );
  };

  // 根据调拨单数量设置宽度
  const setWidth = () => {
    let width;
    if (demandDetail.type) {
      const { length } = Object.keys(demandDetail.type);
      if (length === 1 || 0) {
        width = '100%';
      } else if (length === 2) {
        width = '130%';
      } else if (length === 3) {
        width = '180%';
      }
    }
    return width;
  };

  // 根据调拨单类型设置列宽
  const setColSpan = item => {
    const { length: typeLength } = Object.keys(demandDetail.type);
    let spanLength;
    if (typeLength === 1) {
      spanLength = 16;
    } else if (typeLength === 2) {
      if (Object.keys(demandDetail.type).indexOf('CN') !== -1) {
        spanLength = item === 'CN' ? 9 : 7;
      } else {
        spanLength = 8;
      }
    } else if (typeLength === 3) {
      spanLength = item === 'CN' ? 6 : 5;
    }
    return spanLength;
  };

  return (
    <Card bodyStyle={{ padding: '10px' }} style={{ marginTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <h4
          style={{
            fontWeight: '600',
            fontSize: '18px',
            color: 'rgba(0,0,0,0.75)',
            marginBottom: '0',
          }}
        >
          详情
        </h4>
        {renderSearch()}
      </div>

      {demandDetail?.data?.length && isMatch ? (
        <Spin spinning={loading === undefined ? false : loading}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ width: setWidth() }} className="detailWrap">
              <Row
                gutter={8}
                style={{
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #e8e8e8',
                }}
                type="flex"
              >
                <Col span={1}>平台SKU</Col>
                <Col span={1}>可售SKU</Col>
                <Col span={1}>需求数</Col>
                <Col span={1}>下单数</Col>
                <Col span={1} style={{ borderRight: '1px solid rgb(232, 232, 232)' }}>
                  实际发货数
                </Col>
                {demandDetail.type &&
                  Object.keys(demandDetail.type).map(item => {
                    const spanLength = setColSpan(item);
                    return (
                      <Col
                        span={spanLength}
                        key={item}
                        style={{
                          display: 'flex',
                          alignItems: 'inherit',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                        className={item === currentAllocationType ? styles.choosedBgc : ''}
                      >
                        <span>{demandDetail.type[item]}</span>
                        <Row gutter={8} type="flex">
                          <Col span={item === 'CN' ? 2 : 3}>下单数</Col>
                          <Col span={item === 'CN' ? 3 : 3}>实际发货数</Col>
                          <Col
                            span={item === 'CN' ? 5 : 0}
                            style={{
                              display: item === 'CN' ? 'flex' : 'none',
                            }}
                          >
                            单品组合
                          </Col>
                          <Col span={item === 'CN' ? 4 : 5}>FBA货件码</Col>
                          <Col span={item === 'CN' ? 4 : 5}>FBA地址</Col>
                          <Col span={item === 'CN' ? 6 : 8}>备注</Col>
                        </Row>
                      </Col>
                    );
                  })}
                <Col span={1}>可售缺口</Col>
                <Col span={2}>单品缺口</Col>
              </Row>
              <div
                style={{ overflowY: 'auto', maxHeight: '550px', overflowX: 'hidden' }}
                className={styles.hideScroll}
              >
                {demandDetail.data.map(item => {
                  const {
                    platform_product_item_id,
                    platform_product_item_sku,
                    seller_product_item_sku,
                    need_quantity,
                    order_quantity,
                    true_quantity,
                    seller_insufficiency_quantity,
                    product_insufficiency_quantity,
                    items,
                  } = item;
                  return (
                    <Row
                      gutter={8}
                      type="flex"
                      key={platform_product_item_id}
                      style={{ borderBottom: '1px solid rgb(232, 232, 232)' }}
                    >
                      <Col span={1} style={{ wordBreak: 'break-all' }}>
                        {platform_product_item_sku}
                      </Col>
                      <Col span={1} style={{ wordBreak: 'break-all' }}>
                        {seller_product_item_sku}
                      </Col>

                      <Col span={1}>{need_quantity}</Col>
                      <Col span={1}>{order_quantity}</Col>
                      <Col span={1} style={{ borderRight: '1px solid rgb(232, 232, 232)' }}>
                        {true_quantity}
                      </Col>
                      {items &&
                        Object.keys(items).map(allocation => {
                          const spanLength = setColSpan(allocation);
                          const {
                            // eslint-disable-next-line no-shadow
                            order_quantity,
                            // eslint-disable-next-line no-shadow
                            true_quantity,
                            fba_code: fbaCode,
                            fba_address,
                            remark,
                            products,
                          } = items[allocation];
                          return (
                            <Col
                              span={spanLength}
                              key={allocation}
                              style={{
                                display: 'flex',
                                alignItems: 'inherit',
                                justifyContent: 'center',
                                flexDirection: 'column',
                              }}
                              className={
                                allocation === currentAllocationType ? styles.choosedBgc : ''
                              }
                            >
                              <Row gutter={8} type="flex">
                                <Col span={allocation === 'CN' ? 2 : 3}>{order_quantity}</Col>
                                <Col span={allocation === 'CN' ? 3 : 3}>{true_quantity}</Col>
                                <Col
                                  span={allocation === 'CN' ? 5 : 0}
                                  style={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    display: allocation === 'CN' ? 'flex' : 'none',
                                  }}
                                >
                                  {products &&
                                    Object.keys(products).map(product => {
                                      return (
                                        <p key={product}>
                                          {product}: {products[product]}
                                        </p>
                                      );
                                    })}
                                </Col>
                                <Col
                                  span={allocation === 'CN' ? 4 : 5}
                                  style={{ wordBreak: 'break-all' }}
                                >
                                  {fbaCode}
                                </Col>
                                <Col
                                  span={allocation === 'CN' ? 4 : 5}
                                  style={{ wordBreak: 'break-all' }}
                                >
                                  {fba_address}
                                </Col>
                                <Col span={allocation === 'CN' ? 6 : 8}>
                                  <Popover content={remark} className={styles.popWrap}>
                                    <span
                                      style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        width: '100%',
                                      }}
                                    >
                                      {remark}
                                    </span>
                                  </Popover>
                                </Col>
                              </Row>
                            </Col>
                          );
                        })}
                      <Col span={1}>{seller_insufficiency_quantity}</Col>
                      <Col span={2} style={{ flexDirection: 'column', justifyContent: 'center' }}>
                        {Object.keys(product_insufficiency_quantity).map(gapName => {
                          return (
                            <p key={gapName}>
                              {gapName}: {product_insufficiency_quantity[gapName]}
                            </p>
                          );
                        })}
                      </Col>
                    </Row>
                  );
                })}
              </div>
              <Row gutter={8} type="flex">
                <Col span={2}>本页合计</Col>
                <Col span={1}>{demandDetail.total.need_quantity}</Col>
                <Col span={1}>{demandDetail.total.order_quantity}</Col>
                <Col span={1} style={{ borderRight: '1px solid rgb(232, 232, 232)' }}>
                  {demandDetail.total.true_quantity}
                </Col>
                {demandDetail?.total?.items &&
                  Object.keys(demandDetail.total.items).map(item => {
                    const spanLength = setColSpan(item);
                    const colLength = item === 'CN' ? 2 : 3;
                    return (
                      <Col
                        span={spanLength}
                        key={item}
                        style={{
                          display: 'flex',
                          alignItems: 'inherit',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                        className={item === currentAllocationType ? styles.choosedBgc : ''}
                      >
                        <Row gutter={8} type="flex">
                          <Col span={colLength}>
                            {demandDetail.total.items[item].order_quantity}
                          </Col>
                          <Col span={24 - colLength}>
                            {demandDetail.total.items[item].true_quantity}
                          </Col>
                        </Row>
                      </Col>
                    );
                  })}
                <Col span={1}>{demandDetail.total.seller_insufficiency_quantity}</Col>
                <Col span={2}>{demandDetail.total.product_insufficiency_quantity}</Col>
              </Row>
            </div>
          </div>
        </Spin>
      ) : (
        <Spin spinning={loading === undefined ? false : loading}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Spin>
      )}
    </Card>
  );
};

export default connect(({ loading, allocation: { demandDetail } }) => ({
  loading: loading.effects['allocation/getDemandDetail'],
  demandDetail,
}))(DemandDetail);
