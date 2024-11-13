<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20 login">
  <Toast ref="toast"/>
    <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-border w-full lg:w-6/12 mx-auto">
      <div class="text-center mb-8">
        <svg class="mb-4 mx-auto fill-surface-600 dark:fill-surface-200 h-16" viewBox="0 0 30 32" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M20.7207 6.18211L14.9944 3.11148L3.46855 9.28678L0.579749 7.73444L14.9944 0L23.6242 4.62977L20.7207 6.18211ZM14.9996 12.3574L26.5182 6.1821L29.4216 7.73443L14.9996 15.4621L6.37724 10.8391L9.27337 9.28677L14.9996 12.3574ZM2.89613 16.572L0 15.0196V24.2656L14.4147 32V28.8953L2.89613 22.7132V16.572ZM11.5185 18.09L0 11.9147V8.81001L14.4147 16.5376V25.7904L11.5185 24.2312V18.09ZM24.2086 15.0194V11.9147L15.5788 16.5377V31.9998L18.475 30.4474V18.09L24.2086 15.0194ZM27.0969 22.7129V10.3623L30.0004 8.81V24.2653L21.3706 28.895V25.7904L27.0969 22.7129Z"
          />
        </svg>

        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ t('loginHello') }}</div>
      </div>

      <div>
        <FloatLabel variant="on" class="mb-4">
          <label for="username" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">{{
              t('username')
            }}</label>
          <InputText id="username" type="text" class="w-full" v-model="username" />
        </FloatLabel>
        <FloatLabel variant="on" class="mb-4">
          <label for="password" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">{{
              t('password')
            }}</label>
          <InputText id="password" type="password" class="w-full" v-model="password" v-on:keydown.enter="Login()"/>
        </FloatLabel>
        <div class="flex items-center justify-end mb-12">
          <a class="font-medium no-underline ml-2 text-primary text-right cursor-pointer">{{ t('forgottenPassword') }}</a>
        </div>

        <Button :label="t('signIn')" icon="pi pi-arrow-right" class="w-full" icon-pos="right" @click.native="Login"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {InputText, Button, Checkbox, FloatLabel, Toast, useToast} from "primevue";
import {onMounted, ref} from 'vue';
import {useI18n} from 'vue-i18n'
import axios from "axios";
import router from "@/router/index.js";
const {t} = useI18n()
let username, password;
const toast = ref(null);


function Login() {
  const data = new FormData();
  data.append('username', username);
  data.append('password', password);
  if (username === undefined || password === undefined || password === "" || username === "") {
    toast.value.add({
      severity: "warn",
      summary: t('loginEmptyFieldHeader'),
      detail: t('loginEmptyFieldMessage'),
      closable: true,
      life: 3000
    })
  } else {
    const loginUrl = "http://localhost:5064/api/User/login"
    axios.post(
        loginUrl,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }

    ).then((response) => {
      console.log(response.data.id);
      if (response.data.id !== undefined) {
        sessionStorage.setItem("userId", response.data.id);
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("token", response.data.token);
        router.push('/dashboard');
      } else {
        toast.value.add({
          severity: "error",
          summary: t('loginErrorHeader'),
          detail: t('loginErrorMessage'),
          closable: true,
          life: 3000
        });
      }
    }).catch((error) => {
      console.log(error);
    });
  }
}

onMounted(() => {
  if (sessionStorage.getItem("redirectedToLogin") == "true") {
    toast.value.add({
      severity: "warn",
      summary: t('redirectedToLoginTitle'),
      detail: t('redirectedToLoginDesc'),
      closable: true,
      life: 3000
    });
    sessionStorage.setItem("redirectedToLogin", "false");
  }
});
</script>