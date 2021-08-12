/*
 * @Author: wjw
 * @Date: 2020-11-10 15:50:01
 * @LastEditTime: 2020-11-11 13:30:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\mock\asinList.ts
 */
import { Request, Response } from 'express';
const sourceData = {
  data: [
    {
      id: 1,
      asin: 'B07TWZ2LTX',
      img:
        'https://fanyi-cdn.cdn.bcebos.com/static/translation/widget/header/downloadGuide/img/download-app-qr_5682465.png',
      rating: 4.3,
      rating_change: 0.1,
      reviews: 443,
      reviews_change: 11,
      is_top: true,
      category: {
        name: '塑身衣',
      },
      brand: {
        name: 'MD',
      },
      name: 'xxxxxxxxxxxxxxxx',
      review_date: '2020-09-30 08:30:30',
    },
    {
      id: 2,
      asin: 'B07TWZ2LTX',
      img:
        'https://fanyi-cdn.cdn.bcebos.com/static/translation/widget/header/downloadGuide/img/download-app-qr_5682465.png',
      rating: 4.3,
      rating_change: -0.1,
      reviews: 443,
      reviews_change: -11,
      is_top: false,
      category: {
        name: '塑身衣',
      },
      brand: {
        name: 'MD',
      },
      name: 'xxxxxxxxxxxxxxxx',
      review_date: '2020-09-30 08:30:30',
    },
    {
      id: 3,
      asin: 'B07TWZ2LTX',
      img:
        'https://fanyi-cdn.cdn.bcebos.com/static/translation/widget/header/downloadGuide/img/download-app-qr_5682465.png',
      rating: 4.3,
      rating_change: 0,
      reviews: 443,
      reviews_change: 11,
      is_top: true,
      category: {
        name: '塑身衣',
      },
      brand: {
        name: 'MD',
      },
      name: 'xxxxxxxxxxxxxxxx',
      review_date: '2020-09-30 08:30:30',
    },
  ],
  total: 55,
  page: 1,
  meta: { total: 55, per_page: 20, current: 1, from: 1, to: 1 },
};

export default {
  'GET /api/asinList': (req: Request, res: Response) => {
    console.log('query', req.query);
    console.log('params', req.params);
    setTimeout(() => {
      res.send({
        status: 'ok',
        data: sourceData,
      });
    }, 1000);
  },
};
