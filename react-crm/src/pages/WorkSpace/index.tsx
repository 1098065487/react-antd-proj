import React from 'react';
import { Collapse, Divider } from 'antd';
import { Link } from 'umi';
import { PageContainer } from "@ant-design/pro-layout";
import globalStyles from "@/global.less";
import styles from './index.less';

const { Panel } = Collapse;

const renderPanelHeader = (title: string) => {
  return (
    <div className={styles.workspace_panel_header}>
      <h3>{title}</h3>
      <Divider className={styles.workspace_panel_header_divider} />
    </div>
  );
};

const renderLink = (route: string, name: string) => {
  return <Link to={route} className={styles.workspace_link}>{name}</Link>;
};

const WorkSpace: React.FC<{}> = () => {
  return (
    <PageContainer
      className={globalStyles.blank_header}
      header={{
        title: undefined,
        breadcrumb: undefined,
      }}
    >
      <div>
        <Collapse defaultActiveKey={['1', '2', '3']} ghost className={styles.workspace_collapse}>
          <Panel header={renderPanelHeader('红人CASE')} key="1">
            <div className={styles.workspace_panel_content}>
              {renderLink('/case/celebrity', '全部红人')}
            </div>
          </Panel>
          <Panel header={renderPanelHeader('资料库')} key="2">
            <div className={styles.workspace_panel_content}>
              {renderLink('/', '发货单库')}
              {renderLink('/', '链接库')}
              {renderLink('/', 'Campaign库')}
              {renderLink('/data/products', '商品库')}
            </div>
          </Panel>
          <Panel header={renderPanelHeader('参数设置')} key="3">
            <div className={styles.workspace_panel_content}>
              {renderLink('/parameter/tag', 'Tag')}
              {renderLink('/parameter/brand', '品牌页')}
              {renderLink('/parameter/medium', 'Medium')}
              {renderLink('/parameter/platform', '平台')}
              {renderLink('/parameter/short-link', 'Short Link')}
            </div>
          </Panel>
        </Collapse>
      </div>
    </PageContainer>
  );
};

export default WorkSpace;
