/*
 * @Author: wjw
 * @Date: 2020-11-20 17:48:08
 * @LastEditTime: 2020-11-26 16:40:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\pages\BusinessParameters\SiteManagement\AddSite\addSite.d.ts
 */
import { Site } from '../siteManagement.d';

export interface AddSiteProps {
  visible: boolean;
  site: Site | undefined;
  setVisible: (visible: boolean) => void;
  addSuccess: () => void;
  setSite: (site: undefined) => void;
}
