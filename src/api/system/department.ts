import { Alova } from '@/utils/http/alova/index';

export interface DepartmentItem {
  id: number;
  company_id: number;
  parent_id: number;
  name: string;
  type: number;
  sort: number;
  remark: string;
  children?: DepartmentItem[];
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentListParams {
  flat?: boolean | number;
  with_employees?: boolean | number;
}

export function getDepartments(params?: DepartmentListParams) {
  return Alova.Get<InResult>('/departments', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function createDepartment(params: Partial<DepartmentItem>) {
  return Alova.Post<InResult>('/departments', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getDepartmentDetail(id: number | string) {
  return Alova.Get<InResult>(`/departments/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getDepartmentEditDetail(id: number | string) {
  return Alova.Get<InResult>(`/departments/${id}/edit`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function updateDepartment(id: number | string, params: Partial<DepartmentItem>) {
  return Alova.Put<InResult>(`/departments/${id}`, params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function deleteDepartment(id: number | string) {
  return Alova.Delete<InResult>(`/departments/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
