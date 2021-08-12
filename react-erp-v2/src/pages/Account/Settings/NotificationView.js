import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { Switch, List } from 'antd';

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
class NotificationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noticeLoading: false,
      taskLoading: false,
    };
  }

  onChange = (checked, type) => {
    const { dispatch } = this.props;
    const payload = {};
    payload[type] = checked;
    const status = {};
    status[`${type}Loading`] = true;
    this.setState(status);
    dispatch({
      type: 'user/updateAuthDynamic',
      payload,
      callback: () => {
        status[`${type}Loading`] = false;
        this.setState(status);
      },
    });
  };

  getData = () => {
    const { currentUser: { dynamic } } = this.props;
    const { noticeLoading, taskLoading } = this.state;

    return [
      {
        title: formatMessage({ id: 'app.settings.notification.messages' }, {}),
        description: formatMessage({ id: 'app.settings.notification.messages-description' }, {}),
        actions: [
          <Switch
            checkedChildren={formatMessage({ id: 'app.settings.open' })}
            unCheckedChildren={formatMessage({ id: 'app.settings.close' })}
            checked={dynamic && dynamic.notice}
            onChange={(checked) => this.onChange(checked, 'notice')}
            loading={noticeLoading}
          />,
        ],
      },
      {
        title: formatMessage({ id: 'app.settings.notification.todo' }, {}),
        description: formatMessage({ id: 'app.settings.notification.todo-description' }, {}),
        actions: [
          <Switch
            checkedChildren={formatMessage({ id: 'app.settings.open' })}
            unCheckedChildren={formatMessage({ id: 'app.settings.close' })}
            checked={dynamic && dynamic.task}
            onChange={(checked) => this.onChange(checked, 'task')}
            loading={taskLoading}
          />,
        ],
      },
    ];
  };

  render() {
    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData()}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Fragment>
    );
  }
}

export default NotificationView;
