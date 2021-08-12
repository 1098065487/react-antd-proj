import React, { useState, useRef } from 'react'
import StandardTable from '@/components/StandardTable'
import { Card, Button, message as Message, Modal } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { Site } from './siteManagement.d'
import { getSiteList, deleteSite } from './service'
import AddSite from './AddSite'
import styles from './index.less'

const SiteManagement: React.FC = () => {
  const tableRef: any = useRef(null)
  const [deleteVisibleId, setDeleteVisibleId] = useState<number>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [visible, setVisible] = useState(false)
  const [site, setSite] = useState<Site>()
  // 添加成功
  const addSuccess = () => {
    setSite(undefined)
    tableRef.current.reset(true)
  }

  // 删除站点
  const handleDeleteSite = async () => {
    setDeleteLoading(true)
    const { status } = await deleteSite(deleteVisibleId as number)
    setDeleteLoading(false)
    setDeleteVisibleId(undefined)
    if (status === 'ok') {
      Message.success('删除成功')
      tableRef.current.reset(true)
    }
  }
  const columns: ColumnsType<Site> = [
    {
      title: '站点名称',
      dataIndex: 'name'
    },
    {
      title: '短名',
      dataIndex: 'short_name'
    },
    {
      title: '域名',
      dataIndex: 'domain',
      render: domain => <a href={domain} target='blank'>{domain}</a>
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: status => status === 'On' ? <span style={{ color: 'var(--up-color)' }}>启用</span> : <span style={{ color: 'var(--down-color)' }}>禁用</span>
    },
    {
      title: '操作',
      dataIndex: 'id',
      render: (id, record) => {
        return (
          <>
            <span
              style={{ color: 'var(--checked-bd)', cursor: 'pointer', marginRight: 10 }}
              onClick={() => {
                setVisible(true)
                setSite(record)
              }}
            >编辑</span>
            <span style={{ color: 'var(--checked-bd)', cursor: 'pointer', }} onClick={() => { setDeleteVisibleId(id) }}>删除</span>
          </>
        )
      }
    }
  ]

  return (
    <Card bodyStyle={{ padding: '10px 15px' }}>
      <Modal
        width={250}
        title='删除'
        onCancel={() => setDeleteVisibleId(undefined)}
        visible={!!deleteVisibleId}
        onOk={handleDeleteSite}
        confirmLoading={deleteLoading}
        centered
      >
        <p style={{ marginBottom: 0 }}>确定要删除该站点吗?</p>
      </Modal>
      {visible && <AddSite addSuccess={addSuccess} visible={visible} setVisible={setVisible} site={site} setSite={setSite} />}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <p style={{
          fontSize: '22px',
          fontWeight: 500,
          marginRight: 20
        }}>站点管理 </p>
        <Button type='primary' className={styles.startSearch} onClick={() => setVisible(true)}>添加</Button>
      </div>
      <StandardTable
        request={(params: any) => getSiteList({ ...params })}
        cref={tableRef}
        bordered
        size='default'
        columns={columns}
      />
    </Card>
  )
}

export default SiteManagement