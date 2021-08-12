/*
 * @Author: wjw
 * @Date: 2020-11-17 15:11:03
 * @LastEditTime: 2020-12-03 14:26:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\ReviewList\reviewList.d.ts
 */

export interface Review {
  id: number;
  username: string;
  title: string;
  rating: number;
  color: string;
  size: string;
  helpers: number;
  date: string;
  content: string;
  detail_link: string;
  site: {
    domain: string;
  };
}

export interface ReviewListData extends API.TableRes {
  data: Review[];
}

export interface Sorter {
  date?: string;
  helpers?: string;
}

export interface Filters {
  color: string;
  size: string;
}
