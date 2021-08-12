import React, { useState, useEffect, useRef } from 'react';
import { Select, Input, Button, Tooltip, Radio, Card, Popconfirm, message } from 'antd';
import AddProduct from './AddProduct';
import AsinList from './AsinList';
import Statistics from './Statistics';
import Charts from './Charts';
import ColorSizeTable from './ColorSizeTable';
import HelpfulReview from './HelpfulReview';
import ReviewList from './ReviewList';
import { Overview } from './competitor.d';
import { Asin, AsinItem } from './AsinList/asinList.d';
import { StatisticsData } from './Statistics/statistics.d';
import { CountryReviews } from './Charts/ReviewNumChart/reviewNumChart.d';
import { FeatureRating } from './Charts/FeatureRateChart/featureRateChart.d';
import { CompetitorProps } from './competitor.d';
import styles from './index.less';
import { crawlReview } from './AsinList/service';

const shop = 2;
const product = 1;
const { Option } = Select;
const Competitor: React.FC<CompetitorProps> = ({ currentShop }) => {
  // 当前选择的页面
  const [selectedPage, setSelectedPage] = useState('review');
  // 搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 搜索类别
  const [searchField, setSearchField] = useState('name');
  // 搜索项
  const [filters, setFilters] = useState({ types: currentShop?.id ? shop : product });
  // 设置左边展示的组件
  const [currentLeftCom, setCurrentLeftCom] = useState('overview');
  // 添加竞品显隐控制
  const [addVisible, setAddVisible] = useState(false);
  // 设置当前asin
  const [currentAsin, setCurrentAsin] = useState<Asin>();
  // overview国家列表
  const [overViewList, setOverviewList] = useState<Overview[]>([]);
  // 当前asinId以及当前overview的国家
  const [asinSite, setAsinSite] = useState<API.AsinAndOverview>({
    asinId: undefined,
    currentOverview: undefined,
  });
  // 当前overview国家下的statistics数据
  const [statisticsData, setStatisticsData] = useState<StatisticsData>();
  // Review数量图表数据
  const [reviewNumChartData, setReviewNumChartData] = useState<CountryReviews[]>([]);
  // featureRate图表数据
  const [featureRateChartData, setFeatureRateChartData] = useState<FeatureRating[]>([]);
  // AsinListRef
  const asinListRef: any = useRef(null);

  // 设置overview国家列表,以及当前overview国家
  useEffect(() => {
    const { product_items = [] } = currentAsin || {};
    const list = product_items.map((item: AsinItem) => item.site);
    setOverviewList(list);
    setAsinSite({ asinId: currentAsin?.id, currentOverview: list[0]?.id });
  }, [currentAsin]);

  // 设置statistics,Review数量图表，Feature Rate图表数据
  useEffect(() => {
    const setData = (id: number | undefined) => {
      const { product_items = [] } = currentAsin || {};

      // 设置statistics数据
      const asinItem = product_items?.find((item: AsinItem) => item?.site_id === id);
      const {
        rating = 0,
        rating_change = 0,
        reviews = 0,
        reviews_change = 0,
        available_date = '',
        classify_rank = [],
        questions = 0,
        answers = 0,
        feature_rate = {},
      } = asinItem || {};
      const statistics_data: StatisticsData = {
        rate_list: [{ rating, rating_change }],
        reviews_list: [{ reviews, reviews_change }],
        available_date_list: [{ available_date }],
        rank_list: [{ classify_rank }],
        qa_list: [{ questions, answers }],
      };
      setStatisticsData(statistics_data);

      // 设置Feature Rate图表数据
      const feature_rate_chart_data =
        (feature_rate &&
          Object.keys(feature_rate).map((item: string) => ({
            name: item,
            rating: Number(feature_rate[item]),
          }))) ||
        [];
      setFeatureRateChartData(feature_rate_chart_data);

      // 设置Review数量图表数据
      const reviewNum_chart_data: CountryReviews[] = [];
      product_items.forEach((item: AsinItem) => {
        const { reviews: reviewsNum, site: { name } = {} } = item;
        reviewNum_chart_data.unshift({ name, reviews: reviewsNum });
      });
      setReviewNumChartData(reviewNum_chart_data);
    };
    setData(asinSite?.currentOverview);
  }, [asinSite]);

  // 添加竞品成功
  const addSuccess = () => {
    asinListRef?.current?.reset(true);
  };

  // 根据产品和站点
  const handleCrawl = async () => {
    const { asinId, currentOverview } = asinSite;
    const res = await crawlReview({ product_id: asinId, site_id: currentOverview });
    if (res.status === 'ok') {
      message.success('加入重新抓取队列成功！');
      return;
    }
    message.error('加入重新抓取队列失败！');
  };

  // 头部搜索部分
  const headerSearch = () => {
    // 开始搜索
    const startSearch = () => {
      setFilters((preFilters) => {
        return { [searchField]: searchValue, types: preFilters.types };
      });
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
            Review概览
          </Option>
        </Select>
        <div className={styles.searchBox}>
          <Input
            className={styles.searchInput}
            bordered={false}
            value={searchValue}
            placeholder="请输入产品名,分类,品牌或ASIN"
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Select
            bordered={false}
            className={styles.selectSearch}
            value={searchField}
            onChange={(value) => setSearchField(value)}
          >
            <Option className={styles.selectOption} value="name">
              产品名
            </Option>
            <Option className={styles.selectOption} value="category">
              分类
            </Option>
            <Option className={styles.selectOption} value="brand">
              品牌
            </Option>
            <Option className={styles.selectOption} value="asin">
              ASIN
            </Option>
          </Select>
        </div>
        <Button onClick={startSearch} type="primary" className={styles.startSearch}>
          搜索
        </Button>

        {currentShop?.id ? null : (
          <Tooltip title="添加竞品">
            <button type="button" className={styles.addAsin} onClick={() => setAddVisible(true)}>
              +
            </button>
          </Tooltip>
        )}
      </>
    );
  };

  const renderOverview = () => {
    return (
      <>
        <p className={styles.overview}>产品Overview</p>
        <div className={styles.overviewHeader}>
          <Radio.Group
            className={styles.overviewRadio}
            value={asinSite.currentOverview}
            buttonStyle="solid"
            onChange={(e) => {
              setAsinSite((preAsinSite) => ({ ...preAsinSite, currentOverview: e.target.value }));
            }}
          >
            {overViewList &&
              overViewList.map((item) => (
                <Radio.Button key={item.id} value={item.id}>
                  {item.name}
                </Radio.Button>
              ))}
          </Radio.Group>
          {asinSite.asinId && asinSite.currentOverview ? (
            <Popconfirm
              title="否加入重新抓取队列？"
              onConfirm={handleCrawl}
              // onCancel={cancel}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary" size="small" className={styles.overviewButton}>
                重抓该站点评论
              </Button>
            </Popconfirm>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <>
      <AddProduct visible={addVisible} setVisible={setAddVisible} addSuccess={addSuccess} />
      <div>
        <div className={styles.header}>{headerSearch()}</div>
        <div style={{ backgroundColor: 'white', padding: '5px 16px 10px' }}>
          {renderOverview()}
          <p className={styles.overview} style={{ marginTop: 5 }}>
            {currentAsin?.asin || 'ASIN-XX01'}
          </p>
          <div style={{ display: 'flex' }}>
            {currentLeftCom === 'overview' ? (
              <div className={styles.leftbox}>
                <Statistics statisticsData={statisticsData} />
                <Card
                  bodyStyle={{ padding: 10 }}
                  style={{ marginTop: 10, border: '1px solid #ccc' }}
                >
                  <Charts
                    asinSite={asinSite}
                    reviewNumChartData={reviewNumChartData}
                    featureRateChartData={featureRateChartData}
                  />
                </Card>
                <Card
                  bodyStyle={{ padding: 10 }}
                  style={{ marginTop: 10, border: '1px solid #ccc' }}
                >
                  <ColorSizeTable asinSite={asinSite} />
                </Card>
                <Card
                  bodyStyle={{ padding: 10 }}
                  style={{ marginTop: 10, border: '1px solid #ccc' }}
                >
                  <HelpfulReview asinSite={asinSite} />
                </Card>
              </div>
            ) : (
              <div className={styles.leftbox}>
                <ReviewList asinSite={asinSite} />
              </div>
            )}
            <div className={styles.rightbox}>
              <Radio.Group
                className={styles.overviewRadio}
                defaultValue="overview"
                value={currentLeftCom}
                buttonStyle="solid"
                onChange={(e) => setCurrentLeftCom(e.target.value)}
              >
                <Radio.Button value="overview">概览</Radio.Button>
                <Radio.Button value="detail">详情</Radio.Button>
              </Radio.Group>
              <AsinList
                filters={filters}
                setCurrentAsin={setCurrentAsin}
                cref={asinListRef}
                currentShop={currentShop}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Competitor;
