import { modify } from '@/api/index'

export function searchbase(params) {
  return modify('/api/evaluate/searchbase', params)
}

export function searchphysician(params) {
  return modify('/api/evaluate/searchphysician', params)
}

// 护士对医师
export function nursephysician(params) {
  return modify('/api/evaluate/nursephysician', params)
}

// 导师对医师
export function mentorphysician(params) {
  return modify('/api/evaluate/mentorphysician', params)
}

export function physicianteaching(params) {
  return modify('/api/evaluate/physicianteaching', params)
}

export function physicianbase(params) {
  return modify('/api/evaluate/physicianbase', params)
}

export function physicianzybase(params) {
  return modify('/api/evaluate/physicianzybase', params)
}

export function physiciandepartment(params) {
  return modify('/api/evaluate/physiciandepartment', params)
}

export function physicianmentor(params) {
  return modify('/api/evaluate/physicianmentor', params)
}
