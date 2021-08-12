import React, { PureComponent } from 'react';
import { Form, Modal, Select, Radio} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';

const { Item } = Form;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const shipLevelList = [
  { key: '1', value: 'Standard' },
  { key: '2', value: 'Expedited' },
  { key: '3', value: 'SecondDay' },
  { key: '4', value: 'NextDay' },
];

@connect(({ platform }) => ({
  platform,
}))
@Form.create()
class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = () => {
    const { dispatch, form, current, showForm } = this.props;
    const { id } = current;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'platform/updateOrder',
        payload: { id, data: fieldValues },
        callback: () => showForm(false, {}, true),
      });
    });
  };

  handleCancel = () => {
    const { showForm } = this.props;
    showForm(false);
  };

  renderIgnore = () => {
    const { current: { ignore_shipment } } = this.props;
    if(ignore_shipment === null) {
      return false;
    }
    return ignore_shipment;
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      current = {},
    } = this.props;

    return (
      <Modal
        title={formatMessage({ id: 'platform.edit.form-title' })}
        visible={visible}
        destroyOnClose
        width={600}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Item {...formLayout} label={formatMessage({ id: 'platform.edit.whether-ignore-shipment' })}>
          {getFieldDecorator('ignore_shipment', {
            rules: [{ required: true, message: formatMessage({ id: 'platform.edit.tip.choose' }) }],
            initialValue: this.renderIgnore(),
          })(
            <Radio.Group
              style={{width: '100%'}}
              options={[
                { label: formatMessage({ id: 'platform.edit.whether-ignore-shipment.yes' }), value: true },
                { label: formatMessage({ id: 'platform.edit.whether-ignore-shipment.no' }), value: false }
              ]}
            />
          )}
        </Item>
        <Item {...formLayout} label={formatMessage({ id: 'platform.table.th.ship-level' })}>
          {getFieldDecorator('local_ship_level', {
            rules: [{ required: true, message: formatMessage({ id: 'platform.edit.tip.choose' }) }],
            initialValue: current.local_ship_level,
          })(
            <Select
              placeholder={formatMessage({ id: 'platform.table.th.ship-level' })}
              style={{ width: '100%' }}
            >
              {shipLevelList.map(item => <Option key={item.key} value={item.value}>{item.value}</Option>)}
            </Select>,
          )}
        </Item>
      </Modal>
    );
  }
}

export default EditForm;
