export interface IOProps {
  visible: boolean;
  type: IOType;
  importVisible: boolean;
  importType?: string;
  handleDrawerVisible: handleIOMethod;
}

export type IOType = 'import' | 'export';

export type handleIOMethod = (flag: boolean, key?: IOType, show?: boolean) => void;

export interface ImportTableItem {
  id: number;
  type: string;
  file_name: string;
  status: string;
  result: {
    success: number;
    skip: number;
    error: number;
    total: number;
    error_file: string;
  };
  updated_at: string;

  [key: string]: any;
}
