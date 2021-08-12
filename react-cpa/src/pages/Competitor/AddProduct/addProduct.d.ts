/*
 * @Author: wjw
 * @Date: 2020-11-04 18:13:38
 * @LastEditTime: 2020-12-03 14:21:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AddProduct\addProduct.d.ts
 */

export interface AddProductProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  addSuccess: () => void;
}

export interface BrandAndCategory {
  id: number;
  name: string;
}
