<template>
  <div class="inline-flex h-screen w-screen">
    <Navbar />
    <Toast ref="toast" />
    <div class="flex-col w-full h-full p-4">
      <div class="inline-flex items-center justify-between w-full p-3" >
        <p class="text-lg font-semibold">Seznam vseh odsotnosti</p>
        <Button :label="t('addAbsenceLabel')" icon-pos="right" icon="pi pi-plus-circle" @click="addAbsenceVisible = true"/>
      </div>
      <DataTable class="m-auto p-3" :value="cols" size="small" v-model:editing-rows="editedRow"
                 edit-mode="row"  dataKey="id" @row-edit-save="onRowEditSave" show-gridlines paginator :rows="10"
                 :rows-per-page-options="[5, 10, 15, 20]" border>
        <Column field="absenceName" header="Vrsta odsotnosti">
          <template #editor="{data, field}">
            <InputText id="absenceName" v-model="data['absenceName']" placeholder="Letni dopust" fluid />
          </template>
        </Column>
        <Column header="Uredi" :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        <Column header="Izbriši" field="id">
          <template #body="{data}">
            <Button @click="deleteAbsence(data['absenceId'])" label="Izbriši" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <Dialog v-model:visible="addAbsenceVisible" header="Dodaj vrsto odsotnosti">
    <span class="flex flex-col gap-6 p-5">
    <FloatLabel variant="on">
      <label for="absenceName">Vrsta odsotnosti</label>
      <InputText id="absenceName" v-model="absenceName" />
    </FloatLabel>
    </span>
    <div class=" w-full inline-flex items-center justify-between gap-2">
      <Button :label=" t('saveLabel')" icon="pi pi-save" @click="addAbsence()"/>
      <Button :label="t('rejectLabel')" icon="pi pi-times" @click="addAbsenceVisible = false"/>
    </div>
  </Dialog>
</template>

<script setup>

import Navbar from "@/components/Navbar.vue";
import {Button, DataTable, Toast, Column, InputText, FloatLabel, Dialog, useConfirm} from "primevue";
import {useI18n} from "vue-i18n";
import {onMounted, ref} from "vue";
import axios from "axios";
const {t} = useI18n()
const toast = ref(null)
const confirm = useConfirm();

const cols = ref([]);
const editedRow = ref([]);
const absenceName = ref();
const addAbsenceVisible = ref(false)


function getData() {
  cols.value = []
  const url = "http://localhost:5064/api/Absence/getAbsences"
  axios.get(url, {
    headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
  }).then(res => {
    if (res.data) {
      for (let i = 0; i < res.data.length; i++) {
        cols.value[i] = res.data[i]
      }
    }
  })
}

function onRowEditSave(row) {
  if (!row.newData['absenceName']) {
    toast.value.add({
      severity: "error",
      summary: t('saveError'),
      detail: "Polje ne sme biti prazno",
      closable: true,
      life: 3000
    })
    return
  }
  const url = "http://localhost:5064/api/Absence/updateAbsence"
  var absenceName = row.newData['absenceName']
  var absenceId = row.newData['absenceId']
  var data = new FormData()
  data.append('absenceName', absenceName)
  data.append('absenceId', absenceId)
  axios.post(url, data, {
    headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
  }).then(() => {
    getData();
  })
}
function deleteAbsence(absenceId) {
  confirm.require({
    header: t('userDeleteConfirm'),
    icon: "pi pi-question",
    message: t('userDeleteMessage'),
    acceptLabel: t('acceptLabel'),
    rejectLabel: t('cancelLabel'),
    acceptIcon: "pi pi-check-circle",
    rejectIcon: "pi pi-times-circle",
    blockScroll: true,
    accept: () => {
      const url = "http://localhost:5064/api/Absence/deleteAbsence"
      var data = new FormData()
      data.append('absenceId', absenceId)
      axios.post(url, data, {
        headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
      }).then(() => {
        toast.value.add({
          severity: "success",
          summary: t('saveSuccess'),
          detail: t('absenceDeleted'),
          closable: true,
          life: 3000
        })
        getData();
      })
    }
  })

}

function addAbsence() {
  if (!absenceName.value) {
    toast.value.add({
      severity: "error",
      summary: t('saveError'),
      detail: "Polje ne sme biti prazno",
      closable: true,
      life: 3000
    })
    addAbsenceVisible.value = true;
  }
  const url = "http://localhost:5064/api/Absence/createAbsence"
  var data = new FormData()
  data.append('absenceName', absenceName.value)
  axios.post(url, data, {
    headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
  }).then(() => {
    toast.value.add({
      severity: "success",
      summary: t('saveSuccess'),
      detail: t('absenceDeleted'),
      closable: true,
      life: 3000
    })
    addAbsenceVisible.value = false;
    getData();
  })
}
onMounted(() => {
  getData();
})
</script>