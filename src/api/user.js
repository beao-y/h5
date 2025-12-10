import { modify } from '@/api/index'

// 登录
export function login(params) {
  return modify('/api/user/login', params)
}

//授分列表
export function workList(params) {
  return modify('/api/workreview/list', params)
}

// 详情
export function workDetail(params) {
  return modify('/api/workreview/info', params)
}

//审核
export function updateList(params) {
  return modify('/api/workreview/update', params)
}

//发布
export function addWork(params) {
  return modify('/api/workreview/add', params)
}

//退出登陆
export function loginOut() {
  return modify('/api/user/logout')
}

//科室
export function department() {
  return modify('/api/workreview/departmentlist')
}

//工作
export function workType() {
  return modify('/api/workreview/worklist')
}

//上传
export function upload(params) {
  return modify('/api/common/upload', params)
}

// 统计
export function getStatistics(params) {
  return modify('/api/workreview/statistics', params)
}

// 注册
export function register(params) {
  return modify('/api/user/register', params)
}

//发送验证码
export function sendCode(params) {
  return modify('/api/sms/send', params)
}
