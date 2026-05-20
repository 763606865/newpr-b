import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { CalendarOutline } from '@vicons/ionicons5';
import { renderIcon } from '@/utils';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/attendance',
    name: 'Attendance',
    redirect: '/attendance/rule',
    component: Layout,
    meta: {
      title: '考勤管理',
      icon: renderIcon(CalendarOutline),
      sort: 3,
      menuCodes: ['attendance', 'attendance_manage', 'attendance.manage'],
    },
    children: [
      {
        path: 'rule',
        name: 'attendance_rules',
        meta: {
          title: '考勤规则',
          menuCodes: ['attendance_rules', 'attendance.rule.manage', 'attendance-rule.manage', 'attendance_rule.manage'],
        },
        component: () => import('@/views/attendance/rules/index.vue'),
      },
      {
        path: 'records',
        name: 'attendance_records',
        meta: {
          title: '考勤记录',
          menuCodes: ['attendance_records', 'attendance.record.manage', 'attendance-record.manage', 'attendance_record.manage'],
        },
        component: () => import('@/views/attendance/records/index.vue'),
      },
      {
        path: 'leave-types',
        name: 'attendance_leave_types',
        meta: {
          title: '假期类型',
          menuCodes: ['attendance_leave_types', 'leave.type.manage', 'leave-type.manage', 'leave_type.manage'],
        },
        component: () => import('@/views/attendance/leave-types/index.vue'),
      },
    ],
  },
];

export default routes;
