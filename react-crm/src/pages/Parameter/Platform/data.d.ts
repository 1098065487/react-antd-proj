export interface TableListItem {
  id: number;
  name: string;
  type: number;
  channel: string;
  prefix: string;
  app_key: string;
  app_secret: string;
  [key: string]: any;
}
