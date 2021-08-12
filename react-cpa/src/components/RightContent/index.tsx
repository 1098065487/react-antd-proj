// import { Tooltip, Tag, Space } from 'antd';
import { Tag, Space, Tooltip } from 'antd';
import { CloudSyncOutlined } from '@ant-design/icons';
// import { QuestionCircleOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useModel, SelectLang } from 'umi';
import ImportAndExport from '@/components/ImportAndExport';
import { handleIOMethod, IOType } from '@/components/ImportAndExport/data.d';
import Avatar from './AvatarDropdown';
// import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.FC<{}> = () => {
  const { initialState } = useModel('@@initialState');

  const [visible, setVisible] = useState(false);
  const [ioType, setIoType] = useState<IOType>('import');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  const handleIoVisible: handleIOMethod = (flag, key) => {
    setVisible(flag);
    if (key) {
      setIoType(key);
    }
  };

  return (
    <>
      <Space className={className}>
        <Tooltip title="导入导出列表">
          <div onClick={() => handleIoVisible(true)}>
            <span className={`${styles.action} ${styles.account}`}>
              <CloudSyncOutlined style={{ fontSize: 20 }} />
            </span>
          </div>
        </Tooltip>
        {/* <HeaderSearch
          className={`${styles.action} ${styles.search}`}
          placeholder="站内搜索"
          defaultValue="umi ui"
          options={[
            { label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>, value: 'umi ui' },
            {
              label: <a href="next.ant.design">Ant Design</a>,
              value: 'Ant Design',
            },
            {
              label: <a href="https://protable.ant.design/">Pro Table</a>,
              value: 'Pro Table',
            },
            {
              label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
              value: 'Pro Layout',
            },
          ]}
          // onSearch={value => {
          //   console.log('input', value);
          // }}
        />
        <Tooltip title="使用文档">
          <span
            className={styles.action}
            onClick={() => {
              window.location.href = 'https://pro.ant.design/docs/getting-started';
            }}
          >
            <QuestionCircleOutlined />
          </span>
        </Tooltip> */}
        <Avatar />
        {/* {REACT_APP_ENV && (
          <span>
            <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
          </span>
        )} */}
        <SelectLang className={styles.action} />
      </Space>
      {visible ? (
        <ImportAndExport
          visible={visible}
          type={ioType}
          importVisible={false}
          handleDrawerVisible={handleIoVisible}
        />
      ) : null}
    </>
  );
};
export default GlobalHeaderRight;
