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
      phone: params.phone,
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
