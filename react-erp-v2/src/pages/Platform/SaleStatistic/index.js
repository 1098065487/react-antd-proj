import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import moment from 'moment';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import { getTimeDistance } from '@/utils/utils';
import PageLoading from '@/components/PageLoading';
import styles from './index.less';

const IntroduceRow = React.lazy(() => import('./IntroduceRow'));
const SalesCard = React.lazy(() => import('./SalesCard'));
const TopSearch = React.lazy(() => import('./TopSearch'));
const ProportionSales = React.lazy(() => import('./ProportionSales'));

@connect(({ report, loading }) => ({
  report,
  salesDateLoading: loading.effects['report/getSalesDate'],
  weeklyOrderLoading: loading.effects['report/getWeeklyOrder'],
  salesProportionLoading: loading.effects['report/getSalesProportion'],
  topSalesLoading: loading.effects['report/getTopSale'],
}))
class Analysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rangePickerValue: getTimeDistance('year'),
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { rangePickerValue } = this.state;
    this.reqRef = requestAnimationFrame(() => {
      dispatch({
        type: 'report/getSalesDate',
        payload: {},
      });
      dispatch({
        type: 'report/getWeeklyOrder',
        payload: {},
      });
      dispatch({
        type: 'report/getSalesProportion',
        payload: {
          start_at: moment(rangePickerValue[0]).format('YYYY-MM-DD HH:mm:ss'),
          end_at: moment(rangePickerValue[1]).format('YYYY-MM-DD HH:mm:ss'),
        },
      });
      dispatch({
        type: 'report/getTopSale',
        payload: {},
      });
    });
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.reqRef);
  }

  handleRangePickerChange = value => {
    const { dispatch } = this.props;
    this.setState({
      rangePickerValue: value,
    }, () => {
      const { rangePickerValue } = this.state;
      dispatch({
        type: 'report/getSalesProportion',
        payload: {
          start_at: moment(rangePickerValue[0]).format('YYYY-MM-DD HH:mm:ss'),
          end_at: moment(rangePickerValue[1]).format('YYYY-MM-DD HH:mm:ss'),
        },
      });
    });
  };

  selectDate = type => {
    const { dispatch } = this.props;
    this.setState({
      rangePickerValue: getTimeDistance(type),
    }, () => {
      const { rangePickerValue } = this.state;
      dispatch({
        type: 'report/getSalesProportion',
        payload: {
          start_at: moment(rangePickerValue[0]).format('YYYY-MM-DD HH:mm:ss'),
          end_at: moment(rangePickerValue[1]).format('YYYY-MM-DD HH:mm:ss'),
        },
      });
    });
  };

  isActive = type => {
    const { rangePickerValue } = this.state;
    const value = getTimeDistance(type);
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return '';
    }
    if (
      rangePickerValue[0].isSame(value[0], 'day') &&
      rangePickerValue[1].isSame(value[1], 'day')
    ) {
      return styles.currentDate;
    }
    return '';
  };

  render() {
    const { rangePickerValue } = this.state;
    const { salesDateLoading, weeklyOrderLoading, salesProportionLoading, topSalesLoading, report: { weeklyOrder = {}, salesDate = {}, salesProportion = {}, topSales = {} } } = this.props;
    // 处理一周订单, 销售额展示
    const weekOrderList = [];
    const weekSaleList = [];
    const { week_total_amount, week_amount_detail = {}, week_sales_detail = {} } = weeklyOrder;
    if (Object.keys(week_amount_detail).length !== 0) {
      for (let i = 0; i < Object.keys(week_amount_detail).length; i += 1) {
        weekOrderList.push({
          x: Object.keys(week_amount_detail)[i],
          y: week_amount_detail[Object.keys(week_amount_detail)[i]],
        });
      }
    }
    if (Object.keys(week_sales_detail).length !== 0) {
      for (let i = 0; i < Object.keys(week_sales_detail).length; i += 1) {
        weekSaleList.push({
          x: Object.keys(week_sales_detail)[i],
          y: week_sales_detail[Object.keys(week_sales_detail)[i]],
        });
      }
    }
    // 处理销售额数据
    const { month_sales, day_sales, platform_sales_rank = [], year_sales_detail = {} } = salesDate;
    const yearSaleList = [];
    if (Object.keys(year_sales_detail).length !== 0) {
      for (let i = 0; i < Object.keys(year_sales_detail).length; i += 1) {
        yearSaleList.push({
          x: Object.keys(year_sales_detail)[i],
          y: year_sales_detail[Object.keys(year_sales_detail)[i]],
        });
      }
    }
    // 处理销售渠道占比数据
    const { total_amount, platform_sales_proportion = [] } = salesProportion;
    const platformSalesList = [];
    if (Object.keys(platform_sales_proportion).length !== 0) {
      for (let i = 0; i < Object.keys(platform_sales_proportion).length; i += 1) {
        platformSalesList.push({
          x: platform_sales_proportion[i].platform_name,
          y: parseFloat(platform_sales_proportion[i].amount),
        });
      }
    }
    // 处理热销商品数据
    const { order_items = [] } = topSales;

    return (
      <GridContent>
        <Suspense fallback={<PageLoading />}>
          <IntroduceRow
            weeklyOrderLoading={weeklyOrderLoading}
            salesDateLoading={salesDateLoading}
            monthlyTotal={month_sales}
            dailyTotal={day_sales}
            weeklyTotal={week_total_amount}
            weeklyOrder={weekOrderList}
            weeklySale={weekSaleList}
          />
        </Suspense>
        <Suspense fallback={null}>
          <SalesCard
            yearSalesData={yearSaleList}
            platformList={platform_sales_rank}
            loading={salesDateLoading}
          />
        </Suspense>
        <div className={styles.twoColLayout}>
          <Row gutter={24} type="flex">
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Suspense fallback={null}>
                <TopSearch
                  loading={topSalesLoading}
                  topSales={order_items}
                />
              </Suspense>
            </Col>
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Suspense fallback={null}>
                <ProportionSales
                  rangePickerValue={rangePickerValue}
                  isActive={this.isActive}
                  handleRangePickerChange={this.handleRangePickerChange}
                  selectDate={this.selectDate}
                  loading={salesProportionLoading}
                  platformTotal={total_amount}
                  salesPieData={platformSalesList}
                />
              </Suspense>
            </Col>
          </Row>
        </div>
      </GridContent>
    );
  }
}

export default Analysis;
