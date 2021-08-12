import React, { useRef, useEffect, useState, useImperativeHandle, memo } from 'react';
import { Card, Tooltip, Modal, Popover, Button } from 'antd';
import Icon, { ExportOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import StandardTable from '@/components/StandardTable';
import ShopDrawer from '../ShopDrawer';
import TrendChart from '../Charts/TrendChart';
import EditShop from '../EditShop'
import { Shop, ShopListProps } from './shopList';
import { getShopList, setShopTop, deleteShop } from './service';
import { DateTrend } from '../Charts/TrendChart/trendChart'

const defaultSvg = () => (
  <svg
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="2073"
    width="40"
    height="40"
  >
    <path
      d="M688.810667 846.506667c-6.826667 0-13.653333-0.682667-20.48-2.730667l-146.773334-40.96c-6.144-2.048-12.970667-2.048-19.114666 0l-146.773334 40.96c-22.528 6.144-46.421333 2.048-64.853333-11.605333-19.114667-13.653333-30.037333-34.816-31.402667-58.026667L253.269333 621.226667c0-6.144-2.048-12.288-6.144-17.749334L163.157333 476.501333c-12.970667-19.114667-16.384-43.008-8.874666-65.536 7.509333-22.528 23.893333-39.594667 45.738666-47.786666l142.677334-53.248c6.144-2.048 10.922667-6.144 15.018666-10.922667l94.890667-119.466667c14.336-18.432 36.181333-28.672 59.392-28.672 23.210667 0 45.056 10.24 59.392 28.672l94.890667 119.466667c4.096 4.778667 9.557333 8.874667 15.018666 10.922667l142.677334 53.248c21.845333 8.192 38.229333 25.258667 45.738666 47.786666 7.509333 22.528 4.096 46.421333-8.874666 65.536l-83.968 126.976c-3.413333 5.461333-5.461333 11.605333-6.144 17.749334l-6.144 152.234666c-0.682667 23.210667-12.288 44.373333-31.402667 58.026667-12.970667 9.557333-28.672 15.018667-44.373333 15.018667zM512 760.490667c6.826667 0 13.653333 0.682667 20.48 2.730666l146.773333 40.96c10.24 2.730667 21.162667 0.682667 30.037334-5.461333 8.874667-6.144 13.653333-16.384 14.336-26.624l6.144-152.234667c0.682667-13.653333 4.778667-27.306667 12.288-38.912L826.026667 453.973333c6.144-8.874667 7.509333-19.797333 4.096-30.037333-3.413333-10.24-10.922667-18.432-21.162667-21.845333L666.965333 348.16c-12.970667-4.778667-24.576-12.970667-32.768-23.893333L539.306667 204.8c-6.826667-8.192-16.384-12.970667-27.306667-12.970667s-20.48 4.778667-27.306667 12.970667L389.802667 324.266667c-8.874667 10.922667-19.797333 19.114667-32.768 23.893333l-142.677334 53.248c-10.24 4.096-17.749333 11.605333-21.162666 21.845333-3.413333 10.24-2.048 21.162667 4.096 30.037334L281.258667 580.266667c7.509333 11.605333 12.288 25.258667 12.288 38.912l6.826666 152.234666c0.682667 10.922667 5.461333 20.48 14.336 26.624s19.797333 8.192 30.037334 5.461334l146.773333-40.96c6.826667-1.365333 13.653333-2.048 20.48-2.048z"
      fill="#4D4D4D"
      p-id="2074"
    />
    <path
      d="M550.229333 326.997333l46.421334 58.709334c5.461333 6.826667 12.970667 12.288 21.162666 15.018666l69.632 25.941334c29.354667 10.922667 40.96 46.421333 23.210667 72.362666l-40.96 62.122667c-4.778667 7.509333-7.509333 15.701333-8.192 24.576l-3.413333 74.410667c-1.365333 31.402667-31.402667 53.248-61.44 45.056l-71.68-19.797334c-8.874667-2.048-17.749333-2.048-25.941334 0l-71.68 19.797334c-30.037333 8.192-60.074667-13.653333-61.44-45.056l-3.413333-74.410667c-0.682667-8.874667-3.413333-17.749333-8.192-24.576l-40.96-62.122667c-17.066667-25.941333-6.144-61.44 23.210667-72.362666l69.632-25.941334c8.192-3.413333 15.701333-8.192 21.162666-15.018666l46.421334-58.709334c19.797333-24.576 56.661333-24.576 76.458666 0z"
      fill="#ffffff"
      p-id="2075"
      data-spm-anchor-id="a313x.7781069.0.i0"
      className="selected"
    />
  </svg>
);

const toppingSvg = () => (
  <svg
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="2073"
    width="40"
    height="40"
  >
    <path
      d="M688.810667 846.506667c-6.826667 0-13.653333-0.682667-20.48-2.730667l-146.773334-40.96c-6.144-2.048-12.970667-2.048-19.114666 0l-146.773334 40.96c-22.528 6.144-46.421333 2.048-64.853333-11.605333-19.114667-13.653333-30.037333-34.816-31.402667-58.026667L253.269333 621.226667c0-6.144-2.048-12.288-6.144-17.749334L163.157333 476.501333c-12.970667-19.114667-16.384-43.008-8.874666-65.536 7.509333-22.528 23.893333-39.594667 45.738666-47.786666l142.677334-53.248c6.144-2.048 10.922667-6.144 15.018666-10.922667l94.890667-119.466667c14.336-18.432 36.181333-28.672 59.392-28.672 23.210667 0 45.056 10.24 59.392 28.672l94.890667 119.466667c4.096 4.778667 9.557333 8.874667 15.018666 10.922667l142.677334 53.248c21.845333 8.192 38.229333 25.258667 45.738666 47.786666 7.509333 22.528 4.096 46.421333-8.874666 65.536l-83.968 126.976c-3.413333 5.461333-5.461333 11.605333-6.144 17.749334l-6.144 152.234666c-0.682667 23.210667-12.288 44.373333-31.402667 58.026667-12.970667 9.557333-28.672 15.018667-44.373333 15.018667zM512 760.490667c6.826667 0 13.653333 0.682667 20.48 2.730666l146.773333 40.96c10.24 2.730667 21.162667 0.682667 30.037334-5.461333 8.874667-6.144 13.653333-16.384 14.336-26.624l6.144-152.234667c0.682667-13.653333 4.778667-27.306667 12.288-38.912L826.026667 453.973333c6.144-8.874667 7.509333-19.797333 4.096-30.037333-3.413333-10.24-10.922667-18.432-21.162667-21.845333L666.965333 348.16c-12.970667-4.778667-24.576-12.970667-32.768-23.893333L539.306667 204.8c-6.826667-8.192-16.384-12.970667-27.306667-12.970667s-20.48 4.778667-27.306667 12.970667L389.802667 324.266667c-8.874667 10.922667-19.797333 19.114667-32.768 23.893333l-142.677334 53.248c-10.24 4.096-17.749333 11.605333-21.162666 21.845333-3.413333 10.24-2.048 21.162667 4.096 30.037334L281.258667 580.266667c7.509333 11.605333 12.288 25.258667 12.288 38.912l6.826666 152.234666c0.682667 10.922667 5.461333 20.48 14.336 26.624s19.797333 8.192 30.037334 5.461334l146.773333-40.96c6.826667-1.365333 13.653333-2.048 20.48-2.048z"
      fill="#1890FF"
      p-id="2074"
      data-spm-anchor-id="a313x.7781069.0.i3"
      className="selected"
    />
    <path
      d="M550.229333 326.997333l46.421334 58.709334c5.461333 6.826667 12.970667 12.288 21.162666 15.018666l69.632 25.941334c29.354667 10.922667 40.96 46.421333 23.210667 72.362666l-40.96 62.122667c-4.778667 7.509333-7.509333 15.701333-8.192 24.576l-3.413333 74.410667c-1.365333 31.402667-31.402667 53.248-61.44 45.056l-71.68-19.797334c-8.874667-2.048-17.749333-2.048-25.941334 0l-71.68 19.797334c-30.037333 8.192-60.074667-13.653333-61.44-45.056l-3.413333-74.410667c-0.682667-8.874667-3.413333-17.749333-8.192-24.576l-40.96-62.122667c-17.066667-25.941333-6.144-61.44 23.210667-72.362666l69.632-25.941334c8.192-3.413333 15.701333-8.192 21.162666-15.018666l46.421334-58.709334c19.797333-24.576 56.661333-24.576 76.458666 0z"
      fill="#1890FF"
      p-id="2075"
      data-spm-anchor-id="a313x.7781069.0.i0"
      className="selected"
    />
  </svg>
);

const ShopList: React.FC<ShopListProps> = memo(({ filters, cref }) => {
  const tableRef: any = useRef(null);
  const isFirstOnload = useRef(true);
  const DefaultIcon = (defaultIconProps: any) => (
    <Icon component={defaultSvg} {...defaultIconProps} />
  );
  const ToppingIcon = (toppingIconProps: any) => (
    <Icon component={toppingSvg} {...toppingIconProps} />
  );
  const [currentShop, setCurrentShop] = useState<{
    asin: string;
    id: undefined | number;
    name: string;
    link: string;
  }>({ asin: '', id: undefined, name: '', link: '' });
  const [bigChartData, setBigChartData] = useState<DateTrend[]>()
  const [bigChartTitle, setBigChartTitle] = useState('')
  const [operateId, setOperateId] = useState<number>()
  const [loading, setLoading] = useState(false)
  // 显隐控制编辑店铺
  const [editInfo, setEditInfo] = useState<{ shopId: number | undefined; name: string }>({ shopId: undefined, name: '' });
  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    reset: tableRef?.current?.reset,
  }));

  // 获取表格列表
  const fetchShopList = (params: any) => {
    return getShopList({ with: 'site,shop,detail', ...params, filters });
  };

  useEffect(() => {
    if (isFirstOnload.current) {
      isFirstOnload.current = false;
    } else {
      tableRef?.current?.onSearch({ searchFilters: filters });
    }
  }, [filters]);

  // 置顶
  const setTop = async (e: any, top_id: number, shopId: number) => {
    e.stopPropagation();
    const { status } = await setShopTop({ shopId, top: top_id ? 0 : 1 });
    if (status === 'ok') {
      tableRef?.current?.reset(true);
    }
  };

  const watchBigChart = (e: any, data: DateTrend[], title: string) => {
    e.stopPropagation();
    setBigChartData(data)
    setBigChartTitle(title)
  }

  const deleteConfirm = (e: any, id: number) => {
    e.stopPropagation()
    setOperateId(id)
  }

  const startEdit = (e: any, id: number, name: string) => {
    e.stopPropagation()
    setEditInfo({ shopId: id, name })
  }

  const editSuccess = () => {
    tableRef?.current?.fetchRequest()
  }

  const columns: ColumnsType<Shop> = [
    {
      title: '置顶',
      dataIndex: 'top_id',
      width: '50px',
      render: (_, { top_id, id }) => {
        return top_id ? (
          <ToppingIcon style={{ cursor: 'pointer' }} onClick={(e: any) => setTop(e, top_id, id)} />
        ) : (
            <DefaultIcon style={{ cursor: 'pointer' }} onClick={(e: any) => setTop(e, top_id, id)} />
          );
      },
      fixed: 'left'
    },
    {
      title: '店铺名',
      dataIndex: ['shop', 'name'],
      width: '90px',
      render: name => <Popover content={name}>
        <span style={{ width: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{name}</span >
      </Popover>,
      fixed: 'left'
    },
    {
      title: 'ASIN',
      dataIndex: ['shop', 'asin'],
      width: '130px',
      render: (asin, record) => {
        const { link } = record;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a>{asin}</a>
            <Tooltip title="点击跳转到该店铺">
              <a target="blank" href={link} onClick={(e) => e.stopPropagation()}>
                <ExportOutlined style={{ cursor: 'pointer', marginLeft: '10px' }} />
              </a>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: (
        <div>
          <span style={{ marginRight: '10px' }}>商品趋势</span>
          <Tooltip title="该店铺下的小类目BSR100以内的商品数量趋势">
            <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: ['detail', 'little_goods_trend'],
      width: '220px',
      render: (data) => {
        return (
          <div style={{ cursor: 'pointer' }} onClick={e => watchBigChart(e, data, '小类目BSR100以内的商品数量趋势')}>
            <TrendChart height={150} style={{ width: '220px' }} data={data || []} />
          </div>
        )
      },
    },
    {
      title: (
        <div>
          <span style={{ marginRight: '10px' }}>商品数量</span>
          <Tooltip title="该店铺下的小类目BSR100以内的商品数量">
            <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'little_goods_num',
      width: '120px',
      render: (_, record) => record?.detail?.little_goods_num,
      sorter: true,
    },
    {
      title: (
        <div>
          <span style={{ marginRight: '10px' }}>商品趋势</span>
          <Tooltip title="该店铺下的3.8评分以上的商品数量趋势">
            <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: ['detail', 'high_rate_goods_trend'],
      width: '220px',
      render: (data) => {
        return (
          <div style={{ cursor: 'pointer' }} onClick={e => watchBigChart(e, data, '3.8评分以上的商品数量趋势')}>
            <TrendChart height={150} style={{ width: '220px' }} data={data || []} />
          </div>
        )
      },
    },
    {
      title: (
        <div>
          <span style={{ marginRight: '10px' }}>商品数量</span>
          <Tooltip title="该店铺下的3.8评分以上的商品数量">
            <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'high_rate_goods_num',
      width: '120px',
      render: (_, record) => record?.detail?.high_rate_goods_num,
      sorter: true,
    },
    {
      title: '30天评论趋势',
      dataIndex: ['detail', 'review_trend'],
      width: '220px',
      render: (data) => {
        return (
          <div style={{ cursor: 'pointer' }} onClick={e => watchBigChart(e, data, '30天评论趋势')}>
            <TrendChart height={150} style={{ width: '220px' }} data={data || []} />
          </div>
        )
      },
    },
    {
      title: '评论数量',
      dataIndex: 'review_num',
      width: '100px',
      render: (_, record) => record?.detail?.review_num,
      sorter: true,
    },
    {
      title: '四五星趋势',
      dataIndex: ['detail', 'rate_trend'],
      width: '220px',
      render: (data) => {
        return (
          <div style={{ cursor: 'pointer' }} onClick={e => watchBigChart(e, data, '四五星趋势')}>
            <TrendChart height={150} style={{ width: '220px' }} data={data || []} />
          </div>
        )
      },
    },
    {
      title: '四五星数量',
      dataIndex: 'rate',
      width: '100px',
      render: (_, record) => record?.detail?.rate,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: '120px',
      render: (_, record) => {
        const { id, shop } = record
        const { name } = shop
        return (
          <>
            <Button size='small' onClick={(event) => {
              deleteConfirm(event, id)
            }}>删除</Button>
            <Button size='small' onClick={(event) => {
              startEdit(event, id, name)
            }}>编辑</Button>
          </>
        )
      },
      fixed: 'right'
    },
  ];

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ marginTop: 10 }}>
      <EditShop editInfo={editInfo} setEditInfo={setEditInfo} editSuccess={editSuccess} />
      <Modal width={600} visible={!!bigChartData?.length} footer={null} title={bigChartTitle} onCancel={() => { setBigChartData([]); setBigChartTitle('') }}>
        <TrendChart height={550} style={{ width: '550px' }} data={bigChartData} />
      </Modal>
      <Modal
        centered
        width={300}
        confirmLoading={loading}
        visible={!!operateId}
        onCancel={() => {
          setOperateId(undefined)
        }}
        onOk={async () => {
          setLoading(true)
          const { status } = await deleteShop({ shopId: operateId });
          setLoading(false)
          setOperateId(undefined)
          if (status === 'ok') {
            tableRef?.current?.reset(true);
          }
        }}
      >
        确定要删除该店铺吗?
      </Modal>
      <StandardTable
        scroll={{ x: 1800 }}
        cref={tableRef}
        request={fetchShopList}
        bordered={false}
        columns={columns}
        onRow={(record: Shop) => {
          let flag = true;
          let startPosition: { startX: any; startY: any };
          return {
            onClick: () => {
              if (flag) {
                const { id, shop, link } = record;
                const { asin, name } = shop;
                setCurrentShop({ asin, id, name, link });
              }
            },
            onMouseDown: (event: any) => {
              // react事件池  出于性能考虑 如需异步访问事件 需要此操作
              event.persist();
              const { pageX, pageY } = event;
              startPosition = { startX: pageX, startY: pageY };
            },
            onMouseUp: (event: any) => {
              event.persist();
              const { pageX, pageY } = event;
              const { startX, startY } = startPosition;
              if (startX !== pageX || startY !== pageY) {
                flag = false;
              }
            },
          };
        }}
      />
      <ShopDrawer currentShop={currentShop} setCurrentShop={setCurrentShop} />
    </Card>
  );
});

export default ShopList;
