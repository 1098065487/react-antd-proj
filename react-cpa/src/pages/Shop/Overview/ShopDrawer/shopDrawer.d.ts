/*
 * @Author: wjw
 * @Date: 2021-01-05 13:26:46
 * @LastEditTime: 2021-01-11 09:50:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Shop\Overview\ShopDrawer\shopDrawer.d.ts
 */

export interface ShopDrawerProps {
  currentShop: {
    asin: string;
    id: undefined | number;
    name: string;
    link: string;
  };
  setCurrentShop: (shop: {
    asin: string;
    id: undefined | number;
    name: string;
    link: string;
  }) => void;
}
