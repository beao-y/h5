import { modify } from '@/api/index'

export function activityList(params) {
  return modify('/api/observation/list', params)
}

export function activityApply(params) {
  return modify('/api/observation/apply', params)
}

export function activityUnApply(params) {
  return modify('/api/observation/cancelApply', params)
}

export function clockIn(params) {
  return modify('/api/observation/clockIn', params)
}

export function clockInInfo(params) {
  return modify('/api/observation/clockInInfo', params)
}