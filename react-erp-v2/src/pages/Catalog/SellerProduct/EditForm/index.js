import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, message, Cascader, Button } from 'antd';
import { connect } from 'dva';
import ErrorInfo from "@/components/ErrorInfo";

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@connect(({ sellerProduct }) => ({
  sellerProduct,
}))
@Form.create()
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      record: {},
    };
  }

  componentDidMount() {
    const { dispatch, current = {} } = this.props;
    if(Object.keys(current).length !== 0) {
      dispatch({
        type: 'sellerProduct/fetchOne',
        payload: { id: current.id, params: {} },
        callback: res => {
          this.setState({ record: res });
        }
      });
    }

  }

  handleSubmit = () => {
    this.setState({
      errors: {}
    });
    const { dispatch, form, current, showForm } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      if (current && Object.keys(current).length !== 0) {
        const { id } = current;
        dispatch({
          type: 'sellerProduct/updateOne',
          payload: { id, params: fieldValues },
          callback: (res) => {
            if(res.status === 'ok') {
              message.success('更新成功！');
              showForm(false, {}, true);
            }
            if(res.status === 'error') {
              this.setState({
                errors: res.body.errors || {}
              });
              message.error('更新失败！')
            }
          }
        });
      } else {
        dispatch({
          type: 'sellerProduct/createOne',
          payload: fieldValues,
          callback: (res) => {
            if (res.status === 'ok') {
              message.success('添加成功！');
              showForm(false, {}, true);
            }
            if(res.status === 'error') {
              this.setState({
                errors: res.body.errors || {}
              });
              message.error('添加失败！')
            }
          },
        });
      }
    });
  };

  handleCancel = () => {
    const { showForm } = this.props;
    showForm(false);
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      brandList,
      categories,
    } = this.props;

    const { errors, record } = this.state;

    return (
      <Modal
        visible={visible}
        destroyOnClose
        width={600}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
        footer={[
          <ErrorInfo key='errors' errors={errors} />,
          <Button key="cancel" onClick={this.handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            确定
          </Button>,
        ]}
      >
        <Item {...formLayout} label="父SKU">
          {getFieldDecorator('spu', {
            rules: [{ required: true, message: '请输入父SKU！' }],
            initialValue: record.spu,
          })(<Input placeholder="请输入父SKU" />)}
        </Item>
        <Item {...formLayout} label="品牌">
          {getFieldDecorator('brand_id', {
            initialValue: record.brand_id,
          })(
            <Select allowClear placeholder="请选择品牌" style={{ width: '100%' }}>
              {brandList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
            </Select>
          )}
        </Item>
        <Item {...formLayout} label="产品分类">
          {getFieldDecorator('category_id', {
            initialValue: record.category_path,
          })(
            <Cascader
              options={categories}
              placeholder="请选择产品分类"
              style={{ width: '100%' }}
            />
          )}
        </Item>
      </Modal>
    );
  }
}

export default EditForm;
