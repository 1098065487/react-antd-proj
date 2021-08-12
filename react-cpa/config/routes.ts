/*
 * @Author: wjw
 * @Date: 2020-11-04 10:38:23
 * @LastEditTime: 2021-01-20 13:32:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\config\routes.ts
 */
const routes = [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/competitor',
    name: 'competitor',
    component: './Competitor',
  },

  {
    path: '/shop',
    name: 'shop',
    routes: [
      {
        path: '/shop/overview',
        name: 'shop-overview',
        component: './Shop/Overview',
      },
    ],
  },

  {
    path: '/classify',
    name: 'classify',
    routes: [
      {
        path: '/classify/keyword',
        name: 'keyword',
        component: './Classify/Keyword',
      },
    ],
  },

  {
    path: '/manage',
    name: 'manage',
    access: 'admin',
    routes: [
      {
        path: '/manage/site',
        name: 'site-manage',
        component: './BusinessParameters/SiteManagement',
      },
      {
        path: '/manage/store',
        name: 'stores',
        component: './BusinessParameters/StoreManagement',
      },
    ],
  },
  {
    name: 'follow-sale',
    path: '/follow-sale',
    component: './FollowSale',
  },
  {
    name: 'product',
    path: '/product',
    routes: [
      {
        path: '/product/all',
        name: 'all',
        component: './Product',
      },
      {
        path: '/product/free',
        name: 'free',
        component: './Product/Free',
      },
    ],
  },
  {
    name: 'order',
    path: '/order',
    component: './Order',
  },
  {
    name: 'cost-analysis',
    path: '/cost-analysis',
    component: './CostAnalysis',
  },
  {
    name: 'product-report',
    path: '/product-report',
    component: './ProductReport',
  },
  {
    path: '/',
    redirect: '/competitor',
  },
  {
    component: './404',
  },
];

export default routes;
