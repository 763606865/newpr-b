<template>
  <div class="onboarding-page">
    <div class="onboarding-card">
      <div class="onboarding-head">
        <h2>入驻企业</h2>
        <p>{{ onboardingMessage }}</p>
      </div>
      <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" class="onboarding-form">
        <n-form-item label="公司名称" path="name">
          <n-input v-model:value="formValue.name" placeholder="请输入公司名称" />
        </n-form-item>
        <n-form-item label="统一社会信用代码" path="credit_code">
          <n-input v-model:value="formValue.credit_code" placeholder="请输入统一社会信用代码" />
        </n-form-item>
        <n-form-item label="法人姓名" path="legal_person">
          <n-input v-model:value="formValue.legal_person" placeholder="请输入法人姓名" />
        </n-form-item>
        <n-form-item label="联系电话" path="contact_phone">
          <n-input v-model:value="formValue.contact_phone" placeholder="请输入联系电话" />
        </n-form-item>
        <n-form-item label="公司地址" path="address">
          <n-input
            v-model:value="formValue.address"
            type="textarea"
            :rows="4"
            placeholder="请输入公司地址"
          />
        </n-form-item>
        <n-button type="primary" block :loading="loading" @click="handleSubmit">提交企业信息</n-button>
      </n-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import { ResultEnum } from '@/enums/httpEnum';
  import { PageEnum } from '@/enums/pageEnum';
  import { createCompany } from '@/api/system/user';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store/modules/user';

  const formRef = ref();
  const message = useMessage();
  const loading = ref(false);
  const router = useRouter();
  const userStore = useUserStore();
  const onboardingMessage = computed(() => {
    const currentCompany = userStore.getCurrentCompany;
    if (currentCompany && Number(currentCompany.status) === 0) {
      return '当前企业申请未通过或已被禁用，请修改企业信息后重新提交申请。';
    }
    return '当前账号暂未绑定任何企业，请先补充企业信息后继续使用系统。';
  });

  const formValue = reactive({
    name: '',
    credit_code: '',
    legal_person: '',
    contact_phone: '',
    address: '',
  });

  const rules = {
    name: { required: true, message: '请输入公司名称', trigger: 'blur' },
    credit_code: [
      { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
      { max: 255, message: '统一社会信用代码长度不能超过255个字符', trigger: 'blur' },
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

  const handleSubmit = async () => {
    formRef.value?.validate(async (errors) => {
      if (errors) return;

      try {
        loading.value = true;
        const { code, message: msg } = await createCompany({ ...formValue });
        if (code === ResultEnum.SUCCESS) {
          const userInfo = await userStore.getInfo();
          const currentCompany = userInfo?.current_company || null;
          if (currentCompany && Number(currentCompany.status) === 1) {
            message.success(msg || '企业已审核通过，即将进入系统');
            router.replace(PageEnum.BASE_HOME);
            return;
          }
          if (currentCompany && Number(currentCompany.status) === 2) {
            message.success(msg || '企业入驻申请已提交，请等待审核');
            router.replace(PageEnum.BASE_COMPANY_PENDING);
            return;
          }
          if (currentCompany && Number(currentCompany.status) === 0) {
            message.warning(msg || '企业申请未通过，请调整后重新提交');
            return;
          }
          message.success(msg || '企业入驻申请已提交');
          return;
        }
        message.error(msg || '企业入驻申请提交失败');
      } catch (error) {
        message.error((error as Error)?.message || '企业入驻申请提交失败');
      } finally {
        loading.value = false;
      }
    });
  };
</script>

<style lang="less" scoped>
  .onboarding-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: linear-gradient(140deg, #e8f1fa, #c2d9ec, #a1c3e0, #80aed3);
  }

  .onboarding-card {
    width: 100%;
    max-width: 560px;
    padding: 32px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 18px 48px rgba(35, 58, 97, 0.12);
  }

  .onboarding-head {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 28px;
      color: #223250;
    }

    p {
      margin: 10px 0 0;
      font-size: 14px;
      line-height: 1.7;
      color: #6b7280;
    }
  }

  .onboarding-form {
    margin-top: 8px;
  }
</style>
