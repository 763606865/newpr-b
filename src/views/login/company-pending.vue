<template>
  <div class="pending-page">
    <div class="pending-card">
      <div class="pending-icon">...</div>
      <h2>申请已提交，等待审核</h2>
      <p>
        您的企业入驻申请已经提交成功，我们会尽快完成审核。审核通过后，系统将自动开放工作台与
        <code>/dashboard</code> 相关功能。
      </p>
      <p class="pending-tip">系统会每 15 秒自动刷新一次审核状态，若暂未返回明确结果，将继续停留在当前页面。</p>
      <div class="pending-company" v-if="companyName">
        <span>当前申请企业</span>
        <strong>{{ companyName }}</strong>
      </div>
      <div class="approved-companies" v-if="approvedCompanyOptions.length > 1">
        <span>检测到多个已通过企业，请选择要进入的企业</span>
        <n-select
          v-model:value="selectedApprovedCompanyId"
          :options="approvedCompanyOptions"
          placeholder="请选择已通过企业"
          class="approved-company-select"
        />
        <n-button
          type="primary"
          :disabled="!selectedApprovedCompanyId"
          :loading="switchingCompany"
          @click="handleApprovedCompanyConfirm"
        >
          进入所选企业
        </n-button>
      </div>
      <n-button type="primary" secondary @click="handleRefresh()" :loading="loading">
        {{ loading ? '刷新中...' : polling ? '立即刷新审核状态' : '刷新审核状态' }}
      </n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import { refreshToken } from '@/api/system/user';
  import { useMessage } from 'naive-ui';
  import { ResultEnum } from '@/enums/httpEnum';
  import { useRouter } from 'vue-router';
  import { PageEnum } from '@/enums/pageEnum';
  import { PENDING_COMPANY } from '@/store/mutation-types';
  import { useUserStore } from '@/store/modules/user';
  import { storage } from '@/utils/Storage';

  const loading = ref(false);
  const polling = ref(false);
  const switchingCompany = ref(false);
  const selectedApprovedCompanyId = ref<number | null>(null);
  const approvedCompanyOptions = ref<{ label: string; value: number }[]>([]);
  const message = useMessage();
  const router = useRouter();
  const userStore = useUserStore();
  let pollingTimer: ReturnType<typeof setInterval> | null = null;
  const POLLING_INTERVAL = 15000;

  const companyName = computed(() => userStore.getCurrentCompany?.name || storage.get(PENDING_COMPANY, null)?.name || '');

  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
    polling.value = false;
  };

  const buildApprovedCompanyOptions = (companies: Record<string, any>[] = []) => {
    return companies
      .filter((company) => Number(company?.status) === 1 && Number(company?.id) > 0)
      .map((company) => ({
        label: company?.name || `企业 ${company.id}`,
        value: Number(company.id),
      }));
  };

  const applyApprovedCompanyToken = async (companyId: number, successMessage?: string) => {
    if (!companyId) return false;

    try {
      switchingCompany.value = true;
      const { code, data, message: msg } = await refreshToken({ company_id: companyId });
      if (code !== ResultEnum.SUCCESS) {
        message.error(msg || '企业切换失败');
        return false;
      }

      userStore.applyAuthState(data);
      const userInfo = await userStore.getInfo(true);
      const currentCompany = userInfo?.current_company || null;
      if (Number(currentCompany?.status) === 1) {
        storage.remove(PENDING_COMPANY);
        stopPolling();
        message.success(successMessage || '审核已通过，即将进入系统');
        router.replace(PageEnum.BASE_HOME);
        return true;
      }

      return false;
    } catch (error) {
      message.error((error as Error)?.message || '企业切换失败');
      return false;
    } finally {
      switchingCompany.value = false;
    }
  };

  const handleApprovedCompanyConfirm = async () => {
    if (!selectedApprovedCompanyId.value) {
      message.warning('请先选择一个已通过企业');
      return;
    }

    await applyApprovedCompanyToken(selectedApprovedCompanyId.value, '企业切换成功，即将进入系统');
  };

  const handleRefresh = async (showMessage = true) => {
    if (loading.value) return;

    try {
      loading.value = true;
      let userInfo = await userStore.getInfo(true);
      const approvedCompanies = Array.isArray(userInfo?.companies)
        ? userInfo.companies.filter((company) => Number(company?.status) === 1)
        : [];

      approvedCompanyOptions.value = buildApprovedCompanyOptions(approvedCompanies);
      if (approvedCompanyOptions.value.length === 1) {
        selectedApprovedCompanyId.value = approvedCompanyOptions.value[0].value;
      } else if (approvedCompanyOptions.value.length === 0) {
        selectedApprovedCompanyId.value = null;
      }

      if (!userInfo?.current_company && approvedCompanyOptions.value.length === 1) {
        const switched = await applyApprovedCompanyToken(
          approvedCompanyOptions.value[0].value,
          '审核已通过，即将进入系统'
        );
        if (switched) {
          return;
        }
        userInfo = await userStore.getInfo(true);
      } else if (approvedCompanyOptions.value.length > 1) {
        stopPolling();
        if (showMessage) {
          message.warning('检测到多个已通过企业，请先选择一个企业进入系统');
        }
        return;
      }

      const currentCompany = userInfo?.current_company || null;
      const currentStatus = currentCompany ? Number(currentCompany.status) : -1;

      if (currentStatus === 1) {
        storage.remove(PENDING_COMPANY);
        stopPolling();
        message.success('审核已通过，即将进入系统');
        router.replace(PageEnum.BASE_HOME);
        return;
      }

      if (currentStatus === 0) {
        storage.remove(PENDING_COMPANY);
        stopPolling();
        message.warning('企业申请未通过或已被禁用，请重新提交入驻信息');
        router.replace(PageEnum.BASE_COMPANY_ONBOARDING);
        return;
      }

      if (currentStatus === 2 || currentStatus === -1) {
        if (showMessage) {
          message.info('企业申请仍在审核中，请耐心等待');
        }
        return;
      }

      if (showMessage) {
        message.info('当前还没有可用企业，请稍后再试');
      }
    } catch (error) {
      if (showMessage) {
        message.error((error as Error)?.message || '刷新审核状态失败');
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    polling.value = true;
    pollingTimer = setInterval(() => {
      handleRefresh(false);
    }, POLLING_INTERVAL);
  });

  onBeforeUnmount(() => {
    stopPolling();
  });
</script>

<style lang="less" scoped>
  .pending-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: linear-gradient(140deg, #e8f1fa, #c2d9ec, #a1c3e0, #80aed3);
  }

  .pending-card {
    width: 100%;
    max-width: 560px;
    padding: 40px 32px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 18px 48px rgba(35, 58, 97, 0.12);
    text-align: center;

    h2 {
      margin: 0;
      font-size: 28px;
      color: #223250;
    }

    p {
      margin: 16px 0 0;
      font-size: 14px;
      line-height: 1.8;
      color: #6b7280;
    }

    .pending-tip {
      margin-top: 12px;
      font-size: 13px;
      color: #8190a5;
    }

    code {
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(45, 140, 240, 0.08);
      color: #2563eb;
    }
  }

  .pending-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    letter-spacing: 4px;
    color: #2563eb;
    background: rgba(37, 99, 235, 0.12);
  }

  .pending-company {
    margin: 24px 0;
    padding: 14px 16px;
    border-radius: 12px;
    background: rgba(37, 99, 235, 0.06);
    color: #374151;

    span {
      display: block;
      font-size: 13px;
      color: #6b7280;
    }

    strong {
      display: block;
      margin-top: 6px;
      font-size: 16px;
      color: #223250;
    }
  }

  .approved-companies {
    margin: 20px 0 16px;
    padding: 16px;
    border-radius: 12px;
    background: rgba(37, 99, 235, 0.08);

    span {
      display: block;
      margin-bottom: 12px;
      font-size: 13px;
      color: #4b5563;
    }
  }

  .approved-company-select {
    margin-bottom: 12px;
    text-align: left;
  }
</style>
