<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="部门管理">
        当前页面按企业维度维护部门树，支持新增顶级部门、创建下级部门、编辑和删除。
      </n-card>
    </div>

    <n-card :bordered="false" class="mt-4 proCard">
      <template #header-extra>
        <n-space wrap>
          <n-input
            v-model:value="keyword"
            clearable
            placeholder="请输入部门名称关键字"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <n-button @click="loadDepartments" :loading="loading">刷新</n-button>
          <n-button @click="toggleExpandAll">{{ isExpandedAll ? '收起全部' : '展开全部' }}</n-button>
          <n-button @click="handleResetSearch">重置</n-button>
          <n-button type="primary" @click="handleSearch">搜索</n-button>
        </n-space>
      </template>

      <div class="department-toolbar">
        <n-button type="primary" @click="openCreateDrawer()">新增部门</n-button>
      </div>

      <n-data-table
        :columns="columns"
        :data="filteredTreeData"
        :loading="loading"
        :pagination="false"
        :bordered="false"
        children-key="children"
        :row-key="rowKey"
        :row-class-name="rowClassName"
        :expanded-row-keys="expandedRowKeys"
        @update:expanded-row-keys="handleExpandedRowKeys"
      />
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
          <n-form-item label="部门名称" path="name">
            <n-input v-model:value="formValue.name" placeholder="请输入部门名称" />
          </n-form-item>

          <n-grid :x-gap="16" item-responsive responsive="screen">
            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="上级部门" path="parent_id">
                <n-tree-select
                  v-model:value="formValue.parent_id"
                  :options="parentOptions"
                  clearable
                  default-expand-all
                  key-field="value"
                  label-field="label"
                  children-field="children"
                  placeholder="请选择上级部门，不选则为顶级部门"
                />
              </n-form-item>
            </n-grid-item>

            <n-grid-item span="24 s:24 m:12">
              <n-form-item label="部门类型" path="type">
                <n-select v-model:value="formValue.type" :options="departmentTypeOptions" />
              </n-form-item>
            </n-grid-item>
          </n-grid>

          <n-form-item label="排序" path="sort">
            <n-input-number v-model:value="formValue.sort" :min="0" class="w-full" />
          </n-form-item>

          <n-form-item label="备注" path="remark">
            <n-input
              v-model:value="formValue.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注"
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-space>
            <n-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="detailVisible" preset="dialog" :show-icon="false" title="部门详情">
      <n-descriptions label-placement="left" :column="1" bordered>
        <n-descriptions-item label="部门名称">{{ detailRecord?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="上级部门">{{ getParentDepartmentName(detailRecord?.parent_id) }}</n-descriptions-item>
        <n-descriptions-item label="部门类型">{{ getDepartmentTypeLabel(detailRecord?.type) }}</n-descriptions-item>
        <n-descriptions-item label="排序">{{ detailRecord?.sort ?? '-' }}</n-descriptions-item>
        <n-descriptions-item label="子部门数量">{{ getChildDepartmentCount(detailRecord?.id) }}</n-descriptions-item>
        <n-descriptions-item label="备注">{{ detailRecord?.remark || '-' }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ detailRecord?.created_at || '-' }}</n-descriptions-item>
        <n-descriptions-item label="更新时间">{{ detailRecord?.updated_at || '-' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { NButton, NSpace, NTag, useDialog, useMessage } from 'naive-ui';
  import { ResultEnum } from '@/enums/httpEnum';
  import {
    createDepartment,
    deleteDepartment,
    getDepartmentDetail,
    getDepartmentEditDetail,
    getDepartments,
    updateDepartment,
    type DepartmentItem,
  } from '@/api/system/department';

  type DrawerMode = 'create' | 'create-child' | 'edit';

  const message = useMessage();
  const dialog = useDialog();
  const formRef = ref();
  const loading = ref(false);
  const submitLoading = ref(false);
  const drawerVisible = ref(false);
  const drawerMode = ref<DrawerMode>('create');
  const currentDepartmentId = ref<number | null>(null);
  const treeData = ref<DepartmentItem[]>([]);
  const flatDepartments = ref<DepartmentItem[]>([]);
  const keyword = ref('');
  const detailVisible = ref(false);
  const detailRecord = ref<DepartmentItem | null>(null);
  const expandedRowKeys = ref<number[]>([]);
  const latestCreatedDepartmentId = ref<number | null>(null);

  const departmentTypeOptions = [
    { label: '职能', value: 1 },
    { label: '业务', value: 2 },
    { label: '管理层', value: 3 },
  ];

  const departmentTypeMap = {
    1: { label: '职能', type: 'info' as const },
    2: { label: '业务', type: 'success' as const },
    3: { label: '管理层', type: 'warning' as const },
  };

  const defaultFormValue = () => ({
    name: '',
    parent_id: 0,
    type: 1,
    sort: 0,
    remark: '',
  });

  const formSnapshot = ref(defaultFormValue());
  const formValue = reactive(defaultFormValue());

  const rules = {
    name: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { max: 100, message: '部门名称长度不能超过100个字符', trigger: 'blur' },
    ],
    type: {
      type: 'number',
      required: true,
      message: '请选择部门类型',
      trigger: 'change',
    },
    remark: [{ max: 255, message: '备注长度不能超过255个字符', trigger: 'blur' }],
  };

  const drawerTitle = computed(() => {
    if (drawerMode.value === 'edit') return '编辑部门';
    if (drawerMode.value === 'create-child') return '新增下级部门';
    return '新增部门';
  });

  const filteredTreeData = computed(() => filterDepartmentTree(treeData.value, keyword.value));
  const isExpandedAll = computed(() => {
    const allIds = flatDepartments.value.map((item) => Number(item.id));
    return allIds.length > 0 && allIds.every((id) => expandedRowKeys.value.includes(id));
  });

  const parentOptions = computed(() => {
    const excludedIds = new Set<number>();
    if (drawerMode.value === 'edit' && currentDepartmentId.value) {
      buildDescendantIds(currentDepartmentId.value).forEach((id) => excludedIds.add(id));
      excludedIds.add(currentDepartmentId.value);
    }

    const availableList = flatDepartments.value.filter((item) => !excludedIds.has(Number(item.id)));
    return [
      { label: '作为顶级部门', value: 0 },
      ...buildTreeSelectOptions(availableList),
    ];
  });

  const columns = [
    {
      title: '部门名称',
      key: 'name',
      minWidth: 220,
    },
    {
      title: '部门类型',
      key: 'type',
      width: 120,
      render(row: DepartmentItem) {
        const config = departmentTypeMap[row.type] || { label: `类型${row.type}`, type: 'default' as const };
        return h(NTag, { bordered: false, type: config.type }, { default: () => config.label });
      },
    },
    {
      title: '排序',
      key: 'sort',
      width: 100,
    },
    {
      title: '备注',
      key: 'remark',
      minWidth: 220,
      render(row: DepartmentItem) {
        return row.remark || '-';
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 240,
      fixed: 'right',
      render(row: DepartmentItem) {
        return h(NSpace, { wrap: false }, {
          default: () => [
            h(
              NButton,
              { text: true, onClick: () => openDetailModal(row) },
              { default: () => '详情' }
            ),
            h(
              NButton,
              { text: true, type: 'primary', onClick: () => openCreateDrawer(row) },
              { default: () => '新增下级' }
            ),
            h(
              NButton,
              { text: true, type: 'primary', onClick: () => openEditDrawer(row) },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              { text: true, type: 'error', onClick: () => handleDelete(row) },
              { default: () => '删除' }
            ),
          ],
        });
      },
    },
  ];

  const rowKey = (row: DepartmentItem) => row.id;

  function normalizeDepartmentList(data: unknown) {
    return Array.isArray(data) ? (data as DepartmentItem[]) : [];
  }

  function getDepartmentTypeLabel(type: number | string | undefined) {
    const config = departmentTypeMap[Number(type)] || { label: '-' };
    return config.label;
  }

  function getParentDepartmentName(parentId?: number) {
    if (!parentId) return '顶级部门';
    return flatDepartments.value.find((item) => Number(item.id) === Number(parentId))?.name || '-';
  }

  function getChildDepartmentCount(departmentId?: number) {
    if (!departmentId) return 0;
    return flatDepartments.value.filter((item) => Number(item.parent_id) === Number(departmentId)).length;
  }

  function filterDepartmentTree(list: DepartmentItem[], searchValue: string) {
    const keywordValue = String(searchValue || '').trim().toLowerCase();
    if (!keywordValue) return list;

    return list
      .map((item) => ({
        ...item,
        children: filterDepartmentTree(item.children || [], keywordValue),
      }))
      .filter((item) => {
        const matched = String(item.name || '').toLowerCase().includes(keywordValue);
        return matched || Boolean(item.children?.length);
      });
  }

  function buildTreeSelectOptions(list: DepartmentItem[]) {
    const map = new Map<number, any>();
    const roots: any[] = [];

    list.forEach((item) => {
      map.set(Number(item.id), {
        label: item.name,
        value: Number(item.id),
        children: [],
      });
    });

    list.forEach((item) => {
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

  function buildDescendantIds(rootId: number) {
    const ids = new Set<number>();
    const queue = [rootId];

    while (queue.length) {
      const currentId = queue.shift() as number;
      const children = flatDepartments.value.filter((item) => Number(item.parent_id) === currentId);
      children.forEach((child) => {
        const childId = Number(child.id);
        if (!ids.has(childId)) {
          ids.add(childId);
          queue.push(childId);
        }
      });
    }

    return ids;
  }

  function applyForm(nextValue?: Partial<typeof formValue>) {
    const mergedValue = Object.assign({}, defaultFormValue(), nextValue || {});
    Object.assign(formValue, mergedValue);
    formSnapshot.value = { ...mergedValue };
  }

  async function loadDepartments() {
    try {
      loading.value = true;
      const [treeResponse, flatResponse] = await Promise.all([
        getDepartments(),
        getDepartments({ flat: 1 }),
      ]);

      if (treeResponse.code === ResultEnum.SUCCESS) {
        treeData.value = normalizeDepartmentList(treeResponse.data);
      }
      if (flatResponse.code === ResultEnum.SUCCESS) {
        flatDepartments.value = normalizeDepartmentList(flatResponse.data);
        expandedRowKeys.value = flatDepartments.value.map((item) => Number(item.id));
      }
    } catch (error) {
      message.error((error as Error)?.message || '部门列表加载失败');
    } finally {
      loading.value = false;
    }
  }

  function handleExpandedRowKeys(keys: Array<string | number>) {
    expandedRowKeys.value = keys.map((item) => Number(item));
  }

  function rowClassName(row: DepartmentItem) {
    return Number(row.id) === Number(latestCreatedDepartmentId.value) ? 'department-row-highlight' : '';
  }

  function toggleExpandAll() {
    if (isExpandedAll.value) {
      expandedRowKeys.value = [];
      return;
    }
    expandedRowKeys.value = flatDepartments.value.map((item) => Number(item.id));
  }

  function handleSearch() {
    expandedRowKeys.value = flatDepartments.value.map((item) => Number(item.id));
  }

  function handleResetSearch() {
    keyword.value = '';
    expandedRowKeys.value = flatDepartments.value.map((item) => Number(item.id));
  }

  function openCreateDrawer(parent?: DepartmentItem) {
    drawerMode.value = parent ? 'create-child' : 'create';
    currentDepartmentId.value = null;
    applyForm({ parent_id: parent ? Number(parent.id) : 0, type: parent?.type || 1, sort: 0 });
    drawerVisible.value = true;
  }

  async function openEditDrawer(record: DepartmentItem) {
    try {
      submitLoading.value = true;
      const { code, data } = await getDepartmentEditDetail(record.id);
      if (code !== ResultEnum.SUCCESS) return;

      drawerMode.value = 'edit';
      currentDepartmentId.value = Number(record.id);
      applyForm({
        name: data?.name || '',
        parent_id: Number(data?.parent_id || 0),
        type: Number(data?.type || 1),
        sort: Number(data?.sort || 0),
        remark: data?.remark || '',
      });
      drawerVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '部门详情加载失败');
    } finally {
      submitLoading.value = false;
    }
  }

  async function openDetailModal(record: DepartmentItem) {
    try {
      const { code, data } = await getDepartmentDetail(record.id);
      if (code !== ResultEnum.SUCCESS) return;
      detailRecord.value = data || null;
      detailVisible.value = true;
    } catch (error) {
      message.error((error as Error)?.message || '部门详情加载失败');
    }
  }

  function handleReset() {
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
          parent_id: Number(formValue.parent_id || 0),
          type: Number(formValue.type),
          sort: Number(formValue.sort || 0),
          remark: String(formValue.remark || '').trim(),
        };

        if (drawerMode.value === 'edit' && currentDepartmentId.value) {
          const { code, message: msg } = await updateDepartment(currentDepartmentId.value, payload);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '部门更新成功');
            drawerVisible.value = false;
            await loadDepartments();
          }
          return;
        }

        const { code, message: msg, data } = await createDepartment(payload);
        if (code === ResultEnum.SUCCESS) {
          latestCreatedDepartmentId.value = Number(data?.id || 0) || null;
          message.success(msg || '部门创建成功');
          drawerVisible.value = false;
          await loadDepartments();
        }
      } catch (error) {
        message.error((error as Error)?.message || '部门保存失败');
      } finally {
        submitLoading.value = false;
      }
    });
  }

  function handleDelete(record: DepartmentItem) {
    const childCount = getChildDepartmentCount(record.id);
    if (childCount > 0) {
      dialog.warning({
        title: '无法删除部门',
        content: `当前部门下还有 ${childCount} 个子部门，请先删除子部门后再操作。`,
        positiveText: '我知道了',
      });
      return;
    }

    dialog.warning({
      title: '删除部门',
      content: `确认删除部门“${record.name}”吗？`,
      positiveText: '确认',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          const { code, message: msg } = await deleteDepartment(record.id);
          if (code === ResultEnum.SUCCESS) {
            message.success(msg || '部门删除成功');
            await loadDepartments();
          }
        } catch (error) {
          message.error((error as Error)?.message || '部门删除失败');
        }
      },
    });
  }

  onMounted(() => {
    loadDepartments();
  });
</script>

<style lang="less" scoped>
  .w-full {
    width: 100%;
  }

  .search-input {
    width: 260px;
  }

  .department-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  :deep(.department-row-highlight td) {
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.14), rgba(37, 99, 235, 0.04));
  }
</style>
