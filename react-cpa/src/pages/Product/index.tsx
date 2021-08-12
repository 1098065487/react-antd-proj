import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Select, Tooltip, Avatar, Table, Button } from 'antd';
import StandardTable from '@/components/StandardTable';
import { CloudUploadOutlined, PlusOutlined } from '@ant-design/icons';
import { handleIOMethod, IOType } from '@/components/ImportAndExport/data';
import ImportAndExport from '@/components/ImportAndExport';
// @ts-ignore
import defaultImg from '@/assets/product.webp';
import { getStoreList, getProductList } from './service';
import styles from './index.less';
import EditParent from './ParentEdit';
import EditChild from '@/pages/Product/ChildEdit';

const { Option } = Select;

const Product: React.FC = () => {
  const [form] = Form.useForm();
  const ref: any = useRef();
  const [firstLoad, setFirstLoad] = useState(true);

  // 店铺列表选项、站点列表选项
  const [storeList, setStoreList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);

  // 默认店铺选中、站点选中
  const [store, setStore] = useState<number | undefined>(1);
  const [site, setSite] = useState<number | undefined>(1);

  // asin, sku输入
  const [asin, setAsin] = useState<undefined | string>(undefined);
  const [sku, setSku] = useState<undefined | string>(undefined);

  const [ioVisible, setIoVisible] = useState(false);
  const [ioType, setIoType] = useState<IOType>('import');
  const [importVisible, setImportVisible] = useState(false);

  // 父产品编辑，添加
  const [parentVisible, setParentVisible] = useState(false);
  const [parentCurrent, setParentCurrent] = useState<any>(undefined);

  // 子产品编辑，添加
  const [childVisible, setChildVisible] = useState(false);
  const [childCurrent, setChildCurrent] = useState<any>(undefined);

  // 获取店铺及站点列表选项
  useEffect(() => {
    (async () => {
      const res = await getStoreList({ pageSize: 100, with: 'sites' });
      if (res.status === 'ok') {
        setStoreList(res.data);
        if (res.data.length !== 0) {
          setStore(res.data[0].id);
          form.setFieldsValue({ store_id: res.data[0].id });
          if (res.data[0].sites) {
            setSiteList(res.data[0].sites);
            if (res.data[0].sites.length !== 0) {
              setSite(res.data[0].sites[0].id);
              form.setFieldsValue({ site_id: res.data[0].sites[0].id });
            }
          }
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    } else {
      if (ref.current) {
        ref.current.reset(true);
      }
    }
  }, [store, site, asin, sku]);

  const onStoreChange = (value: number) => {
    setStore(value);
    const currentStore = storeList.filter((e) => e.id === value);
    if (currentStore.length !== 0) {
      setSiteList(currentStore[0].sites);
      if (currentStore[0].sites.length !== 0) {
        setSite(currentStore[0].sites[0].id);
        form.setFieldsValue({ site_id: currentStore[0].sites[0].id });
      }
    }
  };

  const handleAsinSearch = () => {
    setAsin(form.getFieldValue('asin'));
  };

  const handleSkuSearch = () => {
    setSku(form.getFieldValue('sku'));
  };

  const handleAsinChange = () => {
    if (!form.getFieldValue('asin')) {
      setAsin(undefined);
    }
  };

  const handleSkuChange = () => {
    if (!form.getFieldValue('sku')) {
      setSku(undefined);
    }
  };

  const handleIoVisible: handleIOMethod = (flag, key, show) => {
    setIoVisible(flag);
    if (key) {
      setIoType(key);
    }
    if (show !== undefined) {
      setImportVisible(show);
    }
    if (!flag && key === 'import') {
      if (ref.current) {
        ref.current.reset();
      }
    }
  };

  const handleParentVisible = (flag: boolean, record: any, refresh?: boolean) => {
    setParentVisible(flag);
    setParentCurrent(record);
    if (refresh) {
      if (ref.current) {
        ref.current.reset();
      }
    }
  };

  const handleChildVisible = (flag: boolean, item: any, record: any, refresh?: boolean) => {
    setChildVisible(flag);
    setChildCurrent(item);
    setParentCurrent(record);
    if (refresh) {
      if (ref.current) {
        ref.current.reset();
      }
    }
  };

  const renderInfo = (sku: string, title: string, thumbnail: string) => {
    return (
      <div style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' }}>
        <Avatar
          style={{ display: 'block' }}
          src={thumbnail || defaultImg}
          shape="square"
          size={40}
        />
        <div style={{ marginLeft: 10 }}>
          <h5 style={{ textAlign: 'left' }}>{sku}</h5>
          {title ? (
            <Tooltip title={title}>
              <p
                style={{
                  marginBottom: 0,
                  fontSize: 12,
                  width: 320,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </p>
            </Tooltip>
          ) : null}
        </div>
      </div>
    );
  };

  const expandedRow = (record: any, index: number, indent: any, expanded: boolean) => {
    const { items } = record;
    const rowColumns: any[] = [
      {
        title: '系统编号',
        dataIndex: 'id',
        align: 'center',
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
        align: 'center',
      },
      {
        title: 'ASIN',
        dataIndex: 'asin',
        align: 'center',
        render: (_: any, item: any) => {
          const currentSite: any[] = siteList.filter((e) => e.id === item.site_id);
          return currentSite.length !== 0 ? (
            <a
              href={`${currentSite[0].domain}dp/${item.asin}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.asin}
            </a>
          ) : (
            <span>{item.asin}</span>
          );
        },
      },
      {
        title: '标题',
        dataIndex: 'title',
        width: 380,
        align: 'center',
        render: (_: any, item: any) => {
          return _ ? (
            <Tooltip title={_}>
              <p
                style={{
                  marginBottom: 0,
                  fontSize: 12,
                  width: 360,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {_}
              </p>
            </Tooltip>
          ) : null;
        },
      },
      {
        title: '价格',
        dataIndex: 'price',
        align: 'center',
      },
      {
        title: '库存量',
        dataIndex: 'fulfillable_qty',
        align: 'center',
      },
      {
        title: '操作人',
        dataIndex: 'user',
        align: 'center',
        render: (_: any, record: any) => {
          const { user } = record;
          return user && Object.keys(user).length !== 0 ? `${user?.name} (ID: ${user?.id})` : null;
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        render: (_: any, item: any) => {
          return (
            <a
              onClick={() => {
                handleChildVisible(true, item, record);
              }}
            >
              编辑
            </a>
          );
        },
      },
    ];

    return (
      <Table
        bordered
        rowKey="id"
        size="small"
        columns={rowColumns}
        dataSource={items}
        pagination={false}
      />
    );
  };

  const columns = [
    {
      title: '系统编号',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: '产品信息',
      dataIndex: 'info',
      width: 400,
      align: 'center',
      render: (_: any, record: any) => {
        const { sku, title, thumbnail } = record;
        return renderInfo(sku, title, thumbnail);
      },
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      align: 'center',
      render: (_: any, record: any) => {
        const currentSite: any[] = siteList.filter((e) => e.id === record.site_id);
        return currentSite.length !== 0 ? (
          <a
            href={`${currentSite[0].domain}dp/${record.asin}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.asin}
          </a>
        ) : (
          <span>{record.asin}</span>
        );
      },
    },
    {
      title: '库存量',
      dataIndex: 'fulfillable_qty',
      align: 'center',
    },
    {
      title: '复购率',
      dataIndex: 'repurchase_rate',
      align: 'center',
      render: (_: number, record: any) => {
        return Math.round(_ * 100) / 100;
      },
    },
    {
      title: '退货率',
      dataIndex: 'refund_rate',
      align: 'center',
      render: (_: number, record: any) => {
        return Math.round(_ * 100) / 100;
      },
    },
    {
      title: '操作人',
      dataIndex: 'user',
      align: 'center',
      render: (_: any, record: any) => {
        const { user } = record;
        return user && Object.keys(user).length !== 0 ? `${user?.name} (ID: ${user?.id})` : null;
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <a
            onClick={() => {
              handleParentVisible(true, record);
            }}
          >
            编辑
          </a>
        );
      },
    },
  ];

  return (
    <div className={styles.contentContainer}>
      <div className={styles.searchContainer}>
        <Form
          form={form}
          initialValues={{
            store_id: store,
            site_id: site,
            asin,
            sku,
          }}
        >
          <div className={styles.formContainer}>
            <Form.Item name="store_id" style={{ width: 120, marginBottom: 5 }}>
              <Select onChange={(value: number) => onStoreChange(value)}>
                {storeList.map((e: any) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="site_id" style={{ width: 100, marginBottom: 5, marginLeft: 10 }}>
              <Select onChange={(value: number) => setSite(value)}>
                {siteList.map((e: any) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="asin" style={{ width: 210, marginBottom: 5, marginLeft: 10 }}>
              <Input.Search
                placeholder="请输入asin"
                allowClear
                onChange={handleAsinChange}
                onSearch={handleAsinSearch}
              />
            </Form.Item>
            <Form.Item name="sku" style={{ width: 210, marginBottom: 5, marginLeft: 10 }}>
              <Input.Search
                placeholder="请输入sku"
                allowClear
                onChange={handleSkuChange}
                onSearch={handleSkuSearch}
              />
            </Form.Item>
          </div>
        </Form>
        <div className={styles.formContainer}>
          <Button
            style={{ marginLeft: 10, marginBottom: 5 }}
            key="import"
            type="primary"
            onClick={() => handleIoVisible(true, 'import', true)}
          >
            <CloudUploadOutlined /> 导入
          </Button>
          <Button
            style={{ marginLeft: 10, marginBottom: 5 }}
            key="plus"
            type="default"
            onClick={() => handleParentVisible(true, {})}
          >
            <PlusOutlined /> 添加父产品
          </Button>
          <Button
            style={{ marginLeft: 10, marginBottom: 5 }}
            key="plus_child"
            type="default"
            onClick={() => handleChildVisible(true, {}, {})}
          >
            <PlusOutlined /> 添加子产品
          </Button>
        </div>
      </div>
      <StandardTable
        request={(params: any) =>
          getProductList({
            ...params,
            filters: {
              store: store,
              site: site,
              asin,
              sku,
            },
            with: 'items.user, user',
            sorter: { updated_at: 'desc' },
          })
        }
        cref={ref}
        columns={columns}
        bordered
        sticky
        pagination={{ current: 1, pageSize: 20 }}
        paginationConfig={{ pageSizeOptions: [10, 20, 50, 100] }}
        expandedRowRender={expandedRow}
      />
      {ioVisible ? (
        <ImportAndExport
          visible={ioVisible}
          type={ioType}
          importVisible={importVisible}
          importType="store_products_relations"
          handleDrawerVisible={handleIoVisible}
        />
      ) : null}
      {parentVisible ? (
        <EditParent
          store={store as number}
          site={site as number}
          record={parentCurrent}
          visible={parentVisible}
          handleVisible={handleParentVisible}
        />
      ) : null}
      {childVisible ? (
        <EditChild
          store={store as number}
          site={site as number}
          record={childCurrent}
          parent={parentCurrent}
          visible={childVisible}
          handleVisible={handleChildVisible}
        />
      ) : null}
    </div>
  );
};

export default Product;
