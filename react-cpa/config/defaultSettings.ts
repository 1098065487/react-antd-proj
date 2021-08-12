/*
 * @Author: wjw
 * @Date: 2020-11-04 10:28:04
 * @LastEditTime: 2020-11-19 14:33:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\config\defaultSettings.ts
 */
import { Settings as LayoutSettings } from '@ant-design/pro-layout';
export default {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'CPA',
  pwa: false,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
} as LayoutSettings & {
  pwa: boolean;
};
