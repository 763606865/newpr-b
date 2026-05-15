<template>
  <div class="pending-page">
    <div class="pending-card">
      <div class="pending-icon">...</div>
      <h2>申请已提交，等待审核</h2>
      <p>
        您的企业入驻申请已经提交成功，我们会尽快完成审核。审核通过后，系统将自动开放工作台与
        <code>/dashboard</code> 相关功能。
      </p>
      <div class="pending-company" v-if="companyName">
        <span>当前申请企业</span>
        <strong>{{ companyName }}</strong>
      </div>
      <n-button type="primary" secondary @click="handleRefresh" :loading="loading">刷新审核状态</n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import { useRouter } from 'vue-router';
  import { PageEnum } from '@/enums/pageEnum';
  import { useUserStore } from '@/store/modules/user';

  const loading = ref(false);
  const message = useMessage();
  const router = useRouter();
  const userStore = useUserStore();

  const companyName = computed(() => userStore.getCurrentCompany?.name || '');

  const handleRefresh = async () => {
    try {
      loading.value = true;
      const userInfo = await userStore.getInfo();
      const currentCompany = userInfo?.current_company || null;
      const currentStatus = currentCompany ? Number(currentCompany.status) : -1;
      if (currentStatus === 2) {
        message.info('企业申请仍在审核中，请耐心等待');
        return;
      }
      if (currentStatus === 1) {
        message.success('审核已通过，即将进入系统');
        router.replace(PageEnum.BASE_HOME);
        return;
      }
      if (currentStatus === 0) {
        message.warning('企业申请未通过或已被禁用，请重新提交入驻信息');
        router.replace(PageEnum.BASE_COMPANY_ONBOARDING);
        return;
      }
      const companies = Array.isArray(userInfo?.companies) ? userInfo.companies : [];
      if (companies.length) {
        message.success('企业状态已更新，即将进入系统');
        router.replace(PageEnum.BASE_HOME);
        return;
      }
      message.info('当前还没有可用企业，请稍后再试');
    } catch (error) {
      message.error((error as Error)?.message || '刷新审核状态失败');
    } finally {
      loading.value = false;
    }
  };
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
</style>
