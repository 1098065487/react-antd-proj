/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  local: {
    '/api/': {
      target: 'http://crm.leading.local',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  develop: {
    '/api/': {
      target: 'http://crm.leading.io',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  test: {
    '/api/': {
      target: 'http://test.leading.io',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
