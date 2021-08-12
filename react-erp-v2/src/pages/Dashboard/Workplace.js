import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Row, Col, Card, Avatar } from 'antd';
import EditableLinkGroup from '@/components/EditableLinkGroup';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import avatar from '@/assets/avatar.png';
import styles from './Workplace.less';

@connect(({ user, loading }) => ({
  user,
  currentUserLoading: loading.effects['user/fetchCurrent'],
}))
class Workplace extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { links: [] };
  }

  render() {
    const {
      user: { currentUser },
      currentUserLoading,
    } = this.props;
    const { links } = this.state;

    const pageHeaderContent =
      currentUser && Object.keys(currentUser).length ? (
        <div className={styles.pageHeaderContent}>
          <div className={styles.avatar}>
            <Avatar size="large" src={currentUser.avatar || avatar} />
          </div>
          <div className={styles.content}>
            <div className={styles.contentTitle}>
              早安，{currentUser.name}，祝你开心每一天！
            </div>
            <div>
              {currentUser.title} | {currentUser.signature}
            </div>
          </div>
        </div>
      ) : null;

    const extraContent = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>项目数</p>
          <p>56</p>
        </div>
        <div className={styles.statItem}>
          <p>团队内排名</p>
          <p>
            8<span> / 24</span>
          </p>
        </div>
        <div className={styles.statItem}>
          <p>项目访问</p>
          <p>2,223</p>
        </div>
      </div>
    );

    return (
      <PageHeaderWrapper
        loading={currentUserLoading}
        content={pageHeaderContent}
        extraContent={extraContent}
      >
        <Row gutter={24}>
          <Col xl={8} lg={24} md={24} sm={24} xs={24}>
            <Card
              style={{ marginBottom: 24 }}
              title="快速开始 / 便捷导航"
              bordered={false}
              bodyStyle={{ padding: 0 }}
            >
              <EditableLinkGroup
                links={links}
                linkElement={Link}
              />
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default Workplace;
