/*
 * @Author: wjw
 * @Date: 2020-08-04 13:31:05
 * @LastEditTime: 2020-09-15 15:30:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Operation\Review\index.js
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Button, Cascader, Form, Input, Select, Card } from 'antd';
import useInitTable from '@/customHook/useInitTable';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
// 表格公用组件
import StandardTable from '@/components/StandardTable';
// 评论分析波动图组件
import Fluctuation from './Fluctuation';
// 概览，详情父组件
import Detail from './Detail';
import style from './index.less';

const Review = props => {
  const { loading, reviewAnalysisList, dispatch } = props;
  const [attributes, setAttributes] = useState([]); // 产品属性
  const [currentSku, setCurrentSku] = useState({}); // 要查看的当前SKU
  const initTableData = useMemo(
    () => ({
      initFilters: { no_virtual_spu: true },
      initSorter: { field: 'review_date', order: 'descend' },
    }),
    []
  );
  const {
    pagination,
    filters,
    sorter,
    getTableList,
    handleStandardTableChange,
    handleSearch,
  } = useInitTable(initTableData); // 自定义table hook

  // 获取表格列表
  useEffect(() => {
    getTableList({
      dispatch,
      type: 'review/getReviewAnalysis',
      payload: { pagination, filters, sorter },
    });
  }, [pagination, filters, sorter, dispatch, getTableList]);

  // 获取相关过滤项
  useEffect(() => {
    dispatch({ type: 'platform/fetchTree' }); // 获取平台
    dispatch({ type: 'category/fetchOptions' }); // 获取产品分类
    /**
     * @description: 获取属性包括产品周期 产品分组 产品等级等
     * @return: void
     */
    const getAttribute = () => {
      dispatch({
        type: 'attribute/fetchAll',
        payload: { with: ['values'] },
        callback: res => {
          const attributesResult = res.filter(e => e.name !== 'Group');
          setAttributes(attributesResult);
        },
      });
    };
    getAttribute();
  }, [dispatch]);

  /**
   * @description: 渲染头部搜索部分JSX
   * @return: JSX
   */
  const renderSearchForm = () => {
    const renderAttributeFilters = attr => {
      const { values } = attr;
      return (
        <Select
          mode="multiple"
          allowClear
          style={{ width: 187 }}
          placeholder={attr.name === 'Cycle' ? '产品周期选择' : '产品等级选择'}
        >
          {values.map(value => (
            <Select.Option key={value.id} value={value.id}>
              {value.description}
            </Select.Option>
          ))}
        </Select>
      );
    };
    const {
      form: { getFieldDecorator, validateFieldsAndScroll, resetFields },
      platformTree,
      categoryOptions,
    } = props;
    return (
      <Form layout="inline">
        <Form.Item>{getFieldDecorator('spu')(<Input placeholder="SKU搜索" />)}</Form.Item>
        <Form.Item>
          {getFieldDecorator('platform')(
            <Cascader options={platformTree} placeholder="平台选择" />
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('category')(
            <Cascader options={categoryOptions} placeholder="产品分类选择" />
          )}
        </Form.Item>
        {attributes.map((attr, idx) => (
          <Form.Item key={attr.id}>
            {getFieldDecorator(`attrs.${idx}`)(renderAttributeFilters(attr))}
          </Form.Item>
        ))}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              handleSearch('submit', validateFieldsAndScroll);
            }}
          >
            查询
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              handleSearch('reset', validateFieldsAndScroll, resetFields);
            }}
          >
            重置
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const columns = [
    {
      dataIndex: 'overview',
      render: (_, { id, spu }) => {
        return (
          <span
            className={style.detail}
            onClick={() => setCurrentSku({ id, spu, type: 'overview' })}
          >
            概览
          </span>
        );
      },
      align: 'center',
    },
    {
      dataIndex: 'detail',
      render: (_, { id, spu, platform_id, platform_sn }) => {
        return (
          <span
            className={style.detail}
            onClick={() => setCurrentSku({ id, spu, platform_id, platform_sn, type: 'detail' })}
          >
            评论详情
          </span>
        );
      },
      align: 'center',
    },
    {
      title: '父SKU',
      dataIndex: 'spu',
      render: (_, record) => {
        const { category_name, cycle, level } = record;
        return (
          <>
            <p>{record.spu}</p>
            <p>
              {category_name}
              {cycle ? `/${cycle}` : cycle}
              {level ? `/${level}` : level}
            </p>
          </>
        );
      },
      align: 'center',
    },
    {
      dataIndex: 'fluctuation',
      title: <span style={{ marginLeft: '67px' }}>近一月评论数及评分波动</span>,
      width: '300px',
      render: (_, record) => {
        return <Fluctuation height={120} width={300} data={record.lineData} />;
      },
    },
    {
      title: '7天新增评论数量',
      align: 'center',
      children: [
        {
          title: '5星',
          dataIndex: 'fiveStar',
          align: 'center',
          render: (_, record) => record.newData['5'],
        },
        {
          title: '4星',
          dataIndex: 'fourStar',
          align: 'center',
          render: (_, record) => record.newData['4'],
        },
        {
          title: '3星',
          dataIndex: 'threeStar',
          align: 'center',
          render: (_, record) => record.newData['3'],
        },
        {
          title: '2星',
          dataIndex: 'twoStar',
          align: 'center',
          render: (_, record) => record.newData['2'],
        },
        {
          title: '1星',
          dataIndex: 'oneStar',
          align: 'center',
          render: (_, record) => record.newData['1'],
        },
        {
          title: '评论总数',
          dataIndex: 'all',
          align: 'center',
          render: (_, record) => record.newData.all,
        },
      ],
    },
    {
      title: '总评分',
      dataIndex: 'rating',
      sorter: true,
      sortOrder: sorter.columnKey === 'rating' && sorter.order,
      align: 'center',
    },
    {
      title: '最新更新时间',
      dataIndex: 'review_date',
      sorter: true,
      sortOrder: sorter.columnKey === 'review_date' && sorter.order,
      align: 'center',
    },
  ];

  return (
    <>
      <PageHeaderWrapper title="评论分析" content={renderSearchForm()}>
        <Card>
          <StandardTable
            columns={columns}
            bordered
            dataSource={reviewAnalysisList}
            loading={loading}
            onChange={handleStandardTableChange}
          />
        </Card>
      </PageHeaderWrapper>
      <Detail currentSku={currentSku} setCurrentSku={setCurrentSku} />
    </>
  );
};

export default connect(
  ({
    category: { options: categoryOptions },
    platform: { platformTree },
    review: { reviewAnalysisList },
    loading,
  }) => ({
    categoryOptions,
    platformTree,
    reviewAnalysisList,
    loading: loading.effects['review/getReviewAnalysis'],
  })
)(Form.create()(Review));
