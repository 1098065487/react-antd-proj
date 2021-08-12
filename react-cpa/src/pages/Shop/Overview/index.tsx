import React, { useState, useRef } from 'react';
import { Select, Input, Button, Tooltip } from 'antd';
import AddShop from './AddShop';
import ShopList from './ShopList';
import styles from './index.less';

const { Option } = Select;
const Shop: React.FC = () => {
  // 当前选择的页面
  const [selectedPage, setSelectedPage] = useState('review');
  // 搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 搜索项
  const [filters, setFilters] = useState({});
  // 添加店铺显隐控制
  const [addVisible, setAddVisible] = useState(false);
  // shopListRef
  const shopListRef: any = useRef(null);

  // 添加店铺成功
  const addSuccess = () => {
    shopListRef?.current?.reset(true);
  };

  // 头部搜索部分
  const headerSearch = () => {
    // 开始搜索
    const startSearch = () => {
      setFilters({ asin: searchValue });
    };
    return (
      <>
        <Select
          bordered={false}
          className={styles.selectPage}
          defaultValue="review"
          value={selectedPage}
          onChange={(value) => setSelectedPage(value)}
        >
          <Option className={styles.selectOption} value="review">
            店铺概览
          </Option>
        </Select>
        <div className={styles.searchBox}>
          <Input
            className={styles.searchInput}
            bordered={false}
            value={searchValue}
            placeholder="请输入店铺ASIN"
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button onClick={startSearch} type="primary" className={styles.startSearch}>
          搜索
        </Button>

        <Tooltip title="添加店铺">
          <button type="button" className={styles.addAsin} onClick={() => setAddVisible(true)}>
            +
          </button>
        </Tooltip>
      </>
    );
  };

  return (
    <>
      <AddShop visible={addVisible} setVisible={setAddVisible} addSuccess={addSuccess} />
      <div>
        <div className={styles.header}>{headerSearch()}</div>
        <div style={{ backgroundColor: 'white', padding: '5px 16px 10px' }}>
          <ShopList filters={filters} cref={shopListRef} />
        </div>
      </div>
    </>
  );
};

export default Shop;
