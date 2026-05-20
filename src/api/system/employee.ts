import { Alova } from '@/utils/http/alova/index';

export interface EmployeeItem {
  id: number;
  company_id: number;
  department_id?: number | null;
  position_id?: number | null;
  user_id: number;
  employee_no?: string;
  real_name?: string;
  avatar?: string;
  mobile?: string;
  email?: string;
  status: number;
  entry_time?: string | null;
  user?: Record<string, any> | null;
  department?: Record<string, any> | null;
  position?: Record<string, any> | null;
}

export interface EmployeeListParams {
  keyword?: string;
  status?: number | string;
  per_page?: number;
  page?: number;
}

export interface EmployeeCreateData {
  departments?: Array<Record<string, any>>;
  positions?: Array<Record<string, any>>;
  status_options?: Array<{ value: number; label: string }>;
}

export function getEmployees(params?: EmployeeListParams) {
  return Alova.Get<InResult>('/employees', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getEmployeeCreateData() {
  return Alova.Get<InResult>('/employees/create', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function searchEmployeeUsers(params?: { keyword?: string; per_page?: number }) {
  return Alova.Get<InResult>('/employees/search-users', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function createEmployee(params: Partial<EmployeeItem>) {
  return Alova.Post<InResult>('/employees', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getEmployeeDetail(id: number | string) {
  return Alova.Get<InResult>(`/employees/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getEmployeeEditDetail(id: number | string) {
  return Alova.Get<InResult>(`/employees/${id}/edit`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function updateEmployee(id: number | string, params: Partial<EmployeeItem>) {
  return Alova.Put<InResult>(`/employees/${id}`, params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function deleteEmployee(id: number | string) {
  return Alova.Delete<InResult>(`/employees/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
