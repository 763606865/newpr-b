import { Alova } from '@/utils/http/alova/index';
/**
 * @description: 获取用户信息
 */
export function getUserInfo() {
  return Alova.Get<InResult>('/auth/me', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 用户登录
 */
export function login(params) {
  return Alova.Post<InResult>(
    '/auth/login',
    {
      phone: params.phone,
      code: params.code,
    },
    {
      meta: {
        isReturnNativeResponse: true,
      },
    }
  );
}

/**
 * @description: 发送登录验证码
 */
export function sendVerificationCode(params) {
  return Alova.Post<InResult>(
    '/auth/send-verification-code',
    {
      type: params.type || 'phone',
      account: params.account,
      scene: params.scene || 'login',
    },
    {
      meta: {
        isReturnNativeResponse: true,
      },
    }
  );
}

/**
 * @description: 申请企业入驻
 */
export function createCompany(params) {
  return Alova.Post<InResult>('/companies', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取当前用户绑定企业
 */
export function getCompanies() {
  return Alova.Get<InResult>('/companies', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取企业详情
 */
export function getCompanyDetail(id: number | string) {
  return Alova.Get<InResult>(`/companies/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 获取企业编辑页数据
 */
export function getCompanyEditDetail(id: number | string) {
  return Alova.Get<InResult>(`/companies/${id}/edit`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 更新企业信息
 */
export function updateCompany(id: number | string, params) {
  return Alova.Put<InResult>(`/companies/${id}`, params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 切换企业并刷新 token
 */
export function refreshToken(params) {
  return Alova.Post<InResult>(
    '/auth/refresh-token',
    {
      company_id: params.company_id,
    },
    {
      meta: {
        isReturnNativeResponse: true,
      },
    }
  );
}

/**
 * @description: 用户修改密码
 */
export function changePassword(params, uid) {
  return Alova.Post(`/user/u${uid}/changepw`, { params });
}

/**
 * @description: 用户登出
 */
export function logout(params) {
  return Alova.Post('/login/logout', {
    params,
  });
}
