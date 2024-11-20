<template>
  <div class="inline-flex h-screen w-screen">
    <Toast ref="toast" />
    <Navbar />
    <div class="h-full w-full flex flex-col p-2">
    <div class="inline-flex items-center justify-between">
      <p class="font-semibold text-xl">{{t('selectedMonth')}} {{monthDisplay}}</p>
      <div class="inline-flex gap-5 items-center">
        <p>{{ t('totalHoursTable.selectMonth') }}</p>
        <DatePicker v-model="selectedMonth"  view="month" :max-date="new Date()" dateFormat="mm-yy" @dateSelect="getData()"></DatePicker>
        <Button :label="t('totalHoursTable.clearSelectedMonth')" icon-class="pi pi-times" icon-position="right" @click="clearSelectedMonth()"></Button>
      </div>
    </div>
    <DataTable class="mx-auto mr-auto mt-6 p-3" :value="cols" size="small" v-model:editing-rows="editedRow"
               edit-mode="row"  dataKey="id" @row-edit-save="onRowEditSave" show-gridlines paginator :rows="10"
               :rows-per-page-options="[5, 10, 15, 20]" border ref="dataTable" :export-filename="exportFileName">
      <template #paginatorstart>
        <Button type="button" icon="pi pi-refresh" @click="getData()" text />
      </template>
      <template #paginatorend>
        <Button type="button" icon="pi pi-download" text  @click="exportCSV($event)"/>
      </template>
      <Column field="date" :header="t('totalHoursTable.date')"></Column>
      <Column field="clockIn" :header="t('totalHoursTable.clockIn')">
        <template #editor="{data, field}">
          <InputMask id="clockIn" v-model="data[field]" mask="99:99" placeholder="06:30" :invalid="!data[field]" fluid />
        </template>
      </Column>
      <Column field="clockOut" :header="t('totalHoursTable.clockOut')">
        <template #editor="{data, field}">
          <InputMask id="clockOut" v-model="data[field]" mask="99:99" placeholder="06:30" :invalid="!data[field]" fluid />
        </template>
      </Column>
      <Column field="breakStart" :header="t('totalHoursTable.breakStart')">
        <template #editor="{data, field}">
          <InputMask id="breakStart" v-model="data[field]" mask="99:99" placeholder="06:30" :invalid="!data[field]" fluid />
        </template>
      </Column>
      <Column field="breakEnd" :header="t('totalHoursTable.breakEnd')">
        <template #editor="{data, field}">
          <InputMask id="breakEnd" v-model="data[field]" mask="99:99" placeholder="06:30" fluid />
        </template>
      </Column>
      <Column field="breakDuration" :header="t('totalHoursTable.totalBreakTime')">
      </Column>
      <Column field="breakOverAllowedTime" :header="t('totalHoursTable.breakOverTime')">
      </Column>
      <Column field="totalWorkTime" :header="t('totalHoursTable.totalWorkTime')">
      </Column>
      <Column field="absent" :header="t('totalHoursTable.absent')">
      </Column>
      <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
    </DataTable>
    </div>
  </div>

</template>

<script setup>

import Navbar from "@/components/Navbar.vue";
import axios from "axios";
import {onMounted, ref} from "vue";
import {DataTable, Column, DatePicker, Button, InputMask, Toast} from "primevue";
import {useI18n} from "vue-i18n";
const {t} = useI18n();
const toast = ref(null)

let cols = ref([]);
const dataTable = ref();
var monthDisplay = new Date().toLocaleDateString(t('dashboardLocale'), {month: 'long', year: 'numeric'})
const selectedMonth = ref('');
const editedRow = ref([]);
const invalidInput = ref(false)
const exportFileName = ref('')
const exportCSV = () => {
  dataTable.value.exportCSV();
};

function getData(){
  var month = ""
  if(selectedMonth.value !== ''){
    month = new Date(selectedMonth.value).toISOString()
    monthDisplay = new Date(selectedMonth.value).toLocaleDateString(t('dashboardLocale'), {month: 'long', year: 'numeric'})
  }
  exportFileName.value = t('totalHoursTable.csvExportFileName')+ monthDisplay.split(" ").join("_");

  const data = new FormData();
  const url = "http://localhost:5064/api/WorkTime/getUserWorkTimes";
  data.append("userId", sessionStorage.getItem("userId"));
  data.append("month", month);
  axios.post(url, data,
      {
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
        }
      }).then(res => {

        if (res.data) {
          cols.value = [];
          for(let i=0; i<res.data.length;i++) {
            if(res.data[i].absent == false){
              res.data[i].absent = t('dashboardNo');
            } else {
              res.data[i].absent = t('dashboardYes');
            }
            if (t('dashboardLocale') === "sl-SI") {
              res.data[i].date = res.data[i].date.split('-').reverse().join('.');
            } else {
              res.data[i].date = res.data[i].date.split('-').join('/');
            }
            if (res.data[i].breakOverAllowedTime === "00:00:00") {
              res.data[i].breakOverAllowedTime = "/";
            }
            if (res.data[i].clockIn) {
              res.data[i].clockIn = res.data[i].clockIn.substring(0, res.data[i].clockIn.lastIndexOf(':'))
            } else {
              res.data[i].clockIn = "/"
            }
            if (res.data[i].clockOut) {
              res.data[i].clockOut = res.data[i].clockOut.substring(0, res.data[i].clockOut.lastIndexOf(':'))
            } else {
              res.data[i].clockOut = "/"
            }
            if (res.data[i].breakStart) {
              res.data[i].breakStart = res.data[i].breakStart.substring(0, res.data[i].breakStart.lastIndexOf(':'))
            } else {
              res.data[i].breakStart = "/"
            }
            if (res.data[i].breakEnd) {
              res.data[i].breakEnd = res.data[i].breakEnd.substring(0, res.data[i].breakEnd.lastIndexOf(':'))
            } else {
              res.data[i].breakEnd = "/"
            }

            cols.value.push(res.data[i]);
          }
        }
  })
}
function clearSelectedMonth(){
  selectedMonth.value = '';
  monthDisplay = new Date().toLocaleDateString(t('dashboardLocale'), {month: 'long', year: 'numeric'})
  getData()

}
function onRowEditSave(row) {
  const date = new Date().toISOString();
  const workId = row.newData.id;
  const data = new FormData();
  var clockInTime, clockOutTime, breakStartTime, breakEndTime;
  const validHour = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  clockInTime = row.newData['clockIn']
  clockOutTime = row.newData['clockOut']
  breakStartTime = row.newData['breakStart']
  breakEndTime = row.newData['breakEnd']
  if (clockInTime != "/") {
    if (clockInTime.length < 5) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t('inputErrors.invalidInput'),
        closable: true,
        life: 3000
      })
      return;
    }
    if (validHour.test(clockInTime)) {
      clockInTime = date.substring(0, date.indexOf('T')+1) + clockInTime + ":00.000"
    } else {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("invalidFormat"),
        closable: true,
        life: 3000
      })
      return
    }
  } else {
    clockInTime = "/"
  }
  if (clockOutTime != "/") {
    if (clockInTime === "/") {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("departureBeforeArrival"),
        closable: true,
        life: 3000
      })
      return
    }
    if (clockOutTime.length < 5) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t('inputErrors.invalidInput'),
        closable: true,
        life: 3000
      })
      return;
    }
    if ((parseInt(clockOutTime.split(":").join("")) < parseInt(row.newData['clockIn'].split(":").join("")))) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("deptTooSmall"),
        closable: true,
        life: 3000
      })
      return
    }
    if (validHour.test(clockOutTime)) {
      clockOutTime = date.substring(0, date.indexOf('T')+1) + clockOutTime + ":00.000"
    } else {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("invalidFormat"),
        closable: true,
        life: 3000
      })
      return;
    }
  } else {
    clockOutTime = "/"
  }
  if (breakStartTime != "/") {
    if (clockInTime == "/") {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("departureBeforeArrival"),
        closable: true,
        life: 3000
      })
      return
    }
    if (breakStartTime.length < 5) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t('inputErrors.invalidInput'),
        closable: true,
        life: 3000
      })
      return;
    }
    if (!(parseInt(row.newData['clockIn'].split(":").join("")) < parseInt(row.newData['breakStart'].split(":").join("")))) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("breakBeforeWorkTime"),
        closable: true,
        life: 3000
      })
      return
    }
    if (clockOutTime != "/") {
      if (!(parseInt(row.newData['clockIn'].split(":").join("")) < parseInt(row.newData['breakStart'].split(":").join("")))) {
        toast.value.add({
          severity: "error",
          summary: t("inputError"),
          detail: t("breakAfterWorkTime"),
          closable: true,
          life: 3000
        })
        return
      }
    }
    if (!validHour.test(breakStartTime)) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("invalidFormat"),
        closable: true,
        life: 3000
      })
      return;
    }
    breakStartTime = date.substring(0, date.indexOf('T')+1) + breakStartTime + ":00.000"
  } else {
    breakStartTime = "/"
  }
  if (breakEndTime !== "/") {
    if (breakStartTime === "/") {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t('inputErrors.breakBeginFirst'),
        closable: true,
        life: 3000
      })
      return;
    }
    if (!(parseInt(row.newData['breakEnd'].split(":").join("")) > parseInt(row.newData['breakStart'].split(":").join("")))) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t('inputErrors.endAfterBeginning'),
        closable: true,
        life: 3000
      })
      return;
    }
    if (!(parseInt(row.newData['clockOut'].split(":").join("")) > parseInt(row.newData['breakEnd'].split(":").join("")))) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t('inputErrors.endBeforeClockOut'),
        closable: true,
        life: 3000
      })
      return;
    }
    if (!validHour.test(breakEndTime)) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("invalidFormat"),
        closable: true,
        life: 3000
      })
      return;
    }
    breakEndTime = date.substring(0, date.indexOf('T')+1) + breakEndTime + ":00.000"
  } else {
    breakEndTime = "/"
  }
  data.append("workId", workId);
  data.append("clockInTime", clockInTime);
  data.append("clockOutTime", clockOutTime);
  data.append("breakStartTime", breakStartTime);
  data.append("breakEndTime", breakEndTime);
  const url =  "http://localhost:5064/api/WorkTime/updateUserWorkTimes";
  axios.post(url, data,  {
    headers: {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
    }
  }).then(res => {
    getData()
    if (res.data.error == "userWasAbsent") {
      toast.value.add({
        severity: "info",
        summary: t("inputError"),
        detail: t("userWasAbsent"),
        closable: true,
        life: 3000
      })
    }
  })
}
onMounted(() => {
  getData();
})
</script>
