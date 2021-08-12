/*
 * @Author: wjw
 * @Date: 2020-08-24 16:05:54
 * @LastEditTime: 2020-11-04 15:17:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\customHook\useIsMountedRef\useIsMountedRef.js
 */
import { useEffect, useRef } from 'react';

const useIsUnMountedRef = () => {
  const isUnMountedRef = useRef<Boolean>();
  useEffect(() => {
    isUnMountedRef.current = false;
    return () => {
      isUnMountedRef.current = true;
    };
  });
  return isUnMountedRef;
};

export default useIsUnMountedRef;
