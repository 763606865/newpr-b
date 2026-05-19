<template>
  <div class="company-setting-page">
    <n-grid :x-gap="24" :y-gap="24" item-responsive responsive="screen">
      <n-grid-item span="24 s:24 m:8 l:7 xl:6">
        <n-card :bordered="false" size="small" title="企业列表" class="proCard side-card">
          <template #header-extra>
            <n-button text type="primary" :loading="listLoading" @click="loadCompanies"
              >刷新</n-button
            >
          </template>

          <n-spin :show="listLoading">
            <div v-if="companyList.length" class="company-list">
              <div
                v-for="company in companyList"
                :key="company.id"
                class="company-item"
                :class="{ 'company-item-active': isSelectedCompany(company.id) }"
                @click="handleSelectCompany(company.id)"
              >
                <div class="company-item-head">
                  <div class="company-item-name">{{ company.name || '未命名企业' }}</div>
                  <n-tag size="small" :bordered="false" :type="getStatusType(company.status)">
                    {{ getStatusText(company.status) }}
                  </n-tag>
                </div>
                <div class="company-item-meta">统一信用代码：{{ company.credit_code || '-' }}</div>
                <div class="company-item-meta">联系电话：{{ company.contact_phone || '-' }}</div>
              </div>
            </div>

            <n-empty
              v-else
              description="当前账号还没有关联企业，您可以直接创建第一家企业"
              class="empty-state"
            />
          </n-spin>
        </n-card>
      </n-grid-item>

      <n-grid-item span="24 s:24 m:16 l:17 xl:18">
        <n-card :bordered="false" size="small" :title="pageTitle" class="proCard">
          <template #header-extra>
            <div v-if="activeCompany" class="header-extra">
              <n-tag size="small" :bordered="false" :type="getStatusType(activeCompany.status)">
                {{ getStatusText(activeCompany.status) }}
              </n-tag>
              <span class="header-tip">{{
                statusDescriptions[getStatusValue(activeCompany.status)]
              }}</span>
            </div>
          </template>

          <n-spin :show="detailLoading">
            <div class="page-intro">
              <p>{{ pageDescription }}</p>
            </div>

            <n-form
              ref="formRef"
              :model="formValue"
              :rules="rules"
              label-placement="top"
              require-mark-placement="right-hanging"
              class="company-form"
            >
              <n-grid :x-gap="16" :y-gap="8" item-responsive responsive="screen">
                <n-grid-item span="24 s:24 m:12">
                  <n-form-item label="企业名称" path="name">
                    <n-input
                      v-model:value="formValue.name"
                      :disabled="!isCreateMode"
                      :placeholder="isCreateMode ? '请输入企业名称' : '企业名称不支持修改'"
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="24 s:24 m:12">
                  <n-form-item label="统一社会信用代码" path="credit_code">
                    <n-input
                      v-model:value="formValue.credit_code"
                      :disabled="!isCreateMode"
                      :placeholder="
                        isCreateMode ? '请输入统一社会信用代码' : '统一社会信用代码不支持修改'
                      "
                      @update:value="handleCreditCodeInput"
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="24 s:24 m:12">
                  <n-form-item label="法人姓名" path="legal_person">
                    <n-input v-model:value="formValue.legal_person" placeholder="请输入法人姓名" />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="24 s:24 m:12">
                  <n-form-item label="联系电话" path="contact_phone">
                    <n-input v-model:value="formValue.contact_phone" placeholder="请输入联系电话" />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="24">
                  <n-form-item label="企业地址" path="address">
                    <n-input
                      v-model:value="formValue.address"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入企业地址"
                    />
                  </n-form-item>
                </n-grid-item>
              </n-grid>

              <div class="form-actions">
                <n-button type="primary" :loading="submitLoading" @click="handleSubmit">
                  {{ submitButtonText }}
                </n-button>
                <n-button :disabled="detailLoading || submitLoading" @click="resetForm"
                  >重置</n-button
                >
              </div>
            </n-form>
          </n-spin>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import { ResultEnum } from '@/enums/httpEnum';
  import {
    createCompany,
    getCompanies,
    getCompanyEditDetail,
    updateCompany,
  } from '@/api/system/user';
  import { useUserStore } from '@/store/modules/user';

  type CompanyItem = {
    id?: number | string;
    name?: string;
    credit_code?: string;
    legal_person?: string;
    contact_phone?: string;
    address?: string;
    status?: number | string;
  };

  const formRef = ref();
  const message = useMessage();
  const userStore = useUserStore();

  const listLoading = ref(false);
  const detailLoading = ref(false);
  const submitLoading = ref(false);
  const selectedCompanyId = ref<number | string | null>(null);

  const companyList = ref<CompanyItem[]>([]);
  const activeCompany = ref<CompanyItem | null>(null);
  const formSnapshot = ref(createEmptyForm());

  const statusDescriptions = {
    0: '当前企业已被禁用或审核未通过，修改后可重新提交信息。',
    1: '当前企业已启用，您可以随时维护基础资料。',
    2: '当前企业正在审核中，请保持信息真实有效。',
  };

  const formValue = reactive(createEmptyForm());

  const rules = {
    name: [
      { required: true, message: '请输入企业名称', trigger: 'blur' },
      { max: 255, message: '企业名称长度不能超过255个字符', trigger: 'blur' },
    ],
    credit_code: [
      { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
      { min: 18, message: '统一社会信用代码长度不能少于18位', trigger: 'blur' },
      { max: 18, message: '统一社会信用代码长度不能超过18位', trigger: 'blur' },
    ],
    legal_person: [
      { required: true, message: '请输入法人姓名', trigger: 'blur' },
      { max: 255, message: '法人姓名长度不能超过255个字符', trigger: 'blur' },
    ],
    contact_phone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
      { max: 255, message: '联系电话长度不能超过255个字符', trigger: 'blur' },
    ],
  };

  const isCreateMode = computed(() => !selectedCompanyId.value);
  const pageTitle = computed(() => (isCreateMode.value ? '创建企业信息' : '编辑企业信息'));
  const pageDescription = computed(() => {
    if (isCreateMode.value) {
      return '当前账号暂无企业资料，提交后系统会自动为您创建企业并建立关联。';
    }
    return '您可以在这里维护法人、联系电话和企业地址，企业名称与统一社会信用代码不支持修改。';
  });
  const submitButtonText = computed(() => (isCreateMode.value ? '创建企业' : '保存修改'));

  function createEmptyForm() {
    return {
      name: '',
      credit_code: '',
      legal_person: '',
      contact_phone: '',
      address: '',
    };
  }

  function getStatusValue(status: number | string | undefined) {
    const value = Number(status);
    return Number.isNaN(value) ? 2 : value;
  }

  function getStatusText(status: number | string | undefined) {
    const statusValue = getStatusValue(status);
    if (statusValue === 1) return '已启用';
    if (statusValue === 0) return '已禁用';
    return '审批中';
  }

  function isSelectedCompany(companyId: number | string | undefined) {
    return `${companyId}` === `${selectedCompanyId.value}`;
  }

  function getStatusType(status: number | string | undefined) {
    const statusValue = getStatusValue(status);
    if (statusValue === 1) return 'success';
    if (statusValue === 0) return 'error';
    return 'warning';
  }

  function applyFormValue(company?: CompanyItem | null) {
    const nextValue = {
      name: company?.name || '',
      credit_code: company?.credit_code || '',
      legal_person: company?.legal_person || '',
      contact_phone: company?.contact_phone || '',
      address: company?.address || '',
    };

    Object.assign(formValue, nextValue);
    formSnapshot.value = { ...nextValue };
  }

  function normalizeCompanies(data: any) {
    return Array.isArray(data) ? data : [];
  }

  function handleCreditCodeInput(value: string) {
    formValue.credit_code = value.toUpperCase().replace(/\s/g, '');
  }

  async function loadCompanies() {
    try {
      listLoading.value = true;
      const { code, data } = await getCompanies();
      if (code !== ResultEnum.SUCCESS) return;

      const companies = normalizeCompanies(data);
      companyList.value = companies;

      if (!companies.length) {
        selectedCompanyId.value = null;
        activeCompany.value = null;
        applyFormValue(null);
        return;
      }

      const currentCompanyId = userStore.getCurrentCompany?.id;
      const matchedCompany = companies.find(
        (item) => `${item.id}` === `${selectedCompanyId.value}`
      );
      const defaultCompany =
        matchedCompany ||
        companies.find((item) => `${item.id}` === `${currentCompanyId}`) ||
        companies[0];

      selectedCompanyId.value = defaultCompany?.id ?? null;
      if (selectedCompanyId.value) {
        await loadCompanyDetail(selectedCompanyId.value);
      }
    } catch (error) {
      message.error((error as Error)?.message || '企业列表加载失败');
    } finally {
      listLoading.value = false;
    }
  }

  async function loadCompanyDetail(companyId: number | string) {
    try {
      detailLoading.value = true;
      const { code, data } = await getCompanyEditDetail(companyId);
      if (code !== ResultEnum.SUCCESS) return;

      activeCompany.value = data || null;
      applyFormValue(data);
    } catch (error) {
      message.error((error as Error)?.message || '企业信息加载失败');
    } finally {
      detailLoading.value = false;
    }
  }

  async function handleSelectCompany(companyId: number | string) {
    if (`${companyId}` === `${selectedCompanyId.value}`) return;
    selectedCompanyId.value = companyId;
    await loadCompanyDetail(companyId);
  }

  function resetForm() {
    Object.assign(formValue, formSnapshot.value);
  }

  async function handleSubmit() {
    formRef.value?.validate(async (errors) => {
      if (errors) return;

      try {
        submitLoading.value = true;
        const payload = {
          ...formValue,
          credit_code: formValue.credit_code.toUpperCase().trim(),
        };

        if (isCreateMode.value) {
          const { code, message: msg } = await createCompany(payload);
          if (code === ResultEnum.SUCCESS) {
            await userStore.getInfo();
            message.success(msg || '企业创建成功');
            await loadCompanies();
          }
          return;
        }

        const { code, message: msg } = await updateCompany(
          selectedCompanyId.value as number | string,
          payload
        );
        if (code === ResultEnum.SUCCESS) {
          await userStore.getInfo();
          await loadCompanies();
          message.success(msg || '企业信息已更新');
        }
      } catch (error) {
        message.error((error as Error)?.message || '企业信息保存失败');
      } finally {
        submitLoading.value = false;
      }
    });
  }

  onMounted(() => {
    loadCompanies();
  });
</script>

<style lang="less" scoped>
  .company-setting-page {
    min-height: 100%;
  }

  .side-card {
    height: 100%;
  }

  .company-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .company-item {
    padding: 14px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    transition: all 0.2s ease;

    &:hover {
      cursor: pointer;
      border-color: #93c5fd;
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
    }
  }

  .company-item-active {
    border-color: #2563eb;
    background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
  }

  .company-item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .company-item-name {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
  }

  .company-item-meta {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: #6b7280;
    word-break: break-all;
  }

  .empty-state {
    padding: 36px 0 20px;
  }

  .header-extra {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-tip {
    font-size: 12px;
    color: #6b7280;
  }

  .page-intro {
    margin-bottom: 12px;

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.8;
      color: #6b7280;
    }
  }

  .company-form {
    margin-top: 8px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  @media (max-width: 768px) {
    .header-extra {
      align-items: flex-start;
      flex-direction: column;
      gap: 6px;
    }

    .company-item-head {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
