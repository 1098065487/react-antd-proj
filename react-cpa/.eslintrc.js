/*
 * @Author: wjw
 * @Date: 2020-11-11 17:50:50
 * @LastEditTime: 2021-01-05 13:57:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\.eslintrc.js
 */
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error', // 检查 Hook 的规则
    'react-hooks/exhaustive-deps': 'warn', // 检查 effect 的依赖
    '@typescript-eslint/consistent-type-definitions': ['off'],
    '@typescript-eslint/consistent-type-imports': ['off'],
  },
};
