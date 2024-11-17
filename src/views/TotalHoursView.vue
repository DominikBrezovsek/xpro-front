<template>
  <div class="inline-flex h-screen w-screen">
    <Navbar />
    <div class="h-full w-full flex flex-col p-2">
    <div class="inline-flex items-center justify-between">
      <p class="font-semibold text-xl">Podatki za mesec {{monthDisplay}}</p>
      <div class="inline-flex gap-5 items-center">
        <p>Izberi mesec: </p>
        <DatePicker v-model="selectedMonth" select-other-months view="month"  dateFormat="mm/yy" @dateSelect="getData()"></DatePicker>
        <Button label="Počisti izbiro" icon-class="pi pi-times" icon-position="right" @click="clearSelectedMonth()"></Button>
      </div>
    </div>
    <DataTable class="mx-auto mr-auto mt-6 p-3" :value="cols" size="small" v-model:editing-rows="editedRow"
               edit-mode="row"  dataKey="id" @row-edit-save="onRowEditSave" show-gridlines paginator :rows="10"
               :rows-per-page-options="[5, 10, 15, 20]" border>
      <template #paginatorstart>
        <Button type="button" icon="pi pi-refresh" @click="getData()" text />
      </template>
      <template #paginatorend>
        <Button type="button" icon="pi pi-download" text/>
      </template>
      <Column field="date" header="Datum"></Column>
      <Column field="clockIn" header="Čas prihoda">
        <template #editor="{ data, field }">
          <DatePicker
              v-model="data[field]"
              timeOnly
              hourFormat="24"
          />
        </template>
      </Column>
      <Column field="clockOut" header="Čas odhoda">
        <template #editor="{ data, field }">
          <DatePicker
              v-model="data[field]"
              timeOnly
              hourFormat="24"
          />
        </template>
      </Column>
      <Column field="breakStart" header="Začetek malice">
        <template #editor="{ data, field }">
          <DatePicker
              v-model="data[field]"
              timeOnly
              hourFormat="24"
          />
        </template>
      </Column>
      <Column field="breakEnd" header="Konec malice">
        <template #editor="{ data, field }">
          <DatePicker
              v-model="data[field]"
              timeOnly
              hourFormat="24"
          />
        </template>
      </Column>
      <Column field="breakDuration" header="Trajanje malice">
      </Column>
      <Column field="breakOverAllowedTime" header="Prekoračen čas malice">
      </Column>
      <Column field="totalWorkTime" header="Skupno število ur">
      </Column>
      <Column field="absent" header="Odsotnost">
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
import {DataTable, Column, DatePicker, Button, InputText} from "primevue";
import {useI18n} from "vue-i18n";
const {t} = useI18n();

let cols = ref([]);
var monthDisplay = new Date().toLocaleDateString(t('dashboardLocale'), {month: 'long', year: 'numeric'})
const selectedMonth = ref('');
const editedRow = ref([]);

function getData(){
  var month = ""
  if(selectedMonth.value !== ''){
    month = new Date(selectedMonth.value).toISOString()
    monthDisplay = new Date(selectedMonth.value).toLocaleDateString(t('dashboardLocale'), {month: 'long', year: 'numeric'})
  }

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
  var clockIn, clockOut, breakStart, breakEnd;
  if(typeof(row.newData.clockIn) == "object") {
    clockIn = new Date(row.newData.clockIn).toISOString();
    clockIn = clockIn.substring(0, clockIn.lastIndexOf(':')+1) + "00.000Z";

  } else {
    clockIn = date.substring(0, date.indexOf('T')+1) + row.newData.clockIn + ".000";
  }
  if(typeof(row.newData.clockOut) == "object") {
    clockOut = new Date(row.newData.clockOut).toISOString();
    clockOut = clockOut.substring(0, clockOut.lastIndexOf(':')+1) + "00.000Z";

  } else {
    clockOut = date.substring(0, date.indexOf('T')+1) + row.newData.clockOut + ".000";
  }
  if (typeof(row.newData.breakStart) == "object") {
    breakStart = new Date(row.newData.breakStart).toISOString();
    breakStart = breakStart.substring(0, breakStart.lastIndexOf(':')+1) + "00.000Z";

  } else {
    breakStart = date.substring(0, date.indexOf('T')+1) + row.newData.breakStart + ".000";

  }
  if (typeof(row.newData.breakEnd) == "object") {
    breakEnd = new Date(row.newData.breakEnd).toISOString();
    breakEnd = breakEnd.substring(0, breakEnd.lastIndexOf(':')+1) + "00.000Z";

  } else {
    breakEnd =  date.substring(0, date.indexOf('T')+1) + row.newData.breakEnd + ".000";
  }
  data.append("workId", workId);
  data.append("clockInTime", clockIn);
  data.append("clockOutTime", clockOut);
  data.append("breakStartTime", breakStart);
  data.append("breakEndTime", breakEnd);
  const url =  "http://localhost:5064/api/WorkTime/updateUserWorkTimes";
  axios.post(url, data,  {
    headers: {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
    }
  }).then(() => {
    getData()
  })

}

onMounted(() => {
  getData();
})
</script>
