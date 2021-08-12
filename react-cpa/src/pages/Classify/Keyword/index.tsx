import React, { useState, useEffect, useRef } from 'react';
import { Select, Input, Button, Spin, message, Drawer } from 'antd';
import { AbortController } from 'umi-request';
import { getClassifyTree } from './ClassifyTree/service';
import { Tree_Interface } from './keyword.d'
import styles from './index.less';
import { getSiteList } from '../../BusinessParameters/SiteManagement/service';
import { Site } from '../../BusinessParameters/SiteManagement/siteManagement';
import ClassifyTree from './ClassifyTree'
import ShopList from './ShopList'
import KeywordList from './KeywordList'
import KeyProduct from './KeyProduct'
import ShopProduct from './ShopProduct'

const { Option } = Select;
const counts = [
  { id: 0, value: 100, label: '前100个商品' },
  { id: 1, value: 200, label: '前200个商品' },
  { id: 2, value: 300, label: '前300个商品' },
  { id: 3, value: 400, label: '前400个商品' },
]
const Keyword: React.FC = () => {
  const shopProductRef: any = useRef(null)
  const tableRef: any = useRef(null);
  // 当前选择的页面
  const [selectedPage, setSelectedPage] = useState('keyword');
  // 搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 站点
  const [sites, setSites] = useState<[Site]>();
  // 当前选择的站点
  const [currentSiteId, setCurrentSiteId] = useState<number>()
  // 当前选择的搜索前多少个商品
  const [currentNum, setCurrentNum] = useState(100)
  // 左侧classify列表id数组
  const [classifyIds, setClassifyIds] = useState<number[]>([])
  // 树列表
  const [treeList, setTreeList] = useState<Tree_Interface[]>([])
  // 右侧树加载中状态
  const [spinning, setSpinning] = useState(false)
  // 抽屉显影控制
  const [visible, setVisible] = useState('')

  // 监听表格变化，从而获取树
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    if (classifyIds.length) {
      setSpinning(true)
      getClassifyTree({ filters: { ids: classifyIds }, signal }).then(res => {
        const { status, data } = res
        if (status !== 'error') {
          setSpinning(false)
          setTreeList(data)
        }
      })
    }
    return () => {
      controller.abort()
    };
  }, [classifyIds])

  // 获取sites站点列表
  useEffect(() => {
    const fetchSiteList = async () => {
      const { data, status } = await getSiteList({ current: 1, pageSize: 10 });
      if (status === 'ok') {
        setSites(data);
        setCurrentSiteId(data?.[0].id)
      }
    };
    fetchSiteList();
  }, []);

  // 重新获取数据
  const reSearch = (value?: string, num?: number) => {
    if (value) {
      setSearchValue(value)
      setVisible('')
    }
    tableRef?.current?.onSearch({ searchFilters: { [selectedPage]: value || searchValue, site_id: currentSiteId, num: num || currentNum } });
  }

  // 头部搜索部分
  const headerSearch = () => {
    // 开始搜索
    const startSearch = () => {
      if (!searchValue) {
        message.warning(selectedPage === 'keyword' ? '搜索关键字不可为空!' : '搜索店铺asin不可为空!')
        return
      }
      reSearch(searchValue, currentNum)
    };

    const reset = (value: string) => {
      setSearchValue('')
      setSelectedPage(value)
      setTreeList([])
    }
    return (
      <>
        <Select
          bordered={false}
          className={styles.selectPage}
          value={currentSiteId}
          onChange={(value) => setCurrentSiteId(value)}
        >
          {
            sites?.map(site => {
              return (
                <Option key={site.id} className={styles.selectOption} value={site.id}>
                  {site.name}
                </Option>
              )
            })
          }

        </Select>
        {
          selectedPage === 'keyword' ? (
            <Select
              bordered={false}
              className={styles.selectPage}
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
          ) : null
        }
        <Select
          bordered={false}
          className={styles.selectPage}
          defaultValue="keyword"
          value={selectedPage}
          onChange={value => reset(value)}
        >
          <Option className={styles.selectOption} value="keyword">
            关键字
          </Option>
          <Option className={styles.selectOption} value="shop_asin">
            店铺
          </Option>
        </Select>
        <div className={styles.searchBox}>
          <Input
            className={styles.searchInput}
            bordered={false}
            value={searchValue}
            placeholder={selectedPage === 'keyword' ? '请输入关键字' : '请输入店铺asin'}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button onClick={startSearch} type="primary" className={styles.startSearch}>
          搜索
        </Button>
        {selectedPage === 'keyword' ?
          <Button type="primary" style={{ borderRadius: '4px' }} className={styles.startSearch} onClick={() => { setVisible('keyword') }}>关键词字典</Button > :
          <Button type="primary" style={{ borderRadius: '4px' }} className={styles.startSearch} onClick={() => { setVisible('shop_asin') }}>店铺列表</Button>
        }
      </>
    );
  };

  return (
    <>
      <Drawer width='80%' onClose={() => { setVisible('') }} visible={!!visible} title={selectedPage === 'keyword' ? '关键词字典' : '店铺列表'}>
        {visible === 'keyword' ? <KeywordList siteId={currentSiteId} reSearch={reSearch} /> : null}
        {visible === 'shop_asin' ? <ShopList siteId={currentSiteId} reSearch={reSearch} /> : null}
      </Drawer>
      <div className={styles.header}>{headerSearch()}</div>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ display: 'inline-block', width: '60%' }}>
          {
            selectedPage === 'keyword' ?
              <KeyProduct searchValue={searchValue} setClassifyIds={setClassifyIds} reSearch={reSearch} tableRef={tableRef} setTreeList={setTreeList} /> :
              <ShopProduct cref={shopProductRef} searchValue={searchValue} setClassifyIds={setClassifyIds} reSearch={reSearch} tableRef={tableRef} setTreeList={setTreeList} />
          }
        </div>
        <div style={{
          display: 'inline-block',
          width: 'calc(40% - 20px)',
          marginLeft: '20px',
          backgroundColor: 'white',
          padding: '20px',
          boxSizing: 'border-box',
          maxHeight: '900px',
          overflowY: 'auto',
          marginTop: selectedPage === 'shop_asin' && shopProductRef?.current?.shopInfo?.link ? 32 : 0
        }}>
          <Spin spinning={spinning}>
            <ClassifyTree treeList={treeList} />
          </Spin>
        </div>
      </div>
    </>
  )
}

export default Keyword