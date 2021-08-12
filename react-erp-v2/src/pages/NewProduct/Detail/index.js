import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Form, Row, Steps, Divider, Descriptions, Select, Input, Table, Icon } from 'antd';
import { connect } from 'dva';

import moment from 'moment';
import { router } from 'umi';
import Zmage from 'react-zmage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import { baseUri } from '@/defaultSettings';

import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const statusList = [
  { label: '流转中', value: 'process' },
  { label: '驳回', value: 'reject' },
  { label: '终止', value: 'abort' },
  { label: '完成', value: 'finish' },
];

@connect(({ user, newProduct, spec, loading }) => ({
  user,
  newProduct,
  spec,
  loading: loading.effects['newProduct/fetchProofingList'],
}))
@Form.create()
class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      specs: {},
      attributes: {},
      color: [],
      size: [],
      attrValue: [],
      showProofingList: false,
      fileList: [],
      showLog: false,
    };
  }

  componentDidMount() {
    const { dispatch, location: { state: { category_id } } } = this.props;
    dispatch({
      type: 'spec/fetchAll',
      payload: { with: ['values'] },
      callback: specs => {
        this.setState({ specs });
      },
    });
    dispatch({
      type: 'newProduct/fetchAttributes',
      payload: category_id,
      callback: attributes => {
        this.setState({ attributes });
      },
    });
    this.initDevelopProcess();
    this.initDevelopInfo();
  }

  initDevelopProcess = () => {
    const { location: { state: { flowId, newProductId } }, dispatch } = this.props;
    dispatch({
      type: 'newProduct/fetchProcess',
      payload: flowId,
      callback: res => {
        const { current_step: { name }, status } = res.body;
        if (name === 'make' || name === 'end') {
          dispatch({
            type: 'newProduct/fetchProofingList',
            payload: {
              filters: { 'newProductId': newProductId },
              with: ['newproduct', 'workflowRun.currentStep.users'],
            },
          });
          this.setState({
            showProofingList: true,
          });
        }
        if (name === 'edit' && status === 'reject') {
          this.setState({
            showLog: true,
          });
          dispatch({
            type: 'newProduct/fetchWorkflowLog',
            payload: {
              filters: { workflowRunId: flowId, workflowStepName: 'check', status: 'reject' },
              with: 'user',
            },
          });
        }
      },
    });
  };

  initDevelopInfo = () => {
    const { location: { state: { newProductId } }, dispatch } = this.props;
    dispatch({
      type: 'newProduct/fetchDevelopInfo',
      payload: {
        id: newProductId,
        params: { with: ['user', 'category', 'demand.attachments', 'specValues', 'attributeValues'] },
      },
      callback: res => {
        const { spec_values, attribute_values, demand } = res.body;
        if (spec_values && Object.keys(spec_values).length !== 0) {
          this.setState({
            color: spec_values[0].id,
            size: spec_values[1].id,
          });
        }
        if (attribute_values && Object.keys(attribute_values).length !== 0) {
          const attr = [];
          attribute_values.forEach(item => attr.push(item.id));
          this.setState({
            attrValue: attr,
          });
        }
        if (demand && Object.keys(demand).length !== 0) {
          const { attachments } = demand;
          if (attachments && Object.keys(attachments).length !== 0) {
            this.setState({
              fileList: attachments.filter(item => item.type === 'file'),
            });
          }
        }
      },
    });
  };

  // 遍历出颜色选项
  renderColorOption = () => {
    const { specs } = this.state;
    if (specs && Object.keys(specs).length !== 0) {
      const colorList = specs.find(item => item.name === 'Color').values;
      return colorList.map(item => (<Option key={item.id} value={item.id}>{item.value}</Option>));
    }
    return null;
  };

  // 遍历出尺寸选项
  renderSizeOption = () => {
    const { specs } = this.state;
    if (specs && Object.keys(specs).length !== 0) {
      const sizeList = specs.find(item => item.name === 'Size').values;
      return sizeList.map(item => (<Option key={item.id} value={item.id}>{item.value}</Option>));
    }
    return null;
  };

  renderAttributeFilters = attr => {
    const { values } = attr;
    return (
      <Select style={{ maxWidth: 286, width: '100%' }} placeholder="请选择属性值" disabled>
        {values.map(value => (
          <Option key={value.id} value={value.id}>
            {value.description}
          </Option>
        ))}
      </Select>
    );
  };

  handleActions = (key, record) => {
    if (key === 'read') {
      router.push('/production/new-product/proofing-detail', { proofingId: record.id, flowId: record.workflow_run.id });
    } else if (key === 'action') {
      router.push('/production/new-product/proofing', { proofingId: record.id, flowId: record.workflow_run.id });
    }
  };

  // 页面返回上一页
  goBack = () => {
    router.goBack();
  };

  // 获取当前流程节点
  renderCurrentStep = (currentStep, workflowSteps) => {
    const { name } = currentStep;
    return workflowSteps.findIndex(item => item.name === name);
  };

  renderPic = info => {
    if (info && Object.keys(info).length !== 0) {
      const { demand } = info;
      if (demand && Object.keys(demand).length !== 0) {
        const { attachments } = demand;
        if (attachments && Object.keys(attachments).length !== 0) {
          const imgList = attachments.filter(item => item.type === 'image');
          if (Object.keys(imgList).length !== 0) {
            return imgList.map(item => (
              <Zmage
                alt={item.filename}
                key={item.id}
                style={{ width: 102, height: 102, marginRight: 5, marginTop: 5 }}
                src={`${baseUri}/storage/${item.uri}`}
              />
            ));
          }
          return null;

        }
        return null;

      }
      return null;

    }
    return null;
  };

  render() {
    const {
      loading,
      newProduct: { process: { workflow_steps = [], current_step = {} }, info, proofingList = [], workflowLogs = [] },
      form: { getFieldDecorator },
    } = this.props;

    const { attributes = [], color, size, attrValue, showProofingList, fileList, showLog } = this.state;

    const columns = [
      { title: '附件名称', dataIndex: 'filename' },
      { title: '上传日期', dataIndex: 'created_at' },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        render: (text, record) => (
          <a href={`${baseUri}/storage/${record.uri}`}>
            <Icon type='download' /> 下载
          </a>
        ),
      },
    ];

    const logColumns = [
      {
        title: '操作人',
        dataIndex: 'user',
        render: (text, record) => record.user ? record.user.name : null,
      },
      {
        title: '驳回原因',
        dataIndex: 'reason',
        render: (text, record) => record.dynamic ? record.dynamic.reason : null,
      },
      { title: '驳回时间', dataIndex: 'created_at' },
    ];

    const proofingColumns = [
      { title: '打样编号', dataIndex: 'sn' },
      {
        title: '新品开发编号',
        dataIndex: 'new_sn',
        render: (text, record) => {
          const { newproduct } = record;
          return newproduct ? newproduct.sn : null;
        },
      },
      { title: '计划开始时间', dataIndex: 'expected_start_time' },
      { title: '计划结束时间', dataIndex: 'expected_end_time' },
      {
        title: '节点',
        dataIndex: 'node',
        render: (text, record) => {
          const { workflow_run: { current_step } } = record;
          return current_step.label;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => {
          const { status } = record.workflow_run;
          const statusNow = statusList.find(item => item.value === status);
          return statusNow.label;
        },
      },
      { title: '创建时间', dataIndex: 'created_at' },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        render: (text, record) => (
          <Fragment>
            <Button
              type="primary"
              icon="eye"
              size="small"
              onClick={() => this.handleActions('read', record)}
            />
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper
        title="新品开发"
        extra={[
          <Button type="link" icon="left" key='right' onClick={this.goBack}>返回</Button>,
        ]}
      >
        <Fragment>
          <Card bordered={false} className="searchCard">
            <Steps current={this.renderCurrentStep(current_step, workflow_steps)} style={{ margin: '30px 0' }}>
              {
                workflow_steps.map(item => {
                  let descriptions = null;
                  const { workflowRunStep } = item;
                  if (workflowRunStep) {
                    const { user } = workflowRunStep;
                    descriptions = (
                      <div style={{ marginTop: 10 }}>
                        {`处理人：${user.name}`}
                      </div>
                    );
                  }
                  return <Step key={item.id} title={item.label} description={descriptions} />;
                })
              }
            </Steps>
          </Card>

          <Card bordered={false} style={{ marginTop: 10 }}>
            <Descriptions
              title="基本信息"
              style={{
                marginBottom: 32,
              }}
            >
              <Descriptions.Item label="新品开发编号">{info.sn}</Descriptions.Item>
              <Descriptions.Item label="标题">{info.title}</Descriptions.Item>
              <Descriptions.Item
                label="产品分类"
              >{info.category && Object.keys(info.category).length !== 0 ? info.category.name : null}</Descriptions.Item>
              <Descriptions.Item label="开发类型">{info.develop_type === 'new' ? '新品开发' : '老品改良'}</Descriptions.Item>
              <Descriptions.Item label="预计开始时间">{info.expected_start_time}</Descriptions.Item>
              <Descriptions.Item label="预计下单时间">{info.expected_order_time}</Descriptions.Item>
              <Descriptions.Item
                label="创建人"
              >{info.user && Object.keys(info.user).length !== 0 ? info.user.name : null}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{info.updated_at}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card bordered={false} style={{ marginTop: 10 }}>
            <div>需求信息</div>
            <Divider style={{ margin: '12px 0' }} />
            <Form layout="inline">
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="颜色" style={{ width: '100%' }}>
                    {getFieldDecorator('color', {
                      rules: [{ required: true, message: '请选择颜色' }],
                      initialValue: color,
                    })(
                      <Select placeholder="请选择" style={{ width: '100%' }} disabled>
                        {this.renderColorOption()}
                      </Select>,
                    )}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="尺码" style={{ width: '100%' }}>
                    {getFieldDecorator('size', {
                      rules: [{ required: true, message: '请选择尺码' }],
                      initialValue: size,
                    })(
                      <Select placeholder="请选择" style={{ width: '100%' }} disabled>
                        {this.renderSizeOption()}
                      </Select>,
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                {attributes && Object.keys(attributes).length !== 0 ? attributes.map((attr, idx) => (
                  <Col key={attr.id} md={8} sm={24}>
                    <Form.Item {...formItemLayout} label={attr.description} style={{ width: '100%' }}>
                      {getFieldDecorator(`attrs.${idx}`, {
                        rules: [{ required: true, message: '请选择' }],
                        initialValue: attrValue[idx],
                      })(this.renderAttributeFilters(attr))}
                    </Form.Item>
                  </Col>
                )) : null}
              </Row>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={16} sm={24}>
                  <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="其他需求" style={{ width: '100%' }}>
                    {getFieldDecorator('demand.remark', {
                      initialValue: info.demand ? info.demand.remark : null,
                    })(<TextArea placeholder="请输入" disabled />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={16} sm={24}>
                  <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="样式图片" style={{ width: '100%' }}>
                    {this.renderPic(info)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={16} sm={24}>
                  <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="参考链接" style={{ width: '100%' }}>
                    {getFieldDecorator('demand.link', {
                      initialValue: info.demand ? info.demand.link : null,
                    })(<Input placeholder="请输入" disabled />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card bordered={false} style={{ marginTop: 10 }}>
            <div>附件信息</div>
            <Divider style={{ margin: '12px 0' }} />
            <Table
              size='small'
              rowKey='id'
              columns={columns}
              dataSource={fileList}
              rowSelection={null}
              pagination={false}
            />
          </Card>

          {showLog ? (
            <Card bordered={false} style={{ marginTop: 10 }}>
              <div>驳回信息</div>
              <Divider style={{ margin: '12px 0' }} />
              <Table
                size='small'
                rowKey='id'
                columns={logColumns}
                dataSource={workflowLogs}
                rowSelection={null}
                pagination={false}
              />
            </Card>
          ) : null}

          {showProofingList ? (
            <Card bordered={false} style={{ marginTop: 10 }}>
              <div>打样信息</div>
              <Divider style={{ margin: '12px 0' }} />
              <StandardTable
                loading={loading}
                columns={proofingColumns}
                dataSource={proofingList}
                rowSelection={null}
                pagination={false}
              />
            </Card>
          ) : null}

        </Fragment>
      </PageHeaderWrapper>
    );
  }
}

export default Detail;
