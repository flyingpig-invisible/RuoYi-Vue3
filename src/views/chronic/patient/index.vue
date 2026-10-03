<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="患者编号" prop="patientNo">
        <el-input v-model="queryParams.patientNo" placeholder="请输入患者编号" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable style="width: 160px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="病种" prop="diseaseCode">
        <el-select v-model="queryParams.diseaseCode" placeholder="全部病种" clearable style="width: 160px">
          <el-option v-for="item in diseaseOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="风险等级" prop="riskLevel">
        <el-select v-model="queryParams.riskLevel" placeholder="全部等级" clearable style="width: 140px">
          <el-option v-for="dict in risk_level" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
          <el-option v-for="dict in patient_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作区 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['chronic:patient:add']">建档</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['chronic:patient:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['chronic:patient:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 患者队列表格 -->
    <el-table v-loading="loading" :data="patientList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="患者编号" align="center" prop="patientNo" width="110" />
      <el-table-column label="姓名" align="center" prop="name" width="100" />
      <el-table-column label="性别" align="center" prop="gender" width="70">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.gender" />
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="age" width="70" />
      <el-table-column label="病种" align="center" min-width="180">
        <template #default="scope">
          <el-tag v-for="disease in scope.row.diseases" :key="disease" type="info" size="small" class="disease-tag">{{ disease }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="风险等级" align="center" prop="riskLevel" width="100">
        <template #default="scope">
          <el-tag :type="riskTagType(scope.row.riskLevel)" effect="dark">{{ riskLabel(scope.row.riskLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="风险评分" align="center" prop="riskScore" width="90" />
      <el-table-column label="最近监测" align="center" prop="lastMeasureTime" width="160" />
      <el-table-column label="待处理预警" align="center" prop="pendingWarningCount" width="100">
        <template #default="scope">
          <el-badge v-if="scope.row.pendingWarningCount > 0" :value="scope.row.pendingWarningCount" type="danger" />
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <dict-tag :options="patient_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['chronic:patient:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['chronic:patient:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['chronic:patient:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 建档 / 修改 弹窗 -->
    <el-dialog :title="title" v-model="open" width="720px" append-to-body>
      <el-form ref="patientRef" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="患者编号" prop="patientNo">
              <el-input v-model="form.patientNo" placeholder="留空由系统自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker v-model="form.birthday" type="date" value-format="YYYY-MM-DD" placeholder="选择出生日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" maxlength="18" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="病种" prop="diseaseCodes">
          <el-select v-model="form.diseaseCodes" multiple placeholder="请选择病种（可多选）" style="width: 100%">
            <el-option v-for="item in diseaseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="风险等级" prop="riskLevel">
              <el-select v-model="form.riskLevel" placeholder="请选择风险等级" style="width: 100%">
                <el-option v-for="dict in risk_level" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option v-for="dict in patient_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="居住地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入居住地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Patient">
import { listPatient, getPatient, delPatient, addPatient, updatePatient, listDiseaseOptions } from "@/api/chronic/patient"

const { proxy } = getCurrentInstance()
const { risk_level: riskDict, patient_status: statusDict, sys_user_sex: sexDict } = proxy.useDict("risk_level", "patient_status", "sys_user_sex")

// 字典兜底：后端字典未配置时使用本地默认值，保证页面可正常展示
const risk_level = computed(() => (riskDict.value && riskDict.value.length) ? riskDict.value : [
  { label: "低危", value: "1", elTagType: "success" },
  { label: "中危", value: "2", elTagType: "warning" },
  { label: "高危", value: "3", elTagType: "danger" }
])
const patient_status = computed(() => (statusDict.value && statusDict.value.length) ? statusDict.value : [
  { label: "管理中", value: "0", elTagType: "primary" },
  { label: "已结案", value: "1", elTagType: "info" }
])
const sys_user_sex = computed(() => (sexDict.value && sexDict.value.length) ? sexDict.value : [
  { label: "男", value: "0", elTagType: "" },
  { label: "女", value: "1", elTagType: "" }
])

const patientList = ref([])
const diseaseOptions = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const open = ref(false)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    patientNo: undefined,
    name: undefined,
    diseaseCode: undefined,
    riskLevel: undefined,
    status: undefined
  },
  rules: {
    name: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
    gender: [{ required: true, message: "请选择性别", trigger: "change" }],
    birthday: [{ required: true, message: "请选择出生日期", trigger: "change" }],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur" }],
    diseaseCodes: [{ required: true, message: "请至少选择一个病种", trigger: "change" }],
    riskLevel: [{ required: true, message: "请选择风险等级", trigger: "change" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询患者队列列表 */
function getList() {
  loading.value = true
  listPatient(queryParams.value).then(response => {
    patientList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 查询病种下拉 */
function getDiseaseOptions() {
  listDiseaseOptions().then(response => {
    diseaseOptions.value = response.data || []
  })
}

/** 风险等级标签颜色 */
function riskTagType(level) {
  if (level === "3") return "danger"
  if (level === "2") return "warning"
  return "success"
}

function riskLabel(level) {
  const hit = risk_level.value.find(item => item.value === level)
  return hit ? hit.label : "未知"
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = {
    patientId: undefined,
    patientNo: undefined,
    name: undefined,
    gender: undefined,
    birthday: undefined,
    phone: undefined,
    idCard: undefined,
    diseaseCodes: [],
    riskLevel: undefined,
    status: "0",
    address: undefined,
    remark: undefined
  }
  proxy.resetForm("patientRef")
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.patientId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "患者建档"
}

function handleUpdate(row) {
  reset()
  getPatient(row.patientId).then(response => {
    form.value = response.data
    if (!form.value.diseaseCodes) {
      form.value.diseaseCodes = []
    }
    open.value = true
    title.value = "修改患者档案"
  })
}

function handleDetail(row) {
  proxy.$router.push({ path: "/chronic/patient/detail", query: { patientId: row.patientId } })
}

function submitForm() {
  proxy.$refs["patientRef"].validate(valid => {
    if (!valid) return
    if (form.value.patientId != null) {
      updatePatient(form.value).then(() => {
        proxy.$modal.msgSuccess("修改成功")
        open.value = false
        getList()
      })
    } else {
      addPatient(form.value).then(() => {
        proxy.$modal.msgSuccess("建档成功")
        open.value = false
        getList()
      })
    }
  })
}

function handleDelete(row) {
  const patientIds = row.patientId || ids.value
  proxy.$modal.confirm('是否确认删除选中的患者档案？').then(() => {
    return delPatient(patientIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
getDiseaseOptions()
</script>

<style scoped>
.disease-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}
</style>