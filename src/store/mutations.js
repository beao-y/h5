import state from './state'

// 导入LocalStorage的封装器，详细使用方式参考 Git上storejs
import LS from 'storejs'

// 定义数据仓库前缀，避免保存到LocalStorage中的数据节点冲突
const sysKeys = process.env.VUE_APP_SYSKEY

// mutations

/* 从本地存储读取数据 */
Object.keys(state).forEach(item => {
  LS.get(sysKeys + item) ? (state[item] = JSON.parse(LS.get(sysKeys + item))) : false
})

// 从组件中提交请求方法，写在此类下，注意保存时，一定要保存为json
const mutations = {
  // 存储用户信息
  setUserinfo(state, payload) {
    state.user = payload
    LS.set(sysKeys + 'user', JSON.stringify(state.user))
  }
}

export default mutations
