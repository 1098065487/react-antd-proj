import React, { Component } from 'react';
import {
  Button,
  Card,
  Cascader,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Popover,
  Spin,
} from 'antd';
import { connect } from 'dva';
import { router } from 'umi';

import moment from 'moment';
import StandardTable from '@/components/StandardTable';
import DetailTable from './DetailTable';
import styles from './index.less';

const { Item } = Form;
const { Option } = Select;
const { RangePicker, MonthPicker } = DatePicker;

@connect(({ platform, loading }) => ({
  platform,
  loading: loading.effects['platform/fetchProductReports'],
}))
@Form.create()
class SearchList extends Component {
  constructor(props) {
    super(props);
    const {
      platform: { reportFilters },
    } = props;
    this.state = {
      filters: reportFilters,
      pagination: { current: 1, pageSize: 10 },
      sorter: {},
      platformTree: [],
      categories: [],
      attributes: [],
      start: -11,
      end: 0,
      mode: ['month', 'month'],
      isOpen: false,
      firstModeRecord: '',
      compareDateCheck: true,
      isCompareOpen: false,
      compareFirstModeRecord: '',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
      callback: platformTree => {
        this.setState({ platformTree });
      },
    });
    dispatch({
      type: 'category/fetchOptions',
      callback: categories => {
        this.setState({ categories });
      },
    });
    dispatch({
      type: 'attribute/fetchAll',
      payload: { with: ['values'] },
      callback: res => {
        const list = res.filter(e => e.name !== 'Group');
        this.setState({ attributes: list });
      },
    });
    this.initPlatformProducts();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'platform/save',
      payload: { products: {} },
    });
  }

  initPlatformProducts = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    const { platform, attrs = [], range, sort_month } = filters;
    // 必须存在marketplaceId，才能请求数据
    let sort;
    if (range && range.length !== 0) {
      if (sort_month) {
        if (
          sort_month.isAfter(moment(range[0]).add(-1, 'months')) &&
          sort_month.isBefore(moment(range[1]).add(1, 'months'))
        ) {
          sort = sort_month;
        } else {
          sort = range[1];
        }
      } else {
        if (
          moment().isAfter(moment(range[0]).add(-1, 'months')) &&
          moment().isBefore(moment(range[1]).add(1, 'months'))
        ) {
          sort = moment();
        } else {
          sort = range[1];
        }
      }
    } else {
      sort = moment();
    }
    dispatch({
      type: 'platform/fetchProductReports',
      payload: {
        filters: {
          ...filters,
          attrs: [attrs[0] ? Array.of(attrs[0]) : [], attrs[1] ? Array.of(attrs[1]) : []],
          sort_month: sort,
          platform: platform || [1, 5],
        },
        pagination,
        sorter,
        with_count: ['reviews', 'questions'],
        with: ['category', 'attributeValues'],
      },
    });
  };

  handleStandardTableChange = (pagination, filter, sorters) => {
    const { filters, sorter } = this.state;
    this.setState(
      {
        pagination,
        filters: { ...filters, ...filter },
        sorter: { ...sorter, ...sorters },
      },
      () => this.initPlatformProducts()
    );
  };

  handlePanelChange = (value, mode) => {
    const { firstModeRecord } = this.state; // 设置range选择为起始或者始起时，面板方才收起并赋值
    if (firstModeRecord === '') {
      this.setState({
        firstModeRecord: mode[0],
      });
    }
    if (firstModeRecord !== '' && firstModeRecord !== mode[0]) {
      const { form } = this.props;
      this.setState({
        isOpen: false,
        firstModeRecord: '',
      });
      form.setFieldsValue({ range: value, sort_month: undefined }); //  表单值的变动需要传回
    }
  };

  handleComparePanelChange = (value, mode) => {
    const { compareFirstModeRecord } = this.state; // 设置range选择为起始或者始起时，面板方才收起并赋值
    if (compareFirstModeRecord === '') {
      this.setState({
        compareFirstModeRecord: mode[0],
      });
    }
    if (compareFirstModeRecord !== '' && compareFirstModeRecord !== mode[0]) {
      const { form } = this.props;
      this.setState({
        isCompareOpen: false,
        compareFirstModeRecord: '',
      });
      form.setFieldsValue({ compare_range: value }); //  表单值的变动需要传回
    }
  };

  handleChange = value => {
    //  存在清空的情况用onChange事件控制
    const { form } = this.props;
    form.setFieldsValue({ range: value, sort_month: undefined });
    this.setState({
      start: -11,
      end: 0,
    });
  };

  handleCompareChange = value => {
    const { form } = this.props;
    form.setFieldsValue({ compare_range: value });
  };

  onOpenChange = status => {
    //  控制面板打开关闭
    this.setState({ isOpen: status });
  };

  onCompareOpenChange = status => {
    this.setState({ isCompareOpen: status });
  };

  startAndEnd = date => {
    if (date.isAfter(moment())) {
      return date.diff(moment(), 'months') + 1;
    }
    return date.diff(moment(), 'months');
  };

  handleSearch = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { filters, pagination, start, end } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const { range } = values;
      const newFilters = { ...filters, ...values };
      this.setState(
        {
          filters: newFilters,
          pagination: { ...pagination, current: 1 },
          start: range && range.length !== 0 ? this.startAndEnd(range[0]) : start,
          end: range && range.length !== 0 ? this.startAndEnd(range[1]) : end,
        },
        () => {
          // 记录到Redux中
          dispatch({
            type: 'platform/save',
            payload: {
              reportFilters: {
                ...newFilters,
                range: [moment().add(-11, 'months'), moment().add(0, 'months')],
              },
            },
          });
          this.initPlatformProducts();
        }
      );
    });
  };

  handleSearchFormReset = () => {
    const { form, dispatch } = this.props;
    const {
      filters: { platform },
    } = this.state;
    form.resetFields();
    this.setState(
      {
        filters: { platform, attrs: [undefined, undefined] },
        pagination: { current: 1, pageSize: 10 },
        sorter: {},
        start: -11,
        end: 0,
      },
      () => {
        dispatch({
          type: 'platform/save',
          payload: { reportFilters: { platform } },
        });
        this.initPlatformProducts();
      }
    );
  };

  /**
   * @description: 导入商品报表
   * @return: void
   */

  handleUpload() {
    router.push('/excel/imports/create?type=amazon_monthly_data');
  }

  renderAttributeFilters = attr => {
    const { values } = attr;
    return (
      <Select
        size="small"
        allowClear
        style={{ width: 100 }}
        placeholder={attr.name === 'Cycle' ? '产品周期选择' : '产品等级选择'}
      >
        {values.map(value => (
          <Option key={value.id} value={value.id}>
            {value.description}
          </Option>
        ))}
      </Select>
    );
  };

  // 排序月份选择范围在查看月份内
  disabledMonth = current => {
    const { start, end } = this.state;
    return (
      current <
        moment()
          .add(start, 'months')
          .startOf('day') ||
      current >
        moment()
          .add(end + 1, 'month')
          .startOf('day')
    );
  };

  dateSwitchChange = checked => {
    this.setState({
      compareDateCheck: checked,
    });
  };

  renderSearch = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const {
      filters,
      platformTree,
      categories,
      attributes,
      compareDateCheck,
      isOpen,
      mode,
      isCompareOpen,
    } = this.state;
    const content = (
      <>
        <Item style={{ marginBottom: 0 }}>
          {getFieldDecorator(
            'sort_month',
            {}
          )(
            <MonthPicker size="small" placeholder="请选择月份" disabledDate={this.disabledMonth} />
          )}
        </Item>
        <Button
          type="primary"
          size="small"
          style={{ marginLeft: 120 }}
          onClick={() => this.handleSearch()}
        >
          确定
        </Button>
      </>
    );
    return (
      <Form className={styles.searchForm} layout="inline">
        <Item>
          {getFieldDecorator('platform', {
            initialValue: filters.platform || [1, 5],
          })(
            <Cascader
              size="small"
              style={{ width: 100 }}
              options={platformTree}
              placeholder="平台选择"
            />
          )}
        </Item>
        <Item>
          {getFieldDecorator('spu', {
            initialValue: filters.spu,
          })(<Input size="small" style={{ width: 100 }} placeholder="SKU搜索" />)}
        </Item>
        <Item>
          {getFieldDecorator('category', {
            initialValue: filters.category,
          })(
            <Cascader
              size="small"
              options={categories}
              placeholder="产品分类选择"
              style={{ width: 100 }}
            />
          )}
        </Item>
        {attributes.map((attr, idx) => (
          <Item key={idx}>
            {getFieldDecorator(`attrs.${idx}`, {
              initialValue:
                filters.attrs && Object.keys(filters.attrs).length !== 0
                  ? filters.attrs[`${idx}`]
                  : undefined,
            })(this.renderAttributeFilters(attr))}
          </Item>
        ))}
        <Item>
          {getFieldDecorator('range', {
            initialValue: [moment().add(-11, 'months'), moment().add(0, 'months')],
          })(
            <RangePicker
              size="small"
              style={{ width: 200 }}
              placeholder={['开始月份', '结束月份']}
              format="YYYY-MM"
              open={isOpen}
              mode={mode}
              onOpenChange={this.onOpenChange}
              onChange={this.handleChange}
              onPanelChange={this.handlePanelChange}
            />
          )}
        </Item>
        <div className={styles.switch}>
          <span>对比</span>
          <Switch checked={compareDateCheck} onChange={this.dateSwitchChange} />
        </div>
        <Item>
          {getFieldDecorator('compare_range', {
            initialValue: [moment().add(-23, 'months'), moment().add(-1, 'year')],
          })(
            <RangePicker
              size="small"
              style={{ width: 200 }}
              disabled={!compareDateCheck}
              placeholder={['对比开始月份', '对比结束月份']}
              format="YYYY-MM"
              open={isCompareOpen}
              mode={mode}
              onOpenChange={this.onCompareOpenChange}
              onChange={this.handleCompareChange}
              onPanelChange={this.handleComparePanelChange}
            />
          )}
        </Item>
        <Item>
          <Button type="primary" size="small" htmlType="submit" onClick={this.handleSearch}>
            查询
          </Button>
          <Button style={{ marginLeft: 8 }} size="small" onClick={this.handleSearchFormReset}>
            重置
          </Button>
          <Popover content={content} trigger="click">
            <Button size="small" style={{ marginLeft: 8 }}>
              排序
            </Button>
          </Popover>
          <Button size="small" style={{ marginLeft: 8 }} onClick={() => this.handleUpload()}>
            导入
          </Button>
        </Item>
      </Form>
    );
  };

  render() {
    const {
      loading,
      platform: { reports },
    } = this.props;
    const { start, end, compareDateCheck } = this.state;

    const newColumns = [
      {
        title: '详细',
        dataIndex: 'info',
        render: (text, record) => (
          <DetailTable
            current={record}
            start={start}
            end={end}
            compareCheck={compareDateCheck}
            refresh={this.initPlatformProducts}
          />
        ),
      },
    ];

    return (
      <Spin spinning={loading}>
        <Card bordered={false}>
          <h4 className={styles.pageTitle}>在售商品报表</h4>
          {this.renderSearch()}
          <StandardTable
            rowKey="id"
            size="small"
            bordered
            // loading={loading}
            showHeader={false}
            columns={newColumns}
            dataSource={reports}
            rowSelection={null}
            onChange={this.handleStandardTableChange}
            scroll={
              document.documentElement.clientWidth - 48 - 16 - 200 >= 90 + (end - start + 1) * 80
                ? undefined
                : { x: '80vw' }
            }
            // pagination={{ showSizeChanger: false }}
          />
        </Card>
      </Spin>
    );
  }
}

export default SearchList;
