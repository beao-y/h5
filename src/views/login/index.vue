<template>
  <div class="login">
    <div v-if="isShow">
      <div class="logo">
        <van-image class="logo-img" width="120" height="120" round fit="cover" :src="logo" />
        <div>徐州市中心医院授分平台</div>
      </div>
      <van-form @submit="onSubmit">
        <van-field v-model="username" name="account" label="用户名" placeholder="用户名" :rules="[{ required: true, message: '请填写用户名' }]" />
        <van-field v-model="password" type="password" name="password" label="密码" placeholder="密码" :rules="[{ required: true, message: '请填写密码' }]" />
        <div style="margin: 40px 16px">
          <van-button round block type="info" native-type="submit">登陆</van-button>
          <van-button round block type="info" plain style="margin-top: 20px" @click.prevent="onRegister">注册</van-button>
        </div>
      </van-form>
    </div>

    <Register v-else v-model="isShow" @change="change" />
  </div>
</template>

<script>
import { login } from '@/api/user'
import Cookies from 'js-cookie'
import Register from './register.vue'
export default {
  components: { Register },
  data() {
    return {
      username: '',
      password: '',
      logo: require('@/assets/img/logo.png'),
      isShow: true
    }
  },
  methods: {
    onSubmit(values) {
      login({ ...values }).then(res => {
        const expires = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        Cookies.set('MarinaToken', res.userinfo.token, {
          expires
        })
        this.$store.dispatch('setUserinfo', res.userinfo)
        setTimeout(() => {
          console.log(555, res.userinfo.admin_info)

          const fullpath = window.sessionStorage.getItem('path')
          if (fullpath) {
            this.$router.push(fullpath)
            return
          }
          if (!res.userinfo.admin_info.is_ky) {
            this.$router.push('/home/statistics')
          } else {
            this.$router.push('/home/grant')
          }
        })
      })
    },
    onRegister() {
      this.isShow = false
    },
    change() {
      console.log(333)
      this.isShow = true
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  margin-top: 120px;
  padding: 0 20px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  font-size: 24px;
  font-weight: 600;
  color: #323233;
  &-img {
    margin-bottom: 10px;
    filter: drop-shadow(2px 10px 20px rgba(91, 55, 192, 0.5));
  }
}
:deep(.van-cell) {
  margin: 20px 0;
}
</style>
