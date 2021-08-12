import { Settings as LayoutSettings } from '@ant-design/pro-layout';

export default {
  navTheme: 'dark',      // 'light' | 'dark'
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',         // 'side' | 'top' | 'mix'
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'CRM 管理系统',
  pwa: false,
  iconfontUrl: '',
} as LayoutSettings & {
  pwa: boolean;
};
