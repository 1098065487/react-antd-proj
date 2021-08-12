/*
 * @Author: wjw
 * @Date: 2021-01-29 09:58:51
 * @LastEditTime: 2021-02-04 10:46:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeywordList\index.tsx
 */
import React, { useState, useRef } from 'react'
import { Button, Modal, Select, message } from 'antd'
import { ColumnsType } from 'antd/es/table';
import StandardTable from '@/components/StandardTable';
import { getKeywordList, reGetClassifyList } from './service'
import styles from './index.less'
import { KeywordListProps, KeywordItem } from './keywordList.d'

const { Option } = Select;
const counts = [
  { id: 0, value: 100, label: '前100个商品' },
  { id: 1, value: 200, label: '前200个商品' },
  { id: 2, value: 300, label: '前300个商品' },
  { id: 3, value: 400, label: '前400个商品' },
]

const KeywordList: React.FC<KeywordListProps> = ({ siteId, reSearch }) => {
  const tableRef: any = useRef(null)
  // 当前选择的搜索前多少个商品
  const [currentNum, setCurrentNum] = useState(100)
  // 重新抓取关键字名称
  const [keyword, setKeyword] = useState('')
  // 重新抓取loading
  const [loading, setLoading] = useState(false)
  // 获取关键字列表
  const fetchKeywordList = (params: any) => {
    const newParams = params
    delete newParams.current
    delete newParams.pageSize
    return getKeywordList({ ...newParams, site_id: siteId, with: 'progress' })
  }
  // 重新抓取该关键字的分类列表
  const reFetchClassifyList = async () => {
    setLoading(true)
    const { status } = await reGetClassifyList({
      filters: {
        keyword,
        site_id: siteId,
        num: currentNum,
      }
    })
    if (status === 'ok') {
      tableRef.current.setDataSource((data: KeywordItem[]) => {
        const keyWordList = data
        for (let i = 0, { length } = keyWordList; i < length; i += 1) {
          if (keyWordList[i].name === keyword) {
            if (keyWordList[i].progress) {
              keyWordList[i].progress.finished = 0
            }
            break
          }
        }
        return keyWordList
      })
      setLoading(false)
      setKeyword('')
      message.success('重新抓取成功。')
    } else {
      message.error('重新抓取失败!')
    }
  }

  const columns: ColumnsType<KeywordItem> = [
    {
      title: '关键词',
      dataIndex: 'name',
      sorter: true,
      render(name, { progress }) {
        const { total, finished } = progress || { total: 0, finished: 0 }
        return total && finished === total ?
          <span
            style={{ color: 'var(--checked-bd)', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => {
              setKeyword('')
              reSearch(name)
            }}
          >
            {name}
          </span> :
          <span>{name}</span>
      }
    },
    {
      title: '状态',
      dataIndex: 'progress',
      render(progress) {
        const { finished, total } = progress || { finished: 0, total: 0 }
        return <span style={{ color: total && finished === total ? 'var(--checked-bd)' : 'var(--down-color)' }}>{parseInt((total && finished / total * 100).toString(), 10) || 0}%{total && finished === total ? '(完成)' : '(抓取中)'}</span>
      }
    },
    {
      dataIndex: 'options',
      render(_, record) {
        const { name } = record
        return <Button type="link" size='small' onClick={() => { setKeyword(name) }}>
          重新抓取
        </Button>
      }
    }
  ]

  return (
    <>
      <Modal width={290} visible={!!keyword} closable={false} style={{ textAlign: 'center' }} footer={
        <div style={{ textAlign: 'center' }}>
          <Button type='default' onClick={() => { setKeyword('') }}>取消</Button>
          <Button loading={loading} type='primary' onClick={reFetchClassifyList}>确定</Button>
        </div>
      }>
        <p style={{ textAlign: 'center', marginBottom: '10px', marginRight: '5px' }}>请选择抓取:</p>
        <Select
          className={styles.selectPage}
          bordered={false}
          defaultValue={currentNum}
          value={currentNum}
          onChange={(value) => setCurrentNum(value)}
        >
          {
            counts.map(count => {
              return (
                <Option key={count.id} className={styles.selectOption} value={count.value}>
                  {count.label}
                </Option>
              )
            })
          }
        </Select>
      </Modal>
      <StandardTable
        cref={tableRef}
        paginationConfig={false}
        request={fetchKeywordList}
        bordered={false}
        columns={columns}
      />
    </>
  )
}

export default KeywordList