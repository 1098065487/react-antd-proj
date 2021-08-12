import React, { PureComponent, Fragment } from 'react';
import { Avatar, Button, Card, Col, Form, Icon, Input, List, Row, Tag } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardFormRow from '@/components/StandardFormRow';
import IconFont from '@/components/IconFont';
import avatar from '@/assets/avatar.png';
import moment from "moment";
import styles from "./index.less";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailFormItemLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

@connect(({ platform, loading }) => ({
  platform,
  loading: loading.effects['platform/getReviewsList'],
}))
@Form.create()
class CustomerReviews extends PureComponent {
  constructor(pros) {

    super(pros);
    this.state = {
      pagination: { current: 1, pageSize: 20 },
      filters: {},
      sorter: { field: 'date', order: 'desc' },
      dataList: [],
      total: 0,
      current: 0,
    };
  }

  componentDidMount() {
    this.initList();
  }


  initList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter, dataList } = this.state;
    dispatch({
      type: 'platform/getReviewsList',
      payload: { pagination, filters, sorter },
      callback: res => {
        this.setState({
          dataList: dataList.concat(res.data),
          total: res.meta.pagination.total,
          current: res.meta.pagination.current,
        })
      }
    });
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

  fetchMore = () => {
    const { current } = this.state;
    this.setState({
      pagination: { current: current + 1, pageSize: 20 },
    }, this.initList);
  };

  renderRating = (num, id) => {
    const arr1 = [ ...Array(num) ];
    if (num < 5) {
      const arr2 = [ ...Array(5-num)];
      return (
        <Fragment>
          {arr1.map((v, k) => <Icon type='star' key={`${id}_${k + 1}`} theme='filled' style={{ color: '#ffc200' }} />)}
          {arr2.map((v, k) => <Icon type='star' key={`${id}_${k + num + 1}`} />)}
        </Fragment>
      )
    }
    return (
      <Fragment>
        {arr1.map((v, k) => <Icon type='star' key={`${id}_${k + 1}`} theme='filled' style={{ color: '#ffc200' }} />)}
      </Fragment>
    )
  };

  render() {
    const {
      loading,
    } = this.props;

    const { dataList, total } = this.state;

    const loadMore =
      total > dataList.length ? (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={this.fetchMore} style={{ paddingLeft: 48, paddingRight: 48 }}>
            {loading ? (
              <span>
                <Icon type="loading" /> 加载中...
              </span>
            ) : (
              '加载更多'
            )}
          </Button>
        </div>
      ) : null;

    return (
      <PageHeaderWrapper
        title="商品评论列表"
        logo={<IconFont type="icon-authorization-management" />}
      >
        <Card bordered={false} className="searchCard">
          {this.renderSearchForm()}
        </Card>
        <Card
          style={{ marginTop: 24 }}
          bordered={false}
          bodyStyle={{ padding: '8px 32px 32px 32px' }}
        >
          <List
            size="large"
            loading={loading}
            rowKey="id"
            itemLayout="vertical"
            loadMore={loadMore}
            dataSource={dataList}
            renderItem={item => (
              <List.Item
                key={item.id}
              >
                <List.Item.Meta
                  title={item.title}
                  description={
                    <span>
                      {this.renderRating(item.rating, item.id)}
                      <Tag style={{marginLeft: 30}}>{item.color}</Tag>
                      <Tag>{item.size}</Tag>
                    </span>
                  }
                />
                <div className={styles.listContent}>
                  <div className={styles.description}>{item.content}</div>
                  <div className={styles.extra}>
                    <Avatar src={avatar} size="small" />
                    {item.username} 发布于
                    <em>{moment(item.date).format('YYYY-MM-DD')}</em>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CustomerReviews;
