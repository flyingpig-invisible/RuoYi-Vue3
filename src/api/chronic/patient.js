import request from '@/utils/request'

// ==================== 本地 Mock 开关 ====================
// 后端接口未就绪时设为 true，联调时改回 false 即可，无需改动页面代码
const USE_MOCK = false

/* -------------------- Mock 数据 -------------------- */
const mockDiseaseMap = {
  '1': '高血压',
  '2': '2 型糖尿病',
  '3': '冠心病',
  '4': '慢阻肺'
}

const mockPatients = [
  { patientId: 1, patientNo: 'P20260001', name: '张建国', gender: '0', age: 68, diseases: ['高血压', '2 型糖尿病'], diseaseCodes: ['1', '2'], riskLevel: '3', riskScore: 86, lastMeasureTime: '2026-10-03 08:12:00', pendingWarningCount: 3, status: '0', birthday: '1958-03-12', phone: '13800138001', address: '深圳市南山区' },
  { patientId: 2, patientNo: 'P20260002', name: '李秀兰', gender: '1', age: 72, diseases: ['冠心病'], diseaseCodes: ['3'], riskLevel: '3', riskScore: 82, lastMeasureTime: '2026-10-03 07:45:00', pendingWarningCount: 1, status: '0', birthday: '1954-07-25', phone: '13800138002', address: '深圳市福田区' },
  { patientId: 3, patientNo: 'P20260003', name: '王卫东', gender: '0', age: 61, diseases: ['高血压'], diseaseCodes: ['1'], riskLevel: '2', riskScore: 63, lastMeasureTime: '2026-10-02 21:30:00', pendingWarningCount: 0, status: '0', birthday: '1965-01-08', phone: '13800138003', address: '深圳市罗湖区' },
  { patientId: 4, patientNo: 'P20260004', name: '陈美玲', gender: '1', age: 55, diseases: ['2 型糖尿病', '慢阻肺'], diseaseCodes: ['2', '4'], riskLevel: '2', riskScore: 55, lastMeasureTime: '2026-10-02 19:05:00', pendingWarningCount: 2, status: '0', birthday: '1971-11-19', phone: '13800138004', address: '深圳市宝安区' },
  { patientId: 5, patientNo: 'P20260005', name: '刘志强', gender: '0', age: 48, diseases: ['高血压'], diseaseCodes: ['1'], riskLevel: '1', riskScore: 32, lastMeasureTime: '2026-10-02 14:20:00', pendingWarningCount: 0, status: '0', birthday: '1978-05-30', phone: '13800138005', address: '深圳市龙岗区' },
  { patientId: 6, patientNo: 'P20260006', name: '赵淑芬', gender: '1', age: 79, diseases: ['慢阻肺'], diseaseCodes: ['4'], riskLevel: '3', riskScore: 91, lastMeasureTime: '2026-10-03 06:58:00', pendingWarningCount: 4, status: '0', birthday: '1947-02-14', phone: '13800138006', address: '深圳市南山区' },
  { patientId: 7, patientNo: 'P20260007', name: '孙明辉', gender: '0', age: 66, diseases: ['2 型糖尿病'], diseaseCodes: ['2'], riskLevel: '2', riskScore: 58, lastMeasureTime: '2026-10-01 22:10:00', pendingWarningCount: 0, status: '0', birthday: '1960-09-03', phone: '13800138007', address: '深圳市盐田区' },
  { patientId: 8, patientNo: 'P20260008', name: '周文彬', gender: '0', age: 58, diseases: ['冠心病', '高血压'], diseaseCodes: ['3', '1'], riskLevel: '1', riskScore: 41, lastMeasureTime: '2026-10-01 18:40:00', pendingWarningCount: 0, status: '1', birthday: '1968-12-21', phone: '13800138008', address: '深圳市光明区' }
]

function mockResponse(data) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), 300)
  })
}

/* -------------------- 接口 -------------------- */

// 查询患者队列列表
export function listPatient(query) {
  if (USE_MOCK) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    let filtered = mockPatients.slice()

    if (query.name) filtered = filtered.filter(p => p.name.includes(query.name))
    if (query.patientNo) filtered = filtered.filter(p => p.patientNo.includes(query.patientNo))
    if (query.diseaseCode) filtered = filtered.filter(p => p.diseaseCodes.includes(query.diseaseCode))
    if (query.riskLevel) filtered = filtered.filter(p => p.riskLevel === query.riskLevel)
    if (query.status) filtered = filtered.filter(p => p.status === query.status)

    // 按风险等级倒序（高危置顶），同级按风险分倒序
    filtered.sort((a, b) => Number(b.riskLevel) - Number(a.riskLevel) || Number(b.riskScore) - Number(a.riskScore))

    const start = (pageNum - 1) * pageSize
    return mockResponse({
      code: 200,
      msg: '查询成功',
      rows: filtered.slice(start, start + pageSize),
      total: filtered.length
    })
  }
  return request({
    url: '/chronic/patient/list',
    method: 'get',
    params: query
  })
}

// 查询患者详情
export function getPatient(patientId) {
  if (USE_MOCK) {
    const hit = mockPatients.find(p => p.patientId === Number(patientId))
    return mockResponse({ code: 200, msg: '操作成功', data: hit ? { ...hit, idCard: '440301195803124521' } : {} })
  }
  return request({
    url: '/chronic/patient/' + patientId,
    method: 'get'
  })
}

// 新增患者档案
export function addPatient(data) {
  if (USE_MOCK) {
    return mockResponse({ code: 200, msg: '建档成功' })
  }
  return request({
    url: '/chronic/patient',
    method: 'post',
    data: data
  })
}

// 修改患者档案
export function updatePatient(data) {
  if (USE_MOCK) {
    return mockResponse({ code: 200, msg: '修改成功' })
  }
  return request({
    url: '/chronic/patient',
    method: 'put',
    data: data
  })
}

// 删除患者档案
export function delPatient(patientIds) {
  if (USE_MOCK) {
    return mockResponse({ code: 200, msg: '删除成功' })
  }
  return request({
    url: '/chronic/patient/' + patientIds,
    method: 'delete'
  })
}

// 查询病种下拉选项
export function listDiseaseOptions() {
  if (USE_MOCK) {
    const options = Object.keys(mockDiseaseMap).map(key => ({ label: mockDiseaseMap[key], value: key }))
    return mockResponse({ code: 200, msg: '操作成功', data: options })
  }
  return request({
    url: '/chronic/patient/diseaseOptions',
    method: 'get'
  })
}