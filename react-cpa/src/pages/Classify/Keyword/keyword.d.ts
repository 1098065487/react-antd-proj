/*
 * @Author: wjw
 * @Date: 2021-01-14 09:43:38
 * @LastEditTime: 2021-02-02 16:07:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Category\Keyword\keyword.d.ts
 */

interface Tree {
  id: number;
  title: string;
  key: string;
  children: Tree[];
}

export interface Tree_Interface {
  tree: Tree[];
  default_select: string[];
  expand_select: string[];
}
