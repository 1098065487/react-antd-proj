/*
 * @Author: wjw
 * @Date: 2021-02-01 10:17:22
 * @LastEditTime: 2021-02-03 11:25:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\ShopProduct\index.tsx
 */

import React, { useState, useImperativeHandle } from 'react'
import { Button, Modal, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table';
import StandardTable from '@/components/StandardTable'
import { getShopProduct } from './service'
import { ShopProductProps, Shop, ProductItem } from './shopProduct.d'
import { Classify, Ancestor } from '../KeyProduct/keyProduct.d'

const { confirm } = Modal;
const ShopProduct: React.FC<ShopProductProps> = ({ searchValue, setClassifyIds, reSearch, tableRef, setTreeList, cref }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedRowKeyList, setSelectedRowKeyList] = useState<number[]>([])
  const [shopInfo, setShopInfo] = useState({ name: '', asin: '', link: '' })

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cref, () => ({
    shopInfo,
  }));

  const columns: ColumnsType<ProductItem> = [
    {
      title: 'Title',
      dataIndex: ['product', 'name'],
      width: 100,
      render(name, record) {
        const { link } = record
        return <a href={link} target='blank'>{name}</a>
      }
    },
    {
      title: 'ASIN',
      dataIndex: ['product', 'asin'],
      width: 100,
      render(asin, record) {
        const { link } = record
        return <a href={link} target='blank'>{asin}</a>
      }
    },
    {
      title: '分类名称',
      dataIndex: 'classifies',
      width: 200,
      render(classifies: Classify[]) {
        return classifies.map(({ name, id }: { name: string; id: number }) => <p key={id}>{name}</p>)
      }
    },
    {
      title: '分类路径',
      dataIndex: 'classifies',
      render(classifies: Classify[]) {
        return classifies.map((classify: Classify) => {
          const { id } = classify
          const ancestor_dom_list = classify.ancestor_list.map((ancestor: Ancestor) => {
            const { url, classify_name } = ancestor
            return `<a href=${url} target='blank'>${classify_name}</a>`
          })
          return <p key={id}><span dangerouslySetInnerHTML={{ __html: ancestor_dom_list.join('>') }} /></p>
        })

      }
    }
  ];

  // 获取表格列表
  const fetchShopProduct = (params: any) => {
    if (!searchValue) {
      return false
    }
    return getShopProduct({ ...params }).then(res => {
      const { data }: { data: Shop } = res
      if (data?.product_items?.length) {
        const { shop: { asin, name }, link } = data
        setShopInfo({ asin, name, link })
        const productItemIds = data.product_items.map(productItem => productItem.id)
        const idsList = data.product_items.map(productItem => productItem.classifies.map(classify => classify.id))
        const flatIdsList = idsList.toString().split(',').map(item => Number(item)).filter(item => item !== 0)
        setSelectedRowKeyList(productItemIds)
        setClassifyIds(flatIdsList)
        setSelectedIds(flatIdsList)
      } else {
        confirm({
          content: <span>新数据抓取中，请稍后再试，谢谢。</span>,
          okText: '刷新',
          cancelText: '关闭',
          maskClosable: true,
          okButtonProps: {
            className: 'okButton'
          },
          onOk() {
            reSearch()
          },
        });
      }
      setTreeList([])
      return { status: res?.status, data: data?.product_items }
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: number[], selectedRows: ProductItem[]) => {
      const idsList = selectedRows.map(productItem => productItem.classifies.map(classify => classify.id))
      const flatIdsList = idsList.toString().split(',').map(item => Number(item)).filter(item => item !== 0)
      setSelectedIds(flatIdsList)
      setSelectedRowKeyList(selectedRowKeys)
    },
    selectedRowKeys: selectedRowKeyList
  };

  return (
    <>

      <StandardTable
        scroll={{
          y: 860
        }}
        rowSelection={{
          type: 'checkbox',
          ...rowSelection
        }}
        cref={tableRef}
        request={fetchShopProduct}
        bordered={false}
        columns={columns}
        paginationConfig={false}
        pagination={{ current: 1, pageSize: 10000 }}
      >
        {shopInfo.link ? (
          <div style={{ marginBottom: 10 }}>
            <a href={shopInfo.link} target='blank'>{shopInfo.name}({shopInfo.asin})</a>
            <Tooltip title='点击查看选中产品的分类树'>
              <Button style={{ marginLeft: 10 }} type='primary' size='small' onClick={() => setClassifyIds(selectedIds)}>查看</Button>
            </Tooltip>
          </div>
        ) : null}
      </StandardTable>
    </>

  )
}

export default ShopProduct