/*
 * @Author: wjw
 * @Date: 2020-11-11 10:35:36
 * @LastEditTime: 2020-11-20 15:15:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\Statistics\statistics.d.ts
 */

export interface StatisticsProps {
  statisticsData: StatisticsData | undefined;
}

interface RateList {
  rating: number;
  rating_change: number;
}

interface ReviewsList {
  reviews: number;
  reviews_change: number;
}

interface ReviewDateList {
  available_date: string;
}

interface RankList {
  classify_rank: string[];
}

interface QaList {
  questions: number;
  answers: number;
}

export interface StatisticsData {
  rate_list: RateList[];
  reviews_list: ReviewsList[];
  available_date_list: ReviewDateList[];
  rank_list: RankList[];
  qa_list: QaList[];
}
