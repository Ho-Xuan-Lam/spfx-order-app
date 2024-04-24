import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IOrderApp01Props {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userEmail: string;
  context: WebPartContext
}

export enum OrderFormatEnum {
  ONLINE = 'Online',
  OFFLINE = 'Offline'
}

export interface Option {
  value: string;
  label: string;
}

export interface IOrderSitesProps {
  options: Option[] | undefined;
  name?: string;
}

export interface ISitesMasterResponeItem {
  SiteName: string;
}
export interface IOrderAppProps {
  description?: string;
  isDarkTheme?: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userEmail: string;
  context: WebPartContext
}

export interface IOrderAppStates {
  siteMasterData?: IOrderSitesProps;
  productMasterData?: IProductMasterItem[];
  orderMasterData?: IOrderMasterItem[]
  isExitProductList: boolean;
  productOptionList: IOrderSitesProps;
  siteName: string;
  productValue?: Option;
  quantity: number;
  orderType: Option,
  unit: string;
  siteValue?: Option,
}

export interface IProductMasterItem {
  ID: string;
  ProductName: string;
  Detail: string;
  OrderFormat: OrderFormatEnum
  Remark: string;
  Unit: string
}

export interface IOrderMasterItem extends IProductMasterItem {
  ID: string;
  Email: string;
  ProductID: string;
  Quantity: number;
  SiteName: string;
}

export interface IOrderMasterItemPost extends Omit<IOrderMasterItem, 'Detail' | 'OrderFormat'> {
  OrderDate: Date;
  OrderFormat: string;
}
