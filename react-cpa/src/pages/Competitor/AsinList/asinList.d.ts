/*
 * @Author: wjw
 * @Date: 2020-11-04 15:37:07
 * @LastEditTime: 2021-01-06 10:43:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AsinList\asinList.d.ts
 */

// 每一个overview
export interface Site {
  id: number;
  name: string;
}

// 每一个asin在每个国家的数据集
export interface AsinItem {
  id: number;
  site_id: number;
  rating: number;
  rating_change: number;
  reviews: number;
  reviews_change: number;
  available_date: string;
  classify_rank: string[];
  questions: number;
  answers: number;
  site: Site;
  feature_rate: Record<string, number>;
}

export interface Asin {
  id: number;
  asin: string;
  img_url: string;
  rating: number;
  rating_change: number;
  reviews: number;
  reviews_change: number;
  top_id: number;
  category: { name: string; [propName: string]: any };
  brand: { name: string; [propName: string]: any };
  link: string;
  name: string;
  review_date: string;
  product_items: AsinItem[];
}

export interface AsinListProps {
  filters: any;
  setCurrentAsin: (asin: Asin) => void;
  cref: any;
  currentShop?: {
    id: number | undefined;
    asin: string | undefined;
  };
}
