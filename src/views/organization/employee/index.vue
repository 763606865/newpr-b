<template>
  <n-flex vertical>
    <n-card :bordered="false" title="职工管理">
      <n-grid :x-gap="16" :y-gap="12" item-responsive responsive="screen">
        <n-grid-item span="24 s:24 m:10">
          <n-input
            v-model:value="searchForm.keyword"
            clearable
            placeholder="请输入姓名、手机号、邮箱、工号等关键字"
            @keyup.enter="handleSearch"
          />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:6">
          <n-select
            v-model:value="searchForm.status"
            clearable
            :options="statusOptions"
            placeholder="请选择在职状态"
          />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:8">
          <n-space justify="end" class="w-full">
            <n-button @click="handleResetSearch">重置</n-button>
            <n-button type="primary" @click="handleSearch">搜索</n-button>
          </n-space>
        </n-grid-item>
      </n-grid>
    </n-card>

    <n-card :bordered="false">
      <BasicTable
        ref="actionRef"
        :columns="columns"
        :request="loadDataTable"
        :row-key="rowKey"
        :actionColumn="actionColumn"
        :striped="true"
      >
        <template #tableTitle>
          <n-button type="primary" @click="openCreateDrawer()">新增职工</n-button>
        </template>
      </BasicTable>
    </n-card>

    <n-drawer v-model:show="drawerVisible" :width="560" placement="right">
      <n-drawer-content :title="drawerTitle" closable>
        <n-form
          ref="formRef"
          :model="formValue"
          :rules="rules"
          label-placement="top"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="绑定用户" path="user_id">
            <n-select
              v-model:value="formValue.user_id"
              filterable
              remote
              clearable
              :loading="userSearchLoading"
              :options="userOptions"
              placeholder="请输入姓名、手机号或邮箱搜索用户"
              @search="handleUserSearch"
            />
          </n-form-item>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="所属部门" path="department_id">
                <n-tree-select
                  v-model:value="formValue.department_id"
                  clearable
                  default-expand-all
                  :options="departmentOptions"
                  key-field="value"
                  label-field="label"
                  children-field="children"
                  placeholder="请选择所属部门"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="所属岗位" path="position_id">
                <n-select
                  v-model:value="formValue.position_id"
                  clearable
                  :options="positionOptions"
                  placeholder="请选择所属岗位"
                />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="员工工号" path="employee_no">
                <n-input v-model:value="formValue.employee_no" placeholder="不填则自动生成" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="员工姓名" path="real_name">
                <n-input v-model:value="formValue.real_name" placeholder="为空时默认回填用户姓名" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="手机号" path="mobile">
                <n-input v-model:value="formValue.mobile" placeholder="为空时默认回填用户手机号" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="邮箱" path="email">
                <n-input v-model:value="formValue.email" placeholder="为空时默认回填用户邮箱" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="状态" path="status">
                <n-select v-model:value="formValue.status" :options="statusOptions" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="入职时间" path="entry_time">
                <n-date-picker
                  v-model:value="formValue.entry_time"
                  type="datetime"
                  clearable
                  class="w-full"
                  placeholder="请选择入职时间"
                />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-form-item label="头像地址" path="avatar">
            <n-input v-model:value="formValue.avatar" placeholder="为空时默认回填用户头像" />
          </n-form-item>

          <n-form-item label="备注说明">
            <n-alert type="info" :show-icon="false">
              同一企业内同一个用户只能绑定一次；部门与岗位均会按当前企业自动校验。
            </n-alert>
          </n-form-item>
        </n-form>

        <template #footer>
          <n-space>
            <n-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</n-button>
            <n-button @click="handleResetForm">重置</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="detailVisible" preset="dialog" :show-icon="false" title="职工详情">
      <n-descriptions label-placement="left" :column="1" bordered>
        <n-descriptions-item label="员工工号">{{ detailRecord?.employee_no || '-' }}</n-descriptions-item>
        <n-descriptions-item label="姓名">{{ detailRecord?.real_name || detailRecord?.user?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="手机号">{{ detailRecord?.mobile || detailRecord?.user?.phone || '-' }}</n-descriptions-item>
        <n-descriptions-item label="邮箱">{{ detailRecord?.email || '-' }}</n-descriptions-item>
        <n-descriptions-item label="所属部门">{{ detailRecord?.department?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="所属岗位">{{ detailRecord?.position?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ getStatusLabel(detailRecord?.status) }}</n-descriptions-item>
        <n-descriptions-item label="入职时间">{{ formatDisplayTime(detailRecord?.entry_time) }}</n-descriptions-item>
        <n-descriptions-item label="关联用户">{{ buildUserOptionLabel(detailRecord?.user || {}) }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </n-flex>
</template>

<script lang="ts" setup>
  import { computed, h, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import { NButton, NSpace, NTag, useDialog, useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { ResultEnum } from '@/enums/httpEnum';
  import {
    createEmployee,
    deleteEmployee,
    getEmployeeCreateData,
    getEmployeeDetail,
    getEmployeeEditDetail,
    getEmployees,
    searchEmployeeUsers,
    updateEmployee,
    type EmployeeItem,
    type EmployeeCreateData,
  } from '@/api/system/employee';

  type DrawerMode = 'create' | 'edit';

  const actionRef = ref();
  const formRef = ref();
  const message = useMessage();
  const dialog = useDialog();
  const drawerVisible = ref(false);
  const detailVisible = ref(false);
  const submitLoading = ref(false);
  const userSearchLoading = ref(false);
  const drawerMode = ref<DrawerMode>('create');
  const currentEmployeeId = ref<number | null>(null);
  const detailRecord = ref<EmployeeItem | null>(null);

  const searchForm = reactive({
    keyword: '',
    status: null as number | null,
  });

  const statusOptions = ref([
    { label: '在职', value: 1 },
    { label: '离职', value: 0 },
  ]);
  const departmentOptions = ref<any[]>([]);
  const positionOptions = ref<Array<{ label: string; value: number }>>([]);
  const userOptions = ref<Array<{ label: string; value: number }>>([]);

  const defaultFormValue = () => ({
    user_id: null as number | null,
    department_id: null as number | null,
    position_id: null as number | null,
    employee_no: '',
    real_name: '',
    avatar: '',
    email: '',
    mobile: '',
    status: 1,
    entry_time: null as number | null,
  });

  const formValue = reactive(defaultFormValue());
  const formSnapshot = ref(defaultFormValue());

  const rules = {
    user_id: {
      type: 'number',
      required: true,
      message: '请选择绑定用户',
      trigger: 'change',
    },
    employee_no: [{ max: 100, message: '员工工号长度不能超过100个字符', trigger: 'blur' }],
    real_name: [{ max: 100, message: '员工姓名长度不能超过100个字符', trigger: 'blur' }],
  };

  const drawerTitle = computed(() => (drawerMode.value === 'create' ? '新增职工' : '编辑职工'));
  const rowKey = (row: EmployeeItem) => row.id;

  const columns = [
    { title: '工号', key: 'employee_no', minWidth: 180 },
    {
      title: '姓名',
      key: 'real_name',
      minWidth: 120,
      render: (row: EmployeeItem) => row.real_name || row.user?.name || '-',
    },
    {
      title: '手机号',
      key: 'mobile',
      minWidth: 140,
      render: (row: EmployeeItem) => row.mobile || row.user?.phone || '-',
    },
    { title: '邮箱', key: 'email', minWidth: 180, render: (row: EmployeeItem) => row.email || '-' },
    { title: '部门', key: 'department', minWidth: 120, render: (row: EmployeeItem) => row.department?.name || '-' },
    { title: '岗位', key: 'position', minWidth: 120, render: (row: EmployeeItem) => row.position?.name || '-' },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render(row: EmployeeItem) {
        return h(
          NTag,
          { bordered: false, type: Number(row.status) === 1 ? 'success' : 'warning' },
          { default: () => getStatusLabel(row.status) }
        );
      },
    },
    {
      title: '入职时间',
      key: 'entry_time',
      minWidth: 180,
      render(row: EmployeeItem) {
        return formatDisplayTime(row.entry_time);
      },
    },
  ];

  const actionColumn = reactive({
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render(record: EmployeeItem) {
      return h(TableAction, {
        style: 'button',
        actions: [
          { label: '详情', onClick: () => openDetailModal(record) },
          { label: '编辑', onClick: () => openEditDrawer(record) },
          { label: '删除', onClick: () => handleDelete(record) },
        ],
      });
    },
  });

  function getStatusLabel(status?: number | string | null) {
    return Number(status) === 1 ? '在职' : '离职';
  }

  function formatDisplayTime(value?: string | null) {
    if (!value) return '-';
    return dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : value;
  }

  function buildUserOptionLabel(user: Record<string, any>) {
    if (!user || Object.keys(user).length === 0) return '-';
    const name = user?.name || user?.nickname || '未命名用户';
    const phone = user?.phone ? ` / ${user.phone}` : '';
    const email = user?.email ? ` / ${user.email}` : '';
    return `${name}${phone}${email}`;
  }

  function buildDepartmentTreeOptions(departments: Array<Record<string, any>> = []) {
    const map = new Map<number, any>();
    const roots: any[] = [];

    departments.forEach((item) => {
      map.set(Number(item.id), {
        label: item.name,
        value: Number(item.id),
        children: [],
      });
    });

    departments.forEach((item) => {
      const currentNode = map.get(Number(item.id));
      const parentId = Number(item.parent_id || 0);
      if (parentId > 0 && map.has(parentId)) {
        map.get(parentId).children.push(currentNode);
      } else {
        roots.push(currentNode);
      }
    });

    return roots;
  }

  function applyCreateData(data?: EmployeeCreateData | Record<string, any>) {
    const departments = Array.isArray(data?.departments) ? data.departments : [];
    const positions = Array.isArray(data?.positions) ? data.positions : [];
    const statusList = Array.isArray(data?.status_options) ? data.status_options : [];

    departmentOptions.value = buildDepartmentTreeOptions(departments);
    positionOptions.value = positions.map((item) => ({
      label: item.name,
      value: Number(item.id),
    }));
    if (statusList.length) {
      statusOptions.value = statusList.map((item) => ({
        label: item.label,
        value: Number(item.value),
      }));
    }
  }

  function applyForm(nextValue?: Partial<typeof formValue>) {
    const mergedValue = Object.assign({}, defaultFormValue(), nextValue || {});
    Object.assign(formValue, mergedValue);
    formSnapshot.value = { ...mergedValue };
  }

  async function loadDataTable(params: Record<string, any>) {
    const response = await getEmployees({
      keyword: searchForm.keyword || undefined,
      status: searchForm.status === null ? undefined : Number(searchForm.status),
      page: params.page,
      per_page: params.pageSize,
    });

    const pageData = response?.data || {};
    return {
      list: Array.isArray(pageData.data) ? pageData.data : [],
      page: Number(pageData.current_page || params.page || 1),
      pageCount: Math.max(1, Math.ceil(Number(pageData.total || 0) / Number(pageData.per_page || params.pageSize || 10))),
      itemCount: Number(pageData.total || 0),
    };
  }

  async function loadCreateAssistData() {
    const { code, data } = await getEmployeeCreateData();
    if (code === ResultEnum.SUCCESS) {
      applyCreateData(data);
    }
  }

  async function openCreateDrawer() {
    try {
      await loadCreateAssistData();
      drawerMode.value = 'create';
      currentEmployeeId.value = null;
      userOptions.value = [];
      applyForm();
      drawerVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '创建页数据加载失败');
    }
  }

  async function openEditDrawer(record: EmployeeItem) {
    try {
      submitLoading.value = true;
      const [createRes, detailRes] = await Promise.all([
        getEmployeeCreateData(),
        getEmployeeEditDetail(record.id),
      ]);

      if (createRes.code === ResultEnum.SUCCESS) {
        applyCreateData(createRes.data);
      }
      if (detailRes.code !== ResultEnum.SUCCESS) return;

      const detail = detailRes.data || {};
      drawerMode.value = 'edit';
      currentEmployeeId.value = Number(record.id);
      if (detail.user?.id) {
        userOptions.value = [
          {
            label: buildUserOptionLabel(detail.user),
            value: Number(detail.user.id),
          },
        ];
      }

      applyForm({
        user_id: detail.user_id ? Number(detail.user_id) : null,
        department_id: detail.department_id ? Number(detail.department_id) : null,
        position_id: detail.position_id ? Number(detail.position_id) : null,
        employee_no: detail.employee_no || '',
        real_name: detail.real_name || '',
        avatar: detail.avatar || '',
        email: detail.email || '',
        mobile: detail.mobile || '',
        status: Number(detail.status ?? 1),
        entry_time: detail.entry_time ? dayjs(detail.entry_time).valueOf() : null,
      });
      drawerVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '职工详情加载失败');
    } finally {
      submitLoading.value = false;
    }
  }

  async function openDetailModal(record: EmployeeItem) {
    try {
      const { code, data } = await getEmployeeDetail(record.id);
      if (code !== ResultEnum.SUCCESS) return;
      detailRecord.value = data || null;
      detailVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '职工详情加载失败');
    }
  }

  async function handleUserSearch(keyword: string) {
    try {
      userSearchLoading.value = true;
      const { code, data } = await searchEmployeeUsers({ keyword, per_page: 20 });
      if (code !== ResultEnum.SUCCESS) return;
      const items = Array.isArray(data?.items) ? data.items : [];
      userOptions.value = items.map((item) => ({
        label: buildUserOptionLabel(item),
        value: Number(item.id),
      }));
    } catch (error) {
      message.error((error as Error)?.message || '用户搜索失败');
    } finally {
      userSearchLoading.value = false;
    }
  }

  function handleSearch() {
    actionRef.value?.reload({ page: 1 });
  }

  function handleResetSearch() {
    searchForm.keyword = '';
    searchForm.status = null;
    actionRef.value?.reload({ page: 1 });
  }

  function handleResetForm() {
    formRef.value?.restoreValidation();
    Object.assign(formValue, formSnapshot.value);
  }

  async function handleSubmit() {
    formRef.value?.validate(async (errors) => {
      if (errors) return;

      try {
        submitLoading.value = true;
        const payload = {
          user_id: Number(formValue.user_id),
          department_id: formValue.department_id ? Number(formValue.department_id) : null,
          position_id: formValue.position_id ? Number(formValue.position_id) : null,
          employee_no: String(formValue.employee_no || '').trim(),
          real_name: String(formValue.real_name || '').trim(),
          avatar: String(formValue.avatar || '').trim(),
          email: String(formValue.email || '').trim(),
          mobile: String(formValue.mobile || '').trim(),
          status: Number(formValue.status ?? 1),
          entry_time: formValue.entry_time ? dayjs(formValue.entry_time).format('YYYY-MM-DD HH:mm:ss') : '',
        };

        if (drawerMode.value === 'edit' && currentEmployeeId.value) {
          const { code, message: msg } = await updateEmployee(currentEmployeeId.value, payload);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '职工更新成功');
            drawerVisible.value = false;
            actionRef.value?.reload();
          }
          return;
        }

        const { code, message: msg } = await createEmployee(payload);
        if (code === ResultEnum.SUCCESS) {
          message.success(msg || '职工创建成功');
          drawerVisible.value = false;
          actionRef.value?.reload({ page: 1 });
        }
      } catch (error) {
        message.error((error as Error)?.message || '职工保存失败');
      } finally {
        submitLoading.value = false;
      }
    });
  }

  function handleDelete(record: EmployeeItem) {
    dialog.warning({
      title: '删除职工',
      content: `确认删除职工“${record.real_name || record.user?.name || record.employee_no || record.id}”吗？`,
      positiveText: '确认',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          const { code, message: msg } = await deleteEmployee(record.id);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '职工删除成功');
            actionRef.value?.reload();
          }
        } catch (error) {
          message.error((error as Error)?.message || '职工删除失败');
        }
      },
    });
  }
</script>

<style lang="less" scoped>
  .w-full {
    width: 100%;
  }
</style>
