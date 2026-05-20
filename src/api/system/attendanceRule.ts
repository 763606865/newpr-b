import { Alova } from '@/utils/http/alova/index';

export interface AttendanceRuleItem {
  id: number;
  company_id: number;
  name: string;
  code: string;
  work_type: number;
  start_time?: string;
  end_time?: string;
  time_segments?: any[];
  core_start_time?: string;
  core_end_time?: string;
  required_work_hours?: number | string;
  is_overnight?: boolean | number;
  rest_duration_mins?: number;
  late_grace_mins?: number;
  early_leave_grace_mins?: number;
  clock_in_window_mins?: number;
  clock_out_window_mins?: number;
  applicable_scope?: any[];
  status: number;
  extra?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRuleListParams {
  keyword?: string;
  name?: string;
  code?: string;
  work_type?: number | string;
  status?: number | string;
  per_page?: number;
  page?: number;
}

export interface AttendanceRuleCreateData {
  departments?: Array<Record<string, any>>;
  work_type_options?: Array<{ label: string; value: number }>;
  status_options?: Array<{ label: string; value: number }>;
}

export function getAttendanceRules(params?: AttendanceRuleListParams) {
  return Alova.Get<InResult>('/attendance-rules', {
    params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getAttendanceRuleCreateData() {
  return Alova.Get<InResult>('/attendance-rules/create', {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function createAttendanceRule(params: Partial<AttendanceRuleItem>) {
  return Alova.Post<InResult>('/attendance-rules', params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getAttendanceRuleDetail(id: number | string) {
  return Alova.Get<InResult>(`/attendance-rules/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function getAttendanceRuleEditDetail(id: number | string) {
  return Alova.Get<InResult>(`/attendance-rules/${id}/edit`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function updateAttendanceRule(id: number | string, params: Partial<AttendanceRuleItem>) {
  return Alova.Put<InResult>(`/attendance-rules/${id}`, params, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

export function deleteAttendanceRule(id: number | string) {
  return Alova.Delete<InResult>(`/attendance-rules/${id}`, {
    meta: {
      isReturnNativeResponse: true,
    },
  });
}
