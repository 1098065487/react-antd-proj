/*
 * @Author: wjw
 * @Date: 2021-02-01 10:17:33
 * @LastEditTime: 2021-02-03 10:09:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\ShopProduct\ShopProduct.d.ts
 */

import { Classify } from '../KeyProduct/keyProduct';

export interface ShopProductProps {
  searchValue: string;
  setClassifyIds: (list: number[]) => void;
  reSearch: (value?: string, num?: number) => void;
  tableRef: any;
  cref: any;
  setTreeList: (list: any[]) => void;
}

export interface ProductItem {
  id: number;
  link: string;
  product: {
    name: string;
    asin: string;
  };
  classifies: Classify[];
}

export interface Shop {
  id: number;
  link: string;
  shop: {
    asin: string;
    name: string;
  };
  product_items: ProductItem[];
}
