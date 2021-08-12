import React, { Component, Fragment } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Cascader, Steps, DatePicker, Divider, Modal, Table, Icon } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import AttachmentUpload from '@/components/AttachmentUpload';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import { baseUri } from '@/defaultSettings';
import { router } from "umi";
import moment from 'moment';
import Zmage from 'react-zmage';
import ProofingForm from './ProofingForm';
import RejectForm from './RejectForm';

import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const { Option } = Select;
const { Step } = Steps;
const SelectOption = Select.Option;
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
class Develop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      specs: {},
      attributes: {},
      proofingFormVisible: false,
      rejectFormVisible: false,
      infoDisable: false,
      color: [],
      size: [],
      attrValue: [],
      showProofingList: false,
      fileList: [],
      showLog: false,
    };
  }

  componentDidMount() {
    const { dispatch, location: { state: { category_id } }, } = this.props;
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
        if (name !== 'edit') {
          this.setState({
            infoDisable: true,
          })
        }
        if (name === 'make' || name === 'end') {
          dispatch({
            type: 'newProduct/fetchProofingList',
            payload: {
              filters: { 'newProductId': newProductId },
              with: ['newproduct', 'workflowRun.currentStep.users']
            }
          });
          this.setState({
            showProofingList: true,
          })
        }
        if(name === 'edit' && status === 'reject') {
          this.setState({
            showLog: true,
          })
          dispatch({
            type: 'newProduct/fetchWorkflowLog',
            payload: {
              filters: { workflowRunId: flowId, workflowStepName: 'check', status: 'reject' },
              with: 'user',
            }
          });
        }
      }
    });
  };

  initDevelopInfo = () => {
    const { location: { state: { newProductId } }, dispatch } = this.props;
    dispatch({
      type: 'newProduct/fetchDevelopInfo',
      payload: { id: newProductId, params: { with: ['user', 'demand.attachments', 'specValues', 'attributeValues'] } },
      callback: res => {
        const { spec_values, attribute_values, demand } = res.body;
        if (spec_values && Object.keys(spec_values).length !== 0) {
          this.setState({
            color: spec_values[0].id,
            size: spec_values[1].id,
          })
        }
        if (attribute_values && Object.keys(attribute_values).length !== 0) {
          const attr = [];
          attribute_values.forEach(item => attr.push(item.id));
          this.setState({
            attrValue: attr,
          });
        }
        if(demand && Object.keys(demand).length !== 0) {
          const { attachments } = demand;
          if(attachments && Object.keys(attachments).length !== 0) {
            this.setState({
              fileList: attachments.filter(item => item.type === 'file'),
            })
          }
        }
      }
    });
  };

  handleActions = (key, record) => {
    if (key === 'read') {
      router.push('/production/new-product/proofing-detail', { proofingId: record.id, flowId: record.workflow_run.id });
    } else if (key === 'action') {
      router.push('/production/new-product/proofing', { proofingId: record.id, flowId: record.workflow_run.id });
    }
  };


  renderAttributeFilters = attr => {
    const { infoDisable } = this.state;
    const { values } = attr;
    return (
      <Select style={{ maxWidth: 286, width: '100%' }} placeholder="请选择属性值" disabled={infoDisable}>
        {values.map(value => (
          <Option key={value.id} value={value.id}>
            {value.description}
          </Option>
        ))}
      </Select>
    );
  };

  // 提交需求审核
  submit = () => {
    const { location: { state: { flowId } }, dispatch, form } = this.props;
    form.validateFieldsAndScroll([
      'base.sn',
      'base.title',
      'base.category_id',
      'base.develop_type',
      'base.expected_start_time',
      'base.expected_order_time',
      'color',
      'size',
      'demand.remark',
      'demand.img_ids',
      'demand.link',
      'demand.file_ids',
      'attrs',], (err, fieldValues) => {
      if (err) {
        return;
      }
      // 对基本信息日期格式处理
      const { expected_start_time, expected_order_time } = fieldValues.base;
      fieldValues.base.expected_start_time = moment(expected_start_time).format('YYYY-MM-DD');
      fieldValues.base.expected_order_time = moment(expected_order_time).format('YYYY-MM-DD');

      // 对需求信息格式处理
      const { color, size, attrs } = fieldValues;
      fieldValues.demand.spec_ids = [color, size];
      fieldValues.demand.attribute_ids = attrs;

      dispatch({
        type: 'newProduct/submitToNext',
        payload: { 'id': flowId, data: { payload: fieldValues, action: 'process' } },
        callback: res => {
          if (res.status === 'ok') {
            Modal.success({
              title: '提示',
              content: '提交成功！返回列表。',
              okText: '确定',
              onOk: () => this.goBack(),
            });
          }
        }
      })
    });
  };

  confirmProofing = flag => {
    this.setState({
      proofingFormVisible: !!flag,
    });
  };

  confirmReject = flag => {
    this.setState({
      rejectFormVisible: !!flag,
    });
  };

  // 页面返回上一页
  goBack = () => {
    router.goBack();
  };

  // 获取当前流程节点
  renderCurrentStep = (current_step, workflow_steps) => {
    const { name } = current_step;
    return workflow_steps.findIndex(item => item.name === name);
  };

  // 遍历出颜色选项
  renderColorOption = () => {
    const { specs } = this.state;
    if (specs && Object.keys(specs).length !== 0) {
      const colorList = specs.find(item => item.name === 'Color').values;
      return colorList.map(item => (<Option key={item.id} value={item.id}>{item.value}</Option>));
    } else {
      return null;
    }
  };

  // 遍历出尺寸选项
  renderSizeOption = () => {
    const { specs } = this.state;
    if (specs && Object.keys(specs).length !== 0) {
      const sizeList = specs.find(item => item.name === 'Size').values;
      return sizeList.map(item => (<Option key={item.id} value={item.id}>{item.value}</Option>));
    } else {
      return null;
    }
  };

  // 产品分类控制属性展示
  renderAttribute = e => {
    const { dispatch } = this.props;
    const id = e[e.length - 1];
    dispatch({
      type: 'newProduct/fetchAttributes',
      payload: id,
      callback: attributes => {
        this.setState({ attributes });
      },
    });
  };

  // 分情况展示底部操作按钮
  renderFooterButton = current => {
    if (current === 0) {
      return (
        <FooterToolbar maximum={1}>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={() => this.submit()}>
            提交
          </Button>
        </FooterToolbar>
      )
    } else if (current === 1) {
      return (
        <FooterToolbar maximum={1}>
          <Button type="primary" onClick={this.confirmProofing}>
            下单打样
          </Button>
          <Button onClick={this.confirmReject}>
            无法满足需求
          </Button>
        </FooterToolbar>
      )
    } else {
      return null;
    }
  };

  // 控制展示打样信息列表按钮
  renderButton = record => {
    const { user: { currentUser } } = this.props;
    const { workflow_run } = record;
    if (workflow_run && Object.keys(workflow_run).length !== 0) {
      const { current_step, status } = workflow_run;
      if (status === 'process') {
        if (current_step && Object.keys(current_step).length !== 0) {
          const { users = [] } = current_step;
          const rights = users.find(item => item.id === currentUser.id);
          if (Object.keys(rights).length !== 0) {
            return (
              <Fragment>
                <Divider type="vertical" />
                <Button
                  type="primary"
                  icon="edit"
                  size="small"
                  onClick={() => this.handleActions('action', record)}
                />
              </Fragment>
            );
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  renderPic = info => {
    if(info && Object.keys(info).length !== 0) {
      const { demand } = info;
      if(demand && Object.keys(demand).length !== 0) {
        const { attachments } = demand;
        if(attachments && Object.keys(attachments).length !== 0) {
          const imgList = attachments.filter(item => item.type === 'image');
          if(Object.keys(imgList).length !== 0) {
            return imgList.map(item => (<Zmage alt={item.filename} key={item.id} style={{ width: 102, height: 102, marginRight: 5, marginTop: 5 }} src={`${baseUri}/storage/${item.uri}`} />))
          }else {
            return null;
          }
        }else {
          return null;
        }
      }else {
        return null;
      }
    }else {
      return null
    }
  };

  render() {
    const {
      loading,
      newProduct: { process: { workflow_steps = [], current_step = {} }, info, proofingList = [], workflowLogs=[] },
      location: { state: { categories, flowId } },
      form: { getFieldDecorator },
    } = this.props;

    const { attributes = [], proofingFormVisible, rejectFormVisible, infoDisable, color, size, attrValue, showProofingList, fileList, showLog } = this.state;

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
      }
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
      { title: '驳回时间', dataIndex: 'created_at' }
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
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => {
          const { status } = record.workflow_run;
          const statusNow = statusList.find(item => item.value === status);
          return statusNow.label;
        }
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
            {this.renderButton(record)}
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper
        title="新品开发"
        extra={[
          <Button type="link" icon="left" key='right' onClick={this.goBack}>返回</Button>
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
            <div>基本信息</div>
            <Divider style={{ margin: '12px 0' }} />
            <Form layout="inline">
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="新品开发编号" style={{ width: '100%' }}>
                    {getFieldDecorator('base.sn', {
                      rules: [{ required: true, message: '请输入新品开发编号' }],
                      initialValue: info.sn,
                    })(<Input placeholder="请输入" disabled />)}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="标题" style={{ width: '100%' }}>
                    {getFieldDecorator('base.title', {
                      rules: [{ required: true, message: '请输入标题' }],
                      initialValue: info.title,
                    })(<Input placeholder="请输入" disabled={infoDisable} />)}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="产品分类" style={{ width: '100%' }}>
                    {getFieldDecorator('base.category_id', {
                      rules: [{ required: true, message: '请选择产品分类' }],
                      initialValue: info.category_tree,
                    })(
                      <Cascader
                        disabled={infoDisable}
                        options={categories}
                        onChange={this.renderAttribute}
                        placeholder="请选择"
                        style={{ width: '100%' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="开发类型" style={{ width: '100%' }}>
                    {getFieldDecorator('base.develop_type', {
                      rules: [{ required: true, message: '请选择开发类型' }],
                      initialValue: info.develop_type,
                    })(
                      <Select placeholder="请选择" style={{ width: '100%' }} disabled={infoDisable}>
                        <SelectOption value='new'>新品开发</SelectOption>
                        <SelectOption value='old'>老品改良</SelectOption>
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="预计开始时间" style={{ width: '100%' }}>
                    {getFieldDecorator('base.expected_start_time', {
                      rules: [{ required: true, message: '请选择预计开始时间' }],
                      initialValue: info.expected_start_time ? moment(info.expected_start_time) : null,
                    })(
                      <DatePicker
                        disabled={infoDisable}
                        showTime
                        placeholder="请选择"
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="预计下单时间" style={{ width: '100%' }}>
                    {getFieldDecorator('base.expected_order_time', {
                      rules: [{ required: true, message: '请选择预计下单时间' }],
                      initialValue: info.expected_order_time ? moment(info.expected_order_time) : null,
                    })(
                      <DatePicker
                        disabled={infoDisable}
                        showTime
                        placeholder="请选择"
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="创建人" style={{ width: '100%' }}>
                    {getFieldDecorator('user', {
                      rules: [{ required: true, message: '请选择输入创建人' }],
                      initialValue: info.user ? info.user.name : null,
                    })(<Input placeholder="请输入" disabled />)}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="创建时间" style={{ width: '100%' }}>
                    {getFieldDecorator('created_at', {
                      rules: [{ required: true, message: '请选择输入创建人' }],
                      initialValue: info.updated_at,
                    })(<Input placeholder="请输入" disabled />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
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
                      <Select placeholder="请选择" style={{ width: '100%' }} disabled={infoDisable}>
                        {this.renderColorOption()}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col md={8} sm={24}>
                  <Form.Item {...formItemLayout} label="尺码" style={{ width: '100%' }}>
                    {getFieldDecorator('size', {
                      rules: [{ required: true, message: '请选择尺码' }],
                      initialValue: size,
                    })(
                      <Select placeholder="请选择" style={{ width: '100%' }} disabled={infoDisable}>
                        {this.renderSizeOption()}
                      </Select>
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
                    })(<TextArea placeholder="请输入" disabled={infoDisable} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={16} sm={24}>
                  <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="样式图片" style={{ width: '100%' }}>
                    {infoDisable ? this.renderPic(info) :
                      getFieldDecorator('demand.img_ids', {})(
                        <AttachmentUpload
                          params={{ type: 'image' }}
                          num={10}
                          listType='picture-card'
                        />
                      )
                    }
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={16} sm={24}>
                  <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="参考链接" style={{ width: '100%' }}>
                    {getFieldDecorator('demand.link', {
                      initialValue: info.demand ? info.demand.link : null,
                    })(<Input placeholder="请输入" disabled={infoDisable} />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card bordered={false} style={{ marginTop: 10 }}>
            <div>附件信息</div>
            <Divider style={{ margin: '12px 0' }} />
            {infoDisable ? (
              <Table
                size='small'
                rowKey='id'
                columns={columns}
                dataSource={fileList}
                rowSelection={null}
                pagination={false}
              />
            ) : (
              <Form layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={16} sm={24}>
                    <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="附件上传" style={{ width: '100%' }}>
                      {getFieldDecorator('demand.file_ids', {})(
                        <AttachmentUpload
                          params={{ type: 'file' }}
                          listType='text'
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )
            }
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
        <ProofingForm visible={proofingFormVisible} onCancel={this.confirmProofing} id={flowId} goBack={this.goBack} />
        <RejectForm visible={rejectFormVisible} onCancel={this.confirmReject} id={flowId} goBack={this.goBack} />
        {this.renderFooterButton(this.renderCurrentStep(current_step, workflow_steps))}
      </PageHeaderWrapper>
    );
  }
}

export default Develop;
