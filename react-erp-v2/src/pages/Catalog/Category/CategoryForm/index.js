import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input } from 'antd';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

@connect(({ category }) => ({
  category,
}))
class CategoryForm extends PureComponent {
  constructor(props) {
    super(props);
    const { current, parent } = props;
    this.state = { current, parent };
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { current, parent } = this.state;
    return (
      <Form>
        {Object.keys(parent).length ? ([
          <Item className="hidden">
            {getFieldDecorator('parent_id', {
              initialValue: parent.id,
            })(<Input type="hidden" />)}
          </Item>,
          <Item {...formLayout} label="所属分类">
            <span className="ant-form-text">{parent.name}</span>
          </Item>,
        ]) : null}
        <Item {...formLayout} label="分类">
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input name' }],
            initialValue: current.name,
          })(<Input placeholder="input name" />)}
        </Item>
        <Item {...formLayout} label="SEO标题">
          {getFieldDecorator('meta_title', {
            initialValue: current.meta_title,
          })(<TextArea placeholder="input meta title" />)}
        </Item>
        <Item {...formLayout} label="SEO关键词">
          {getFieldDecorator('meta_keywords', {
            initialValue: current.meta_keywords,
          })(<TextArea placeholder="input meta Keywords" />)}
        </Item>
        <Item {...formLayout} label="SEO描述">
          {getFieldDecorator('meta_description', {
            initialValue: current.meta_description,
          })(<TextArea placeholder="input meta description" />)}
        </Item>
      </Form>
    );
  }
}

export default CategoryForm;
