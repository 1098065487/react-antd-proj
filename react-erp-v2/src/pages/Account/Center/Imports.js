import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Badge, Button, Icon, Modal, Result } from 'antd';
import StandardTable from '@/components/StandardTable';
import { Pie } from '@/components/Charts';
import Link from 'react-router-dom';
import { baseUri } from '@/defaultSettings';

const status = {
  create: { status: 'warning', text: '待确认' },
  acknowledge: { status: 'error', text: '未处理' },
  processing: { status: 'processing', text: '处理中' },
  finish: { status: 'success', text: '已结束' },
  fail: { status: 'error', text: '失败' },
};

@connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/fetchAuthImports'],
}))
class Imports extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pagination: {},
      filters: {},
      sorter: { field: 'updated_at', order: 'desc' },
      visible: false,
      result: {
        total: 0,
        success: 0,
        skip: 0,
        error: 0,
        error_file: null,
      },
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
      type: 'user/fetchAuthImports',
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

  showResult = (flag, current) => {
    this.setState({
      visible: !!flag,
      result: current.result || {
        total: 0,
        success: 0,
        skip: 0,
        error: 0,
        error_file: null,
      },
    });
  };

  render() {
    const {
      loading,
      user: { importList },
    } = this.props;

    const { visible, result } = this.state;

    const colors = ['#00C853', '#FFAB00', '#F44336'];
    const salesData = [
      {
        x: 'success',
        y: result ? result.success : 0,
      },
      {
        x: 'skip',
        y: result ? result.skip : 0,
      },
      {
        x: 'error',
        y: result ? result.error : 0,
      },
    ];

    const columns = [
      { title: 'ID', dataIndex: 'id' },
      { title: '类型', dataIndex: 'type' },
      { title: '上传文件', dataIndex: 'file_name', render: text => <Fragment><Icon type="file-excel" />{text}</Fragment> },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => this.renderStatus(record.status),
      },
      {
        title: '结果',
        dataIndex: 'result',
        render: (text, record) => (
          <Button
            type="link"
            icon="pie-chart"
            size="small"
            disabled={record.status !== 'finish'}
            onClick={() => this.showResult(true, record)}
          />
        ),
      },
      { title: '上传时间', dataIndex: 'created_at' },
    ];
    const actions = (
      <Fragment>
        <Button type="link">
          {result && result.error_file ?
            <a href={`${baseUri}/storage/${result.error_file}`} target="_blank">下载错误数据</a> : '没有错误数据'}
        </Button>
      </Fragment>
    );
    return (
      <Fragment>
        <StandardTable
          loading={loading}
          columns={columns}
          dataSource={importList}
          onChange={this.handleStandardTableChange}
        />
        {visible ? (
          <Modal
            title="导入详情"
            width={640}
            visible={visible}
            destroyOnClose
            onCancel={() => this.showResult(false, {})}
            footer={null}
          >
            <Result
              status='success'
              subTitle={actions}
              style={{ padding: 0 }}
            >
              <Pie
                hasLegend
                subTitle="导入结果"
                total={result ? result.total : 0}
                colors={colors}
                data={salesData}
                height={200}
                lineWidth={4}
              />
            </Result>
          </Modal>
        ) : null}
      </Fragment>
    );
  }
}

export default Imports;
