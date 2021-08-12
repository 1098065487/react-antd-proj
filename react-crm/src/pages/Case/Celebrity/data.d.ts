export interface TableListItem {
  id: number;
  name: string;
  email: string;
  price?: number;
  brands: number[];
  tags: number[];
  case_qty?: number;
  order_qty?: number;
  link_qty?: number;
  campaign_qty?: number;
  detail: string;
  platforms: any[];
  updated_at: string;
  operator: {
    id: number;
    name: string;
    [key: string]: any;
  }

  [key: string]: any;
}

export interface CelebrityFormProps {
  visible: boolean;
  handleVisible: (flag: boolean, current: any) => void;
  actionRef: any;
  current: TableListItem | any;
  refreshStatistic: () => void;
}

export interface ChannelProps {
  // form受控组件，value和onChange由Form.Item提供，受控组件不显式传递
  // 为类型不报错，需在受控组件判断value和onChange为undefined使用，尽管知道必不为undefined
  value?: any[];
  onChange?: (value: any) => void;
  form: any;
}

export interface StatisticProps {
  total_qty: number;
  no_good_qty: number;
  has_casing_qty: number;
}
