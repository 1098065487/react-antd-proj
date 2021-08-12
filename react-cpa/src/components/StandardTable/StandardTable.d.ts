/*
 * @Author: wjw
 * @Date: 2020-11-10 17:13:51
 * @LastEditTime: 2021-01-07 17:45:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\components\StandardTable\StandardTable.d.ts
 */

export interface TableProps {
  rowKey?: string;
  filters?: Record<string, any>;
  sorter?: Record<string, string>;
  pagination?: {
    current: number;
    pageSize: number;
  };
  cref?: any;
  columns: any;
  request: any;
  paginationConfig?: any;
  [key: string]: any;
}
