<template>
  <div class="inline-flex h-screen w-screen">
    <Toast ref="toast"/>
    <Navbar/>
    <Card class="m-auto ">
      <template #content>
        <div class="p-card-title text-xl mb-2">
          <p>{{t('dashboardWorkDay')}} {{date}}</p>
        </div>
        <div class="flex flex-col gap-6  p-5 ">
          <div class="inline-flex items-center justify-between gap-2">
            <div class="inline-flex items-center justify-start gap-4">
              <i class="pi pi-sign-in"></i>
              <p>{{ t('dashboardArrString') }} {{arrHour || t('noData')}} </p>
            </div>
            <Button :label="t('enterArrival')" icon="pi pi-plus-circle" icon-pos="right" class="w-5/12"
                    @click="showDialog('arrHour')"/>
          </div>
          <div class="inline-flex items-center justify-between gap-2">
            <div class="inline-flex items-center justify-start gap-4">
              <i class="pi pi-sign-out"></i>
              <p>{{ t('dashboardDeptString') }} {{deptHour || t('noData')}} </p>
            </div>
            <Button :label="t('enterDeparture')" icon="pi pi-plus-circle" icon-pos="right" class="w-5/12" @click="showDialog('deptHour')"/>
          </div>
          <div class="inline-flex items-center justify-between gap-2">
            <div class="inline-flex items-center justify-start gap-4">
              <i class="pi pi-bell"></i>
              <p>{{ t('dashboardBreakString') }} {{breakDuration|| t('noData')}} </p>
            </div>
            <Button :label="t('enterBreak')" icon="pi pi-plus-circle" icon-pos="right" class="w-5/12" @click="showDialog('break')"/>
          </div>
          <div class="inline-flex items-center justify-between gap-2">
            <p>{{t('dashboardAbsentString')}} {{absenceType || t('noAbsence')}}</p>
            <Button :label="t('addAbsence')" icon="pi pi-plus-circle" icon-pos="right" class="w-5/12" @click="showDialog('absence')" />
          </div>
        </div>
      </template>
    </Card>

    <Dialog :header="t('dashboardHoursInHeaderString')" v-model:visible="showDialogHoursIn" modal>
        <span class="flex flex-col gap-6 p-5">
          <p>{{ t('dashboardHoursInDescString') }}</p>
          <DatePicker id="arrivalHour" v-model="arrivalHour"  showIcon fluid iconDisplay="input" timeOnly  showButtonBar time-separator=":">
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
    <Dialog :header="t('dashboardHourOutHeaderString')" v-model:visible="showDialogHoursOut" modal>
        <span class="flex flex-col gap-6 p-5">
          <p>{{ t('dashboardHourOutDescString') }}</p>
          <DatePicker id="arrivalHour" v-model="departureHour"  showIcon fluid iconDisplay="input" timeOnly manual-input showButtonBar time-separator=":">
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
          <DatePicker id="arrivalHour" v-model="breakTimeBegin"  showIcon fluid iconDisplay="input" timeOnly manual-input showButtonBar time-separator=":">
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback"/>
            </template>
          </DatePicker>
          <p>{{ t('dashboardHoursBreakEndDescString') }}</p>
          <DatePicker id="arrivalHour" v-model="breakTimeEnd"  showIcon fluid iconDisplay="input" timeOnly showButtonBar manual-input time-separator=":">
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
    <Dialog :header="t('dashboardHoursInHeaderString')" v-model:visible="showDialogAbsence" modal>
        <span class="flex flex-col gap-6 p-5">
          <p>{{ t('dashboardHoursInDescString') }}</p>
            <Select v-model="selectedAbsence" :options="absences" option-label="absenceName" option-value="absenceId" placeholder="Izberi vrsto odsotnosti" />
        </span>
      <div class=" w-full inline-flex items-center justify-between gap-2">
        <Button :label=" t('saveLabel')" icon="pi pi-save" @click="saveAbsence()"/>
        <Button :label="t('rejectLabel')" icon="pi pi-times" @click="closeDialog('absence')"/>
      </div>
    </Dialog>
  </div>

</template>
<script setup>
import Navbar from "@/components/Navbar.vue";
import {Card, Button, DatePicker, Dialog, Toast, Select} from 'primevue'
import {onMounted, ref, watch} from "vue";
import axios from "axios";
import router from "@/router/index.js";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const showDialogHoursIn = ref(false);
const showDialogHoursOut = ref(false);
const showDialogBreak = ref(false);
const showDialogAbsence = ref(false);
const arrivalHour = ref();
const departureHour = ref();
const toast = ref(null);
const arrHour = ref();
const deptHour = ref();
const breakTimeBegin = ref();
const breakTimeEnd = ref();
const breakDuration = ref();
const date = ref();
const selectedAbsence = ref();
const absences = ref();
const absenceType = ref();


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
      sessionStorage.setItem("workId", response.data.id);
      var clockIn = response.data.clockIn;
      var clockOut = response.data.clockOut
      var breakDur = response.data.breakDuration;
      var absent = response.data.absent;
      if (clockIn !== null) {
        arrHour.value = clockIn.substring(0, clockIn.lastIndexOf(":"));
      }
      if (clockOut != null) {
        deptHour.value = clockOut.substring(0, clockOut.lastIndexOf(":"));
      }
      if (breakDur !== null) {
        breakDuration.value = breakDur.substring(0, breakDur.lastIndexOf(":"));
      }
      if (absent === true) {
        absenceType.value = "Odsoten";
      }
    } else if (response.status === 401) {
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("workId");
      sessionStorage.setItem("redirectedToLogin", "true");
      router.push("/");
    }
  }).catch(error => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("workId");
      sessionStorage.setItem("redirectedToLogin", "true");
      router.push("/");
    }
  })

  axios.get("http://localhost:5064/api/Absence/getAbsences").then(response => {
    absences.value = [];
    if (response.data !== undefined) {
      for (var i = 0; i < response.data.length; i++) {
        absences.value.push(response.data[i]);
      }
    }
  })
}

function showDialog(dialogName) {
  switch (dialogName) {
    case "arrHour":
      if (arrHour.value) {
        toast.value.add({
          severity: "info",
          summary: t("actionNotAvailable"),
          detail: t("arrivalExists"),
          closable: true,
          life: 3000
        })
      }else if(absenceType.value){
        toast.value.add({
          severity: "info",
          summary: t("actionNotAvailable"),
          detail: t("userAlreadyAbsent"),
          closable: true,
          life: 3000
        })
      }else {
        showDialogHoursIn.value = true;
      }
      break;
    case "deptHour":
      if (deptHour.value) {
        toast.value.add({
          severity: "info",
          summary: t("actionNotAvailable"),
          detail: t("departureExists"),
          closable: true,
          life: 3000
        })
      }else if(!arrHour.value) {
        toast.value.add({
          severity: "info",
          summary: t("actionNotAvailable"),
          detail: t("departureBeforeArrival"),
          closable: true,
          life: 3000
        })
        showDialogHoursOut.value = false;
      }else if(absenceType.value) {
        toast.value.add({
          severity: "info",
          summary: t("actionNotAvailable"),
          detail: t("userAlreadyAbsent"),
          closable: true,
          life: 3000
        })
      } else {
        showDialogHoursOut.value = true;
      }
      break;
    case "break":
      if (breakDuration.value) {
        toast.value.add({
          severity: "info",
          summary: t("actionNotAvailable"),
          detail: t("breakExists"),
          closable: true,
          life: 3000
        })
      } else if (!arrHour.value) {
        toast.value.add({
          severity: "info",
          summary: "Dejanje ni na voljo",
          detail: "Najprej morate vnesti uro prihoda.",
          closable: true,
          life: 3000
        })
        showDialogBreak.value = false;
      } else if(absenceType.value) {
        toast.value.add({
          severity: "info",
          summary: t("actionNotAvailable"),
          detail: t("userAlreadyAbsent"),
          closable: true,
          life: 3000
        })
      }
      else {

        showDialogBreak.value = true;
      }
      break;
      case "absence":
        if(arrHour.value || deptHour.value || breakDuration.value) {
          toast.value.add({
            severity: "info",
            summary: t("actionNotAvailable"),
            detail: t("userAlreadyWorking"),
            closable: true,
            life: 3000
          })
      } else if(absenceType.value) {
          toast.value.add({
            severity: "info",
            summary: t("actionNotAvailable"),
            detail: t("absenceAlreadyExists"),
            closable: true,
            life: 3000
          })
        } else {
          showDialogAbsence.value = true;
        }
  }
}

async function saveArrHour() {
  if (arrivalHour.value) {
    try {
      var startTime = new Date(arrivalHour.value).toISOString();
      startTime = startTime.substring(0, startTime.lastIndexOf(".")-2) + "00.000Z"
      const url = "http://localhost:5064/api/WorkTime/startWork";
      const data = new FormData();
      data.append("userId", sessionStorage.getItem("userId"));
      data.append("startTime", startTime);

      await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      toast.value.add({
        severity: "success",
        summary: t("saveSuccess"),
        detail: t("arrivalSaved"),
        closable: true,
        life: 3000
      });
      await getData();
      showDialogHoursIn.value = false;
    } catch (error) {
      toast.value.add({
        severity: "error",
        summary: t("saveError"),
        detail: t("saveErrorMessage"),
        closable: true,
        life: 3000
      });
      console.error(error);
    }
  } else {
    toast.value.add({
      severity: "error",
      summary: t("inputError"),
      detail: t("noTime"),
      closable: true,
      life: 3000
    });
    showDialogHoursIn.value = true;
  }
}

async function saveDeptHour() {
  if (departureHour.value) {
    try {
      var deptTime = new Date(departureHour.value).toISOString();
      deptTime = deptTime.substring(0, deptTime.lastIndexOf(".") -2) + "00.000Z";
      const url = "http://localhost:5064/api/WorkTime/endWork";
      const data = new FormData();
      data.append("workId", sessionStorage.getItem("workId"));
      data.append("endTime", deptTime);

      await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
      }).then(res => {
        if (res.data.error === "endBeforeBeginning") {
          toast.value.add({
            severity: "error",
            summary: t("inputError"),
            detail: t("endBeforeBeginning"),
            closable: true,
            life: 3000
          });
        } else {
          toast.value.add({
            severity: "success",
            summary: t("saveSuccess"),
            detail: t("departureSaved"),
            closable: true,
            life: 3000
          });
        }
      });
      await getData();
      showDialogHoursOut.value = false;
    } catch (error) {
      toast.value.add({
        severity: "error",
        summary: t("saveError"),
        detail: t("saveErrorMessage"),
        closable: true,
        life: 3000
      });
      console.error(error);
    }
  } else {
    toast.value.add({
      severity: "error",
      summary: "inputError",
      detail: t("noTime"),
      closable: true,
      life: 3000
    });
    showDialogHoursOut.value = true;
  }
}

async function saveBreak() {
  if (breakTimeBegin.value && breakTimeEnd.value) {
    if (breakTimeEnd.value <= breakTimeBegin.value) {
      toast.value.add({
        severity: "error",
        summary: t("inputError"),
        detail: t("breakEndBeforeBreakStart"),
        closable: true,
        life: 3000
      });
      return;
    }
    try {
      var startTime = new Date(breakTimeBegin.value).toISOString();
      startTime = startTime.substring(0, startTime.lastIndexOf(".")-2) + "00.000Z";
      var endTime = new Date(breakTimeEnd.value).toISOString();
      endTime = endTime.substring(0, endTime.lastIndexOf(".")-2) + "00.000Z";
      const url = "http://localhost:5064/api/WorkTime/addBreak";
      const data = new FormData();
      data.append("workId", sessionStorage.getItem("workId"));
      data.append("startTime", startTime);
      data.append("endTime", endTime);

      await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
      }).then(res => {
        if (res.data.error === "beforeWorkTime") {
          toast.value.add({
            severity: "error",
            summary: t("inputError"),
            detail: t("breakBeforeWorkTime"),
            closable: true,
            life: 3000
          });
        } else if(res.data.error === "afterWorkTime") {
          toast.value.add({
            severity: "error",
            summary: t("inputError"),
            detail: t("breakEndAfterWorkTime"),
            closable: true,
            life: 3000
          });
        } else {
          toast.value.add({
            severity: "success",
            summary: t("saveSuccess"),
            detail: t("breakSaved"),
            closable: true,
            life: 3000
          });
        }
      })
      getData();
      showDialogBreak.value = false;
    } catch (error) {
      toast.value.add({
        severity: "error",
        summary: t("saveError"),
        detail: t("saveErrorMessage"),
        closable: true,
        life: 3000
      });
      console.error(error);
      getData()
    }
  }
}

function closeDialog(dialogName) {
  switch (dialogName) {
    case "arrHour":
      showDialogHoursIn.value = false;
      arrivalHour.value = ''
      getData();
      break;
    case "deptHour":
      showDialogHoursOut.value = false;
      departureHourHour.value = ''
      getData();
      break;
    case "break":
      showDialogBreak.value = false;
      breakTimeBegin.value = '';
      breakTimeEnd.value = '';
      getData();
      break;
    case "absence":
      showDialogAbsence.value = false;
      selectedAbsence.value = '';
      getData();
      break;
  }
}

function saveAbsence(){
  const url = "http://localhost:5064/api/WorkTime/addAbsence";
  const data = new FormData();
  data.append("userId", sessionStorage.getItem("userId"));
  data.append("absenceId", selectedAbsence.value);
  axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }).then(res => {
    if (res.data.id != "") {
      showDialogAbsence.value = false;
      toast.value.add({
        severity: "success",
        summary: t("saveSuccess"),
        detail: t("saveAbsenceSuccess"),
        closable: true,
        life: 3000
      })
    } else {
      toast.value.add({
        severity: "error",
        summary: t("saveError"),
        detail: t("saveAbsenceFailure"),
        closable: true,
        life: 3000
      })
    }
  })
  getData();

}
onMounted(() => {
  getData();
})
</script>

<style scoped>
</style>