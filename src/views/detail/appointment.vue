<template>
  <div class="page">
    <van-nav-bar
      title="预约看房"
      :left-arrow="!isShow"
      fixed
      @click-left="onClickLeft"
    />

    <!-- 表单内容 -->
    <div class="form-container">
      <h1 class="form-title">联合金融大厦·写字楼</h1>
      <p class="form-tip">请填写完整信息，方便工作人员与您联系</p>

      <!-- 使用 van-form 包裹表单 -->
      <van-form ref="formRef" :model="formData" @submit="onSubmit">
        <!-- 联系人输入框 -->
        <div class="input-item">
          <div class="input-label">联系人</div>
          <van-field
            v-model="formData.Name"
            placeholder="请输入联系人姓名"
            clearable
            :rules="[{ required: true, message: '请输入联系人姓名' }]"
          />
        </div>

        <!-- 手机号输入框 -->
        <div class="input-item">
          <div class="input-label">手机号</div>
          <van-field
            v-model="formData.Phone"
            placeholder="请输入联系手机号"
            clearable
            type="tel"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
          />
        </div>

        <!-- 预约看房按钮 -->
        <div class="submit-button">
          <van-button type="primary" block :loading="loading" native-type="submit">预约看房</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      title: this.$route.meta.title,
      isShow: this.$route.meta.isLevel,
      // 表单数据
      formData: {
        Name: '',
        Phone: ''
      },
      // 加载状态
      loading: false
    }
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    // 提交表单
    onSubmit() {
      // 使用表单验证
      this.$refs.formRef.validate().then(() => {
        // 验证通过，执行提交逻辑
        this.loading = true;

        axios.post(`${process.env.VUE_APP_BASE_API}/system/AppointmentInfo/form`,{
          ...this.formData,
          ProjectId: this.$route.params.id
        }).then((response) => {
          console.log(response, this.formData,888);
          if (response.data.state === 1) {
            // 显示预约成功提示
            this.$toast.success({
              message: '预约成功',
              duration: 1000,
              onClose: () => {
                // 提示关闭后跳转到详情页
                this.$router.back();
              }
            });
          } else {
            // 显示预约失败提示
            this.$toast.error({
              message: response.data.msg || '预约失败',
              duration: 1000
            });
          }
        }).catch((error) => {
          // 显示预约失败提示
          this.$toast.error({
            message: error.message || '预约失败',
            duration: 1000
          });
        });

      }).catch((error) => {
        // 验证失败，表单会自动提示错误信息
        console.log('表单验证失败:', error);
      });
    }
  }
}
</script>

<style scoped>
.page {
  padding-top: 46px;
  padding-bottom: 60px;
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.form-container {
  padding: 20px;
}

.form-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.form-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.input-item {
  margin-bottom: 20px;
}

.input-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.submit-button {
  margin-top: 40px;
}

.submit-button :deep(.van-button) {
  background-color: #33364C;
  color: #B6A37E;
  border-radius: 10px;
  border: none;
}

.submit-button :deep(.van-button--primary) {
  background-color: #33364C;
}

.submit-button :deep(.van-button--primary::after) {
  border: none;
}

::v-deep(.van-cell) {
  padding: 12px 0;
}
</style>