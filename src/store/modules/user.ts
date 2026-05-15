import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, ACCESS_TOKEN_TYPE, CURRENT_COMPANY, CURRENT_USER, IS_SCREENLOCKED } from '@/store/mutation-types';
import { ResultEnum } from '@/enums/httpEnum';

import { getUserInfo as getUserInfoApi, login } from '@/api/system/user';
import { storage } from '@/utils/Storage';
import { PageEnum } from '@/enums/pageEnum';

export type UserInfoType = {
  // TODO: add your own data
  username?: string;
  name?: string | null;
  phone?: string;
  email: string;
  avatar?: string;
  current_company?: Record<string, any> | null;
  companies?: Record<string, any>[];
  permissions?: any[];
};

export interface IUserState {
  token: string;
  tokenType: string;
  currentCompany: Record<string, any> | null;
  username: string;
  welcome: string;
  avatar: string;
  permissions: any[];
  info: UserInfoType;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: storage.get(ACCESS_TOKEN, ''),
    tokenType: storage.get(ACCESS_TOKEN_TYPE, 'Bearer'),
    currentCompany: storage.get(CURRENT_COMPANY, null),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    info: storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getTokenType(): string {
      return this.tokenType || 'Bearer';
    },
    getCurrentCompany(): Record<string, any> | null {
      return this.currentCompany || null;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getNickname(): string {
      return this.username;
    },
    getPermissions(): [any][] {
      return this.permissions;
    },
    getUserInfo(): UserInfoType {
      return this.info;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setTokenType(tokenType: string) {
      this.tokenType = tokenType || 'Bearer';
    },
    setCurrentCompany(currentCompany: Record<string, any> | null) {
      this.currentCompany = currentCompany || null;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setUserInfo(info: UserInfoType) {
      this.info = info;
    },
    // 登录
    async login(params: any) {
      const response = await login(params);
      const { code, data } = response;
      if (code === ResultEnum.SUCCESS) {
        const ex = 7 * 24 * 60 * 60;
        const token = data?.access_token || data?.token || '';
        const tokenType = data?.token_type || 'Bearer';
        const userInfo = data?.user || data || {};
        const currentCompany = data?.user?.current_company || data?.current_company || null;
        storage.set(ACCESS_TOKEN, token, ex);
        storage.set(ACCESS_TOKEN_TYPE, tokenType, ex);
        storage.set(CURRENT_USER, userInfo, ex);
        storage.set(CURRENT_COMPANY, currentCompany, ex);
        storage.set(IS_SCREENLOCKED, false);
        this.setToken(token);
        this.setTokenType(tokenType);
        this.setCurrentCompany(currentCompany);
        this.setUserInfo(userInfo);
      }
      return response;
    },

    // 获取用户信息
    async getInfo() {
      // @ts-ignore
      const Message = window.$message;
      // @ts-ignore
      const Modal = window.$dialog;
      const LoginPath = PageEnum.BASE_LOGIN;
      const response = await getUserInfoApi();
      const { code, data } = response;
      if (code !== ResultEnum.SUCCESS) {
        if (code === 401) {
          Message?.warning('登录身份已失效，请重新登录!');
          storage.clear();
          window.location.href = LoginPath;
        } else {
          throw new Error('getInfo: failed to fetch user details!');
        }
      }
      const userInfo = data || {};
      const permissionsList: any[] = [];
      if (data.roles && data.roles.length > 0) {
        for (const role of data.roles) {
          if (role.permissions && role.permissions.length > 0) {
            permissionsList.push(...role.permissions);
          }
        }
      }
      if (data.permissions && data.permissions.length > 0) {
        permissionsList.push(...data.permissions);
      }
      this.setPermissions(permissionsList);
      const currentCompany = userInfo?.current_company || userInfo?.user?.current_company || null;
      this.setUserInfo(userInfo);
      this.setCurrentCompany(currentCompany);
      storage.set(CURRENT_USER, userInfo);
      storage.set(CURRENT_COMPANY, currentCompany);
      this.setAvatar(userInfo.avatar || '');
      return userInfo;
    },

    // 登出
    async logout() {
      this.setToken('');
      this.setTokenType('Bearer');
      this.setCurrentCompany(null);
      this.setPermissions([]);
      this.setUserInfo({ username: '', email: '', companies: [], current_company: null, permissions: [] });
      storage.remove(ACCESS_TOKEN);
      storage.remove(ACCESS_TOKEN_TYPE);
      storage.remove(CURRENT_COMPANY);
      storage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
