/*
 * @Author: wjw
 * @Date: 2020-08-06 09:33:33
 * @LastEditTime: 2020-09-16 14:18:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\ReviewOverview\index.js
 */

import React, { useState, Suspense, lazy, useRef } from 'react';
import { connect } from 'dva';
import { DatePicker, Button, Card } from 'antd';
import PageLoading from '@/components/PageLoading';
import moment from 'moment';

const defaultCurrent = 1;
const defaultPageSize = 10;
const TrendChart = lazy(() => import('../Charts/TrendChart'));
const RatingDistributionChart = lazy(() => import('../Charts/RatingDistributionChart'));
const ColorSizeChart = lazy(() => import('../Charts/ColorSizeChart'));
const RatingProductionChart = lazy(() => import('../Charts/RatingProductionChart'));
const StarMonitor = lazy(() => import('./StarMonitor'));
const { RangePicker } = DatePicker;

const limitSelectDate = {
  min: moment().subtract(3, 'months'),
  max: moment(),
};

const ReviewOverview = props => {
  const childRef = useRef();
  const { currentId, currentSku } = props;

  const [dateRange, setDateRange] = useState([limitSelectDate.min, limitSelectDate.max]);
  const [filters, setFilters] = useState({ range: [limitSelectDate.min, limitSelectDate.max] });

  const reset = () => {
    childRef.current.setPagination({
      current: defaultCurrent,
      pageSize: defaultPageSize,
    });
    setFilters({ range: [limitSelectDate.min, limitSelectDate.max] });
    setDateRange([limitSelectDate.min, limitSelectDate.max]);
  };

  return (
    <>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '15px 0',
        }}
      >
        <h3>{currentSku}</h3>
        <div>
          <RangePicker
            allowClear={false}
            value={dateRange}
            onChange={dates => {
              setFilters({ range: dates });
              setDateRange(dates);
              childRef.current.setPagination({
                current: defaultCurrent,
                pageSize: defaultPageSize,
              });
            }}
          />
          <Button style={{ marginLeft: '20px' }} onClick={reset}>
            重置
          </Button>
        </div>
      </header>
      <Card bodyStyle={{ padding: '20px 5px' }}>
        <Suspense fallback={<PageLoading />}>
          <TrendChart currentId={currentId} filters={filters} />
        </Suspense>
        <Suspense fallback={<PageLoading />}>
          <div>
            <RatingDistributionChart currentId={currentId} filters={filters} />
            <ColorSizeChart currentId={currentId} filters={filters} />
          </div>
        </Suspense>
        <Suspense fallback={<PageLoading />}>
          <RatingProductionChart currentId={currentId} filters={filters} />
        </Suspense>
        <Suspense fallback={<PageLoading />}>
          <StarMonitor currentId={currentId} filters={filters} cref={childRef} />
        </Suspense>
      </Card>
    </>
  );
};

export default connect()(ReviewOverview);
