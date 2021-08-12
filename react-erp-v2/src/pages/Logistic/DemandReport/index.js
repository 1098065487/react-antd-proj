import React, { PureComponent } from 'react';
import { Button, Card, Col, Form, Input, Row, Tag } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import StandardFormRow from '@/components/StandardFormRow';
import IconFont from '@/components/IconFont';
import moment from 'moment';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

@connect(({ logistic, platform, loading }) => ({
  logistic,
  platform,
  loading: loading.effects['logistic/getDemandReportList'],
}))
@Form.create()
class DemandReport extends PureComponent {
  constructor(pros) {

    super(pros);
    this.state = {
      pagination: { current: 1, pageSize: 20 },
      filters: {},
      sorter: {},
      platform: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 获取平台
    dispatch({
      type: 'platform/fetchTree',
      payload: {},
      callback: res => {
        this.setState({
          platform: this.renderPlatform(res),
        })
      }
    });
    this.initList();
  }

  // 取平台列表
  renderPlatform = list => {
    const arr = [];
    let index = 1;
    if(list && Object.keys(list).length !== 0) {
      list.forEach(e => {
        if(e.children && Object.keys(e.children).length !== 0) {
          e.children.forEach(o => {
            arr.push({ ...o, idx: index });
            index += 1;
          })
        }
      });
      // 添加平台汇总，与后端约定好匹配id为0
      return [ { value: 0, label: '汇总', key: 0, idx: 0 } ].concat(arr);
    }
    return arr;
  };

  initList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'logistic/getDemandReportList',
      payload: { pagination, filters, sorter, with: 'productItem.factoryProductItems' },
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
      () => this.initList(),
    );
  };

  handleSearch = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { pagination } = this.state;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        filters: { ...values },
        pagination: { ...pagination, current: 1 },
      }, () => {
        this.initList();
      });
    });
  };

  handleSearchFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      filters: {},
      pagination: { current: 1, pageSize: 20 },
      sorter: {},
    }, () => {
      this.initList();
    });
  };

  handleDownload = () => {
    const { dispatch, form: { validateFieldsAndScroll } } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const dynamic = { ...values };
      dispatch({
        type: 'system/createAnExport',
        payload: { type: 'product_report', dynamic },
      });
    });
  };

  renderSearchForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <StandardFormRow title="筛选条件" grid last>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <Form.Item {...formItemLayout} label="SKU">
                {getFieldDecorator('sku')(<Input placeholder="请输入sku" />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  查询
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  type="primary"
                  icon="cloud-download"
                  onClick={this.handleDownload}
                >
                  导出
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleSearchFormReset}>
                  重置
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
      </Form>
    );
  };

  renderPlatforms = record => {
    const { platform } = this.state;
    return platform.map(e => <div key={`platform_${record.id}_${e.value}`} style={{ minHeight: 21, margin: '0 -8px', backgroundColor: (e.idx % 2) !== 0 ? '#fce4d6' : 'white' }}>&nbsp;&nbsp;{e.label}</div>)
  };

  renderPlatformData = (record, key) => {
    const { platform } = this.state;
    if(record.details && Object.keys(record.details).length !== 0) {
      return platform.map(e => {
        const fit = record.details.filter(o => o.platform_id === e.value);
        return (
          <div
            key={`${key}_${record.id}_${e.value}`}
            style={{ minHeight: 21, margin: '0 -8px', backgroundColor: (e.idx % 2) !== 0 ? '#fce4d6' : 'white' }}
          >
            {Object.keys(fit).length !== 0 ? fit[0][key] : ''}
          </div>
        );
      });
    }
    return null;
  };

  render() {
    const {
      loading,
      logistic: { demandReportList },
    } = this.props;

    const columns = [
      {
        title: '基准SKU',
        dataIndex: 'sku',
        fixed: 'left',
        width: 240,
        render: (text, record) => {
          if(record.product_item && Object.keys(record.product_item).length !== 0){
            return record.product_item.sku
          }
          return null;
        }
      },
      {
        title: '工厂SKU',
        dataIndex: 'factory_sku',
        width: 200,
        render: (text, record) => {
          if(record.product_item && Object.keys(record.product_item).length !== 0){
            const { product_item } = record;
            if(product_item.factory_product_items && product_item.factory_product_items.length !==0){
              const { factory_product_items } = product_item;
              return factory_product_items.map(e => <Tag key={e.id} color="blue" style={{ display: 'block', marginBottom: 2 }}>{e.sku}</Tag>)
            }
          }
          return null;
        }
      },
      { title: 'CN库存', dataIndex: 'factory_inventory', width: 80 },
      { title: 'LB库存', dataIndex: 'lb_inventory', width: 80 },
      { title: 'LG库存', dataIndex: 'lg_inventory', width: 80 },
      { title: '分类', dataIndex: 'category', width: 100 },
      { title: '生产未完成量', dataIndex: 'unfinished_production', width: 120 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        render: text => {
          if(text === -1) {
            return '淘汰';
          }
          if(text === 2) {
            return '新品';
          }
          return '在售';
        }
      },
      {
        title: '平台',
        dataIndex: 'platforms',
        align: 'center',
        width: 120,
        render: (text, record) => this.renderPlatforms(record),
      },
      {
        title: '销售量',
        dataIndex: 'sales',
        align: 'center',
        children: [
          {
            title: '周销售量',
            dataIndex: 'weekly_sales',
            align: 'center',
            width: 80,
            render: (text, record) => this.renderPlatformData(record, 'weekly_sales'),
          },
          {
            title: '月销售量',
            dataIndex: 'monthly_sales',
            align: 'center',
            width: 80,
            render: (text, record) => this.renderPlatformData(record, 'monthly_sales'),
          },
          {
            title: '季销售量',
            dataIndex: 'quarterly_sales',
            align: 'center',
            width: 80,
            render: (text, record) => this.renderPlatformData(record, 'quarterly_sales'),
          },
          {
            title: '半年销售量',
            dataIndex: 'half_year_sales',
            align: 'center',
            width: 100,
            render: (text, record) => this.renderPlatformData(record, 'half_year_sales'),
          },
          {
            title: '年销售量',
            dataIndex: 'annual_sales',
            align: 'center',
            width: 80,
            render: (text, record) => this.renderPlatformData(record, 'annual_sales'),
          },
        ],
      },
      {
        title: '库存',
        dataIndex: 'inventory',
        align: 'center',
        children: [
          {
            title: 'FBA库存',
            dataIndex: 'FBA_inventory',
            align: 'center',
            width: 80,
            render: (text, record) => this.renderPlatformData(record, 'fba_inventory'),
          },
        ],
      },
      {
        title: '预测',
        dataIndex: 'expected',
        align: 'center',
        children: [
          {
            title: `${moment().add(1, 'month').utc().month() + 1}月需求`,
            dataIndex: 'next_month_demand',
            align: 'center',
            width: 100,
            render: (text, record) => this.renderPlatformData(record, 'next_month_demand'),
          },
          {
            title: `${moment().add(2, 'month').utc().month() + 1}月需求`,
            dataIndex: 'second_month_demand',
            align: 'center',
            width: 100,
            render: (text, record) => this.renderPlatformData(record, 'second_month_demand'),
          },
          {
            title: `${moment().add(3, 'month').utc().month() + 1}月需求`,
            dataIndex: 'third_month_demand',
            align: 'center',
            width: 100,
            render: (text, record) => this.renderPlatformData(record, 'third_month_demand'),
          },
          {
            title: '一年运营需求',
            dataIndex: 'next_year_demand',
            align: 'center',
            width: 100,
            render: (text, record) => this.renderPlatformData(record, 'next_year_demand'),
          },
        ],
      },
    ];

    return (
      <PageHeaderWrapper
        title="物流需求报表"
        logo={<IconFont type="icon-authorization-management" />}
      >
        <Card bordered={false} className="searchCard">
          {this.renderSearchForm()}
        </Card>
        <Card bordered={false} style={{ marginTop: 24 }}>
          <StandardTable
            rowKey='id'
            bordered
            loading={loading}
            dataSource={demandReportList}
            columns={columns}
            onChange={this.handleStandardTableChange}
            scroll={{
              x: 2000,
              y: (document.documentElement.clientHeight > 768 ? (document.documentElement.clientHeight - 331) : (document.documentElement.clientHeight - 201)),
            }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DemandReport;
