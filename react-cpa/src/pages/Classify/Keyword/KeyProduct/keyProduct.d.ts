/*
 * @Author: wjw
 * @Date: 2021-02-01 09:35:37
 * @LastEditTime: 2021-02-03 10:45:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeyProduct\KeyProduct.d.ts
 */

export interface Ancestor {
  id: number;
  classify_name: string;
  url: string;
}

export interface Classify {
  id: number;
  name: string;
  ancestor_list: Ancestor[];
}

export interface KeyProductProps {
  searchValue: string;
  setClassifyIds: (list: number[]) => void;
  reSearch: (value?: string, num?: number) => void;
  tableRef: any;
  setTreeList: (list: any[]) => void;
}
