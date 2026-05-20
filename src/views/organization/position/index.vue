<template>
  <n-flex vertical>
    <n-card :bordered="false" title="岗位管理">
      <n-grid :x-gap="16" :y-gap="12" item-responsive responsive="screen">
        <n-grid-item span="24 s:24 m:8">
          <n-input v-model:value="searchForm.keyword" placeholder="请输入关键字搜索岗位名称或编码" clearable />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:6">
          <n-input v-model:value="searchForm.name" placeholder="请输入岗位名称" clearable />
        </n-grid-item>
        <n-grid-item span="24 s:12 m:6">
          <n-input v-model:value="searchForm.code" placeholder="请输入岗位编码" clearable />
        </n-grid-item>
        <n-grid-item span="24 s:24 m:4">
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
          <n-button type="primary" @click="openCreateDrawer()">新增岗位</n-button>
        </template>
      </BasicTable>
    </n-card>

    <n-drawer v-model:show="drawerVisible" :width="520" placement="right">
      <n-drawer-content :title="drawerTitle" closable>
        <n-form
          ref="formRef"
          :model="formValue"
          :rules="rules"
          label-placement="top"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="岗位名称" path="name">
            <n-input v-model:value="formValue.name" placeholder="请输入岗位名称" />
          </n-form-item>
          <n-form-item label="岗位编码" path="code">
            <n-input v-model:value="formValue.code" placeholder="请输入岗位编码" />
          </n-form-item>
          <n-form-item label="排序" path="sort">
            <n-input-number v-model:value="formValue.sort" :min="0" class="w-full" />
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input v-model:value="formValue.remark" type="textarea" :rows="4" placeholder="请输入备注" />
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

    <n-modal v-model:show="detailVisible" preset="dialog" :show-icon="false" title="岗位详情">
      <n-descriptions label-placement="left" :column="1" bordered>
        <n-descriptions-item label="岗位名称">{{ detailRecord?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="岗位编码">{{ detailRecord?.code || '-' }}</n-descriptions-item>
        <n-descriptions-item label="排序">{{ detailRecord?.sort ?? '-' }}</n-descriptions-item>
        <n-descriptions-item label="备注">{{ detailRecord?.remark || '-' }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ detailRecord?.created_at || '-' }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ detailRecord?.updated_at || '-' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </n-flex>
</template>

<script lang="ts" setup>
  import { computed, h, reactive, ref } from 'vue';
  import { NButton, NSpace, useDialog, useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { ResultEnum } from '@/enums/httpEnum';
  import {
    createPosition,
    deletePosition,
    getPositionCreateData,
    getPositionDetail,
    getPositionEditDetail,
    getPositions,
    updatePosition,
    type PositionItem,
  } from '@/api/system/position';

  type DrawerMode = 'create' | 'edit';

  const actionRef = ref();
  const formRef = ref();
  const message = useMessage();
  const dialog = useDialog();
  const drawerVisible = ref(false);
  const detailVisible = ref(false);
  const submitLoading = ref(false);
  const drawerMode = ref<DrawerMode>('create');
  const currentPositionId = ref<number | null>(null);
  const detailRecord = ref<PositionItem | null>(null);

  const searchForm = reactive({
    keyword: '',
    name: '',
    code: '',
  });

  const defaultFormValue = () => ({
    name: '',
    code: '',
    sort: 0,
    remark: '',
  });

  const formValue = reactive(defaultFormValue());
  const formSnapshot = ref(defaultFormValue());

  const rules = {
    name: [
      { required: true, message: '请输入岗位名称', trigger: 'blur' },
      { max: 100, message: '岗位名称长度不能超过100个字符', trigger: 'blur' },
    ],
    code: [
      { required: true, message: '请输入岗位编码', trigger: 'blur' },
      { max: 100, message: '岗位编码长度不能超过100个字符', trigger: 'blur' },
    ],
    remark: [{ max: 255, message: '备注长度不能超过255个字符', trigger: 'blur' }],
  };

  const drawerTitle = computed(() => (drawerMode.value === 'create' ? '新增岗位' : '编辑岗位'));

  const rowKey = (row: PositionItem) => row.id;

  const columns = [
    { title: '岗位名称', key: 'name', minWidth: 180 },
    { title: '岗位编码', key: 'code', minWidth: 180 },
    { title: '排序', key: 'sort', width: 100 },
    {
      title: '备注',
      key: 'remark',
      minWidth: 220,
      render(row: PositionItem) {
        return row.remark || '-';
      },
    },
    {
      title: '更新时间',
      key: 'updated_at',
      minWidth: 180,
      render(row: PositionItem) {
        return row.updated_at || '-';
      },
    },
  ];

  const actionColumn = reactive({
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render(record: PositionItem) {
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

  function applyForm(nextValue?: Partial<typeof formValue>) {
    const mergedValue = Object.assign({}, defaultFormValue(), nextValue || {});
    Object.assign(formValue, mergedValue);
    formSnapshot.value = { ...mergedValue };
  }

  async function loadDataTable(params: Record<string, any>) {
    const response = await getPositions({
      keyword: searchForm.keyword || undefined,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined,
      page: params.page,
      per_page: params.pageSize,
    });

    const pageData = response?.data || {};
    return {
      list: Array.isArray(pageData.data) ? pageData.data : [],
      page: Number(pageData.current_page || params.page || 1),
      pageCount: Number(pageData.last_page || 0),
      itemCount: Number(pageData.total || 0),
    };
  }

  async function openCreateDrawer() {
    try {
      await getPositionCreateData();
    } catch (error) {}
    drawerMode.value = 'create';
    currentPositionId.value = null;
    applyForm();
    drawerVisible.value = true;
  }

  async function openEditDrawer(record: PositionItem) {
    try {
      submitLoading.value = true;
      const { code, data } = await getPositionEditDetail(record.id);
      if (code !== ResultEnum.SUCCESS) return;
      drawerMode.value = 'edit';
      currentPositionId.value = Number(record.id);
      applyForm({
        name: data?.name || '',
        code: data?.code || '',
        sort: Number(data?.sort || 0),
        remark: data?.remark || '',
      });
      drawerVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '岗位详情加载失败');
    } finally {
      submitLoading.value = false;
    }
  }

  async function openDetailModal(record: PositionItem) {
    try {
      const { code, data } = await getPositionDetail(record.id);
      if (code !== ResultEnum.SUCCESS) return;
      detailRecord.value = data || null;
      detailVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '岗位详情加载失败');
    }
  }

  function handleSearch() {
    actionRef.value?.reload({ page: 1 });
  }

  function handleResetSearch() {
    searchForm.keyword = '';
    searchForm.name = '';
    searchForm.code = '';
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
          sort: Number(formValue.sort || 0),
          remark: String(formValue.remark || '').trim(),
        };

        if (drawerMode.value === 'edit' && currentPositionId.value) {
          const { code, message: msg } = await updatePosition(currentPositionId.value, payload);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '岗位更新成功');
            drawerVisible.value = false;
            actionRef.value?.reload();
          }
          return;
        }

        const { code, message: msg } = await createPosition(payload);
        if (code === ResultEnum.SUCCESS) {
          message.success(msg || '岗位创建成功');
          drawerVisible.value = false;
          actionRef.value?.reload({ page: 1 });
        }
      } catch (error) {
        message.error((error as Error)?.message || '岗位保存失败');
      } finally {
        submitLoading.value = false;
      }
    });
  }

  function handleDelete(record: PositionItem) {
    dialog.warning({
      title: '删除岗位',
      content: `确认删除岗位“${record.name}”吗？`,
      positiveText: '确认',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          const { code, message: msg } = await deletePosition(record.id);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '岗位删除成功');
            actionRef.value?.reload();
          }
        } catch (error) {
          message.error((error as Error)?.message || '岗位删除失败');
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
