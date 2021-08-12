import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Badge, Icon } from 'antd';
import StandardTable from '@/components/StandardTable';
import { baseUri } from '@/defaultSettings';

const status = {
  create: { status: 'warning', text: '等待中' },
  processing: { status: 'processing', text: '处理中' },
  finish: { status: 'success', text: '已结束' },
};

const mappings = {
  'product': '基准产品数据',
  'annual_demand': '在售商品需求',
  'annual_seller_demand': '可售商品需求',
  'annual_base_demand': '产品需求',
};

@connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/fetchAuthExports'],
}))
class Imports extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pagination: {},
      filters: {},
      sorter: { field: 'updated_at', order: 'desc' },
    };
  }

  componentDidMount() {
    this.initAuthImportList();
  }


  // eslint-disable-next-line react/sort-comp
  initAuthImportList = () => {
    const { dispatch } = this.props;
    const { pagination, filters, sorter } = this.state;
    dispatch({
      type: 'user/fetchAuthExports',
      payload: { pagination, filters, sorter },
    });
  };

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/save',
      payload: { importList: {} },
    });
  }

  renderStatus = key => {
    const mapping = status[key];
    return mapping ?
      <Badge status={mapping.status} text={mapping.text} /> :
      <Badge text={key} />;
  };

  handleStandardTableChange = (pagination, filters) => {
    this.setState({
        pagination,
        filters,
      }, () => this.initAuthImportList(),
    );
  };

  render() {
    const {
      loading,
      user: { exportList },
    } = this.props;
    const columns = [
      { title: 'ID', dataIndex: 'id' },
      {
        title: '类型',
        dataIndex: 'type',
        render: (text) => mappings[text] || text,
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => this.renderStatus(record.status),
      },
      {
        title: '结果',
        dataIndex: 'file_path',
        render: text => {
          return text ?
            <a href={`${baseUri}/storage/${text}`} target="_blank"><Icon type='file-excel' />下载</a> :
            <span><Icon type="exception" />未知</span>;
        },
      },
      {
        title: '错误信息',
        dataIndex: 'error_msg',
        width: 520,
      },
      { title: '下载时间', dataIndex: 'created_at' },
    ];
    return (
      <StandardTable
        loading={loading}
        columns={columns}
        dataSource={exportList}
        onChange={this.handleStandardTableChange}
      />
    );
  }
}

export default Imports;
