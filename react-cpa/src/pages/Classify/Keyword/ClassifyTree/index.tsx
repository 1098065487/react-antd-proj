/*
 * @Author: wjw
 * @Date: 2021-01-21 09:21:32
 * @LastEditTime: 2021-02-01 15:06:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\Classify\Keyword\ClassifyTree\index.tsx
 */
import React, { memo } from 'react';
import { Tree, Empty } from 'antd';
import { ClassifyTreeProps } from './classifyTree'

const ClassifyTree: React.FC<ClassifyTreeProps> = memo(({ treeList = [] }) => {
  return (
    <>
      {
        treeList.length ? treeList.map((item, index) => {
          const { default_select, expand_select, tree } = item
          return (
            <div key={index} style={{ marginBottom: '20px' }}>
              <Tree
                defaultExpandedKeys={expand_select}
                selectable={false}
                treeData={tree}
                filterTreeNode={(node: any) => {
                  return default_select.includes(node.key)
                }}
              />
            </div>
          )
        }) : <div style={{ height: '117px' }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
      }
    </>
  )
})

export default ClassifyTree