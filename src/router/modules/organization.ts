import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { BusinessOutline } from '@vicons/ionicons5';
import { renderIcon } from '@/utils';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/organization',
    name: 'Organization',
    redirect: '/organization/department',
    component: Layout,
    meta: {
      title: '组织架构',
      icon: renderIcon(BusinessOutline),
      sort: 2,
      ignoreCompanyMenu: true,
      menuCodes: ['organization.manage'],
    },
    children: [
      {
        path: 'department',
        name: 'organization_department',
        meta: {
          title: '部门',
          ignoreCompanyMenu: true,
          menuCodes: ['organization.manage', 'department.manage'],
        },
        component: () => import('@/views/organization/department/index.vue'),
      },
      {
        path: 'position',
        name: 'organization_position',
        meta: {
          title: '岗位',
          ignoreCompanyMenu: true,
          menuCodes: ['organization.manage', 'position.manage'],
        },
        component: () => import('@/views/organization/position/index.vue'),
      },
      {
        path: 'employee',
        name: 'organization_employee',
        meta: {
          title: '职工',
          ignoreCompanyMenu: true,
          menuCodes: ['organization.manage', 'employee.manage'],
        },
        component: () => import('@/views/organization/employee/index.vue'),
      },
    ],
  },
];

export default routes;
