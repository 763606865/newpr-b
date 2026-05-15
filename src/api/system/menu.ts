import { Alova } from '@/utils/http/alova/index';

export interface ListDate {
  id: number;
  parent_id: number;
  order: number;
  label: string;
  key: string;
  type: number;
  subtitle: string;
  open_type: number;
  auth: string;
  icon: string | null;
  path: string;
  created_at: string;
  updated_at: string;
  children?: ListDate[];
}

export interface MenuResponse {
  code: number;
  data: ListDate[];
  meta: {
    timestamp: number;
    response_time: number;
  };
}

/**
 * @description: 根据用户id获取用户菜单
 */
export function adminMenus() {
  return Alova.Get('/menus');
}

/**
 * 获取tree菜单列表
 * @param params
 */
export function getMenuList(params?) {
  return Alova.Get<MenuResponse>('/menu', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
