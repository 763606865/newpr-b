import { Alova } from '@/utils/http/alova/index';

export interface PositionItem {
  id: number;
  company_id: number;
  name: string;
  code: string;
  sort: number;
  remark: string;
  created_at?: string;
  updated_at?: string;
}

export interface PositionListParams {
  keyword?: string;
  name?: string;
  code?: string;
  per_page?: number;
  page?: number;
}

export function getPositions(params?: PositionListParams) {
  return Alova.Get<InResult>('/positions', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getPositionCreateData() {
  return Alova.Get<InResult>('/positions/create', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function createPosition(params: Partial<PositionItem>) {
  return Alova.Post<InResult>('/positions', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getPositionDetail(id: number | string) {
  return Alova.Get<InResult>(`/positions/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getPositionEditDetail(id: number | string) {
  return Alova.Get<InResult>(`/positions/${id}/edit`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function updatePosition(id: number | string, params: Partial<PositionItem>) {
  return Alova.Put<InResult>(`/positions/${id}`, params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function deletePosition(id: number | string) {
  return Alova.Delete<InResult>(`/positions/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
