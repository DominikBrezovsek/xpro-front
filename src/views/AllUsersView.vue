<template>
  <div class="inline-flex h-screen w-screen">
    <Toast ref="toast" />
    <Navbar />
    <div class="flex-col w-full h-full p-4">
      <div class="inline-flex items-center justify-between w-full p-3" >
        <p class="text-lg font-semibold">{{t('allUsersTitle')}}</p>
        <Button :label="t('addUserLabel')" icon-pos="right" icon="pi pi-plus-circle" @click="openAddUser"/>
      </div>
      <DataTable class="m-auto p-3" :value="cols" size="small" v-model:editing-rows="editedRow"
                   edit-mode="row"  dataKey="id" @row-edit-save="onRowEditSave" show-gridlines paginator :rows="10"
                   :rows-per-page-options="[5, 10, 15, 20]" border v-model:filters="filters"
                    filterDisplay="row" sortMode="multiple"  removableSort>
          <template #paginatorstart>
            <Button type="button" icon="pi pi-refresh" @click="getData()" text />
          </template>
        <Column field="name" :header="t('allUsersTable.nameHeader')" sortable>
          <template #editor="{data, field}">
            <InputText id="name" v-model="data['name']" placeholder="Janez" fluid />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" :placeholder="t('allUsersTable.nameFilter')" />
          </template>
        </Column>
          <Column field="surname" :header="t('allUsersTable.surnameHeader')" sortable >
            <template #editor="{data, field}">
              <InputText id="surname" v-model="data['surname']" placeholder="Novak"  fluid />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" :placeholder="t('allUsersTable.surnameFilter')" />
            </template>
          </Column>
          <Column field="phone" :header="t('allUsersTable.phoneHeader')">
            <template #editor="{data, field}">
              <InputMask id="phone" v-model="data['phone']" placeholder="(386) 12/345-678" mask="(999) 99/999-999" fluid/>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" :placeholder="t('allUsersTable.phoneFilter')" />
            </template>
          </Column>
          <Column field="email" :header="t('allUsersTable.emailHeader')" :sortable="true">
            <template #editor="{data, field}">
              <InputText id="email" v-model="data['email']" placeholder="janez.novak@example.com" fluid/>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" :placeholder="t('allUsersTable.emailFilter')" />
            </template>
          </Column>
        <Column field="active" :header="t('allUsersTable.statusHeader')">
          <template #editor="{data, field}">
            <Select v-model="data['active']" :options="statuses" optionLabel="name" option-value="value" :placeholder="t('allUsersTable.statusPlaceholder')" />
         </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model="filterModel.value" @change="filterCallback()" :options="statuses" optionValue="value" optionLabel="name" :placeholder="t('allUsersTable.statusPlaceholder')" style="min-width: 12rem" :showClear="true" />
          </template>
        </Column>
        <Column :header="t('allUsersTable.edit')" :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        <Column :header="t('allUsersTable.delete')" field="id">
          <template #body="{data}">
            <Button @click="deleteUser(data['id'])" :label="t('allUsersTable.delete')" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog :header="t('dashboardHourOutHeaderString')" v-model:visible="showAddUser" modal>
        <span class="flex flex-col gap-6 p-5">
          <FloatLabel variant="on">
            <label for="name">{{ t('createUser.name') }}</label>
            <InputText id="name" v-model="name" />
          </FloatLabel>
          <FloatLabel variant="on">
            <label for="surname">{{ t('createUser.surname') }}</label>
            <InputText id="surname" v-model="surname" />
          </FloatLabel>
          <FloatLabel variant="on">
            <label for="email">{{ t('createUser.email') }}</label>
            <InputText id="email" v-model="email" />
          </FloatLabel>
          <FloatLabel variant="on">
            <label for="phone">{{ t('createUser.phone') }}</label>
            <InputMask id="phone" v-model="phone" mask="(999) 99/999-999" />
          </FloatLabel>
          <FloatLabel variant="on">
            <label for="position">{{ t('createUser.position') }}</label>
            <InputText id="position" v-model="postition" />
          </FloatLabel>
          <FloatLabel variant="on">
            <label for="position">{{ t('createUser.username') }}</label>
            <InputText id="position" v-model="username" />
          </FloatLabel>
          <FloatLabel variant="on">
            <label for="position">{{ t('createUser.password') }}</label>
            <InputText id="position" v-model="password" type="password"/>
          </FloatLabel>
          <Select v-model="emplType" :placeholder=" t('createUser.emplType')" :options="employmentTypes" option-value="value" option-label="name"/>
          <FloatLabel variant="on" v-if="emplType==='other'">
            <label for="emplNote">{{ t('createUser.emplNote') }}</label>
            <InputText id="emplNote" v-model="emplNote"/>
          </FloatLabel>
          <Select v-model="role" :placeholder="t('createUser.role')" :options="roleOptions" option-value="value" option-label="name"/>
          <Select v-model="active" :placeholder="t('createUser.active')" :options="activeOptions" option-value="value" option-label="name"/>
        </span>
    <div class=" w-full inline-flex items-center justify-between gap-2">
      <Button :label=" t('saveLabel')" icon="pi pi-save" @click="addUser()"/>
      <Button :label="t('rejectLabel')" icon="pi pi-times" @click="showAddUser = false"/>
    </div>
  </Dialog>
</template>


<script setup>
import Navbar from "@/components/Navbar.vue";
import {
  DataTable,
  Toast,
  Column,
  Button,
  InputText,
  InputMask,
  Select,
  useConfirm,
  Dialog,
  FloatLabel
} from "primevue";
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import axios from "axios";
import { FilterMatchMode } from '@primevue/core/api';
const {t} = useI18n()
const toast = ref('null')
let cols = ref([]);
const editedRow = ref([]);
const showAddUser = ref(false);
const statuses = [{name: t('activeOptions.active'), value: "Aktiven"}, {name: t('activeOptions.inactive'), value: "Neaktiven"}]
const confirm = useConfirm();
const name = ref(null);
const surname = ref(null);
const email = ref(null);
const phone = ref(null);
const postition = ref(null);
const username = ref(null);
const password = ref(null);
const emplType = ref(null);
const emplNote = ref(null);
const role = ref(null);
const active = ref(null)

const employmentTypes = [
  {name: t('fullTimeLabel'), value: "nedolocenCas"},
  {name: t('partTimeLabel'), value: "dolocenCas"},
  {name: t('studentLabel'), value: "student"},
  {name: t('authorLabel'), value: "avtorska"},
  {name: t('SPLabel'), value: "sp"},
  {name: t('otherLabel'), value: "other"},
  ]
const activeOptions = [
  {name: t('activeOptions.active'), value: true},
  {name: t('activeOptions.inactive'), value: false},
]
const roleOptions = [
  {name: t('roleOptions.user'), value: "user"},
  {name: t('roleOptions.admin'), value: "admin"},
]

const filters = ref({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      surname: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
      email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      active: { value: "Aktiven", matchMode: FilterMatchMode.EQUALS}
    })

function onRowEditSave(row){
  var userId = row.newData['id']
  var name = row.newData['name'];
  var surname = row.newData['surname']
  var email = row.newData['email']
  var phone = row.newData['phone']
  var active = row.newData['active']
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
  const url = "http://localhost:5064/api/User/updateUser"
  const data = new FormData();
  data.append('userId', userId)
  data.append('name', name)
  data.append('surname', surname)
  data.append('email', email)
  data.append('phone', phone)
  data.append('active', active)

  if (!regex.test(email)) {
    toast.value.add({
      severity: "error",
      summary: t('saveError'),
      detail: t('emailFormatError'),
      closable: true,
      life: 3000
    })
    return
  }

  axios.post(url, data, {
    headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
  }).then(res => {
    if(res.data.success) {
      toast.value.add({
        severity: "success",
        summary: t('saveSuccess'),
        detail: t('userSaved'),
        closable: true,
        life: 3000
      })
      getData();
    }
  })
}

function getData() {
  cols.value = []
  const url = "http://localhost:5064/api/User/getAllUsers"
  axios.get(url, {
    headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
  }).then(res => {
    if (res.data) {
      for (let i = 0; i < res.data.length; i++) {
        res.data[i].active = res.data[i].active == true ? "Aktiven" : "Neaktiven";
        cols.value[i] = res.data[i]
      }
    }
  })
}

function deleteUser(id){
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
      const url = "http://localhost:5064/api/User/deleteUser"
      const data = new FormData
      data.append('userId', id)
      axios.post(url, data, {
        headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
      }).then(res => {
        if (res.data.success) {
          toast.value.add({
            severity: "success",
            summary: t('saveSuccess'),
            detail: t('userDeleted'),
            closable: true,
            life: 3000
          })
          getData();
        }
      })
    },
  })
}

function openAddUser(){
  showAddUser.value = true
}
function addUser() {
  if (!name.value || !surname.value || !email.value || !phone.value || !postition.value || !role.value &&
      (active.value !== true || active.value !== false) || !password.value || !username.value) {
    toast.value.add({
      severity: "error",
      summary: t('inputError'),
      detail: t('saveOptions.emptyFields'),
      closable: true,
      life: 3000
    })
    showAddUser.value = true
    return
  }
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!regex.test(email.value)) {
    toast.value.add({
      severity: "error",
      summary: t('inputError'),
      detail: t('emailFormatError'),
      closable: true,
      life: 3000
    })
    showAddUser.value = true
    return;
  }
  const data = new FormData()
  const url = "http://localhost:5064/api/User/createUser"
  data.append('name', name.value)
  data.append('surname', surname.value)
  data.append('email', email.value)
  data.append('phone', phone.value)
  data.append('position', postition.value)
  data.append('username', username.value)
  data.append('password', password.value)
  data.append('role', role.value)
  data.append('empType', emplType.value)
  if (emplType.value === "other" && !emplNote.value) {
    toast.value.add({
      severity: "error",
      summary: t('inputError'),
      detail: t('saveOptions.emptyFields'),
      closable: true,
      life: 3000
    })
    showAddUser.value = true
    return;
  }else {
    data.append('empType', emplNote.value)
  }
  data.append('active', active.value)


  axios.post(url, data, {
    headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
  }).then(res => {
    if (res.data.error === "emailExists") {
      toast.value.add({
        severity: "error",
        summary: t('inputError'),
        detail: t('saveOptions.emailExists'),
        closable: true,
        life: 3000
      })
      showAddUser.value = true
    } else if(res.data.error === "usernameExists"){
      toast.value.add({
        severity: "error",
        summary: t('inputError'),
        detail: t('saveOptions.userExists'),
        closable: true,
        life: 3000
      })
      showAddUser.value = true
    } else {
      getData()
      showAddUser.value = false
    }
  })
}
onMounted(() => {
  getData();
})
</script>