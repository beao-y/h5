import { fetch } from './request'

// 插入
export function modify(url, data) {
  return fetch({
    url: url,
    data: data,
    method: 'post'
  })
}

// 数据查询
export function read(url, data) {
  return fetch({
    url: url,
    data: data,
    method: 'get'
  })
}

//  数据删除
export function del(url, data) {
  return fetch({
    url: url,
    data: data,
    method: 'DElETE'
  })
}

//  数据更新
export function update(url, data) {
  return fetch({
    url: url,
    data: data,
    method: 'PUT'
  })
}

//  数据写入
export function write(url, data, method) {
  return fetch({
    url: url,
    data: data,
    method: method
  })
}

// all
export function fetchAll(paramsAll) {
  return new Promise((resolve, reject) => {
    const request = []
    paramsAll.forEach(v => {
      request.push(v)
    })
    Promise.all(request)
      .then(rs => {
        resolve(rs)
      })
      .catch(() => {
        reject(false)
      })
  })
}
