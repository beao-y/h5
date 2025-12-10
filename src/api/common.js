import Cookies from 'js-cookie'
import router from '@/router'

export const MarinaToken = 'MarinaToken'

// 清除缓存
export function clearStore() {
  Cookies.remove(MarinaToken)
}
// 登出
export function loginOut() {
  clearStore()
  router.push({ path: '/login' })
  location.reload()
}

export function accMul(arg1, arg2) {
 const s1 = arg1.toString();
  const s2 = arg2.toString();
  
  const m = (s1.split('.')[1] || '').length + 
            (s2.split('.')[1] || '').length;
            
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
}
