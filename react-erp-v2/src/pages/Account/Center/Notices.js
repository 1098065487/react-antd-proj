import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tag } from 'antd';
import StandardTable from '@/components/StandardTable';

@connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/fetchAuthNotices'],
}))
class Notices extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchAuthNotices',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/save',
      payload: { noticeList: {} },
    });
  }

  render() {
    const {
      loading,
      user: { noticeList },
    } = this.props;

    const columns = [
      {
        title: '标题',
        dataIndex: 'title',
        render: (text, record) => {
          const { data } = record;
          return data && data.title;
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        render: (text, record) => {
          const { data } = record;
          return data && data.description;
        },
      },
      {
        title: '状态',
        dataIndex: 'read_at',
        render: (text) => {
          return text ?
            <Tag color="#87d068">已读</Tag> :
            <Tag color="#f50">未读</Tag>;
        },
      },
    ];

    return (
      <StandardTable
        loading={loading}
        columns={columns}
        dataSource={noticeList}
      />
    );
  }
}

export default Notices;
