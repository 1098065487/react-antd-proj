export interface EditParentProps {
  store: number;
  site: number;
  record: any;
  visible: boolean;
  handleVisible: (flag: boolean, current: any, refresh?: boolean) => void;
}

export interface ChildList {
  id: number;
  sku: string;

  [key: string]: any;
}

export interface ChildrenProps {
  store: number;
  site: number;
  data: ChildList[];
  handleChange: any;
}

export interface SelectChildProps {
  store: number;
  site: number;
  visible: boolean;
  current: ChildList[];
  handleSelectChange: any;
  handleSelectVisible: (flag: boolean) => void;
}
