/*
 * @Author: wjw
 * @Date: 2020-11-20 17:14:16
 * @LastEditTime: 2021-01-04 13:43:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\BusinessParameters\SiteManagement\SiteManagement.d.ts
 */

export interface Site {
  id: number;
  name: string;
  short_name: string;
  domain: string;
  status: stirng;
  config: {
    config: Record<string, any>;
    [key: string]: any;
  };
}
