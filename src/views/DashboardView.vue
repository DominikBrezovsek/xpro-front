<template>
  <div class="inline-flex h-screen w-screen">
    <Toast ref="toast"/>
    <Navbar/>
    <Card class="m-auto w-4/12 h-2/5 colo">
      <template #content>
        <div class="p-card-title text-xl mb-2">
          <p>{{t('dashboardWorkDay')}} {{date}}</p>
        </div>
        <div class="flex flex-col gap-6  p-5 ">
          <div class="inline-flex items-center justify-between gap-2">
            <div class="inline-flex items-center justify-start gap-4">
              <i class="pi pi-sign-in"></i>
              <p>{{ t('dashboardArrString') }} {{arrHour || "Ni podatka"}} </p>
            </div>
            <Button :label="t('navbarLogoutLabel')" icon="pi pi-plus-circle" icon-pos="right" class="w-5/12"
                    @click="showDialog('arrHour')"/>
          </div>
          <div class="inline-flex items-center justify-between gap-2">
            <div class="inline-flex items-center justify-start gap-4">
              <i class="pi pi-sign-out"></i>
              <p>{{ t('dashboardDeptString') }} {{deptHour || "Ni podatka"}} </p>
            </div>
            <Button label="Vnesi čas odhoda" icon="pi pi-plus-circle" icon-pos="right" class="w-5/12" @click="showDialog('deptHour')"/>
          </div>
          <div class="inline-flex items-center justify-between gap-2">
            <div class="inline-flex items-center justify-start gap-4">
              <i class="pi pi-bell"></i>
              <p>{{ t('dashboardBreakString') }} {{breakDuration || "Ni podatka"}} </p>
            </div>
            <Button label="Vnesi podatke o malici" icon="pi pi-plus-circle" icon-pos="right" class="w-5/12" @click="showDialog('break')"/>
          </div>
        </div>
      </template>
    </Card>

    <Dialog :header="t('dashboardHoursInHeaderString')" v-model:visible="showDialogHoursIn" modal>
        <span class="flex flex-col gap-6 p-5">
          <p>{{ t('dashboardHoursInDescString') }}</p>
          <DatePicker id="arrivalHour" v-model="arrivalHour"  showIcon fluid iconDisplay="input" timeOnly showButtonBar time-separator=":">
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback"/>
            </template>
          </DatePicker>
        </span>
      <div class=" w-full inline-flex items-center justify-between gap-2">
        <Button :label=" t('saveLabel')" icon="pi pi-save" @click="saveArrHour()"/>
        <Button :label="t('rejectLabel')" icon="pi pi-times" @click="closeDialog('arrHour')"/>
      </div>
    </Dialog>
    <Dialog :header="t('dashboardHoursOutHeaderString')" v-model:visible="showDialogHoursOut" modal>
        <span class="flex flex-col gap-6 p-5">
          <p>{{ t('dashboardHoursOutDescString') }}</p>
          <DatePicker id="arrivalHour" v-model="departureHour"  showIcon fluid iconDisplay="input" timeOnly showButtonBar time-separator=":">
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback"/>
            </template>
          </DatePicker>
        </span>
      <div class=" w-full inline-flex items-center justify-between gap-2">
        <Button :label=" t('saveLabel')" icon="pi pi-save" @click="saveDeptHour()"/>
        <Button :label="t('rejectLabel')" icon="pi pi-times" @click="closeDialog('deptHour')"/>
      </div>
    </Dialog>
    <Dialog :header="t('dashboardHoursBreakHeaderString')" v-model:visible="showDialogBreak" modal>
        <span class="flex flex-col gap-6 p-5">
          <p>{{ t('dashboardHoursBreakStartDescString') }}</p>
          <DatePicker id="arrivalHour" v-model="breakTimeBegin"  showIcon fluid iconDisplay="input" timeOnly showButtonBar time-separator=":">
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback"/>
            </template>
          </DatePicker>
          <p>{{ t('dashboardHoursBreakEndDescString') }}</p>
          <DatePicker id="arrivalHour" v-model="breakTimeEnd"  showIcon fluid iconDisplay="input" timeOnly showButtonBar time-separator=":">
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback"/>
            </template>
          </DatePicker>
        </span>
      <div class=" w-full inline-flex items-center justify-between gap-2">
        <Button :label="t('saveLabel')" icon="pi pi-save" @click="saveBreak()"/>
        <Button :label=" t('rejectLabel')" icon="pi pi-times" @click="closeDialog('break')"/>
      </div>
    </Dialog>
  </div>

</template>
<script setup>
import Navbar from "@/components/Navbar.vue";
import {Card, Button, DatePicker, Dialog, Toast} from 'primevue'
import {onMounted, ref} from "vue";
import axios from "axios";
import router from "@/router/index.js";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const showDialogHoursIn = ref(false);
const showDialogHoursOut = ref(false);
const showDialogBreak = ref(false);
const arrivalHour = ref('');
const departureHour = ref('');
const toast = ref(null);
const arrHour = ref('');
const deptHour = ref('');
const breakTimeBegin = ref('');
const breakTimeEnd = ref('');
const breakDuration = ref('');
const date = ref('');


function getData(){
  date.value = new Date().toLocaleDateString(t('dashboardLocale'));
  const data = new FormData();
  const url = "http://localhost:5064/api/WorkTime/getWorkTime";
  data.append("userId", sessionStorage.getItem("userId"));
  axios.post(url, data, {
    headers: {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }).then(response => {
    if (response.data.id !== undefined) {

      var clockIn = response.data.clockIn;
      var clockOut = response.data.clockOut
      var breakDur = response.data.breakDuration;
      arrHour.value = clockIn.substring(0, clockIn.indexOf("."));
      if (clockOut !== undefined) {
        deptHour.value = clockOut.substring(0, clockOut.indexOf("."));
      }
      if (breakDur !== undefined) {
        console.log(response.data.breakDuration);
        breakDuration.value = breakDur.substring(0, breakDur.indexOf("."));
      }
    } else if (response.status === 401) {
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.setItem("redirectedToLogin", "true");
      router.push("/");
    }
  }).catch(error => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.setItem("redirectedToLogin", "true");
      router.push("/");
    }
  })
}

function showDialog(dialogName) {
  switch (dialogName) {
    case "arrHour":
      if (arrHour.value !== '') {
        toast.value.add({
          severity: "info",
          summary: "Dejanje ni na voljo",
          detail: "Današnja ura prihoda je že bila vnešena.",
          closable: true,
          life: 3000
        })
      } else {
        showDialogHoursIn.value = true;
      }
      break;
    case "deptHour":
      if (deptHour.value !== '') {
        toast.value.add({
          severity: "info",
          summary: "Dejanje ni na voljo",
          detail: "Današnja ura odhoda je že bila vnešena.",
          closable: true,
          life: 3000
        })
      } else {
        showDialogHoursOut.value = true;
      }
      break;
    case "break":
      if (breakDuration.value !== '') {
        toast.value.add({
          severity: "info",
          summary: "Dejanje ni na voljo",
          detail: "Današnja malica  je že bila vnešena.",
          closable: true,
          life: 3000
        })
      } else {
        showDialogBreak.value = true;
      }
      break;
  }
}

function saveArrHour() {
  if (arrivalHour.value !== undefined && arrivalHour.value != null) {
    const date = new Date(arrivalHour.value);
    const url = "http://localhost:5064/api/WorkTime/startWork";
    const data = new FormData();
    data.append("userId", sessionStorage.getItem("userId"));
    data.append("startTime", date.toISOString());
    axios.post(url, data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
          }
    }
    ).then(() => {
      toast.value.add({
        severity: "success",
        summary: "Uspešno shranjeno",
        detail: "Ura prihoda uspešno shranjena",
        closable: true,
        life: 3000
      })
    })
    arrivalHour.value = null;
    showDialogHoursIn.value = false;

  } else {
    toast.value.add({
      severity: "error",
      summary: "Napaka",
      detail: "Niste izbrali ure",
      closable: true,
      life: 3000
    })
    showDialogHoursIn.value = true;
  }

}

function saveDeptHour(){
  if (departureHour.value !== undefined && departureHour.value != null) {
    const date = new Date(departureHour.value);
    const url = "http://localhost:5064/api/WorkTime/endWork";
    const data = new FormData();
    data.append("userId", sessionStorage.getItem("userId"));
    data.append("endTime", date.toISOString());
    axios.post(url, data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
          }
        }
    ).then(() => {
      toast.value.add({
        severity: "success",
        summary: "Uspešno shranjeno",
        detail: "Ura odhoda uspešno shranjena",
        closable: true,
        life: 3000
      })
    })
    departureHour.value = null;
    showDialogHoursOut.value = false;

  } else {
    toast.value.add({
      severity: "error",
      summary: "Napaka",
      detail: "Niste izbrali ure",
      closable: true,
      life: 3000
    })
    showDialogHoursIn.value = true;
  }
}

function saveBreak(){
  if (breakTimeBegin.value !== undefined && breakTimeBegin.value != null) {
    if (breakTimeEnd.value != null ) {
      const breakBegin = new Date(breakTimeBegin.value);
      const breakEnd = new Date(breakTimeEnd.value);
      const url = "http://localhost:5064/api/WorkTime/addBreak";
      const data = new FormData();
      data.append("userId", sessionStorage.getItem("userId"));
      data.append("startTime", breakBegin.toISOString());
      data.append("endTime", breakEnd.toISOString());
      axios.post(url, data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
          }
      ).then(() => {
        toast.value.add({
          severity: "success",
          summary: "Uspešno shranjeno",
          detail: "Malica uspešno shranjena",
          closable: true,
          life: 3000
        })
      })
      breakBegin.value = null;
      breakEnd.value = null;
      showDialogBreak.value = false;
    } else {
      toast.value.add({
        severity: "error",
        summary: "Napaka",
        detail: "Niste izbrali konca malice",
        closable: true,
        life: 3000
      })
      showDialogBreak.value = true;
    }
  } else {
    toast.value.add({
      severity: "error",
      summary: "Napaka",
      detail: "Niste izbrali začetka malice",
      closable: true,
      life: 3000
    })
    showDialogBreak.value = true;
  }
}
function closeDialog(dialogName) {
  switch (dialogName) {
    case "arrHour":
      showDialogHoursIn.value = false;
      break;
    case "deptHour":
      showDialogHoursOut.value = false;
      break;
    case "break":
      showDialogBreak.value = false;
      break;
  }
}
onMounted(() => {
  getData();
})
</script>

<style scoped>
</style>