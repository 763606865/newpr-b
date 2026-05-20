import { PageEnum } from '@/enums/pageEnum';

type NullableRecord = Record<string, any> | null | undefined;

export function normalizeUserInfo(payload: NullableRecord) {
  const userInfo = payload?.user && typeof payload.user === 'object' ? payload.user : payload || {};
  const companies = Array.isArray(payload?.companies)
    ? payload.companies
    : Array.isArray(payload?.user?.companies)
    ? payload.user.companies
    : [];
  const currentCompany = payload?.current_company ?? payload?.user?.current_company ?? null;
  const permissions = Array.isArray(payload?.permissions)
    ? payload.permissions
    : Array.isArray(payload?.user?.permissions)
    ? payload.user.permissions
    : [];

  return {
    ...userInfo,
    companies,
    current_company: currentCompany,
    permissions,
  };
}

export function getCurrentCompanyStatus(userInfo: NullableRecord) {
  if (!userInfo || typeof userInfo !== 'object') return -1;
  if (!userInfo.current_company) return -1;
  return Number(userInfo.current_company?.status ?? -1);
}

export function resolveCompanyRedirectPath(path: string, userInfo: NullableRecord) {
  if (!userInfo || typeof userInfo !== 'object') return '';
  const hasCurrentCompanyField = Object.prototype.hasOwnProperty.call(userInfo, 'current_company');
  if (!hasCurrentCompanyField) return '';

  const currentCompanyStatus = getCurrentCompanyStatus(userInfo);

  if (currentCompanyStatus === 2) {
    return path !== PageEnum.BASE_COMPANY_PENDING ? PageEnum.BASE_COMPANY_PENDING : '';
  }

  if (currentCompanyStatus === 0 || currentCompanyStatus === -1) {
    return path !== PageEnum.BASE_COMPANY_ONBOARDING ? PageEnum.BASE_COMPANY_ONBOARDING : '';
  }

  if (currentCompanyStatus === 1) {
    if (path === PageEnum.BASE_COMPANY_ONBOARDING || path === PageEnum.BASE_COMPANY_PENDING) {
      return PageEnum.BASE_HOME;
    }
  }

  return '';
}
