import { App } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { RedirectRoute } from '@/router/base';
import { PageEnum } from '@/enums/pageEnum';
import { createRouterGuards } from './guards';
import type { IModuleType } from './types';

const modules = import.meta.glob<IModuleType>('./modules/**/*.ts', { eager: true });

const allowedRouteModuleKeys = new Set([
  './modules/system.ts',
  './modules/setting.ts',
  './modules/organization.ts',
  './modules/attendance.ts',
]);

const routeModuleList: RouteRecordRaw[] = Object.keys(modules).reduce((list, key) => {
  if (!allowedRouteModuleKeys.has(key)) {
    return list;
  }
  const mod = modules[key].default ?? {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  return [...list, ...modList];
}, []);

function sortRoute(a, b) {
  return (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0);
}

routeModuleList.sort(sortRoute);

export const RootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/views/login/index.vue'),
  meta: {
    title: '登录',
  },
};

export const CompanyOnboardingRoute: RouteRecordRaw = {
  path: PageEnum.BASE_COMPANY_ONBOARDING,
  name: PageEnum.BASE_COMPANY_ONBOARDING_NAME,
  component: () => import('@/views/login/company-onboarding.vue'),
  meta: {
    title: '入驻企业',
  },
};

export const CompanyRegisterRoute: RouteRecordRaw = {
  path: PageEnum.BASE_COMPANY_REGISTER,
  name: PageEnum.BASE_COMPANY_REGISTER_NAME,
  component: () => import('@/views/login/company-onboarding.vue'),
  meta: {
    title: '注册企业',
  },
};

export const CompanyPendingRoute: RouteRecordRaw = {
  path: PageEnum.BASE_COMPANY_PENDING,
  name: PageEnum.BASE_COMPANY_PENDING_NAME,
  component: () => import('@/views/login/company-pending.vue'),
  meta: {
    title: '等待审核',
  },
};

//需要验证权限
export const asyncRoutes = [...routeModuleList];

//普通路由 无需验证权限
export const constantRouter: RouteRecordRaw[] = [
  LoginRoute,
  CompanyOnboardingRoute,
  CompanyRegisterRoute,
  CompanyPendingRoute,
  RootRoute,
  RedirectRoute,
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRouter,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function setupRouter(app: App) {
  app.use(router);
  // 创建路由守卫
  createRouterGuards(router);
}

export default router;
