import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DatePicker, Form, Input, Select, Switch, Button } from 'antd';
import moment from 'moment';
import StandardTable from '@/components/StandardTable';

import styles from './index.less';
import DetailTable from './DetailTable';
import { getStoreList, getList } from './service';

const { Option } = Select;
const { RangePicker } = DatePicker;

const startRange = moment().subtract(0.5, 'year').format('YYYY-MM');
const endRange = moment().format('YYYY-MM');
const startCompareRange = moment().subtract(1.5, 'year').format('YYYY-MM');
const endCompareRange = moment().subtract(1, 'year').format('YYYY-MM');

const ProductReport: React.FC = () => {
  const [form] = Form.useForm();
  const ref: any = useRef();
  const [firstLoad, setFirstLoad] = useState(true);

  // 店铺列表选项、站点列表选项
  const [storeList, setStoreList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);

  // 默认店铺选中、站点选中
  const [store, setStore] = useState<number | undefined>(1);
  const [site, setSite] = useState<number | undefined>(1);

  // 关键字或sku输入
  const [keywords, setKeywords] = useState<undefined | string>(undefined);

  // 日期范围选择
  const [range, setRange] = useState<any[]>([moment(startRange), moment(endRange)]);
  // 对比开关
  const [compare, setCompare] = useState(false);
  // 对比日期范围选择
  const [compareRange, setCompareRange] = useState<any[]>([
    moment(startCompareRange),
    moment(endCompareRange),
  ]);

  const [type, setType] = useState('detail');

  // 两个日期范围的区间大小
  const [rangeSize, setRangeSize] = useState<number>(
    moment(endRange).diff(moment(startRange), 'months'),
  );
  const [compareRangeSize, setCompareRangeSize] = useState<number>(
    moment(endCompareRange).diff(moment(startCompareRange), 'months'),
  );

  const [sorter, setSorter] = useState(endRange);

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
      // const response = await getSiteList({ pageSize: 100 });
      // if (response.status === 'ok') {
      //   setSiteList(response.data);
      //   if (response.data.length !== 0) {
      //     setSite(response.data[0].id);
      //     form.setFieldsValue({ site_id: response.data[0].id });
      //   }
      // }
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
  }, [store, site, keywords, range, compareRange, sorter]);

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

  const handleSearch = () => {
    setKeywords(form.getFieldValue('keywords'));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const formRange = form.getFieldValue('range');
      if (moment(sorter).isBefore(formRange[0]) || moment(sorter).isAfter(formRange[1])) {
        form.setFieldsValue({ sorter_month: moment(formRange[1]).format('YYYY-MM') });
        setSorter(moment(formRange[1]).format('YYYY-MM'));
      }
      setRange(formRange);
      setRangeSize(formRange[1].diff(formRange[0], 'months'));
    }
  };

  const handleCompareOpenChange = (open: boolean) => {
    if (!open) {
      const formCompareRange = form.getFieldValue('range_compare');
      setCompareRange(formCompareRange);
      setCompareRangeSize(formCompareRange[1].diff(formCompareRange[0], 'months'));
    }
  };

  const handleSorterChange = (value: string) => {
    setSorter(value);
  };

  const renderSorterOption = useMemo(() => {
    const sorterList: string[] = [];
    for (let i = 0; i <= rangeSize; i += 1) {
      sorterList.push(moment(range[0]).add(i, 'month').format('YYYY-MM'));
    }
    return sorterList.map((e) => (
      <Option key={e} value={e}>
        {e}
      </Option>
    ));
  }, [rangeSize, range]);

  const handleViewChange = () => {
    setType(type === 'detail' ? 'item' : 'detail');
  };

  const columns = [
    {
      title: '详细',
      dataIndex: 'info',
      render: (_: any, record: any) => (
        <DetailTable
          current={record}
          range={range}
          compare={compare}
          compareRange={compareRange}
          rangeSize={rangeSize}
          compareRangeSize={compareRangeSize}
          siteList={siteList}
          type={type}
          pref={ref}
        />
      ),
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
            range: range,
            keywords: keywords,
            range_compare: compareRange,
            sorter_month: sorter,
          }}
        >
          <div className={styles.formContainer}>
            <Form.Item name="store_id" style={{ width: 120, marginBottom: 5, marginLeft: 10 }}>
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
            <Form.Item name="keywords" style={{ width: 210, marginBottom: 5, marginLeft: 10 }}>
              <Input.Search placeholder="请输入sku" allowClear onSearch={handleSearch} />
            </Form.Item>
            <Form.Item name="range" style={{ width: 240, marginBottom: 5, marginLeft: 10 }}>
              <RangePicker allowClear={false} picker="month" onOpenChange={handleOpenChange} />
            </Form.Item>
            <div className={styles.switch}>
              <span>对比</span>
              <Switch checked={compare} onChange={() => setCompare((val) => !val)} />
            </div>
            <Form.Item name="range_compare" style={{ width: 240, marginBottom: 5, marginLeft: 10 }}>
              <RangePicker
                allowClear={false}
                disabled={!compare}
                picker="month"
                onOpenChange={handleCompareOpenChange}
              />
            </Form.Item>
            <Form.Item name="sorter_month" style={{ width: 180, marginBottom: 5, marginLeft: 10 }}>
              <Select placeholder="根据月份对销售额倒序" allowClear onChange={handleSorterChange}>
                {renderSorterOption}
              </Select>
            </Form.Item>
            <Button
              style={{ marginLeft: 10, marginBottom: 5 }}
              key="change"
              type="primary"
              onClick={handleViewChange}
            >
              切换视图
            </Button>
            {/*<Button*/}
            {/*  style={{ marginLeft: 11 }}*/}
            {/*  key="import"*/}
            {/*  type="primary"*/}
            {/*  onClick={() => handleIoVisible(true, 'import', true)}*/}
            {/*>*/}
            {/*  <CloudUploadOutlined /> 导入*/}
            {/*</Button>*/}
          </div>
        </Form>
      </div>
      <StandardTable
        request={(params: any) =>
          getList({
            ...params,
            filters: {
              store: store,
              range: [moment(range[0]).format('YYYY-MM'), moment(range[1]).format('YYYY-MM')],
              compare_range: [
                moment(compareRange[0]).format('YYYY-MM'),
                moment(compareRange[1]).format('YYYY-MM'),
              ],
              site: site,
              keywords,
            },
            sorter: { [sorter as string]: 'desc' },
          })
        }
        cref={ref}
        columns={columns}
        showHeader={false}
        bordered
        sticky
        pagination={{ current: 1, pageSize: 15 }}
        paginationConfig={{ pageSizeOptions: [10, 15, 25, 50] }}
      />
    </div>
  );
};

export default ProductReport;
