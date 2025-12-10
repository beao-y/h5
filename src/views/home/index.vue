<template>
  <div>
    <van-nav-bar :title="title" :left-arrow="!isShow" fixed safe-area-inset-top/>
    <Keep-alive>
      <router-view></router-view>
    </Keep-alive>

    <van-tabbar v-model="active" @change="tabChange"  active-color="#B6A37E" inactive-color="#B1B2B1" safe-area-inset-bottom>
      <van-tabbar-item name="Dashboard">
        <span>首页</span>
        <template #icon="props">
          <img :src="props.active ? home.active : home.inactive" />
        </template>
      </van-tabbar-item>

      <van-tabbar-item name="Nav">
        <span>一键导航</span>
        <template #icon="props">
          <img :src="props.active ? nav.active : nav.inactive" />
        </template>
      </van-tabbar-item>
 
      <van-tabbar-item name="Profile">
        <span>项目简介</span>
        <template #icon="props">
          <img :src="props.active ? profile.active : profile.inactive" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      active: 'Dashboard',
      title: "",
      isShow: false,
       home: {
        active: require('@/assets/img/home-active.png'),
        inactive: require('@/assets/img/home.png'),
      },
      profile: {
        active: require('@/assets/img/profile-active.png'),
        inactive: require('@/assets/img/profile.png'),
      },
      nav: {
        active: require('@/assets/img/nav-active.png'),
        inactive: require('@/assets/img/nav.png'),
      },
    };
  },
  watch: {
    $route: {
      handler(val) {
        this.active = val.name;
        this.title = val.path === '/home/dashboard' ? '联合金融' : val.meta.title;
        this.isShow = val.meta.isLevel;
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
    }),
  },
  methods: {
    tabChange() {
      const router = this.$router;
      router.replace({
        name: this.active,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep(.van-tabbar-item__icon img) {
  width: 24px;
  height: 24px;
}
</style>
