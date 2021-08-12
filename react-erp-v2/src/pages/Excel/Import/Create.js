import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Upload, Select, Divider, Icon, Button } from 'antd';
import router from 'umi/router';
import { getUploadProps } from '@/utils/utils';
import { baseUri } from '@/defaultSettings';
import styles from './style.less';

const { Option } = Select;
const { Dragger } = Upload;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const mappings = [
  {
    key: 'product',
    label: '基准产品数据',
  },
  {
    key: 'seller_product',
    label: '可售商品数据',
  },
  {
    key: 'platform_product',
    label: '在售商品数据',
  },
  {
    key: 'annual_demand',
    label: '在售商品需求数据',
  },
  {
    key: 'warehouse_inventory',
    label: 'Inflow库存数据（物流）',
  },
  {
    key: 'factory_product',
    label: '工厂产品数据',
  },
  {
    key: 'factory_inventory',
    label: '工厂库存数据/CN单品',
  },
  {
    key: 'factory_production',
    label: '工厂生产计划数据',
  },
  {
    key: 'seller_product_mapping',
    label: '可售商品-产品映射关系',
  },
  {
    key: 'product_mapping',
    label: '产品-工厂产品映射关系',
  },
  {
    key: 'inflow_mapping',
    label: '可售商品-INFLOW商品映射',
  },
  {
    key: 'amazon_order',
    label: 'MD北美订单数据',
  },
  {
    key: 'repair_product_mapping',
    label: '修复系统产品数据关系',
  },
  {
    key: 'amazon_monthly_data',
    label: '亚马逊月报表（访问量、转化率）',
  },
  {
    key: 'dirty_product',
    label: '删除商品',
  },
  {
    key: 'factory_order_product_item',
    label: '需求单',
  },
  {
    key: 'product_inflow_warehouse_inventory',
    label: '可售/Inflow单品',
  },
  {
    key: 'transfer',
    label: '调拨需求单',
  },
  {
    key: 'transfer_order',
    label: '调拨单',
  },
];

@connect(({ excel, loading }) => ({
  excel,
  loading: loading.effects['excel/createImports'],
}))
@Form.create()
class CreateStep extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      location: {
        query: { type = 'product', id = 'new' },
      },
    } = props;
    this.state = {
      type,
      id,
      disable: true,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = this.state;
    if (id && id !== 'new') {
      dispatch({
        type: 'excel/fetchAnImport',
        payload: { id },
        callback: res => {
          const { status } = res;
          if (status === 'create') {
            router.push(`/excel/imports/acknowledge?id=${id}`);
          } else {
            router.push(`/excel/imports/${status}?id=${id}`);
          }
        },
      });
    }
  }

  handleTypeChange = type => {
    this.setState({ type });
  };

  // 可以把 onChange 的参数（如 event）转化为控件的值
  handleUpload = e => {
    const {
      file: { status, name, response },
    } = e;
    if (status === 'done') {
      this.setState({
        disable: false,
      });
    }
    return { name, path: response && response.url };
  };

  // 提交数据
  handleSubmit = e => {
    e.preventDefault();
    const {
      dispatch,
      form,
      location: {
        query: { type = 'product' },
      },
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'excel/createImports',
          payload: values,
          callback: res => {
            const { id } = res;
            router.push(`/excel/imports/acknowledge?id=${id}&type=${type}`);
          },
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      loading,
      location: {
        query: { type: initialType = '' },
      },
    } = this.props;
    const { type, disable } = this.state;
    const uploadProps = getUploadProps();

    return (
      <Fragment>
        <Form {...formItemLayout} onSubmit={this.handleSubmit} className={styles.stepForm}>
          <Form.Item label="数据类型" hasFeedback>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '请选择数据类型' }],
              initialValue: type,
            })(
              <Select
                disabled={initialType !== ''}
                onChange={this.handleTypeChange}
                style={{ width: 200 }}
                placeholder="请选择上传数据类型"
              >
                {mappings.map(m => (
                  <Option key={m.key} value={m.key}>
                    {m.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="上传文件">
            {getFieldDecorator('file', {
              rules: [{ required: true, message: '请上传数据文件' }],
              getValueFromEvent: this.handleUpload,
            })(
              <Dragger {...uploadProps} data={{ type: 'import' }} accept=".csv,.xlsx">
                <p className="ant-upload-drag-icon">
                  <Icon type="cloud-upload" />
                </p>
                <p className="ant-upload-text">单击或拖动文件到此区域上载！</p>
              </Dragger>
            )}
          </Form.Item>
          <Form.Item label="模版">
            <a href={`${baseUri}/templates/${type}.xlsx`} target="_blank" style={{ fontSize: 14 }}>
              <Icon type="file-excel" />
              点击下载
            </a>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
            <Button type="primary" htmlType="submit" loading={loading} disabled={disable}>
              下一步
            </Button>
          </Form.Item>
        </Form>
        <Divider style={{ margin: '40px 0 24px' }} />
        <div className={styles.desc}>
          <h3>说明</h3>
          <h4>上传数据</h4>
          <p>首先选择要上传的数据类型，然后上传你的excel文件，上传点击下一步</p>
          <h4>支持的数据类型，请确保选择的正确性，避免系统报错</h4>
          <ul>
            {mappings.map(m => (
              <li key={m.key}>{`${m.key}（${m.label}）`}</li>
            ))}
          </ul>
        </div>
      </Fragment>
    );
  }
}

export default CreateStep;
