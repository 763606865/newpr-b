import { Alova } from '@/utils/http/alova/index';

export interface LeaveTypeItem {
  id: number;
  company_id: number;
  name: string;
  code: string;
  deduction_type?: number;
  unit_type?: number;
  min_duration?: number | string;
  need_attachment?: boolean | number;
  allow_negative?: boolean | number;
  max_continuous_days?: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveTypeListParams {
  keyword?: string;
  name?: string;
  code?: string;
  deduction_type?: number | string;
  unit_type?: number | string;
  status?: number | string;
  per_page?: number;
  page?: number;
}

export interface LeaveTypeCreateData {
  deduction_type_options?: Array<{ label: string; value: number }>;
  unit_type_options?: Array<{ label: string; value: number }>;
  status_options?: Array<{ label: string; value: number }>;
}

export function getLeaveTypes(params?: LeaveTypeListParams) {
  return Alova.Get<InResult>('/leave-types', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getLeaveTypeCreateData() {
  return Alova.Get<InResult>('/leave-types/create', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function createLeaveType(params: Partial<LeaveTypeItem>) {
  return Alova.Post<InResult>('/leave-types', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getLeaveTypeDetail(id: number | string) {
  return Alova.Get<InResult>(`/leave-types/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getLeaveTypeEditDetail(id: number | string) {
  return Alova.Get<InResult>(`/leave-types/${id}/edit`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function updateLeaveType(id: number | string, params: Partial<LeaveTypeItem>) {
  return Alova.Put<InResult>(`/leave-types/${id}`, params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function deleteLeaveType(id: number | string) {
  return Alova.Delete<InResult>(`/leave-types/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
