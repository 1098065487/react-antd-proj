import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Form, Select, DatePicker, Input, Typography, Button } from 'antd';
import Icon, { QuestionCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import * as moment from 'moment';
import StandardTable from '@/components/StandardTable';
import ImportAndExport from '@/components/ImportAndExport';
import { IOType, handleIOMethod } from '@/components/ImportAndExport/data.d';
// @ts-ignore
import defaultImg from '@/assets/product.webp';
// import { systemExport } from '@/components/ImportAndExport/service';
import styles from './style.less';
import {
  getList,
  getStoreList,
  getSiteList,
  queryTotalData,
  setToTop,
  getDefaultRange,
} from './service';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Paragraph } = Typography;

const amazonCostTip = (
  <span style={{ color: '#000' }}>
    运费+包装费+消费税(代收)+运费税(代收)+包装税(代收)+促销运费+促销服务费+运输服务费+配送费+佣金+包装服务费+运输服务费HB+消费税(代缴)+运费税(代缴)+其他税(代缴)+低价物品消费税(代缴)+低价物品运费税(代缴)+赔偿回收+免费退换货退款+逆向赔偿+库存损坏+库存遗失+准备费退款
  </span>
);
const operationCostTip = <span style={{ color: '#000' }}>采购成本+物流头程+运营费用+测评费用</span>;
const returnTip = (
  <span style={{ color: '#000' }}>
    退款服务费(亚马逊)+退款(客户)+退还消费税(客户代缴)+退还运输服务费(客户)+退还运费税(客户代缴)+退还美意(客户)+退还包装费(客户)+退还包装税(客户代缴)+退还补货税(客户)
  </span>
);
const profitTip = <span style={{ color: '#000' }}>销售总额+亚马逊成本+运营成本+退货</span>;
const profitabilityTip = <span style={{ color: '#000' }}>利润/销售总额</span>;
const collectionTip = (
  <span style={{ color: '#000' }}>运费+包装费+消费税(代收)+运费税(代收)+包装税(代收)</span>
);
const costTip = (
  <span style={{ color: '#000' }}>
    促销运费+促销服务费+运输服务费+配送费+佣金+包装服务费+运输服务费HB+消费税(代缴)+运费税(代缴)+其他税(代缴)+低价物品消费税(代缴)+低价物品运费税(代缴)
  </span>
);
const recoverCompensationTip = <span style={{ color: '#000' }}>赔偿回收</span>;
const refundTip = (
  <span style={{ color: '#000' }}>免费退换货退款+逆向赔偿+库存损坏+库存遗失+准备费退款</span>
);
const outStockTip = (
  <span style={{ color: '#000' }}>
    销售数量+免费退换货退款数量+逆向赔偿数量+库存损坏数量+库存遗失数量+准备费用退款数量
  </span>
);
const inStockTip = <span style={{ color: '#000' }}>赔偿回收数量</span>;
const refundAmazonTip = (
  <span style={{ color: '#000' }}>
    退还佣金(亚马逊)+退还运输服务费(亚马逊)+退还运输服务费HB(亚马逊)+退还包装服务费(亚马逊)+退还补货费(亚马逊)+退还消费税(亚马逊代收)+退还运费税(亚马逊代收)+退还其他税(亚马逊)+促销退款(亚马逊)+促销运费退款(亚马逊)
  </span>
);
const chargeAmazonTip = <span style={{ color: '#000' }}>退款服务费(亚马逊)</span>;
const refundCustomTip = (
  <span style={{ color: '#000' }}>
    退款(客户)+退还消费税(客户代缴)+退还运输服务费(客户)+退还运费税(客户代缴)+退还美意(客户)+退还包装费(客户)+退还包装税(客户代缴)+退还补货税(客户)
  </span>
);

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

const CostAnalysis: React.FC = () => {
  const [form] = Form.useForm();
  const ref: any = useRef();
  const [firstLoad, setFirstLoad] = useState(true);

  // 店铺和站点选择列表
  const [storeList, setStoreList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);

  // 初始店铺和站点默认值
  const [shop, setShop] = useState<number>(1);
  const [site, setSite] = useState<number>(1);

  // 时间范围选择
  const [range, setRange] = useState<any[]>([]);
  // 截至时间限定
  const [end, setEnd] = useState<any>(moment());

  const [keywords, setKeywords] = useState<undefined | string>(undefined);

  const [total, setTotal] = useState<any>({});

  const [ioVisible, setIoVisible] = useState(false);
  const [ioType, setIoType] = useState<IOType>('import');
  const [importVisible, setImportVisible] = useState(false);

  const DefaultIcon = (defaultIconProps: any) => (
    <Icon component={defaultSvg} {...defaultIconProps} />
  );
  const ToppingIcon = (toppingIconProps: any) => (
    <Icon component={toppingSvg} {...toppingIconProps} />
  );

  useEffect(() => {
    (async () => {
      const res = await getStoreList({ pageSize: 100 });
      if (res.status === 'ok') {
        setStoreList(res.data);
        if (res.data.length !== 0) {
          setShop(res.data[0].id);
          form.setFieldsValue({ store_id: res.data[0].id });
        }
      }
      const response = await getSiteList({ pageSize: 100 });
      if (response.status === 'ok') {
        setSiteList(response.data);
        if (response.data.length !== 0) {
          setSite(response.data[0].id);
          form.setFieldsValue({ site_id: response.data[0].id });
        }
      }
      const rangeRes = await getDefaultRange();
      if (rangeRes.status === 'ok') {
        setRange(rangeRes.data.range);
        setEnd(rangeRes.data.range[1]);
        form.setFieldsValue({
          range: [moment(rangeRes.data.range[0]), moment(rangeRes.data.range[1])],
        });
      }
    })();
  }, [form]);

  useEffect(() => {
    (async () => {
      if (range && range.length !== 0) {
        const res = await queryTotalData({
          store_id: shop,
          range:
            moment(range[0]).format('YYYY-MM-DD') + ',' + moment(range[1]).format('YYYY-MM-DD'),
          site_id: site,
          keywords,
        });
        if (res.status === 'ok') {
          setTotal(res.data);
        }
      }
    })();
    if (firstLoad) {
      setFirstLoad(false);
    } else {
      if (ref.current) {
        ref.current.reset(true);
      }
    }
  }, [shop, range, site, keywords]);

  // 日期范围选择限制
  const disabledDate = useCallback(
    (current: any) => {
      return current.isAfter(end);
    },
    [end],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRange(form.getFieldValue('range'));
    }
  };

  const handleSearch = () => {
    setKeywords(form.getFieldValue('keywords'));
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

  const renderDataColor = (value: number) => {
    if (value > 0) {
      return <span style={{ color: '#d9001b' }}>{value}$</span>;
    } else if (value < 0) {
      return <span style={{ color: '#88c12f' }}>{value}$</span>;
    } else {
      return value;
    }
  };

  const renderTotalCost = () => {
    return (
      <span style={{ color: '#000' }}>
        亚马逊成本: {renderDataColor(total.amazon_cost)}
        <br />
        运营成本: {renderDataColor(total.operating_cost)}
        <br />
        服务费: {renderDataColor(total.service_fee)}
        <br />
        FBA用户退货存储费: {renderDataColor(total.fba_customer_return_per_unit_fee)}
        <br />
        变卖处理: {renderDataColor(total.disposal_complete)}
        <br />
        移除处理: {renderDataColor(total.remove_complete)}
        <br />
        有偿服务费: {renderDataColor(total.paid_services_fee)}
        <br />
        仓储费: {renderDataColor(total.storage_fee)}
        <br />
        订阅费: {renderDataColor(total.subscription_fee)}
        <br />
        仓库准备费: {renderDataColor(total.warehouse_prep)}
        <br />
        仓库更新费: {renderDataColor(total.storage_renewal_billing)}
        <br />
        优惠劵兑换费: {renderDataColor(total.coupon_redemption_fee)}
        <br />
        FBA包装费调整: {renderDataColor(total.fba_pick_and_pack_fee)}
        <br />
        早期复查费: {renderDataColor(total.early_reviewer_program_fee)}
        <br />
        快速交易费: {renderDataColor(total.lightning_deal_fee)}
      </span>
    );
  };

  const renderTotalRefund = () => {
    return (
      <span style={{ color: '#000' }}>
        亚马逊手续费: {renderDataColor(total.amazon_commission_charge)}
        <br />
        客户退款: {renderDataColor(total.customer_refund)}
      </span>
    );
  };

  // 置顶
  const setTop = async (e: any, id: number) => {
    e.stopPropagation();
    const { status } = await setToTop(id);
    if (status === 'ok') {
      ref?.current?.reset(true);
    }
  };

  const columns = [
    {
      title: '置顶',
      dataIndex: 'top',
      align: 'center',
      width: 60,
      render: (_: any, record: any) => {
        return record.top !== null ? (
          <ToppingIcon style={{ cursor: 'pointer' }} onClick={(e: any) => setTop(e, record.id)} />
        ) : (
          <DefaultIcon style={{ cursor: 'pointer' }} onClick={(e: any) => setTop(e, record.id)} />
        );
      },
      fixed: 'left',
    },
    {
      title: '商品',
      dataIndex: 'product',
      width: 275,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: any) => {
        return (
          <div className={styles.productColumn}>
            <img src={record.thumbnail || defaultImg} />
            <div className={styles.productInfo}>
              <Tooltip placement="rightTop" title={record.title}>
                <div className={styles.title}>{record.title}</div>
              </Tooltip>
              <div>
                ASIN:{' '}
                <Paragraph className={styles.copyableContent} copyable={record.asin}>
                  {record.asin}
                </Paragraph>
              </div>
              <div>
                SKU:{' '}
                <Paragraph className={styles.copyableContent} copyable>
                  {record.sku}
                </Paragraph>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: '概览',
      children: [
        {
          title: '销售总额',
          dataIndex: 'total_sales',
          sorter: true,
          width: 100,
          align: 'center',
        },
        {
          title: (
            <span>
              亚马逊成本&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={amazonCostTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'amazon_cost',
          sorter: true,
          width: 130,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    运费: {renderDataColor(record.pcp2)}
                    <br />
                    包装费: {renderDataColor(record.pcp3)}
                    <br />
                    消费税(代收): {renderDataColor(record.pcp4)}
                    <br />
                    运费税(代收): {renderDataColor(record.pcp5)}
                    <br />
                    包装税(代收): {renderDataColor(record.pcp6)}
                    <br />
                    促销运费: {renderDataColor(record.pam1)}
                    <br />
                    促销服务费: {renderDataColor(record.pam2)}
                    <br />
                    运输服务费: {renderDataColor(record.pam3)}
                    <br />
                    配送费: {renderDataColor(record.pam4)}
                    <br />
                    佣金: {renderDataColor(record.pam5)}
                    <br />
                    包装服务费: {renderDataColor(record.pam6)}
                    <br />
                    运输服务费HB: {renderDataColor(record.pam7)}
                    <br />
                    消费税(代缴): {renderDataColor(record.pam8)}
                    <br />
                    运费税(代缴): {renderDataColor(record.pam9)}
                    <br />
                    其他税(代缴): {renderDataColor(record.pam10)}
                    <br />
                    低价物品消费税(代缴): {renderDataColor(record.pam11)}
                    <br />
                    低价物品运费税(代缴): {renderDataColor(record.pam12)}
                    <br />
                    赔偿回收: {renderDataColor(record.oam1)}
                    <br />
                    免费退换货退款: {renderDataColor(record.oap1)}
                    <br />
                    逆向赔偿: {renderDataColor(record.oap2)}
                    <br />
                    库存损坏: {renderDataColor(record.oap3)}
                    <br />
                    库存遗失: {renderDataColor(record.oap4)}
                    <br />
                    准备费退款: {renderDataColor(record.oap5)}
                  </>
                }
              >
                {record.amazon_cost} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
        {
          title: (
            <span>
              运营成本&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={operationCostTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'operating_cost',
          sorter: true,
          width: 110,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    采购成本: {renderDataColor(record.yym1)}
                    <br />
                    物流头程: {renderDataColor(record.yym2)}
                    <br />
                    运营费用: {renderDataColor(record.yym3)}
                    <br />
                    测评费用: {renderDataColor(record.yym4)}
                  </>
                }
              >
                {record.operating_cost} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
        {
          title: (
            <span>
              退货&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={returnTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'refunds',
          sorter: true,
          width: 90,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    退款服务费(亚马逊): {renderDataColor(record.ram1)}
                    <br />
                    退款(客户): {renderDataColor(record.rcm1)}
                    <br />
                    退还消费税(客户代缴): {renderDataColor(record.rcm2)}
                    <br />
                    退还运输服务费(客户): {renderDataColor(record.rcm3)}
                    <br />
                    退还运费税(客户代缴): {renderDataColor(record.rcm4)}
                    <br />
                    退还美意(客户): {renderDataColor(record.rcm5)}
                    <br />
                    退还包装费(客户): {renderDataColor(record.rcm6)}
                    <br />
                    退还包装税(客户代缴): {renderDataColor(record.rcm7)}
                    <br />
                    退还补货税(客户): {renderDataColor(record.rcm8)}
                  </>
                }
              >
                {record.refunds} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
        {
          title: (
            <span>
              利润&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={profitTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'profit',
          sorter: true,
          width: 90,
          align: 'center',
        },
        {
          title: (
            <span>
              利润率&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={profitabilityTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'profit_margin',
          sorter: true,
          width: 100,
          align: 'center',
        },
      ],
    },
    {
      title: '亚马逊成本',
      children: [
        {
          title: (
            <span>
              代收&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={collectionTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'surrogate_fee',
          sorter: true,
          width: 90,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    运费: {renderDataColor(record.pcp2)}
                    <br />
                    包装费: {renderDataColor(record.pcp3)}
                    <br />
                    消费税(代收): {renderDataColor(record.pcp4)}
                    <br />
                    运费税(代收): {renderDataColor(record.pcp5)}
                    <br />
                    包装税(代收): {renderDataColor(record.pcp6)}
                  </>
                }
              >
                {record.surrogate_fee} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
        {
          title: (
            <span>
              成本&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={costTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'amazon_cost_cost',
          sorter: true,
          width: 90,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    促销运费: {renderDataColor(record.pam1)}
                    <br />
                    促销服务费: {renderDataColor(record.pam2)}
                    <br />
                    运输服务费: {renderDataColor(record.pam3)}
                    <br />
                    配送费: {renderDataColor(record.pam4)}
                    <br />
                    佣金: {renderDataColor(record.pam5)}
                    <br />
                    包装服务费: {renderDataColor(record.pam6)}
                    <br />
                    运输服务费HB: {renderDataColor(record.pam7)}
                    <br />
                    消费税(代缴): {renderDataColor(record.pam8)}
                    <br />
                    运费税(代缴): {renderDataColor(record.pam9)}
                    <br />
                    其他税(代缴): {renderDataColor(record.pam10)}
                    <br />
                    低价物品消费税(代缴): {renderDataColor(record.pam11)}
                    <br />
                    低价物品运费税(代缴): {renderDataColor(record.pam12)}
                  </>
                }
              >
                {record.amazon_cost_cost} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
        {
          title: (
            <span>
              其他成本&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={recoverCompensationTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'amazon_other_cost',
          sorter: true,
          width: 110,
          align: 'center',
        },
        {
          title: (
            <span>
              退款&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={refundTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'amazon_cost_refunds',
          sorter: true,
          width: 90,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    免费退换货退款: {renderDataColor(record.oap1)}
                    <br />
                    逆向赔偿: {renderDataColor(record.oap2)}
                    <br />
                    库存损坏: {renderDataColor(record.oap3)}
                    <br />
                    库存遗失: {renderDataColor(record.oap4)}
                    <br />
                    准备费退款: {renderDataColor(record.oap5)}
                  </>
                }
              >
                {record.amazon_cost_refunds} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
      ],
    },
    {
      title: '数量',
      children: [
        {
          title: (
            <span>
              出库数量&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={outStockTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'outbound_qty',
          sorter: true,
          width: 110,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    销售数量: {record.nm1}
                    <br />
                    免费退换货退款数量: {record.nm2}
                    <br />
                    逆向赔偿数量: {record.nm3}
                    <br />
                    库存损坏数量: {record.nm4}
                    <br />
                    库存遗失数量: {record.nm5}
                    <br />
                    准备费用退款数量: {record.nm6}
                  </>
                }
              >
                {record.outbound_qty} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
        {
          title: (
            <span>
              入库数量&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={inStockTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'inbound_qty',
          sorter: true,
          width: 110,
          align: 'center',
        },
      ],
    },
    {
      title: '退货',
      children: [
        {
          title: (
            <span>
              亚马逊退款&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={refundAmazonTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'amazon_refunds',
          sorter: true,
          width: 130,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    退还佣金(亚马逊): {renderDataColor(record.rap1)}
                    <br />
                    退还运输服务费(亚马逊): {renderDataColor(record.rap2)}
                    <br />
                    退还运输服务费HB(亚马逊): {renderDataColor(record.rap3)}
                    <br />
                    退还包装服务费(亚马逊): {renderDataColor(record.rap4)}
                    <br />
                    退还补货费(亚马逊): {renderDataColor(record.rap5)}
                    <br />
                    退还消费税(亚马逊代收): {renderDataColor(record.rap6)}
                    <br />
                    退还运费税(亚马逊代收): {renderDataColor(record.rap7)}
                    <br />
                    退还其他税(亚马逊): {renderDataColor(record.rap8)}
                    <br />
                    促销退款(亚马逊): {renderDataColor(record.rap9)}
                    <br />
                    促销运费退款(亚马逊): {renderDataColor(record.rap10)}
                  </>
                }
              >
                {record.amazon_refunds} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
        {
          title: (
            <span>
              亚马逊手续费&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={chargeAmazonTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'amazon_commission_charge',
          sorter: true,
          width: 140,
          align: 'center',
        },
        {
          title: (
            <span>
              客户退款&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={refundCustomTip}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          ),
          dataIndex: 'customer_refund',
          sorter: true,
          width: 110,
          align: 'center',
          render: (_: any, record: any) => {
            return (
              <Tooltip
                placement="rightTop"
                trigger="click"
                className={styles.showHover}
                title={
                  <>
                    退款(客户): {renderDataColor(record.rcm1)}
                    <br />
                    退还消费税(客户代缴): {renderDataColor(record.rcm2)}
                    <br />
                    退还运输服务费(客户): {renderDataColor(record.rcm3)}
                    <br />
                    退还运费税(客户代缴): {renderDataColor(record.rcm4)}
                    <br />
                    退还美意(客户): {renderDataColor(record.rcm5)}
                    <br />
                    退还包装费(客户): {renderDataColor(record.rcm6)}
                    <br />
                    退还包装税(客户代缴): {renderDataColor(record.rcm7)}
                    <br />
                    退还补货税(客户): {renderDataColor(record.rcm8)}
                  </>
                }
              >
                {record.customer_refund} <QuestionCircleOutlined />
              </Tooltip>
            );
          },
        },
      ],
    },
    {
      title: '上架时间',
      dataIndex: 'date',
      sorter: true,
      width: 100,
      align: 'center',
    },
  ];

  return (
    <div className={styles.contentContainer}>
      <div className={styles.contentTop}>
        <div className={styles.costInfo}>
          <div className={styles.infoPart}>
            <span>销售总额</span>
            <div className={styles.infoDetail}>{total.total_sales}</div>
          </div>
          <div className={styles.infoPart}>
            <span>
              总成本&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={renderTotalCost()}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
            <div className={styles.infoDetail}>{total.total_cost}</div>
          </div>
          <div className={styles.infoPart}>
            <span>
              退款&nbsp;
              <Tooltip placement="rightTop" color="#F9FBE7" title={renderTotalRefund()}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
            <div className={styles.infoDetail}>{total.refund}</div>
          </div>
          <div className={styles.infoPart}>
            <span>
              利润&nbsp;
              <Tooltip
                placement="rightTop"
                color="#F9FBE7"
                title={<span style={{ color: '#000' }}>销售总额-总成本-退款</span>}
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
            <div className={styles.infoDetail}>{total.profit}</div>
          </div>
          <div className={styles.infoPart}>
            <span>
              其他&nbsp;
              <Tooltip
                placement="rightTop"
                color="#F9FBE7"
                title={<span style={{ color: '#000' }}>用来监控是否有系统遗漏数据</span>}
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
            <div className={styles.infoDetail}>{total.other}</div>
          </div>
        </div>
        <div className={styles.operateContainer}>
          <Form
            form={form}
            initialValues={{
              store_id: shop,
              range: range,
              site_id: site,
            }}
          >
            <div className={styles.formContainer}>
              <Form.Item name="store_id" style={{ width: 120, marginBottom: 0, marginLeft: 10 }}>
                <Select onChange={(value: number) => setShop(value)}>
                  {storeList.map((e: any) => (
                    <Option key={e.id} value={e.id}>
                      {e.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="range" style={{ width: 240, marginBottom: 0, marginLeft: 10 }}>
                <RangePicker
                  allowClear={false}
                  disabledDate={disabledDate}
                  onOpenChange={handleOpenChange}
                />
              </Form.Item>
              <Form.Item name="site_id" style={{ width: 100, marginBottom: 0, marginLeft: 10 }}>
                <Select onChange={(value: number) => setSite(value)}>
                  {siteList.map((e: any) => (
                    <Option key={e.id} value={e.id}>
                      {e.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="keywords" style={{ width: 210, marginBottom: 0, marginLeft: 10 }}>
                <Input.Search allowClear onSearch={handleSearch} />
              </Form.Item>
              <Button
                style={{ marginLeft: 11 }}
                key="import"
                type="primary"
                onClick={() => handleIoVisible(true, 'import', true)}
              >
                <CloudUploadOutlined /> 导入
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <StandardTable
        request={(params: any) => {
          if (range && range.length !== 0) {
            return getList({
              ...params,
              store_id: shop,
              range:
                moment(range[0]).format('YYYY-MM-DD') + ',' + moment(range[1]).format('YYYY-MM-DD'),
              site_id: site,
              keywords,
            });
          }
          return () => {};
        }}
        cref={ref}
        bordered
        columns={columns}
        scroll={{ x: 2035, y: document.documentElement.clientHeight - 360 }}
        pagination={{ current: 1, pageSize: 25 }}
        paginationConfig={{ pageSizeOptions: [25, 50, 75, 100] }}
      />
      {ioVisible ? (
        <ImportAndExport
          visible={ioVisible}
          type={ioType}
          importVisible={importVisible}
          importType="store_product_item_other_fee"
          handleDrawerVisible={handleIoVisible}
        />
      ) : null}
    </div>
  );
};

export default CostAnalysis;
