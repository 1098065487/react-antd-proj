import { Space, Breadcrumb, Tooltip } from 'antd';
import { CloudSyncOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { SelectLang, getLocale, useModel, history } from 'umi';
import menuCN from '@/locales/zh-CN/menu';
import menuUS from '@/locales/en-US/menu';
import menuBR from '@/locales/pt-BR/menu';
import menuTW from '@/locales/zh-TW/menu';
import { getMenuNameList } from '@/utils/utils';
import ImportAndExport from "@/components/ImportAndExport";
import { handleIOMethod, IOType } from '@/components/ImportAndExport/data.d';
import Avatar from './AvatarDropdown';
// import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC<{}> = () => {
  const { initialState } = useModel('@@initialState');

  const [visible, setVisible] = useState(false);
  const [ioType, setIoType] = useState<IOType>('import');

  // 自定义面包屑数组
  const menuNameList: string[] = [];

  const locale = getLocale(); // 获取全球化语言
  const menuList = getMenuNameList(history.location.pathname); // 根据当前路径截取成菜单配置项
  // 根据语言选择菜单名称配置
  let nameList: any;
  if (locale === 'zh-CN') {
    nameList = menuCN;
  } else if (locale === 'en-US') {
    nameList = menuUS;
  } else if (locale === 'pt-BR') {
    nameList = menuBR;
  } else {
    nameList = menuTW;
  }
  // 遍历菜单配置项，根据名称配置，获取面包屑，并塞进数组使用
  menuList.forEach(e => {
    // 根据最后菜单名最后一项匹配菜单
    const filterName = Object.keys(nameList).filter(o => o.endsWith(e));
    if (filterName.length !== 0) {
      // 刚好匹配length === 1可直接获取
      if (filterName.length === 1) {
        menuNameList.push(nameList[filterName[0]]);
      }
      if (filterName.length > 1) {
        // length > 1时要组合前一级菜单查找
        const idx = menuList.indexOf(e);
        // 其实一级菜单不会重名配置，这里实际不会有idx === 0的情况
        if (idx > 0) {
          const name = `${menuList[idx - 1]}.${menuList[idx]}`;
          // 基本不会出现连续两级菜单重名的情况，以此为终点，不在考虑
          const deepFilterName = filterName.filter(o => o.endsWith(name));
          if (deepFilterName.length !== 0) {
            menuNameList.push(nameList[deepFilterName[0]]);
          }
        }
      }
    } else {
      // 这里放开了，没有匹配上的仍旧原path返回，实际应该关闭，确保一定配置
      menuNameList.push(e);
    }
  });

  const handleIoVisible: handleIOMethod = (flag, key) => {
    setVisible(flag);
    if (key) {
      setIoType(key);
    }
  };

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <>
      <div className={styles.breadcrumb}>
        <Breadcrumb>
          {menuNameList.map((e, idx) => (<Breadcrumb.Item key={idx}>{e}</Breadcrumb.Item>))}
        </Breadcrumb>
      </div>
      <Space className={className}>
        <Tooltip title="导入导出列表">
          <div onClick={() => handleIoVisible(true)}>
            <span className={`${styles.action} ${styles.account}`}>
              <CloudSyncOutlined style={{ fontSize: 20, color: 'rgba(0, 0, 0, 0.65)' }} />
            </span>
          </div>
        </Tooltip>
        <Avatar menu />
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
