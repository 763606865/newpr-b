<template>
  <n-flex vertical>
    <n-card :bordered="false" title="假期类型管理">
      <n-grid :x-gap="16" :y-gap="12" item-responsive responsive="screen">
        <n-grid-item span="24 s:24 m:6">
          <n-input
            v-model:value="searchForm.keyword"
            clearable
            placeholder="关键字搜索名称或编码"
            @keyup.enter="handleSearch"
          />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:4">
          <n-input v-model:value="searchForm.name" clearable placeholder="请输入假期名称" @keyup.enter="handleSearch" />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:4">
          <n-input v-model:value="searchForm.code" clearable placeholder="请输入假期编码" @keyup.enter="handleSearch" />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:3">
          <n-select
            v-if="selectRenderReady"
            v-model:value="searchForm.deduction_type"
            clearable
            :options="deductionTypeSelectOptions"
            placeholder="扣薪类型"
          />
          <n-input v-else disabled placeholder="扣薪类型加载中" />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:3">
          <n-select
            v-if="selectRenderReady"
            v-model:value="searchForm.unit_type"
            clearable
            :options="unitTypeSelectOptions"
            placeholder="单位"
          />
          <n-input v-else disabled placeholder="单位加载中" />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:2">
          <n-select
            v-if="selectRenderReady"
            v-model:value="searchForm.status"
            clearable
            :options="statusSelectOptions"
            placeholder="状态"
          />
          <n-input v-else disabled placeholder="状态加载中" />
        </n-grid-item>
        <n-grid-item span="24 s:24 m:2">
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
          <n-button v-if="hasPermission(['attendance_leave_types', 'attendance'])" type="primary" @click="openCreateDrawer()">新增假期类型</n-button>
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
          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="假期名称" path="name">
                <n-input v-model:value="formValue.name" placeholder="请输入假期名称" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="假期编码" path="code">
                <n-input v-model:value="formValue.code" placeholder="请输入假期编码" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:8">
              <n-form-item label="扣薪类型" path="deduction_type">
                <n-select
                  v-if="selectRenderReady"
                  v-model:value="formValue.deduction_type"
                  :options="deductionTypeSelectOptions"
                  placeholder="请选择扣薪类型"
                />
                <n-input v-else disabled placeholder="扣薪类型加载中" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:8">
              <n-form-item label="请假单位" path="unit_type">
                <n-select
                  v-if="selectRenderReady"
                  v-model:value="formValue.unit_type"
                  :options="unitTypeSelectOptions"
                  placeholder="请选择请假单位"
                />
                <n-input v-else disabled placeholder="请假单位加载中" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:8">
              <n-form-item label="状态" path="status">
                <n-select
                  v-if="selectRenderReady"
                  v-model:value="formValue.status"
                  :options="statusSelectOptions"
                  placeholder="请选择状态"
                />
                <n-input v-else disabled placeholder="状态加载中" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="最小请假时长" path="min_duration">
                <n-input-number v-model:value="formValue.min_duration" :min="0" :precision="1" class="w-full" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="最大连续请假天数" path="max_continuous_days">
                <n-input-number v-model:value="formValue.max_continuous_days" :min="0" class="w-full" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="必须附件" path="need_attachment">
                <n-switch v-model:value="formValue.need_attachment" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="允许透支" path="allow_negative">
                <n-switch v-model:value="formValue.allow_negative" />
              </n-form-item>
            </n-grid-item>
          </n-grid>
        </n-form>

        <template #footer>
          <n-space>
            <n-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</n-button>
            <n-button @click="handleResetForm">重置</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="detailVisible" preset="dialog" :show-icon="false" title="假期类型详情">
      <n-descriptions label-placement="left" :column="1" bordered>
        <n-descriptions-item label="假期名称">{{ detailRecord?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="假期编码">{{ detailRecord?.code || '-' }}</n-descriptions-item>
        <n-descriptions-item label="扣薪类型">{{ getDeductionTypeLabel(detailRecord?.deduction_type) }}</n-descriptions-item>
        <n-descriptions-item label="请假单位">{{ getUnitTypeLabel(detailRecord?.unit_type) }}</n-descriptions-item>
        <n-descriptions-item label="最小时长">{{ detailRecord?.min_duration ?? '-' }}</n-descriptions-item>
        <n-descriptions-item label="必须附件">{{ formatBooleanLabel(detailRecord?.need_attachment) }}</n-descriptions-item>
        <n-descriptions-item label="允许透支">{{ formatBooleanLabel(detailRecord?.allow_negative) }}</n-descriptions-item>
        <n-descriptions-item label="最大连续请假天数">{{ detailRecord?.max_continuous_days ?? '-' }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ getStatusLabel(detailRecord?.status) }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ detailRecord?.updated_at || '-' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </n-flex>
</template>

<script lang="ts" setup>
  import { computed, h, nextTick, onMounted, reactive, ref } from 'vue';
  import { NTag, useDialog, useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { usePermission } from '@/hooks/web/usePermission';
  import { ResultEnum } from '@/enums/httpEnum';
  import {
    createLeaveType,
    deleteLeaveType,
    getLeaveTypeCreateData,
    getLeaveTypeDetail,
    getLeaveTypeEditDetail,
    getLeaveTypes,
    updateLeaveType,
    type LeaveTypeCreateData,
    type LeaveTypeItem,
  } from '@/api/system/leaveType';

  type DrawerMode = 'create' | 'edit';

  const actionRef = ref();
  const formRef = ref();
  const message = useMessage();
  const dialog = useDialog();
  const { hasPermission } = usePermission();
  const drawerVisible = ref(false);
  const detailVisible = ref(false);
  const submitLoading = ref(false);
  const selectRenderReady = ref(false);
  const drawerMode = ref<DrawerMode>('create');
  const currentLeaveTypeId = ref<number | null>(null);
  const detailRecord = ref<LeaveTypeItem | null>(null);

  const searchForm = reactive({
    keyword: '',
    name: '',
    code: '',
    deduction_type: null as number | null,
    unit_type: null as number | null,
    status: null as number | null,
  });

  const deductionTypeOptions = ref<Array<{ label: string; value: number }>>([
    { label: '带薪', value: 1 },
    { label: '半薪', value: 2 },
    { label: '无薪', value: 3 },
  ]);
  const unitTypeOptions = ref<Array<{ label: string; value: number }>>([
    { label: '天', value: 1 },
    { label: '小时', value: 2 },
  ]);
  const statusOptions = ref<Array<{ label: string; value: number }>>([
    { label: '启用', value: 1 },
    { label: '停用', value: 0 },
  ]);

  const defaultFormValue = () => ({
    name: '',
    code: '',
    deduction_type: 1,
    unit_type: 1,
    min_duration: 0.5,
    need_attachment: false,
    allow_negative: false,
    max_continuous_days: null as number | null,
    status: 1,
  });

  const formValue = reactive(defaultFormValue());
  const formSnapshot = ref(defaultFormValue());

  const rules = {
    name: [
      { required: true, message: '请输入假期名称', trigger: 'blur' },
      { max: 50, message: '假期名称长度不能超过50个字符', trigger: 'blur' },
    ],
    code: [
      { required: true, message: '请输入假期编码', trigger: 'blur' },
      { max: 32, message: '假期编码长度不能超过32个字符', trigger: 'blur' },
    ],
  };

  const drawerTitle = computed(() => (drawerMode.value === 'create' ? '新增假期类型' : '编辑假期类型'));
  const rowKey = (row: LeaveTypeItem) => row.id;
  const deductionTypeSelectOptions = computed(() => deductionTypeOptions.value.map((item) => ({ ...item })));
  const unitTypeSelectOptions = computed(() => unitTypeOptions.value.map((item) => ({ ...item })));
  const statusSelectOptions = computed(() => statusOptions.value.map((item) => ({ ...item })));

  const columns = [
    { title: '假期名称', key: 'name', minWidth: 160 },
    { title: '假期编码', key: 'code', minWidth: 140 },
    {
      title: '扣薪类型',
      key: 'deduction_type',
      minWidth: 120,
      render: (row: LeaveTypeItem) => getDeductionTypeLabel(row.deduction_type),
    },
    {
      title: '单位',
      key: 'unit_type',
      width: 90,
      render: (row: LeaveTypeItem) => getUnitTypeLabel(row.unit_type),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render(row: LeaveTypeItem) {
        return h(
          NTag,
          { bordered: false, type: Number(row.status) === 1 ? 'success' : 'warning' },
          { default: () => getStatusLabel(row.status) }
        );
      },
    },
    {
      title: '更新时间',
      key: 'updated_at',
      minWidth: 180,
      render: (row: LeaveTypeItem) => row.updated_at || '-',
    },
  ];

  const actionColumn = reactive({
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render(record: LeaveTypeItem) {
      return h(TableAction, {
        style: 'button',
        actions: [
          { label: '详情', onClick: () => openDetailModal(record) },
          { label: '编辑', auth: ['attendance_leave_types', 'attendance'], onClick: () => openEditDrawer(record) },
          { label: '删除', auth: ['attendance_leave_types', 'attendance'], onClick: () => handleDelete(record) },
        ],
      });
    },
  });

  function normalizeOptionList(options: Array<Record<string, any>> = [], fallbackLabel: string) {
    return options.map((item, index) => ({
      label: String(item.label ?? item.name ?? `${fallbackLabel}${index + 1}`),
      value: Number(item.value ?? item.id ?? index),
    }));
  }

  function getDeductionTypeLabel(value?: number | string | null) {
    const target = Number(value);
    return deductionTypeOptions.value.find((item) => Number(item.value) === target)?.label || '-';
  }

  function getUnitTypeLabel(value?: number | string | null) {
    const target = Number(value);
    return unitTypeOptions.value.find((item) => Number(item.value) === target)?.label || '-';
  }

  function getStatusLabel(value?: number | string | null) {
    const target = Number(value);
    return statusOptions.value.find((item) => Number(item.value) === target)?.label || '-';
  }

  function formatBooleanLabel(value?: boolean | number | null) {
    return Number(value) === 1 || value === true ? '是' : '否';
  }

  function applyCreateData(data?: LeaveTypeCreateData | Record<string, any>) {
    const deductionList = Array.isArray(data?.deduction_type_options) ? data.deduction_type_options : [];
    const unitList = Array.isArray(data?.unit_type_options) ? data.unit_type_options : [];
    const statusList = Array.isArray(data?.status_options) ? data.status_options : [];

    if (deductionList.length) {
      deductionTypeOptions.value = normalizeOptionList(deductionList, '扣薪类型');
    }
    if (unitList.length) {
      unitTypeOptions.value = normalizeOptionList(unitList, '单位');
    }
    if (statusList.length) {
      statusOptions.value = normalizeOptionList(statusList, '状态');
    }
  }

  function applyForm(nextValue?: Partial<typeof formValue>) {
    const mergedValue = Object.assign({}, defaultFormValue(), nextValue || {});
    Object.assign(formValue, mergedValue);
    formSnapshot.value = { ...mergedValue };
  }

  function buildFormFromDetail(detail: Record<string, any>) {
    return {
      name: detail?.name || '',
      code: detail?.code || '',
      deduction_type: Number(detail?.deduction_type ?? 1),
      unit_type: Number(detail?.unit_type ?? 1),
      min_duration: detail?.min_duration === undefined || detail?.min_duration === null ? 0.5 : Number(detail.min_duration),
      need_attachment: Boolean(Number(detail?.need_attachment ?? 0)),
      allow_negative: Boolean(Number(detail?.allow_negative ?? 0)),
      max_continuous_days:
        detail?.max_continuous_days === undefined || detail?.max_continuous_days === null
          ? null
          : Number(detail.max_continuous_days),
      status: Number(detail?.status ?? 1),
    };
  }

  async function loadDataTable(params: Record<string, any>) {
    const response = await getLeaveTypes({
      keyword: searchForm.keyword || undefined,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined,
      deduction_type: searchForm.deduction_type === null ? undefined : Number(searchForm.deduction_type),
      unit_type: searchForm.unit_type === null ? undefined : Number(searchForm.unit_type),
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
    const { code, data } = await getLeaveTypeCreateData();
    if (code === ResultEnum.SUCCESS) {
      applyCreateData(data);
    }
  }

  onMounted(async () => {
    try {
      await loadCreateAssistData();
    } catch (error) {
    } finally {
      await nextTick();
      selectRenderReady.value = true;
    }
  });

  async function openCreateDrawer() {
    drawerMode.value = 'create';
    currentLeaveTypeId.value = null;
    applyForm();
    drawerVisible.value = true;

    try {
      await loadCreateAssistData();
    } catch (error) {
      message.warning((error as Error)?.message || '创建页辅助数据加载失败，已先打开表单');
    }
  }

  async function openEditDrawer(record: LeaveTypeItem) {
    try {
      submitLoading.value = true;
      const [createRes, detailRes] = await Promise.all([getLeaveTypeCreateData(), getLeaveTypeEditDetail(record.id)]);

      if (createRes.code === ResultEnum.SUCCESS) {
        applyCreateData(createRes.data);
      }
      if (detailRes.code !== ResultEnum.SUCCESS) return;

      drawerMode.value = 'edit';
      currentLeaveTypeId.value = Number(record.id);
      applyForm(buildFormFromDetail(detailRes.data || {}));
      drawerVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '假期类型详情加载失败');
    } finally {
      submitLoading.value = false;
    }
  }

  async function openDetailModal(record: LeaveTypeItem) {
    try {
      const { code, data } = await getLeaveTypeDetail(record.id);
      if (code !== ResultEnum.SUCCESS) return;
      detailRecord.value = data || null;
      detailVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '假期类型详情加载失败');
    }
  }

  function handleSearch() {
    actionRef.value?.reload({ page: 1 });
  }

  function handleResetSearch() {
    searchForm.keyword = '';
    searchForm.name = '';
    searchForm.code = '';
    searchForm.deduction_type = null;
    searchForm.unit_type = null;
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
          name: String(formValue.name || '').trim(),
          code: String(formValue.code || '').trim().toUpperCase(),
          deduction_type: Number(formValue.deduction_type || 1),
          unit_type: Number(formValue.unit_type || 1),
          min_duration: Number(formValue.min_duration ?? 0.5),
          need_attachment: formValue.need_attachment,
          allow_negative: formValue.allow_negative,
          max_continuous_days: formValue.max_continuous_days ?? undefined,
          status: Number(formValue.status ?? 1),
        };

        if (drawerMode.value === 'edit' && currentLeaveTypeId.value) {
          const { code, message: msg } = await updateLeaveType(currentLeaveTypeId.value, payload);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '假期类型更新成功');
            drawerVisible.value = false;
            actionRef.value?.reload();
          }
          return;
        }

        const { code, message: msg } = await createLeaveType(payload);
        if (code === ResultEnum.SUCCESS) {
          message.success(msg || '假期类型创建成功');
          drawerVisible.value = false;
          actionRef.value?.reload({ page: 1 });
        }
      } catch (error) {
        message.error((error as Error)?.message || '假期类型保存失败');
      } finally {
        submitLoading.value = false;
      }
    });
  }

  function handleDelete(record: LeaveTypeItem) {
    dialog.warning({
      title: '删除假期类型',
      content: `确认删除假期类型“${record.name}”吗？`,
      positiveText: '确认',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          const { code, message: msg } = await deleteLeaveType(record.id);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '假期类型删除成功');
            actionRef.value?.reload();
          }
        } catch (error) {
          message.error((error as Error)?.message || '假期类型删除失败');
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
