import React, { Component, Fragment } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Spin,
  Steps,
  DatePicker,
  Divider,
  Descriptions,
  Checkbox,
  Radio,
  Modal,
} from 'antd';
import { connect } from 'dva';
import { router } from 'umi';
import _ from 'lodash';
import moment from 'moment';
import Zmage from 'react-zmage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FooterToolbar from '@/components/FooterToolbar';
import AttachmentUpload from '@/components/AttachmentUpload';
import { baseUri } from '@/defaultSettings';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const requirementOptions = [
  { label: '颜色符合', value: '1' },
  { label: '材质符合', value: '2' },
  { label: '工艺符合', value: '3' },
  { label: '成本符合', value: '4' },
  { label: '尺码符合', value: '5' },
];
const resultOptions = [
  { label: '符合需求', value: 'agree' },
  { label: '重新打样', value: 'remake' },
  { label: '终止打样', value: 'abort' },
];
const reasonList = [
  { label: '工艺无法达到', value: '1' },
  { label: '原材料无法满足', value: '2' },
  { label: '需求设计有缺陷', value: '3' },
  { label: '生产成本过高', value: '4' },
];

@connect(({ newProduct, category, loading }) => ({
  newProduct,
  category,
  searchLoading: loading.effects['user/fetchUsers'],
}))
@Form.create()
class Proofing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      factorySelect: 'default',
      operationSelect: 'default',
      factoryOptionDisable: false,
      factoryInfo: {},
    };
  }

  componentDidMount() {
    this.initProofingProcess();
    this.initProofingInfo();
  }

  initProofingProcess = () => {
    const { location: { state: { flowId } }, dispatch } = this.props;
    dispatch({
      type: 'newProduct/fetchProcess',
      payload: flowId,
      callback: res => {
        const { current_step } = res.body;
        if (current_step.name === 'check' || current_step.name === 'finish') {
          this.setState({
            factoryOptionDisable: true,
          });
        }
      },
    });
  };

  initProofingInfo = () => {
    const { location: { state: { proofingId } }, dispatch } = this.props;
    dispatch({
      type: 'newProduct/fetchProofingInfo',
      payload: { id: proofingId, params: { with: ['newProduct', 'samples.attachments', 'user'] } },
      callback: res => {
        const { samples = [] } = res.body;
        if (samples && Object.keys(samples).length !== 0) {
          const factoryInfo = samples.filter(item => item.type === 'factory');
          if (factoryInfo && Object.keys(factoryInfo).length !== 0) {
            const { result } = factoryInfo[0];
            this.setState({
              factorySelect: result,
              'factoryInfo': factoryInfo[0],
            });
          }
        }
      },
    });
  };

  searchUsers = name => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUsers',
      payload: { filters: { 'name': name } },
      callback: (res) => {
        this.setState({ users: res.body });
      },
    });
  };

  submit = key => {
    const { location: { state: { flowId } }, dispatch, form } = this.props;
    if (key === 'make') {
      dispatch({
        type: 'newProduct/submitToNext',
        payload: { 'id': flowId, data: { action: 'submit' } },
        callback: res => {
          if (res.status === 'ok') {
            Modal.success({
              title: '提示',
              content: '提交成功！返回上一步。',
              okText: '确定',
              onOk: () => this.goBack(),
            });
          }
        },
      });
    } else if (key === 'test') {
      form.validateFieldsAndScroll([
        'factory.sn',
        'factory.demand_detail',
        'factory.img_ids',
        'factory.remark',
        'factory.result',
        'factory.details.logistics_sn',
        'factory.details.users',
        'factory.details.description',
        'factory.details.expected_start_time',
        'factory.details.expected_end_time',
        'factory.details.remark',
        'factory.details.reason'], (err, fieldValues) => {
        if (err) {
          return;
        }
        const { result } = fieldValues.factory;
        let action = 'submit';
        if (result === 'agree') {
          action = 'submit';
        } else if (result === 'remake') {
          const { expected_start_time, expected_end_time } = fieldValues.factory.details;
          if (expected_start_time || expected_end_time) {
            fieldValues.factory.details.expected_start_time = expected_start_time ? moment(expected_start_time).format('YYYY-MM-DD') : '';
            fieldValues.factory.details.expected_end_time = expected_end_time ? moment(expected_end_time).format('YYYY-MM-DD') : '';
          }
          action = 'reject';
        } else if (result === 'abort') {
          action = 'abort';
        }

        dispatch({
          type: 'newProduct/submitToNext',
          payload: { 'id': flowId, data: { payload: fieldValues.factory, 'action': action } },
          callback: res => {
            if (res.status === 'ok') {
              Modal.success({
                title: '提示',
                content: '提交成功！返回列表。',
                okText: '确定',
                onOk: () => this.goBack(),
              });
            }
          },
        });
      });
    } else if (key === 'check') {
      form.validateFieldsAndScroll([
        'operation.demand_detail',
        'operation.img_ids',
        'operation.remark',
        'operation.result',
        'operation.details.expected_start_time',
        'operation.details.expected_end_time',
        'operation.details.remark',
        'operation.details.reason',
        'operation.details.description'], (err, fieldValues) => {
        if (err) {
          return;
        }
        const { result } = fieldValues.operation;
        let action = 'submit';
        if (result === 'agree') {
          action = 'submit';
        } else if (result === 'remake') {
          const { expected_start_time, expected_end_time } = fieldValues.operation.details;
          if (expected_start_time || expected_end_time) {
            fieldValues.operation.details.expected_start_time = expected_start_time ? moment(expected_start_time).format('YYYY-MM-DD') : '';
            fieldValues.operation.details.expected_end_time = expected_end_time ? moment(expected_end_time).format('YYYY-MM-DD') : '';
          }
          action = 'reject';
        } else if (result === 'abort') {
          action = 'abort';
        }

        dispatch({
          type: 'newProduct/submitToNext',
          payload: { 'id': flowId, data: { payload: fieldValues.operation, 'action': action } },
          callback: res => {
            if (res.status === 'ok') {
              Modal.success({
                title: '提示',
                content: '提交成功！返回列表。',
                okText: '确定',
                onOk: () => this.goBack(),
              });
            }
          },
        });
      });
    }
  };

  goBack = () => {
    router.goBack();
  };

  // 获取当前流程节点
  renderCurrentStep = (current_step, workflow_steps) => {
    const { name } = current_step;
    return workflow_steps.findIndex(item => item.name === name);
  };

  // 分情况展示底部操作按钮
  renderFooterButton = current => {
    // 提交试样按钮
    if (current === 'make') {
      return (
        <FooterToolbar maximum={1}>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={() => this.submit(current)}>
            确认
          </Button>
        </FooterToolbar>
      );
    } else if (current === 'test' || current === 'check') {
      return (
        <FooterToolbar maximum={1}>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={() => this.submit(current)}>
            提交
          </Button>
        </FooterToolbar>
      );
    } else {
      return null;
    }
  };

  // 获取工厂试样选择
  renderFactoryIndex = e => {
    this.setState({
      factorySelect: e.target.value,
    });
  };

  // 获取运营试样选择
  renderOperationIndex = e => {
    this.setState({
      operationSelect: e.target.value,
    });
  };

  // 处理满足需求字段字符串返回数组
  renderFactoryDemandDetail = value => {
    if (value && Object.keys(value).length > 1) {
      return value.split(',');
    }
    if (value && Object.keys(value).length === 1) {
      const arr = [];
      arr.push(value);
      return arr;
    }
    return [];
  };

  // 根据工厂试样选择展示form
  renderFactoryResult = (form, flag) => {
    const { searchLoading } = this.props;
    const { getFieldDecorator } = form;
    const { users, factoryOptionDisable, factoryInfo } = this.state;
    if (flag === 'agree') {
      return (
        <Fragment>
          <Form.Item {...formItemLayout} label="物流编号" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.logistics_sn', {
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? factoryInfo.details.logistics_sn : null,
            })(<Input placeholder="请输入" disabled={factoryOptionDisable} />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="运营负责人" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.users', {
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? factoryInfo.details.users : [],
            })(
              <Select
                disabled={factoryOptionDisable}
                mode='multiple'
                showSearch
                allowClear
                labelInValue
                style={{ width: '100%' }}
                placeholder="请查询选择"
                notFoundContent={searchLoading ? <Spin size="small" /> : null}
                filterOption={false}
                onSearch={_.debounce(this.searchUsers, 500)}
              >
                {Object.keys(users).length === 0 ? null : users.map(item => <Option
                  key={item.value}
                  value={item.value}
                >{item.label}</Option>)}
              </Select>,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="描述" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.description', {
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? factoryInfo.details.description : null,
            })(<TextArea placeholder="请输入" disabled={factoryOptionDisable} />)}
          </Form.Item>
        </Fragment>
      );
    }

    if (flag === 'remake') {
      return (
        <Fragment>
          <Form.Item {...formItemLayout} label="计划开始时间" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.expected_start_time', {
              rules: [{ required: true, message: '请选择计划开始时间' }],
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? moment(factoryInfo.details.expected_start_time) : null,
            })(
              <DatePicker
                disabled={factoryOptionDisable}
                showTime
                placeholder="请选择"
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
              />,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="计划结束时间" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.expected_end_time', {
              rules: [{ required: true, message: '请选择计划结束时间' }],
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? moment(factoryInfo.details.expected_end_time) : null,
            })(
              <DatePicker
                disabled={factoryOptionDisable}
                showTime
                placeholder="请选择"
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
              />,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="备注" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.remark', {
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? factoryInfo.details.remark : null,
            })(<TextArea placeholder="请输入" disabled={factoryOptionDisable} />)}
          </Form.Item>
        </Fragment>
      );
    }
    if (flag === 'abort') {
      return (
        <Fragment>
          <Form.Item {...formItemLayout} label="终止原因" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.reason', {
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? factoryInfo.details.reason : [],
            })(
              <Select
                disabled={factoryOptionDisable}
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="请选择"
              >
                {reasonList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
              </Select>,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="描述" style={{ width: '70%' }}>
            {getFieldDecorator('factory.details.description', {
              initialValue: (factoryInfo.details && Object.keys(factoryInfo.details).length !== 0) ? factoryInfo.details.description : null,
            })(<TextArea placeholder="请输入" disabled={factoryOptionDisable} />)}
          </Form.Item>
        </Fragment>
      );
    }
    return null;
  };

  // 根据运营试样展示form
  renderOperationResult = flag => {
    const { form: { getFieldDecorator } } = this.props;
    if (flag === 'remake') {
      return (
        <Fragment>
          <Form.Item {...formItemLayout} label="计划开始时间" style={{ width: '70%' }}>
            {getFieldDecorator('operation.details.expected_start_time', {
              rules: [{ required: true, message: '请选择计划开始时间' }],
            })(
              <DatePicker
                showTime
                placeholder="请选择"
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
              />,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="计划结束时间" style={{ width: '70%' }}>
            {getFieldDecorator('operation.details.expected_end_time', {
              rules: [{ required: true, message: '请选择计划结束时间' }],
            })(
              <DatePicker
                showTime
                placeholder="请选择"
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
              />,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="备注" style={{ width: '70%' }}>
            {getFieldDecorator('operation.details.remark', {})(<TextArea placeholder="请输入" />)}
          </Form.Item>
        </Fragment>
      );
    }

    if (flag === 'abort') {
      return (
        <Fragment>
          <Form.Item {...formItemLayout} label="终止原因" style={{ width: '70%' }}>
            {getFieldDecorator('operation.details.reason', {})(
              <Select
                mode='multiple'
                allowClear
                style={{ width: '100%' }}
                placeholder="请选择"
              >
                {reasonList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
              </Select>,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="描述" style={{ width: '70%' }}>
            {getFieldDecorator('operation.details.description', {})(<TextArea placeholder="请输入" />)}
          </Form.Item>
        </Fragment>
      );
    }
    return null;
  };

  renderPic = info => {
    if (info && Object.keys(info).length !== 0) {
      const { attachments } = info;
      if (attachments && Object.keys(attachments).length !== 0) {
        const imgList = attachments.filter(item => item.type === 'image');
        if (Object.keys(imgList).length !== 0) {
          return imgList.map(item => (<Zmage
            alt={item.filename} key={item.id} style={{ width: 102, height: 102, marginRight: 5, marginBottom: 5 }}
            src={`${baseUri}/storage/${item.uri}`}
          />));
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

  render() {
    const {
      newProduct: { process: { workflow_steps = [], current_step = {} }, proofingInfo = {} },
      form: { getFieldDecorator },
      form,
    } = this.props;

    const { factorySelect, operationSelect, factoryOptionDisable, factoryInfo } = this.state;

    return (
      <PageHeaderWrapper
        title="打样信息"
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
              title="打样信息"
              style={{
                marginBottom: 32,
              }}
            >
              <Descriptions.Item label="打样编号">{proofingInfo.sn}</Descriptions.Item>
              <Descriptions.Item
                label="新品开发编号"
              >{proofingInfo.new_product && Object.keys(proofingInfo.new_product).length !== 0 ? proofingInfo.new_product.sn : null}</Descriptions.Item>
              <Descriptions.Item label="计划开始时间">{proofingInfo.expected_start_time}</Descriptions.Item>
              <Descriptions.Item label="计划结束时间">{proofingInfo.expected_end_time}</Descriptions.Item>
              <Descriptions.Item
                label="创建人"
              >{proofingInfo.user && Object.keys(proofingInfo.user).length !== 0 ? proofingInfo.user.name : null}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{proofingInfo.created_at}</Descriptions.Item>
            </Descriptions>
          </Card>

          {(current_step.name !== 'info' && current_step.name !== 'make') ? (
            <Card bordered={false} style={{ marginTop: 10 }}>
              <div>工厂试样</div>
              <Divider style={{ margin: '12px 0' }} />
              <Form layout="inline">
                <Form.Item {...formItemLayout} label="工厂款号" style={{ width: '70%' }}>
                  {getFieldDecorator('factory.sn', {
                    rules: [{ required: true, message: '请输入工厂款号' }],
                    initialValue: factoryInfo.sn,
                  })(<Input placeholder="请输入" disabled={factoryOptionDisable} />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="是否符合需求" style={{ width: '70%' }}>
                  {getFieldDecorator('factory.demand_detail', {
                    initialValue: this.renderFactoryDemandDetail(factoryInfo.demand_detail),
                  })(<Checkbox.Group options={requirementOptions} disabled={factoryOptionDisable} />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="样品图片" style={{ width: '70%' }}>
                  {factoryOptionDisable ? this.renderPic(factoryInfo) :
                    getFieldDecorator('factory.img_ids', {})(
                      <AttachmentUpload
                        params={{ type: 'image' }}
                        num={10}
                        listType='picture-card'
                      />,
                    )
                  }
                </Form.Item>
                <Form.Item {...formItemLayout} label="备注" style={{ width: '70%' }}>
                  {getFieldDecorator('factory.remark', {
                    initialValue: factoryInfo.remark,
                  })(<TextArea placeholder="请输入" disabled={factoryOptionDisable} />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="试样结果" style={{ width: '70%' }}>
                  {getFieldDecorator('factory.result', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: factoryInfo.result,
                  })(<Radio.Group
                    options={resultOptions} onChange={this.renderFactoryIndex} disabled={factoryOptionDisable}
                  />)}
                </Form.Item>
                {this.renderFactoryResult(form, factorySelect)}
              </Form>
            </Card>
          ) : null}

          {(current_step.name === 'check' || current_step.name === 'finish') ? (
            <Card bordered={false} style={{ marginTop: 10 }}>
              <div>运营试样</div>
              <Divider style={{ margin: '12px 0' }} />
              <Form layout="inline">
                <Form.Item {...formItemLayout} label="是否符合需求" style={{ width: '70%' }}>
                  {getFieldDecorator('operation.demand_detail', {})(<Checkbox.Group options={requirementOptions} />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="样品图片" style={{ width: '70%' }}>
                  {getFieldDecorator('operation.img_ids', {})(
                    <AttachmentUpload
                      params={{ type: 'image' }}
                      num={10}
                      listType='picture-card'
                    />,
                  )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="备注" style={{ width: '70%' }}>
                  {getFieldDecorator('operation.remark', {})(<TextArea placeholder="请输入" />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="试样结果" style={{ width: '70%' }}>
                  {getFieldDecorator('operation.result', {
                    rules: [{ required: true, message: '请选择' }],
                  })(<Radio.Group options={resultOptions} onChange={this.renderOperationIndex} />)}
                </Form.Item>
                {this.renderOperationResult(operationSelect)}
              </Form>
            </Card>
          ) : null}

        </Fragment>
        {this.renderFooterButton(current_step.name)}
      </PageHeaderWrapper>
    );
  }
}

export default Proofing;
