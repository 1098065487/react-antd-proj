import RenderAuthorize from '@/components/Authorized';
import { getAuthorities } from './authority';

let Authorized = RenderAuthorize(getAuthorities()); // eslint-disable-line

// Reload the rights component
const reloadAuthorized = () => {
  Authorized = RenderAuthorize(getAuthorities());
};

export { reloadAuthorized };
export default Authorized;
