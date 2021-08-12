/*
 * @Author: wjw
 * @Date: 2021-02-01 09:28:59
 * @LastEditTime: 2021-02-04 10:13:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeyProduct\index.tsx
 */
import React from 'react'
import { Modal } from 'antd'
import { ColumnsType } from 'antd/es/table';
import StandardTable from '@/components/StandardTable'
import { KeyProductProps } from './keyProduct.d'
import { Classify, Ancestor } from './keyProduct.d'
import { getClassifyList } from './service';

const { confirm } = Modal;
const KeyProduct: React.FC<KeyProductProps> = ({ searchValue, setClassifyIds, reSearch, tableRef, setTreeList }) => {
  const columns: ColumnsType<Classify> = [
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '分类路径',
      dataIndex: 'ancestor_list',
      render: (ancestor_list) => {
        const ancestor_dom_list = ancestor_list.map((ancestor: Ancestor) => {
          const { url, classify_name } = ancestor
          return `<a href=${url} target='blank'>${classify_name}</a>`
        })
        return <span dangerouslySetInnerHTML={{ __html: ancestor_dom_list.join('>') }} />
      }
    }
  ];

  // 获取表格列表
  const fetchKeyProduct = (params: any) => {
    if (!searchValue) {
      return false
    }
    return getClassifyList({ ...params }).then(res => {
      const { data } = res
      if (data?.length) {
        const idsList = data.map((item: Ancestor) => item.id)
        setClassifyIds(idsList)
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
      return res
    })
  };

  return (
    <StandardTable
      cref={tableRef}
      request={fetchKeyProduct}
      bordered={false}
      columns={columns}
      pagination={{ current: 1, pageSize: 25 }}
    />
  )
}

export default KeyProduct