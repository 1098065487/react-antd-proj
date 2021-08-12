import React, { useState, useEffect, useRef } from 'react'
import { Rate, Card, Pagination, Button, Form, Select, Typography, Empty } from 'antd';
import { ReviewListData, Sorter, Filters } from './reviewList.d'
import { getColorList, getSizeList, getReviewList } from './service'
import styles from './index.less'

const reg = /Red|IndianRed|DarkRed|Green|GreenYellow|LightGreen|DarkGreen|YellowGreen|Brown|Pink|LightPink|Orange|DarkOrange|Gold|Yellow|LightYellow|Blue|SkuBlue|LightBlue|White|Snow|Violet|Purple|Gray|Grey|LightGrey|DarkGray|Black/i
const { Option } = Select
const { Paragraph } = Typography;
const dateSorter = [
  { id: 0, key: 'date', value: '评论时间(降序)', sort: 'desc' },
  { id: 1, key: 'date', value: '评论时间(升序)', sort: 'asc' },
  { id: 2, key: 'helpers', value: 'Helpful数(降序)', sort: 'desc' },
  { id: 3, key: 'helpers', value: 'Helpful数(升序)', sort: 'asc' }
]
const ReviewList: React.FC<API.AsinSite> = ({ asinSite }) => {
  const isFirstLoad = useRef(true)
  const [reviewList, setReviewList] = useState<ReviewListData>()
  const [colorList, setColorList] = useState<string[]>([])
  const [sizeList, setSizeList] = useState<string[]>([])
  const [pagination, setPagination] = useState<API.Pagination>({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState<Filters>({ color: '', size: '' })
  const [sorter, setSorter] = useState<Sorter>({})
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm();
  // 开始搜索
  const handleSubmit = ({ sorter: tableSorter, size, color }: { sorter: string; size: string; color: string }) => {
    setSorter(JSON.parse(tableSorter))
    setFilters({ color, size })
    setPagination(prePagination => ({ ...prePagination, current: 1 }))
  }
  // 重置
  const reset = () => {
    form.resetFields();
    setSorter({})
    setFilters({ color: '', size: '' })
    setPagination(prePagination => ({ ...prePagination, current: 1 }))
  }
  // 渲染搜索
  const renderSearch = (
    <Form form={form} layout='inline' onFinish={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
      <Form.Item name='sorter' style={{ marginRight: 10 }}>
        <Select
          bordered={false}
          className={styles.selectPage}
          placeholder='请选择排序方式'
          style={{ width: '150px' }}
        >
          {dateSorter.map((tableSorter) => {
            const { id, key, value, sort } = tableSorter;
            return (
              <Option value={JSON.stringify({ [key]: sort })} key={id}>
                {value}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item name='size' style={{ marginRight: 10 }}>
        <Select
          allowClear
          bordered={false}
          className={styles.selectPage}
          placeholder="尺码"
          style={{ width: '150px' }}
        >
          {sizeList.map((size, index) => {
            return (
              <Option value={size} key={index}>
                {size}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item name='color' style={{ marginRight: 10 }}>
        <Select
          allowClear
          bordered={false}
          className={styles.selectPage}
          placeholder="颜色"
          style={{ width: '150px' }}
          onChange={(value) => { form.resetFields(['color']); form.setFieldsValue({ 'color': value }) }}
        >
          {colorList.map((color, index) => {
            const realColor = reg.exec(color)?.[0] || color
            return (
              <Option value={color} title={color} key={index}>
                <span style={{ width: '10px', height: '10px', backgroundColor: realColor, display: 'inline-block', marginRight: 10 }} />
                {color}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      <Button type='primary' className={styles.search} style={{ marginRight: 10 }} onClick={() => form.submit()}>搜索</Button>
      <Button className={styles.reset} onClick={reset}>重置</Button>
    </Form>
  )

  // 获取表格列表
  useEffect(() => {
    const fetchReviewList = async () => {
      setLoading(true)
      const { status, data, meta, page, total } = await getReviewList({ ...pagination, filters: { ...filters, product_id: asinSite.asinId, site_id: asinSite.currentOverview }, sorter, with: 'site' })
      if (status === 'ok') {
        setReviewList({ data, meta, page, total })
      }
      setLoading(false)
    }
    if (asinSite.currentOverview && asinSite.asinId) {
      fetchReviewList()
    }
  }, [pagination]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
    } else {
      reset()
    }
    const fetchAttrList = async () => {
      Promise.all([
        getColorList({ id: asinSite.asinId, filters: { site_id: asinSite.currentOverview } }),
        getSizeList({ id: asinSite.asinId, filters: { site_id: asinSite.currentOverview } })
      ]).then(res => {
        const [{ data: colorData }, { data: sizeData }] = res
        setColorList(colorData)
        setSizeList(sizeData)
      })
    }
    if (asinSite.currentOverview && asinSite.asinId) {
      fetchAttrList()
    }
  }, [asinSite])

  const handleChange = (page: number, pageSize: number | undefined) => {
    const page_size = pageSize as number;
    setPagination(prePagination => ({ ...prePagination, current: page, pageSize: page_size }))
  }


  return (
    <Card bodyStyle={{ padding: 10, backgroundColor: '#fafafa', border: '1px solid rgb(204, 204, 204)' }} bordered={false} loading={loading}>

      {reviewList?.data?.[0]?.id && asinSite.currentOverview ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>评论详情</p>
            {renderSearch}
          </div>
          <div>
            {reviewList.data.map(review => {
              const { id, rating, username, date, size, color, helpers, title, content, detail_link, site: { domain } } = review || {}
              const realColor = reg.exec(color)?.[0] || color
              return (
                <Card bodyStyle={{ padding: 10, fontSize: 12 }} key={id} style={{ marginTop: 10 }}>
                  <div>
                    <Rate disabled value={rating} />
                    {username && <span style={{ marginLeft: 15 }}>留言人: {username}</span>}
                    {date && <span style={{ marginLeft: 15 }}>评论时间: {date}</span>}
                    {size && <span style={{ marginLeft: 15 }}>尺码: {size}</span>}
                    {color && <span style={{ marginLeft: 15 }}>颜色: <span style={{ width: '10px', height: '10px', backgroundColor: realColor, display: 'inline-block' }} />{color}</span>}
                    <span style={{ marginLeft: 15 }}>Helpful数量: {helpers}</span>
                  </div>
                  {title && detail_link ? <a href={domain + detail_link} target='blank'>{title}</a> : title}
                  {content && <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{ marginBottom: 0 }}>{content}</Paragraph>}
                </Card>
              )
            })}

            <Pagination
              size='small'
              onChange={handleChange}
              current={pagination.current}
              total={reviewList?.total}
              pageSize={pagination.pageSize}
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `总计: ${total}条`}
            />
          </div>
        </>) : <Empty />
      }
    </Card>
  )
}

export default ReviewList