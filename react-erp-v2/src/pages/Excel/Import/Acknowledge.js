import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, Alert, Radio, Divider } from 'antd';
import router from 'umi/router';
import styles from './style.less';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

@connect(({ excel, loading }) => ({
  excel,
  submitting: loading.effects['excel/acknowledgeImports'],
}))
@Form.create()
class Acknowledge extends React.PureComponent {
  constructor(props) {
    super(props);
    const { location: { query } } = props;
    this.state = { query };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query: { id } } = this.state;
    dispatch({
      type: 'excel/fetchAnImport',
      payload: { id },
      callback: res => {
        const { status } = res;
        if (status !== 'create') {
          router.push(`/excel/imports/${status}?id=${id}`);
        }
      },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // 清除数据
    dispatch({
      type: 'excel/save',
      payload: { import: {} },
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch, location: { query: { type = 'product' } } } = this.props;
    const { query: { id } } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'excel/acknowledgeImports',
          payload: { id, params: values },
          callback: data => {
            const { id: iid } = data;
            router.push(`/excel/imports/processing?id=${iid}&type=${type}`);
          },
        });
      }
    });
  };

  render() {
    const { form: { getFieldDecorator }, submitting } = this.props;

    const onPrev = () => {
      router.goBack();
    };

    return (
      <Fragment>
        <Form layout="horizontal" className={styles.stepForm}>
          <Alert
            closable
            showIcon
            message="确认导入后，后台会自动执行，将无法撤回！"
            style={{ marginBottom: 24 }}
          />
          <Form.Item {...formItemLayout} label="重复数据">
            {getFieldDecorator('repetitive_rule', {
              initialValue: 'coverage',
              rules: [
                { required: true, message: '需要指定重复数据处理规则' },
              ],
            })(
              <Radio.Group>
                <Radio.Button value="ignore">忽&nbsp;&nbsp;略</Radio.Button>
                <Radio.Button value="coverage">覆&nbsp;&nbsp;盖</Radio.Button>
              </Radio.Group>,
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="异常数据">
            {getFieldDecorator('exceptional_rule', {
              initialValue: 'record',
              rules: [
                { required: true, message: '指定异常数据处理逻辑' },
              ],
            })(
              <Radio.Group>
                <Radio.Button value="ignore">忽&nbsp;&nbsp;略</Radio.Button>
                <Radio.Button value="record">记&nbsp;&nbsp;录</Radio.Button>
              </Radio.Group>,
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
            <Button disabled={submitting} onClick={onPrev} style={{ marginRight: 8 }}>
              上一步
            </Button>
            <Button type="primary" onClick={this.handleSubmit} loading={submitting}>
              确认
            </Button>
          </Form.Item>
        </Form>
        <Divider style={{ margin: '40px 0 24px' }} />
        <div className={styles.desc}>
          <h3>说明</h3>
          <h4>确认数据处理规则后，点击下一步，跳转到处理页面</h4>
        </div>
      </Fragment>
    );
  }
}

export default Acknowledge;
