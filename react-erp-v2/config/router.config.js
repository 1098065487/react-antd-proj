export default [
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', name: 'login', component: './User/Login' },
      { path: '/user/register', name: 'register', component: './User/Register' },
      {
        path: '/user/register-result',
        name: 'register.result',
        component: './User/RegisterResult',
      },
      {
        component: '404',
      },
    ],
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/', redirect: '/dashboard/workplace' }, // 顶部不需要添加权限
      {
        path: '/dashboard',
        name: 'dashboard',
        icon: 'dashboard',
        routes: [
          {
            path: '/dashboard/workplace',
            name: 'workplace',
            component: './Dashboard/Workplace',
          },
        ],
      },
      {
        path: '/products',
        name: 'products',
        icon: 'hdd',
        authority: 'menu_products',
        routes: [
          {
            path: '/products/factory',
            name: 'factory',
            authority: 'menu_products_factory',
            component: './Factory/Product',
          },
          {
            path: '/products/product',
            name: 'product',
            authority: 'menu_products_product',
            routes: [
              {
                path: '/products/product',
                component: './Catalog/Product/index',
              },
              {
                path: '/products/product/items/:item',
                component: './Catalog/Product/Item/$item',
              },
              {
                path: '/products/product/:id',
                component: './Catalog/Product/$id/index',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/products/product/:id',
                    redirect: '/products/product/:id/info',
                  },
                  {
                    path: '/products/product/:id/info',
                    component: './Catalog/Product/$id/Info',
                  },
                  {
                    path: '/products/product/:id/items',
                    component: './Catalog/Product/$id/Item',
                  },
                  {
                    path: '/products/product/:id/detail',
                    component: './Catalog/Product/$id/Detail',
                  },
                  {
                    path: '/products/product/:id/finish',
                    component: './Catalog/Product/$id/Finish',
                  },
                ],
              },
            ],
          },
          {
            path: '/products/sellers',
            name: 'seller_product',
            authority: 'menu_products_seller_product',
            routes: [
              {
                path: '/products/sellers',
                component: './Catalog/SellerProduct/index',
              },
              {
                path: '/products/sellers/:id/edit',
                component: './Catalog/SellerProduct/$id',
              },
              {
                path: '/products/sellers/items/:item/edit',
                component: './Catalog/SellerProduct/$item/edit',
              },
              {
                path: '/products/sellers/items/:item/publish',
                component: './Catalog/SellerProduct/$item/Publish',
              },
            ],
          },
          {
            path: '/products/platform',
            name: 'platform',
            authority: 'menu_products_platform',
            routes: [
              {
                path: '/products/platform',
                component: './Platform/Product/index',
              },
              {
                path: '/products/platform/:id',
                component: './Platform/Product/$id/index',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/products/platform/:id',
                    redirect: '/products/platform/:id/info',
                  },
                  {
                    path: '/products/platform/:id/info',
                    component: './Platform/Product/$id/Info',
                  },
                  {
                    path: '/products/platform/:id/items',
                    component: './Platform/Product/$id/Item',
                  },
                ],
              },
            ],
          },
          {
            path: '/products/platform/products/:id',
            hideInMenu: true,
            component: './Profile/BasicProfile',
          },
        ],
      },
      {
        path: '/warehouse',
        name: 'warehouse',
        icon: 'cluster',
        authority: 'menu_warehouse',
        routes: [
          {path: '/warehouse', redirect: '/warehouse/inventory'},
          {
            path: '/warehouse/inventory',
            name: 'inventory',
            authority: 'menu_warehouse_inventory',
            routes: [
              {
                path: '/warehouse/inventory',
                redirect: '/warehouse/inventory/singleItem'
              },
              {
                path: '/warehouse/inventory/singleItem',
                name: 'single_item',
                component: './Storage/Inventory/SingleItem',
              },
              {
                path: '/warehouse/inventory/vendibility',
                name: 'vendibility',
                component: './Storage/Inventory/Vendibility',
              },
            ],
          },
          {
            path: '/warehouse/allocate',
            name: 'allocate',
            authority: 'menu_warehouse_allocate',
            component: './Storage/Allocation'
          },
          {
            path: '/warehouse/blacklist',
            name: 'black_list',
            component: './Storage/BlackList'
          },
        ],
      },
      {
        path: '/order',
        name: 'order',
        icon: 'hdd',
        authority: 'menu_order',
        routes: [
          {
            path: '/order/orders',
            name: 'orders',
            authority: 'menu_order_orders',
            component: './Platform/Order',
          },
        ],
      },
      {
        path: '/production',
        icon: 'bank',
        name: 'production',
        authority: 'menu_production',
        routes: [
          { path: '/production', redirect: '/production/factory' },
          {
            path: '/production/factory',
            name: 'productions_factory',
            authority: 'menu_production_productions',
            component: './Production/Factory',
            hideChildrenInMenu: true,
            routes: [
              {
                path: '/production/factory',
                redirect: '/production/factory/workbench',
              },
              {
                path: '/production/factory/workbench',
                component: './Production/Factory/Workbench',
              },
              {
                path: '/production/factory/dataanalysis',
                component: './Production/Factory/DataAnalysis',
              },
            ],
          },
          {
            path: '/production/new-product-list',
            name: 'new_product_list',
            authority: 'menu_production_new_product_list',
            component: './NewProduct/List',
          },
          {
            path: '/production/proofing-list',
            name: 'proofing_list',
            authority: 'menu_production_proofing_list',
            component: './NewProduct/ProofingList',
          },
          {
            path: '/production/new-product/develop',
            hideInMenu: true,
            component: './NewProduct/Develop',
          },
          {
            path: '/production/new-product/detail',
            hideInMenu: true,
            component: './NewProduct/Detail',
          },
          {
            path: '/production/new-product/proofing',
            hideInMenu: true,
            component: './NewProduct/Proofing',
          },
          {
            path: '/production/new-product/proofing-detail',
            hideInMenu: true,
            component: './NewProduct/ProofingDetail',
          },
        ],
      },
      {
        path: '/operation',
        name: 'operation',
        icon: 'shop',
        authority: 'menu_operation',
        routes: [
          {
            path: '/operation/demands',
            name: 'demands',
            authority: 'menu_operation_demands',
            routes: [
              {
                path: '/operation/demands/platform',
                name: 'platform',
                authority: 'menu_operation_demands_platform',
                component: './Demand/Demand',
              },
              {
                path: '/operation/demands/sell-product',
                name: 'sell-product',
                authority: 'menu_operation_demands_seller_product',
                component: './Demand/SellerProductDemand',
              },
              {
                path: '/operation/demands/product',
                name: 'product',
                authority: 'menu_operation_demands_product',
                component: './Demand/ProductDemand',
              },
              {
                path: '/operation/demands/self-website',
                name: 'self-website',
                authority: 'menu_operation_demands_self_website',
                component: './Demand/SelfWebsiteDemand',
              },
            ],
          },
          // {
          //   path: '/operation/reviews',
          //   name: 'reviews',
          //   authority: 'menu_operation_reviews',
          //   component: './Platform/CustomerReviews',
          // },
          {
            path: '/operation/reviews',
            name: 'reviews',
            authority: 'menu_operation_reviews',
            component: './Operation/Review',
          },
          {
            path: '/operation/competitor',
            name: 'competitor',
            component: './Operation/Competitor',
          },
          {
            path: '/operation/question-answers',
            name: 'question-answers',
            authority: 'menu_operation_question_answers',
            component: './Platform/ProductQuestionAnswer',
          },
        ],
      },
      {
        path: '/report',
        icon: 'bar-chart',
        name: 'report',
        authority: 'menu_report',
        routes: [
          {
            path: '/report/products',
            name: 'products',
            authority: 'menu_report_products',
            component: './Platform/Report',
          },
          {
            path: '/report/demands',
            name: 'demands',
            authority: 'menu_report_demands',
            component: './Logistic/DemandReport',
          },
          {
            path: '/report/analysis',
            name: 'analysis',
            authority: 'menu_report_analysis',
            component: './Platform/SaleStatistic',
          },
        ],
      },
      {
        path: '/catalog',
        name: 'catalog',
        icon: 'gift',
        authority: 'menu_catalog',
        routes: [
          {
            path: '/catalog/platforms',
            name: 'platform',
            authority: 'menu_catalog_platform',
            component: './System/Platform/index',
          },
          {
            path: '/catalog/brands',
            name: 'brand',
            authority: 'menu_catalog_brand',
            component: './Catalog/Brand/index',
          },
          {
            path: '/catalog/specs',
            name: 'spec',
            authority: 'menu_catalog_spec',
            hideChildrenInMenu: true,
            routes: [
              {
                path: '/catalog/specs',
                component: './Catalog/Spec/index',
              },
              {
                path: '/catalog/specs/:id',
                component: './Catalog/Spec/$id',
              },
            ],
          },
          {
            path: '/catalog/categories',
            name: 'category',
            authority: 'menu_catalog_category',
            component: './Catalog/Category/index',
          },
          {
            path: '/catalog/units',
            name: 'unit',
            authority: 'menu_catalog_unit',
            hideInMenu: true,
            component: './Catalog/Unit/index',
          },
          {
            path: '/catalog/attributes',
            name: 'attribute',
            authority: 'menu_catalog_attribute',
            hideChildrenInMenu: true,
            routes: [
              {
                path: '/catalog/attributes',
                component: './Catalog/Attribute/index',
              },
              {
                path: '/catalog/attributes/:id',
                component: './Catalog/Attribute/$id',
              },
            ],
          },
          {
            path: '/catalog/logistics-warehouse',
            name: 'logistics_warehouse',
            authority: 'menu_catalog_logistics_warehouse',
            component: './Logistic/Warehouse',
          },
          {
            path: '/catalog/factory-warehouse',
            name: 'factory_warehouse',
            authority: 'menu_catalog_factory_warehouse',
            component: './Factory/Warehouse',
          },
        ],
      },
      {
        path: '/system',
        name: 'system',
        icon: 'icon-configuration-management',
        authority: 'menu_system',
        routes: [
          {
            path: '/system/users',
            name: 'user',
            authority: 'menu_system_user',
            component: './System/User/index',
          },
          {
            path: '/system/roles',
            name: 'role',
            authority: 'menu_system_role',
            component: './System/Role/index',
          },
          {
            path: '/system/permissions',
            name: 'permission',
            authority: 'menu_system_permission',
            component: './System/Permission/index',
          },
        ],
      },
      {
        path: '/excel',
        name: 'excel',
        icon: 'file-excel',
        authority: 'menu_excel',
        hideInMenu: true,
        routes: [
          {
            path: '/excel/imports',
            name: 'import',
            component: './Excel/Import/index',
            hideChildrenInMenu: true,
            routes: [
              {
                path: '/excel/imports',
                redirect: '/excel/imports/create',
              },
              {
                path: '/excel/imports/create',
                name: 'upload',
                component: './Excel/Import/Create',
              },
              {
                path: '/excel/imports/acknowledge',
                name: 'acknowledge',
                component: './Excel/Import/Acknowledge',
              },
              {
                path: '/excel/imports/processing',
                name: 'processing',
                component: './Excel/Import/Processing',
              },
              {
                path: '/excel/imports/finish',
                name: 'finish',
                component: './Excel/Import/Finish',
              },
            ],
          },
        ],
      },
      {
        name: 'account',
        icon: 'user',
        path: '/account',
        hideInMenu: true,
        routes: [
          {
            path: '/account/center',
            name: 'center',
            component: './Account/Center/Center',
            routes: [
              {
                path: '/account/center',
                redirect: '/account/center/notices',
              },
              {
                path: '/account/center/notices',
                component: './Account/Center/Notices',
              },
              {
                path: '/account/center/imports',
                component: './Account/Center/Imports',
              },
              {
                path: '/account/center/exports',
                component: './Account/Center/Exports',
              },
            ],
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: './Account/Settings/Info',
            routes: [
              {
                path: '/account/settings',
                redirect: '/account/settings/base',
              },
              {
                path: '/account/settings/base',
                component: './Account/Settings/BaseView',
              },
              {
                path: '/account/settings/security',
                component: './Account/Settings/SecurityView',
              },
              {
                path: '/account/settings/notification',
                component: './Account/Settings/NotificationView',
              },
            ],
          },
        ],
      },
      {
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        hideInMenu: true,
        routes: [
          {
            path: '/exception/403',
            name: 'not-permission',
            component: './Exception/403',
          },
          {
            path: '/exception/404',
            name: 'not-find',
            component: './Exception/404',
          },
          {
            path: '/exception/500',
            name: 'server-error',
            component: './Exception/500',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
