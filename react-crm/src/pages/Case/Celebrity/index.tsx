import React, { useRef, useState, useEffect } from 'react';
import { Input, Space, Button, Form, message, Switch, Tooltip } from 'antd';
import ProTable, { ActionType, ProColumns } from "@ant-design/pro-table";
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { getAllBrandList } from '@/pages/Parameter/Brand/service';
import { getAllTags } from '@/pages/Parameter/Tag/service';
import { TableListItem, StatisticProps } from './data.d';
import { queryCelebrities, queryStatistic, setStatus } from './service';
import CelebrityFrom from "./Component/CelebrityForm";
import styles from './index.less';

const Celebrity: React.FC<TableListItem> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  // 统计数据
  const [statistic, setStatistic] = useState<StatisticProps>({ total_qty: 0, no_good_qty: 0, has_casing_qty: 0 });

  // 品牌，tag参数列表
  const [brands, setBrands] = useState<number[]>([]);
  const [tags, setTags] = useState<number[]>([]);

  // 额外的查询参数
  // 工具栏两个参数
  const [extraFilter, setExtraFilter] = useState({ keywords: undefined, channel: undefined });

  // form表单参数
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({});

  const getStatistic = async () => {
    const res = await queryStatistic();
    if (res.status === 'ok') {
      setStatistic(res.body);
      return;
    }
    message.warning('获取统计信息失败！');
  };

  useEffect(() => {
    // 本页获取品牌，tag参数列表
    (
      async () => {
        const res = await getAllBrandList({});
        if (res.status === 'ok') {
          setBrands(res.body);
        }
        const response = await getAllTags({});
        if (response.status === 'ok') {
          const tagList = response.body;
          setTags(tagList);
        }
      }
    )();
    // 初始获取统计数据
    getStatistic();
  }, []);

  // 处理表格内筛选品牌多选展示
  const renderBrandEnum = () => {
    if (brands.length !== 0) {
      const brandEnum = {};
      brands.forEach((e: any) => {
        brandEnum[e.value] = e.key;
      });
      return brandEnum;
    }
    return undefined;
  };

  // 处理表格内筛选Tag多选展示
  const renderTagEnum = () => {
    if (tags.length !== 0) {
      const tagEnum = {};
      tags.forEach((e: any) => {
        tagEnum[e.id] = e.tag;
      });
      return tagEnum;
    }
    return undefined;
  };

  const handleSearch = (value: any) => {
    const { keywords, channel } = value;
    setExtraFilter({ keywords, channel });
  };

  const handleReset = () => {
    form.resetFields();
    setExtraFilter({ keywords: undefined, channel: undefined });
  };

  const handleVisible = (flag: boolean, record: TableListItem | any) => {
    setVisible(flag);
    setCurrent(record);
  };

  const handleThinkingChange = async (checked: boolean, record: TableListItem) => {
    const { id } = record;
    if (id) {
      const res = await setStatus(id, { thinking: checked ? 1 : 0 });
      if (res.status === 'ok') {
        getStatistic();
        if (actionRef.current) {
          actionRef.current.reload();
        }
      }
    }
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '红人名称',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 150,
      ellipsis: true,
    },
    {
      title: '品牌线',
      dataIndex: 'brands',
      width: 120,
      filters: true,
      valueEnum: renderBrandEnum(),
      render: (_, record) => {
        const { brands = [] } = record;
        return brands.map((e: any) => <div key={e.id}>{e.name}</div>);
      }
    },
    {
      title: 'Tag',
      dataIndex: 'tags',
      width: 120,
      filters: true,
      valueEnum: renderTagEnum(),
      render: (_, record) => {
        const { tags = [] } = record;
        return tags.map((e: any) => <div key={e.id}>{e.tag}</div>);
      }
    },
    {
      title: '详情',
      dataIndex: 'detail',
      width: 180,
      render: (_, record) => {
        return (
          <Tooltip title={record.detail}>
            <div className={styles.over_line}>
              {record.detail}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: '频道',
      dataIndex: 'platforms',
      width: 200,
      render: (_, record) => {
        const { platforms = [] } = record;
        if (platforms) {
          return platforms.map((e: any) => {
            return (
              <Tooltip key={e.id} title={e.pivot.full_channel}>
                <a
                  rel="noreferrer"
                  href={e.pivot.full_channel}
                  target='_blank'
                  className={styles.channel_link}
                >
                  {e.pivot.full_channel}
                </a>
              </Tooltip>
            );
          });
        }
        return null;
      }
    },
    {
      title: '是否适合',
      dataIndex: 'thinking',
      fixed: 'right',
      width: 100,
      render: (_, record) => {
        return (
          <Switch
            checkedChildren="合适"
            unCheckedChildren="不合适"
            checked={record.thinking === 1}
            onChange={checked => handleThinkingChange(checked, record)}
          />
        );
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 60,
      fixed: 'right',
      valueType: 'option',
      hideInForm: true,
      search: false,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleVisible(true, record as any)}
        >
          <EditOutlined />
        </Button>
      ),
    },
  ];

  const handleQueryCelebrities = async (params: any) => {
    let renderParams: any;
    if (Object.keys(params.sorter).length !== 0) {
      renderParams = params;
    } else {
      renderParams = { ...params, sorter: { id: 'descend' } }
    }
    const res = await queryCelebrities({ ...renderParams, with: 'brands,tags,platforms,user' });
    if (res.status === 'ok') {
      return { success: true, ...res.body };
    }
    message.error('数据请求失败！');
    return { success: false, data: [] }
  };

  return (
    <PageContainer
      className={styles.custom_container}
      header={{
        breadcrumb: undefined,
        title: (
          <div className={styles.statistic}>
            <div className={styles.statistic_part}>
              全部红人数
              <div className={styles.statistic_value}>
                {statistic.total_qty}
              </div>
            </div>
            <div className={styles.statistic_part}>
              有进行中Case的红人
              <div className={styles.statistic_value}>
                {statistic.has_casing_qty}
              </div>
            </div>
            <div className={styles.statistic_part}>
              不合适的红人
              <div className={styles.statistic_value}>
                {statistic.no_good_qty}
              </div>
            </div>
          </div>
        ),
        extra: (
          <Space>
            <Button key='add' type="primary" onClick={() => handleVisible(true, {})}>
              <PlusOutlined /> 新建
            </Button>
            {/*<Button key='import' type="primary">*/}
            {/*  <CloudUploadOutlined /> 导入*/}
            {/*</Button>*/}
            {/*<Button key='export'>*/}
            {/*  <CloudDownloadOutlined /> 导出*/}
            {/*</Button>*/}
          </Space>
        ),
      }}
    >
      <ProTable<TableListItem>
        headerTitle={
          <Form
            colon={false}
            form={form}
            layout='horizontal'
            onFinish={handleSearch}
            key='search'
            style={{ display: 'inline-block' }}
          >
            <Space>
              <Form.Item
                wrapperCol={{ span: 24 }}
                name='keywords'
                style={{ marginBottom: 0, width: 200 }}
              >
                <Input placeholder='红人名称、Email综合搜索' />
              </Form.Item>
              <Form.Item
                wrapperCol={{ span: 24 }}
                name='channel'
                style={{ marginBottom: 0, width: 200 }}
              >
                <Input placeholder='频道模糊查询' />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form>
        }
        actionRef={actionRef}
        rowKey='id'
        search={false}
        toolbar={{
          actions: [],
        }}
        columns={columns}
        params={extraFilter}
        request={(params, sorter, filter) => handleQueryCelebrities({ params, sorter, filter })}
        scroll={document.documentElement.clientWidth - 208 - 48 > 1130 ? undefined : { x: 1130 }}
      />
      {visible ? (
        <CelebrityFrom
          visible={visible}
          handleVisible={handleVisible}
          current={current}
          actionRef={actionRef}
          refreshStatistic={getStatistic}
        />
      ) : null}
    </PageContainer>
  );
};

export default Celebrity;
