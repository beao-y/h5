// 数据资源请求
import axios from 'axios'
import Cookies from 'js-cookie'
import { Notify } from 'vant'
import { loginOut } from '@/api/common.js'

// 设置默认请求头
axios.defaults.baseURL = process.env.VUE_APP_BASE_API

// 请求拦截器
axios.interceptors.request.use(
  config => {
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// 获取token
function getToken() {
  const token = Cookies.get('MarinaToken')
  return token || ''
}

export function fetch(options) {
  return new Promise((resolve, reject) => {
    const data = options.data || {}
    const params = {
      url: options.url,
      method: options.method
    }
    if (options.method === 'get') {
      params.params = data
    } else {
      params.data = data
    }
    // axios.defaults.headers['Authorization'] = getToken()
    axios.defaults.headers['token'] = getToken()
    axios(params)
      .then(rs => {
        if (rs.data && typeof rs.data.code !== undefined && rs.data.code == 1) {
          return resolve(rs.data.data ? rs.data.data : null)
        } else {
          const msg = rs && rs.data && rs.data.msg ? rs.data.msg : '请求失败！'
          Notify({ type: rs.code === 1 ? 'danger' : 'success', message: msg })
          if ([401].indexOf(rs.data.code) > -1) {
            setTimeout(() => {
              loginOut()
            }, 2000)
          }
          return reject({
            err: rs
          })
        }
      })
      .catch(err => {
        if ([401].indexOf(err.response.data.code) > -1) {
          setTimeout(() => {
            loginOut()
          }, 2000)
        }
        const msg = err.response && err.response.data && err.response.data.msg ? err.response.data.msg : '请求失败'
        Notify(msg)
        return reject({
          err: err
        })
      })
  })
}
