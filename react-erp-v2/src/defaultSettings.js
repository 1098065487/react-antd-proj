module.exports = {
  navTheme: 'dark', // theme for nav menu
  primaryColor: '#1890FF', // primary color of ant design
  layout: 'topmenu', // nav menu position: sidemenu or topmenu
  contentWidth: 'Fluid', // layout of content: Fluid or Fixed, only works when layout is topmenu
  fixedHeader: true, // sticky header
  autoHideHeader: false, // auto hide header
  fixSiderbar: true, // sticky siderbar
  menu: {
    disableLocal: false,
  },
  title: 'LTG ERP',
  pwa: false,
  // Your custom iconfont Symbol script Url
  // eg：//at.alicdn.com/t/font_1039637_btcrd5co4w.js
  // 注意：如果需要图标多色，Iconfont 图标项目里要进行批量去色处理
  // Usage: https://github.com/ant-design/ant-design-pro/pull/3517
  iconfontUrl: '//at.alicdn.com/t/font_1277023_t2hgx0u4qni.js',
  baseUri: 'http://api.erp.local',
  collapse: true,
  echo: false,
  channelPrefix: 'erp_database_', // 必须和后端保持一致
};
