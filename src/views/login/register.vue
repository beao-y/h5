<template>
  <div>
    <van-form @submit="onSubmit">
      <van-field
        v-model="name"
        name="name"
        label="姓名"
        placeholder="姓名（必填）"
        :rules="[{ required: true, message: '请填写姓名' }]"
      />
      <van-field
        v-model="account"
        name="account"
        label="用户名"
        placeholder="用户名（手机号-必填）"
        :rules="[{ required: true, message: '请填写手机号' }]"
      />
      <van-field
        v-model="password"
        name="password"
        label="密码"
        placeholder="密码（必填）"
        :rules="[{ required: true, message: '请填写密码' }]"
      />
      <van-field
        v-model="department_id"
        name="department_id"
        readonly
        is-link
        label="所属科室"
        placeholder="所属科室（必填）"
        @click="onClickPicker(1)"
        :rules="[{ required: true, message: '所属科室' }]"
      />
      <van-field
        v-model="department_title"
        name="department_title"
        label="职称"
        placeholder="职称（必填）"
				:rules="[{ required: true, message: '请填写职称' }]"
      />
      <div style="margin: 40px 16px">
        <van-button round block type="info" native-type="submit">立即注册</van-button>
        <van-button round block type="info" plain style="margin-top: 20px" @click.prevent="onBack">
          返回登陆
        </van-button>
      </div>
    </van-form>

    <van-popup v-model="showPicker1" round position="bottom">
      <van-picker
        title="申请科室"
        show-toolbar
        value-key="label"
        :columns="columns"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>
  </div>
</template>

<script>
import { department, register } from '@/api/user'
import { Toast } from 'vant'

export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      name: '',
      account: '',
      password: '',
      department_id: '',
      department_title: '',
      showPicker1: false,
      columns: []
    }
  },
  created() {
    this.getDepartment()
  },
  methods: {
    onBack() {
      this.$emit('change')
    },
    onSubmit(values) {
      const params = {
        ...values,
        department_id: this.columns.find(v => v.label === values.department_id).value + ''
      }
      register(params).then(() => {
        Toast('注册成功')
        this.onBack()
      })
    },
    onClickPicker() {
      this.showPicker1 = true
    },
    onConfirm(value) {
      this.showPicker1 = false
      this.department_id = value.label
    },
    onCancel() {
      this.showPicker1 = false
    },
    getDepartment() {
      department().then(rs => {
        this.columns = rs.map(item => ({
          label: item.name,
          value: item.id
        }))
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
