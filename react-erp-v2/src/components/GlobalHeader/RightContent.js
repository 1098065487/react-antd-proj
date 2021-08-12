import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { Spin, Menu, Icon, Avatar } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import avatar from '@/assets/avatar.png';
import noticeImg from '@/assets/notice.svg';
import msgImg from '@/assets/msg.svg';
import taskImg from '@/assets/task.svg';
import NoticeIcon from '../NoticeIcon';
import HeaderSearch from '../HeaderSearch';
import HeaderDropdown from '../HeaderDropdown';
import SelectLang from '../SelectLang';
import styles from './index.less';

@connect(({ user, loading }) => ({
  user,
  fetchingNotices: loading.effects['user/fetchAuthUnreadNotices'],
}))
class GlobalHeaderRight extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initAuthUnreadNotices();
  }

  initAuthUnreadNotices = () => {
    const { dispatch, user: { currentUser } } = this.props;
    if (Object.keys(currentUser).length) {
      dispatch({
        type: 'user/fetchAuthUnreadNotices',
      });
    }
  };

  handleNoticeData = () => {
    const { user: { unreadNotices } } = this.props;
    if (!unreadNotices || unreadNotices.length === 0) {
      return {};
    }
    const newNotices = unreadNotices.map(notice => {
      const newNotice = { ...notice };
      const { data = {} } = newNotice;
      if (newNotice.created_at) {
        newNotice.datetime = moment(notice.created_at).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (data.type) {
        newNotice.type = data.type;
      }

      return newNotice;
    });

    return groupBy(newNotices, 'type');
  };

  handleGlobalSearch = value => {
    console.log('全局搜索', value);
  };

  handleNoticeVisibleChange = visible => {
    if (visible) {
      this.initAuthUnreadNotices();
    }
  };

  changeReadState = (item) => {
    const { id } = item;
    const { dispatch } = this.props;
    dispatch({
      type: 'user/readNotice',
      payload: { id },
    });
  };

  handleClear = (item, type) => {
    console.log(item, type);
  };

  handleViewMore = (type, event) => {
    console.log(type, event);
  };

  render() {
    const {
      currentUser,
      fetchingNotices,
      onMenuClick,
      theme,
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="userCenter">
          <Icon type="user" />
          <FormattedMessage id="menu.account.center" defaultMessage="account center" />
        </Menu.Item>
        <Menu.Item key="userSetting">
          <Icon type="setting" />
          <FormattedMessage id="menu.account.settings" defaultMessage="account settings" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />
          <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
        </Menu.Item>
      </Menu>
    );

    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    const notices = this.handleNoticeData();

    return (
      <div className={className}>
        {/*<HeaderSearch*/}
        {/*  className={`${styles.action} ${styles.search}`}*/}
        {/*  placeholder={formatMessage({ id: 'component.globalHeader.search' })}*/}
        {/*  dataSource={[*/}
        {/*    formatMessage({ id: 'component.globalHeader.search.example1' }),*/}
        {/*    formatMessage({ id: 'component.globalHeader.search.example2' }),*/}
        {/*    formatMessage({ id: 'component.globalHeader.search.example3' }),*/}
        {/*  ]}*/}
        {/*  onSearch={this.handleGlobalSearch}*/}
        {/*  onPressEnter={this.handleGlobalSearch}*/}
        {/*/>*/}
        <NoticeIcon
          className={styles.action}
          count={currentUser.unread_count}
          onItemClick={this.changeReadState}
          loading={fetchingNotices}
          locale={{
            emptyText: formatMessage({ id: 'component.noticeIcon.empty' }),
            clear: formatMessage({ id: 'component.noticeIcon.clear' }),
            viewMore: formatMessage({ id: 'component.noticeIcon.view-more' }),
            notice: formatMessage({ id: 'component.globalHeader.notification' }),
            message: formatMessage({ id: 'component.globalHeader.message' }),
            task: formatMessage({ id: 'component.globalHeader.event' }),
          }}
          onClear={this.handleClear}
          onPopupVisibleChange={this.handleNoticeVisibleChange}
          onViewMore={this.handleViewMore}
          clearClose
        >
          <NoticeIcon.Tab
            count={notices.order && notices.order.length}
            list={notices.order}
            title={formatMessage({ id: 'component.globalHeader.order' })}
            name="notice"
            emptyText={formatMessage({ id: 'component.globalHeader.order.empty' })}
            emptyImage={noticeImg}
            showViewMore
          />
          <NoticeIcon.Tab
            count={notices.message && notices.message.length}
            list={notices.message}
            title={formatMessage({ id: 'component.globalHeader.message' })}
            name="message"
            emptyText={formatMessage({ id: 'component.globalHeader.message.empty' })}
            emptyImage={msgImg}
            showViewMore
          />
          <NoticeIcon.Tab
            count={notices.task && notices.task.length}
            list={notices.task}
            title={formatMessage({ id: 'component.globalHeader.event' })}
            name="task"
            emptyText={formatMessage({ id: 'component.globalHeader.event.empty' })}
            emptyImage={taskImg}
            showViewMore
          />
        </NoticeIcon>
        {currentUser.name ? (
          <HeaderDropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar
                size="small"
                className={styles.avatar}
                src={currentUser.avatar || avatar}
                alt="avatar"
              />
              <span className={styles.name}>{currentUser.name}</span>
            </span>
          </HeaderDropdown>
        ) : (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        )}
        <SelectLang className={styles.action} />
      </div>
    );
  }
}

export default GlobalHeaderRight;
