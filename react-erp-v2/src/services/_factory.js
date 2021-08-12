/*
 * @Author: wjw
 * @Date: 2020-07-21 10:33:00
 * @LastEditTime: 2020-07-31 17:54:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\services\_factory.js
 */
import http from '@/utils/http'

/**
 * @description: 获取需求单列表 
 * @return: {object} response
 */
export async function fetchDemandList (params) {
    return http.get('/api/factory/orders', params)
}

/**
 * @description: 新建需求单
 * @return: {object} response
 */
export async function fetchNewDemand () {
    return http.post('/api/factory/orders/store')
}

/**
 * @description: 获取需求单详情
 * @return: {object} response
 */
export async function fetchDemandDetail (params) {
    return http.get(`/api/factory/orders/${params.demandDetail}/factory`, params)
}

/**
 * @description: 获取生产单详情(工作台页面)
 * @return: {object} response
 */
export async function fetchProductionDetail (params) {
    return http.get(`/api/factory/orders/${params.productionDetail}/product`, params)
}

/**
 * @description: 获取生产单详情(数据分析页面)
 * @return: {object} response
 */
export async function fetch_ProductionDetail (params) {
    return http.get('/api/factory/production-detail', params)
}

/**
 * @description: 获取sku详情
 * @return: {object} response
 */
export async function fetchSkuDetail (params) {
    return http.get('/api/factory/production-sku-detail', params)
}


/**
 * @description: 获取工作台需求数据统计信息
 * @return: {object} response
 */
export async function fetchDemandDataStatistics () {
    return http.get('/api/factory/orders/collect-data')
}

/**
 * @description: 获取数据分析生产数据统计信息
 * @return: {object} response
 */
export async function fetchProductDataStatistics (params) {
    return http.get('/api/factory/production-items-collect', params)
}
