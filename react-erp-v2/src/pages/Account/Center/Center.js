import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Card, Tabs } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './Center.less';

class Center extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onTabChange = key => {
    const { match } = this.props;
    switch (key) {
      case 'notices':
        router.push(`${match.url}/notices`);
        break;
      case 'imports':
        router.push(`${match.url}/imports`);
        break;
      case 'exports':
        router.push(`${match.url}/exports`);
        break;
      default:
        break;
    }
  };

  render() {
    const {
      match,
      location,
      children,
    } = this.props;

    const tabList = [
      {
        key: 'notices',
        tab: (
          <span>
            通知 <span style={{ fontSize: 14 }}>(*)</span>
          </span>
        ),
      },
      {
        key: 'imports',
        tab: (
          <span>
            导入 <span style={{ fontSize: 14 }}>(*)</span>
          </span>
        ),
      },
      {
        key: 'exports',
        tab: (
          <span>
            下载 <span style={{ fontSize: 14 }}>(*)</span>
          </span>
        ),
      },
    ];

    return (
      <PageHeaderWrapper>
        <Card
          bordered={false}
          className={styles.centerCard}
        >
          <Tabs
            animated={false}
            className={styles.tabs}
            activeKey={location.pathname.replace(`${match.path}/`, '')}
            onChange={this.onTabChange}
          >
            {tabList.map(item => (
              <Tabs.TabPane tab={item.tab} key={item.key} />
            ))}
          </Tabs>
          {children}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Center;
