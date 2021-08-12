/*
 * @Author: wjw
 * @Date: 2020-08-06 09:09:09
 * @LastEditTime: 2020-10-15 15:28:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\models\review.js
 */

import {
  fetchDemandList,
  postDemand,
  deleteDemand,
  fetchAllocationList,
  fetchStatisticsList,
  putAllocationStatus,
  putAllocationLeaveTime,
  putPackageStatus,
  fetchDemandDetail,
} from '@/services/allocation';

export default {
  namespace: 'allocation',
  state: {
    demandList: {}, // 需求单列表
    allocationList: [], // 调拨单列表
    demandDetail: {}, // 需求单详情
  },
  effects: {
    /**
     * @description: 获取需求单列表
     * @return: void
     */
    *getDemandList({ payload }, { call, put }) {
      const response = yield call(fetchDemandList, payload);
      yield put({
        type: 'save',
        payload: { demandList: response.body },
      });
    },

    /**
     * @description: 新建需求单
     * @return: void
     */
    *addDemand({ payload, callback }, { call }) {
      const response = yield call(postDemand, payload);
      callback(response);
    },

    /**
     * @description: 删除需求单
     * @return: void
     */
    *deleteDemand({ payload, callback }, { call }) {
      const response = yield call(deleteDemand, payload);
      callback(response);
    },

    /**
     * @description: 获取调拨单列表
     * @return: void
     */
    *getAllocationList({ payload, callback }, { call, put }) {
      const response = yield call(fetchAllocationList, payload);
      yield put({
        type: 'save',
        payload: { allocationList: response.body },
      });
      callback(response.body);
    },

    /**
     * @description:修改调拨单状态
     * @return: void
     */
    *updateAllocationStatus({ payload, callback }, { call }) {
      const response = yield call(putAllocationStatus, payload);
      callback(response);
    },

    /**
     * @description:修改调拨单离岸时间
     * @return: void
     */
    *updateAllocationLeaveTime({ payload, callback }, { call }) {
      const response = yield call(putAllocationLeaveTime, payload);
      callback(response);
    },

    /**
     * @description: 修改调拨单Package状态
     * @return: void
     */
    *updatePackageStatus({ payload, callback }, { call }) {
      const response = yield call(putPackageStatus, payload);
      callback(response);
    },

    /**
     * @description: 获取需求单详情
     * @return: void
     */
    *getDemandDetail({ payload, callback }, { call, put }) {
      const response = yield call(fetchDemandDetail, payload);
      yield put({
        type: 'save',
        payload: { demandDetail: response.body },
      });
      callback(payload.id);
    },

    /**
     * @description: 获取统计列表
     * @return: void
     */
    *getStatisticsList({ payload, callback }, { call }) {
      const response = yield call(fetchStatisticsList, payload);
      callback(response);
    },
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
