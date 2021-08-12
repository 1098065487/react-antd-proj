import React, { useRef, useEffect, useState, useImperativeHandle } from 'react';
import { Card } from 'antd';
import Icon, { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import StandardTable from '@/components/StandardTable';
import { keepOne } from '@/utils/utils';
import { Asin, AsinListProps } from './asinList.d';
import { getAsinList, setAsinTop } from './service';
import styles from './index.less';

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

// 获取7天变化趋势
const getTrend = (value: number) => {
  if (value > 0) {
    return (
      <span style={{ fontSize: '12px' }}>
        <ArrowUpOutlined style={{ color: 'var(--up-color)' }} />
        <span style={{ color: 'var(--up-color)' }}>{keepOne(Math.abs(value))}</span>
      </span>
    );
  }
  return value < 0 ? (
    <span style={{ fontSize: '12px' }}>
      <ArrowDownOutlined style={{ color: 'var(--down-color)' }} />
      <span style={{ color: 'var(--down-color)' }}>{keepOne(Math.abs(value))}</span>
    </span>
  ) : null;
};

const AsinList: React.FC<AsinListProps> = (props) => {
  const { filters, setCurrentAsin, cref, currentShop } = props;
  const tableRef: any = useRef(null);
  const isFirstOnload = useRef(true);
  const DefaultIcon = (defaultIconProps: any) => (
    <Icon component={defaultSvg} {...defaultIconProps} />
  );
  const ToppingIcon = (toppingIconProps: any) => (
    <Icon component={toppingSvg} {...toppingIconProps} />
  );
  const [currentId, setCurrentId] = useState<number>();
  const [asinList, setAsinList] = useState([]);

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    reset: tableRef?.current?.reset,
  }));

  // 获取表格列表
  const fetchAsinList = (params: any) => {
    let url = '/api/v1/product';
    if (currentShop?.id && currentShop?.asin) {
      url = `/api/v1/shop-item/${currentShop.id}/products`;
    }
    return getAsinList(url, { with: 'category,brand', ...params, filters }).then((res) => {
      const { data, status } = res || {};
      if (status === 'ok') {
        setAsinList(data);
      }
      return res;
    });
  };

  useEffect(() => {
    if (isFirstOnload.current) {
      isFirstOnload.current = false;
    } else {
      tableRef?.current?.onSearch({ searchFilters: filters });
    }
  }, [filters]);

  // 每当asin列表变化 设置当前竞品为列表第一个
  useEffect(() => {
    if (asinList?.length) {
      const { id } = asinList[0];
      setCurrentId(id);
      setCurrentAsin(asinList[0]);
    }
  }, [asinList, setCurrentAsin]);

  // 置顶
  const setTop = async (e: any, top_id: number, asinId: number) => {
    e.stopPropagation();
    const { status } = await setAsinTop({ asinId, top: top_id ? 0 : 1 });
    if (status === 'ok') {
      tableRef?.current?.reset(true);
    }
  };

  const columns: ColumnsType<Asin> = [
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
    },
    {
      title: '缩略图',
      dataIndex: 'img',
      width: '80px',
      render: (_, { img_url }) => {
        return (
          <div className={styles.thumbnail}>
            <img src={img_url} style={{ width: '100%', height: 80 }} alt="" />
            <img src={img_url} className={styles.bigImg} alt="" />
          </div>
        );
      },
    },
    {
      title: '产品名',
      dataIndex: 'name',
      width: '100px',
      render: (name, record) => {
        const { link } = record;
        return (
          <a target="blank" href={link}>
            {name}
          </a>
        );
      },
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      width: '100px',
      render: (asin, record) => {
        const { link } = record;
        return (
          <a target="blank" href={link}>
            {asin}
          </a>
        );
      },
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      width: '80px',
    },
    {
      title: '品牌',
      dataIndex: ['brand', 'name'],
      width: '80px',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      width: '70px',
      render: (_, { rating, rating_change }) => {
        return (
          <p style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span>{rating}</span>
            {getTrend(rating_change)}
          </p>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'reviews',
      width: '70px',
      render: (_, { reviews, reviews_change }) => {
        return (
          <p style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span>{reviews}</span>
            {getTrend(reviews_change)}
          </p>
        );
      },
    },
    {
      title: '最新更新时间',
      dataIndex: 'review_date',
      width: '130px',
    },
  ];

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ marginTop: 10 }}>
      <StandardTable
        scroll={{y: 800}}
        cref={tableRef}
        request={fetchAsinList}
        bordered={false}
        columns={columns}
        pagination={{ current: 1, pageSize: 50 }}
        rowClassName={({ id }: Asin) => {
          if (currentId === id) {
            return styles.highLight;
          }
          return '';
        }}
        onRow={(record: Asin) => {
          let flag = true;
          let startPosition: { startX: any; startY: any };
          return {
            onClick: () => {
              if (flag) {
                const { id } = record;
                setCurrentId(id);
                setCurrentAsin(record);
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
    </Card>
  );
};

export default AsinList;
