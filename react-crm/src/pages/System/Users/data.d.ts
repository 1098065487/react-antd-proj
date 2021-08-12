export interface TableListItem {
  id: number;
  name: string;
  email: string;
  gender: string;
  mobile: string;
  [key: string]: any;
}

export interface UserFormProps {
  cRef: any,
  current: any | null,
  handleVisible: (flag: boolean, current?: object & null) => void,
  actionRef: any,
}
