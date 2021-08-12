/*
 * @Author: wjw
 * @Date: 2020-11-04 18:13:38
 * @LastEditTime: 2021-01-08 17:39:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Competitor\AddProduct\addProduct.d.ts
 */

export interface EditShopProps {
  editInfo: { shopId: number | undefined; name: string };
  setEditInfo: (params: { shopId: undefined; name: string }) => void;
  editSuccess: () => void;
}
