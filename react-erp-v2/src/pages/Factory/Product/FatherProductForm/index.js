import React, { PureComponent } from 'react';
import { Cascader, Form, Input, Modal, Select, message, Button } from 'antd';
import { connect } from "dva";
import ErrorInfo from "@/components/ErrorInfo";

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@connect(({ factory }) => ({
  factory
}))
@Form.create()
class FatherProductForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
    };
  }

  handleSubmit = () => {
    this.setState({
      errors: {}
    });
    const { dispatch, form, showForm, current } = this.props;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      if(current && Object.keys(current).length !== 0) {
        const { id } = current;
        dispatch({
          type: 'factory/updateFatherProduct',
          payload: { 'id': id, data: fieldValues },
          callback: (res) => {
            if (res.status === 'ok') {
              message.success('更新成功！');
              showForm(false, {}, true);
            }
            if(res.status === 'error') {
              this.setState({
                errors: res.body.errors || {}
              }, message.error('更新失败！'));
            }
          }
        })
      }else {
        dispatch({
          type: 'factory/createFatherProduct',
          payload: fieldValues,
          callback: (res) => {
            if (res.status === 'ok') {
              message.success('添加成功！');
              showForm(false, {}, true);
            }
            if(res.status === 'error') {
              this.setState({
                errors: res.body.errors || {}
              }, message.error('添加失败！'));
            }
          }
        })
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
      categoryList,
      current,
    } = this.props;

    const { errors } = this.state;

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
        <Item {...formLayout} label="货号">
          {getFieldDecorator('spu', {
            initialValue: current.spu,
            rules: [{ required: true, message: '请输入货号！' }],
          })(<Input placeholder="请输入货号" />)}
        </Item>
        <Item {...formLayout} label="品牌">
          {getFieldDecorator('brand_id', {
            initialValue: current.brand_id,
          })(
            <Select allowClear placeholder="请选择品牌" style={{ width: '100%' }}>
              {brandList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
            </Select>
          )}
        </Item>
        <Item {...formLayout} label="生产款号">
          {getFieldDecorator('production_sn', {
            initialValue: current.production_sn,
          })(<Input placeholder="请输入生产款号" />)}
        </Item>
        <Item {...formLayout} label="产品分类">
          {getFieldDecorator('category', {
            initialValue: current.category,
          })(
            <Cascader options={categoryList} placeholder="请选择产品分类" style={{ width: '100%' }} />
          )}
        </Item>
        <Item {...formLayout} label="中文品名">
          {getFieldDecorator('title', {
            initialValue: current.title,
          })(<Input placeholder="请输入中文品名" />)}
        </Item>
      </Modal>
    );
  }
}

export default FatherProductForm;
