// import Cookies from 'js-cookie'
import Vue from 'vue'
import Router from 'vue-router'
const VueRouter = Router

Vue.use(Router)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登陆',
      isLevel: true
    }
  },

  {
    path: '/',
    redirect: '/home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/home',
    redirect: '/dashboard',
    component: () => import('@/views/home/index.vue'),
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          isLevel: true
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '项目简介',
          isLevel: true
        }
      },
      {
        path: '/nav',
        name: 'Nav',
        component: () => import('@/views/nav/index.vue'),
        meta: {
          title: '一键导航',
          isLevel: true
        }
      }
    ]
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/detail/index.vue'),
    meta: {
      title: '详情'
    }
  },  
  {
    path: '/detail/appointment',
    name: 'Appointment',
    component: () => import('@/views/detail/appointment.vue'),
    meta: {
      title: '预约看房',
    }
  },
]

//2.创建路由对象
const router = new Router({
  mode: 'history',
  routes
})

// 优化push和replace方法，避免重复导航报错
const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;

VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch(err => err)
}

VueRouter.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalReplace.call(this, location, onResolve, onReject)
  }
  return originalReplace.call(this, location).catch(err => err)
}


router.beforeEach((to, from, next) => {
  // 页面滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  
  // 直接放行所有路由
  next()
})

export default router
