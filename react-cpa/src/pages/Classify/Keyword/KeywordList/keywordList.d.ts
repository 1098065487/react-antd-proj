/*
 * @Author: wjw
 * @Date: 2021-01-29 14:59:29
 * @LastEditTime: 2021-02-04 11:10:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\KeywordList\keywordList.d.ts
 */

export interface KeywordListProps {
  siteId: number | undefined;
  reSearch: (value?: string, num?: number) => void;
}

export interface KeywordItem {
  name: string;
  progress: {
    total: number;
    finished: number;
  };
}
