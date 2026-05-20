<template>
  <n-flex vertical>
    <n-card :bordered="false" title="考勤规则管理">
      <n-grid :x-gap="16" :y-gap="12" item-responsive responsive="screen">
        <n-grid-item span="24 s:24 m:6">
          <n-input
            v-model:value="searchForm.keyword"
            clearable
            placeholder="关键字搜索名称或编码"
            @keyup.enter="handleSearch"
          />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:5">
          <n-input v-model:value="searchForm.name" clearable placeholder="请输入规则名称" @keyup.enter="handleSearch" />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:5">
          <n-input v-model:value="searchForm.code" clearable placeholder="请输入规则编码" @keyup.enter="handleSearch" />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:4">
          <n-select
            v-if="selectRenderReady"
            v-model:value="searchForm.work_type"
            clearable
            :options="workTypeSelectOptions"
            placeholder="工作类型"
          />
          <n-input v-else disabled placeholder="工作类型加载中" />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:4">
          <n-select
            v-if="selectRenderReady"
            v-model:value="searchForm.status"
            clearable
            :options="statusSelectOptions"
            placeholder="状态"
          />
          <n-input v-else disabled placeholder="状态加载中" />
        </n-grid-item>
        <n-grid-item span="24 s:24 m:24">
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
          <n-button v-if="hasPermission(['attendance_rules', 'attendance'])" type="primary" @click="openCreateDrawer()">新增考勤规则</n-button>
        </template>
      </BasicTable>
    </n-card>

    <n-drawer v-model:show="drawerVisible" :width="680" placement="right">
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
              <n-form-item label="规则名称" path="name">
                <n-input v-model:value="formValue.name" placeholder="请输入规则名称" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="规则编码" path="code">
                <n-input v-model:value="formValue.code" placeholder="请输入规则编码" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:8">
              <n-form-item label="工作类型" path="work_type">
                <n-select
                  v-if="selectRenderReady"
                  v-model:value="formValue.work_type"
                  :options="workTypeSelectOptions"
                  placeholder="请选择工作类型"
                />
                <n-input v-else disabled placeholder="工作类型加载中" />
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
            <n-grid-item span="24 s:24 m:8">
              <n-form-item label="是否跨天" path="is_overnight">
                <n-switch v-model:value="formValue.is_overnight" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="上班时间" path="start_time">
                <n-time-picker
                  v-model:formatted-value="formValue.start_time"
                  value-format="HH:mm"
                  format="HH:mm"
                  clearable
                  class="w-full"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="下班时间" path="end_time">
                <n-time-picker
                  v-model:formatted-value="formValue.end_time"
                  value-format="HH:mm"
                  format="HH:mm"
                  clearable
                  class="w-full"
                />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="核心开始时间" path="core_start_time">
                <n-time-picker
                  v-model:formatted-value="formValue.core_start_time"
                  value-format="HH:mm"
                  format="HH:mm"
                  clearable
                  class="w-full"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="核心结束时间" path="core_end_time">
                <n-time-picker
                  v-model:formatted-value="formValue.core_end_time"
                  value-format="HH:mm"
                  format="HH:mm"
                  clearable
                  class="w-full"
                />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:12 m:8">
              <n-form-item label="要求工时" path="required_work_hours">
                <n-input-number v-model:value="formValue.required_work_hours" :min="0" :precision="1" class="w-full" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:12 m:8">
              <n-form-item label="休息时长(分钟)" path="rest_duration_mins">
                <n-input-number v-model:value="formValue.rest_duration_mins" :min="0" class="w-full" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:12 m:8">
              <n-form-item label="迟到容忍(分钟)" path="late_grace_mins">
                <n-input-number v-model:value="formValue.late_grace_mins" :min="0" class="w-full" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:12 m:8">
              <n-form-item label="早退容忍(分钟)" path="early_leave_grace_mins">
                <n-input-number v-model:value="formValue.early_leave_grace_mins" :min="0" class="w-full" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:12 m:8">
              <n-form-item label="上班打卡窗口(分钟)" path="clock_in_window_mins">
                <n-input-number v-model:value="formValue.clock_in_window_mins" :min="0" class="w-full" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item span="24 s:12 m:8">
              <n-form-item label="下班打卡窗口(分钟)" path="clock_out_window_mins">
                <n-input-number v-model:value="formValue.clock_out_window_mins" :min="0" class="w-full" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-form-item label="适用部门">
            <n-tree-select
              v-model:value="formValue.applicable_department_ids"
              multiple
              clearable
              default-expand-all
              :options="departmentOptions"
              key-field="value"
              label-field="label"
              children-field="children"
              placeholder="请选择适用部门"
            />
          </n-form-item>

          <n-form-item label="分段时间(JSON)" path="time_segments_json">
            <n-input
              v-model:value="formValue.time_segments_json"
              type="textarea"
              :rows="3"
              placeholder='例如：[{"start":"09:00","end":"12:00"}]'
            />
          </n-form-item>

          <n-form-item label="扩展配置(JSON)" path="extra_json">
            <n-input v-model:value="formValue.extra_json" type="textarea" :rows="3" placeholder='例如：[{"key":"value"}]' />
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

    <n-modal v-model:show="detailVisible" preset="dialog" :show-icon="false" title="考勤规则详情">
      <n-descriptions label-placement="left" :column="1" bordered>
        <n-descriptions-item label="规则名称">{{ detailRecord?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="规则编码">{{ detailRecord?.code || '-' }}</n-descriptions-item>
        <n-descriptions-item label="工作类型">{{ getWorkTypeLabel(detailRecord?.work_type) }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ getStatusLabel(detailRecord?.status) }}</n-descriptions-item>
        <n-descriptions-item label="上下班时间">
          {{ [detailRecord?.start_time, detailRecord?.end_time].filter(Boolean).join(' - ') || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="核心时间段">
          {{ [detailRecord?.core_start_time, detailRecord?.core_end_time].filter(Boolean).join(' - ') || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="要求工时">{{ detailRecord?.required_work_hours ?? '-' }}</n-descriptions-item>
        <n-descriptions-item label="适用范围">{{ formatApplicableScope(detailRecord?.applicable_scope) }}</n-descriptions-item>
        <n-descriptions-item label="分段时间">{{ formatJsonText(detailRecord?.time_segments) }}</n-descriptions-item>
        <n-descriptions-item label="扩展配置">{{ formatJsonText(detailRecord?.extra) }}</n-descriptions-item>
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
    createAttendanceRule,
    deleteAttendanceRule,
    getAttendanceRuleCreateData,
    getAttendanceRuleDetail,
    getAttendanceRuleEditDetail,
    getAttendanceRules,
    updateAttendanceRule,
    type AttendanceRuleCreateData,
    type AttendanceRuleItem,
  } from '@/api/system/attendanceRule';

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
  const currentRuleId = ref<number | null>(null);
  const detailRecord = ref<AttendanceRuleItem | null>(null);

  const searchForm = reactive({
    keyword: '',
    name: '',
    code: '',
    work_type: null as number | null,
    status: null as number | null,
  });

  const departmentOptions = ref<any[]>([]);
  const workTypeOptions = ref<Array<{ label: string; value: number }>>([]);
  const statusOptions = ref<Array<{ label: string; value: number }>>([
    { label: '启用', value: 1 },
    { label: '停用', value: 0 },
  ]);

  const defaultFormValue = () => ({
    name: '',
    code: '',
    work_type: null as number | null,
    start_time: null as string | null,
    end_time: null as string | null,
    core_start_time: null as string | null,
    core_end_time: null as string | null,
    required_work_hours: null as number | null,
    is_overnight: false,
    rest_duration_mins: 0,
    late_grace_mins: 0,
    early_leave_grace_mins: 0,
    clock_in_window_mins: 0,
    clock_out_window_mins: 0,
    applicable_department_ids: [] as number[],
    time_segments_json: '[]',
    extra_json: '[]',
    status: 1,
  });

  const formValue = reactive(defaultFormValue());
  const formSnapshot = ref(defaultFormValue());

  const rules = {
    name: [
      { required: true, message: '请输入规则名称', trigger: 'blur' },
      { max: 100, message: '规则名称长度不能超过100个字符', trigger: 'blur' },
    ],
    code: [
      { required: true, message: '请输入规则编码', trigger: 'blur' },
      { max: 100, message: '规则编码长度不能超过100个字符', trigger: 'blur' },
    ],
    work_type: {
      type: 'number',
      required: true,
      message: '请选择工作类型',
      trigger: 'change',
    },
    time_segments_json: {
      validator: (_rule: any, value: string) => validateJsonField(value, '分段时间'),
      trigger: ['blur', 'input'],
    },
    extra_json: {
      validator: (_rule: any, value: string) => validateJsonField(value, '扩展配置'),
      trigger: ['blur', 'input'],
    },
  };

  const drawerTitle = computed(() => (drawerMode.value === 'create' ? '新增考勤规则' : '编辑考勤规则'));
  const rowKey = (row: AttendanceRuleItem) => row.id;
  const workTypeSelectOptions = computed(() => workTypeOptions.value.map((item) => ({ ...item })));
  const statusSelectOptions = computed(() => statusOptions.value.map((item) => ({ ...item })));

  const columns = [
    { title: '规则名称', key: 'name', minWidth: 180 },
    { title: '规则编码', key: 'code', minWidth: 160 },
    {
      title: '工作类型',
      key: 'work_type',
      minWidth: 120,
      render: (row: AttendanceRuleItem) => getWorkTypeLabel(row.work_type),
    },
    {
      title: '时间段',
      key: 'time_range',
      minWidth: 180,
      render: (row: AttendanceRuleItem) => [row.start_time, row.end_time].filter(Boolean).join(' - ') || '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render(row: AttendanceRuleItem) {
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
      render: (row: AttendanceRuleItem) => row.updated_at || '-',
    },
  ];

  const actionColumn = reactive({
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render(record: AttendanceRuleItem) {
      return h(TableAction, {
        style: 'button',
        actions: [
          { label: '详情', onClick: () => openDetailModal(record) },
          { label: '编辑', auth: ['attendance_rules', 'attendance'], onClick: () => openEditDrawer(record) },
          { label: '删除', auth: ['attendance_rules', 'attendance'], onClick: () => handleDelete(record) },
        ],
      });
    },
  });

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

  function normalizeOptionList(options: Array<Record<string, any>> = [], fallbackLabel: string) {
    return options.map((item, index) => ({
      label: String(item.label ?? item.name ?? `${fallbackLabel}${index + 1}`),
      value: Number(item.value ?? item.id ?? index),
    }));
  }

  function normalizeApplicableDepartmentIds(scope: any) {
    if (!Array.isArray(scope)) return [];
    return scope
      .map((item) => Number(item?.department_id ?? item?.id ?? item?.value))
      .filter((item) => Number.isFinite(item) && item > 0);
  }

  function buildApplicableScope(departmentIds: number[]) {
    return departmentIds.map((department_id) => ({ department_id }));
  }

  function parseJsonText(value: string, fallback: any[] = []) {
    const text = String(value || '').trim();
    if (!text) return fallback;
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : fallback;
  }

  function normalizeTimeValue(value?: string | null) {
    const text = String(value || '').trim();
    if (!text) return null;
    if (/^\d{2}:\d{2}$/.test(text)) return text;
    if (/^\d{2}:\d{2}:\d{2}$/.test(text)) return text.slice(0, 5);
    return null;
  }

  function formatJsonText(value: any) {
    if (!Array.isArray(value) || value.length === 0) return '-';
    return JSON.stringify(value);
  }

  function validateJsonField(value: string, label: string) {
    const text = String(value || '').trim();
    if (!text) return true;
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        return new Error(`${label}必须是 JSON 数组`);
      }
      return true;
    } catch (error) {
      return new Error(`${label}格式不正确`);
    }
  }

  function getWorkTypeLabel(value?: number | string | null) {
    const target = Number(value);
    return workTypeOptions.value.find((item) => Number(item.value) === target)?.label || '-';
  }

  function getStatusLabel(value?: number | string | null) {
    const target = Number(value);
    return statusOptions.value.find((item) => Number(item.value) === target)?.label || '-';
  }

  function formatApplicableScope(scope: any) {
    if (!Array.isArray(scope) || scope.length === 0) return '-';
    return scope
      .map((item) => item?.department_name || item?.name || item?.label || `部门#${item?.department_id || item?.id || item?.value}`)
      .join('、');
  }

  function applyCreateData(data?: AttendanceRuleCreateData | Record<string, any>) {
    const departments = Array.isArray(data?.departments) ? data.departments : [];
    const workTypes = Array.isArray(data?.work_type_options) ? data.work_type_options : [];
    const statusList = Array.isArray(data?.status_options) ? data.status_options : [];

    departmentOptions.value = buildDepartmentTreeOptions(departments);
    if (workTypes.length) {
      workTypeOptions.value = normalizeOptionList(workTypes, '类型');
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
      work_type: detail?.work_type === undefined || detail?.work_type === null ? null : Number(detail.work_type),
      start_time: normalizeTimeValue(detail?.start_time),
      end_time: normalizeTimeValue(detail?.end_time),
      core_start_time: normalizeTimeValue(detail?.core_start_time),
      core_end_time: normalizeTimeValue(detail?.core_end_time),
      required_work_hours:
        detail?.required_work_hours === undefined || detail?.required_work_hours === null
          ? null
          : Number(detail.required_work_hours),
      is_overnight: Boolean(Number(detail?.is_overnight ?? 0)),
      rest_duration_mins: Number(detail?.rest_duration_mins || 0),
      late_grace_mins: Number(detail?.late_grace_mins || 0),
      early_leave_grace_mins: Number(detail?.early_leave_grace_mins || 0),
      clock_in_window_mins: Number(detail?.clock_in_window_mins || 0),
      clock_out_window_mins: Number(detail?.clock_out_window_mins || 0),
      applicable_department_ids: normalizeApplicableDepartmentIds(detail?.applicable_scope),
      time_segments_json: JSON.stringify(Array.isArray(detail?.time_segments) ? detail.time_segments : []),
      extra_json: JSON.stringify(Array.isArray(detail?.extra) ? detail.extra : []),
      status: Number(detail?.status ?? 1),
    };
  }

  async function loadDataTable(params: Record<string, any>) {
    const response = await getAttendanceRules({
      keyword: searchForm.keyword || undefined,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined,
      work_type: searchForm.work_type === null ? undefined : Number(searchForm.work_type),
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
    const { code, data } = await getAttendanceRuleCreateData();
    if (code === ResultEnum.SUCCESS) {
      applyCreateData(data);
    }
  }

  onMounted(async () => {
    try {
      await loadCreateAssistData();
    } catch (error) {
      // 顶部筛选和抽屉表单都依赖辅助数据，页面初始化时先尝试预加载一次。
    } finally {
      await nextTick();
      selectRenderReady.value = true;
    }
  });

  async function openCreateDrawer() {
    drawerMode.value = 'create';
    currentRuleId.value = null;
    applyForm();
    drawerVisible.value = true;

    try {
      await loadCreateAssistData();
    } catch (error) {
      message.warning((error as Error)?.message || '创建页辅助数据加载失败，已先打开表单');
    }
  }

  async function openEditDrawer(record: AttendanceRuleItem) {
    try {
      submitLoading.value = true;
      const [createRes, detailRes] = await Promise.all([
        getAttendanceRuleCreateData(),
        getAttendanceRuleEditDetail(record.id),
      ]);

      if (createRes.code === ResultEnum.SUCCESS) {
        applyCreateData(createRes.data);
      }
      if (detailRes.code !== ResultEnum.SUCCESS) return;

      drawerMode.value = 'edit';
      currentRuleId.value = Number(record.id);
      applyForm(buildFormFromDetail(detailRes.data || {}));
      drawerVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '考勤规则详情加载失败');
    } finally {
      submitLoading.value = false;
    }
  }

  async function openDetailModal(record: AttendanceRuleItem) {
    try {
      const { code, data } = await getAttendanceRuleDetail(record.id);
      if (code !== ResultEnum.SUCCESS) return;
      detailRecord.value = data || null;
      detailVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '考勤规则详情加载失败');
    }
  }

  function handleSearch() {
    actionRef.value?.reload({ page: 1 });
  }

  function handleResetSearch() {
    searchForm.keyword = '';
    searchForm.name = '';
    searchForm.code = '';
    searchForm.work_type = null;
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
          work_type: Number(formValue.work_type),
          start_time: formValue.start_time || undefined,
          end_time: formValue.end_time || undefined,
          time_segments: parseJsonText(formValue.time_segments_json),
          core_start_time: formValue.core_start_time || undefined,
          core_end_time: formValue.core_end_time || undefined,
          required_work_hours: formValue.required_work_hours ?? undefined,
          is_overnight: formValue.is_overnight ? 1 : 0,
          rest_duration_mins: Number(formValue.rest_duration_mins || 0),
          late_grace_mins: Number(formValue.late_grace_mins || 0),
          early_leave_grace_mins: Number(formValue.early_leave_grace_mins || 0),
          clock_in_window_mins: Number(formValue.clock_in_window_mins || 0),
          clock_out_window_mins: Number(formValue.clock_out_window_mins || 0),
          applicable_scope: buildApplicableScope(formValue.applicable_department_ids),
          status: Number(formValue.status ?? 1),
          extra: parseJsonText(formValue.extra_json),
        };

        if (drawerMode.value === 'edit' && currentRuleId.value) {
          const { code, message: msg } = await updateAttendanceRule(currentRuleId.value, payload);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '考勤规则更新成功');
            drawerVisible.value = false;
            actionRef.value?.reload();
          }
          return;
        }

        const { code, message: msg } = await createAttendanceRule(payload);
        if (code === ResultEnum.SUCCESS) {
          message.success(msg || '考勤规则创建成功');
          drawerVisible.value = false;
          actionRef.value?.reload({ page: 1 });
        }
      } catch (error) {
        message.error((error as Error)?.message || '考勤规则保存失败');
      } finally {
        submitLoading.value = false;
      }
    });
  }

  function handleDelete(record: AttendanceRuleItem) {
    dialog.warning({
      title: '删除考勤规则',
      content: `确认删除考勤规则“${record.name}”吗？`,
      positiveText: '确认',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          const { code, message: msg } = await deleteAttendanceRule(record.id);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '考勤规则删除成功');
            actionRef.value?.reload();
          }
        } catch (error) {
          message.error((error as Error)?.message || '考勤规则删除失败');
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
