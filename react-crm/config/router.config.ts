export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './Login',
      },
    ],
  },
  {
    path: '/',
    redirect: '/workspace',
  },
  {
    path: '/workspace',
    name: 'workspace',
    icon: 'dashboard',
    component: './WorkSpace',
  },
  {
    path: '/account',
    name: 'account',
    hideInMenu: true,
    routes: [
      {
        name: 'settings',
        path: '/account/settings',
        component: './Account/Setting',
      }
    ]
  },
  {
    path: '/case',
    name: 'case',
    icon: 'audit',
    routes: [
      {
        path: '/case/celebrity',
        name: 'celebrity',
        component: './Case/Celebrity',
      }
    ]
  },
  {
    path: '/data',
    name: 'data',
    icon: 'database',
    routes: [
      {
        path: '/data/products',
        name: 'product',
        component: './DataInfo/Product',
      },
    ]
  },
  {
    path: '/parameter',
    name: 'parameter',
    icon: 'partition',
    routes: [
      {
        path: '/parameter/brand',
        name: 'brand',
        component: './Parameter/Brand',
      },
      {
        path: '/parameter/medium',
        name: 'medium',
        component: './Parameter/Medium',
      },
      {
        path: '/parameter/tag',
        name: 'tag',
        component: './Parameter/Tag',
      },
      {
        path: '/parameter/platform',
        name: 'platform',
        component: './Parameter/Platform',
      },
      {
        path: '/parameter/short-link',
        name: 'short_link',
        component: './Parameter/ShortLink',
      },
    ]
  },
  {
    path: '/system',
    icon: 'setting',
    name: 'system',
    access: 'menu_system',
    routes: [
      {
        path: '/system/users',
        name: 'users',
        icon: 'user',
        access: 'menu_system_users',
        component: './System/Users',
      }
    ],
  },
  {
    component: './404',
  },
]
