/*
 * @Author: wjw
 * @Date: 2021-01-15 16:10:14
 * @LastEditTime: 2021-01-15 16:30:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\ClassifyTree\classifyTree.d.ts
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

export interface ClassifyTreeProps {
  treeList: Tree_Interface[];
}
