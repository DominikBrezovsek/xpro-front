<template>
  <div class="px-6 py-20 md:px-12 lg:px-20 login">
  <Toast ref="toast"/>
    <div class="p-6 shadow shadow-primary rounded-border w-full lg:w-6/12 mx-auto">
      <div class="text-center mb-8">
        <svg class="mb-4 mx-auto fill-primary-emphasis-alt h-16" viewBox="0 0 30 32" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M20.7207 6.18211L14.9944 3.11148L3.46855 9.28678L0.579749 7.73444L14.9944 0L23.6242 4.62977L20.7207 6.18211ZM14.9996 12.3574L26.5182 6.1821L29.4216 7.73443L14.9996 15.4621L6.37724 10.8391L9.27337 9.28677L14.9996 12.3574ZM2.89613 16.572L0 15.0196V24.2656L14.4147 32V28.8953L2.89613 22.7132V16.572ZM11.5185 18.09L0 11.9147V8.81001L14.4147 16.5376V25.7904L11.5185 24.2312V18.09ZM24.2086 15.0194V11.9147L15.5788 16.5377V31.9998L18.475 30.4474V18.09L24.2086 15.0194ZM27.0969 22.7129V10.3623L30.0004 8.81V24.2653L21.3706 28.895V25.7904L27.0969 22.7129Z"
          />
        </svg>

        <div class="text-3xl font-medium mb-4">{{ t('loginHello') }}</div>
      </div>

      <div>
        <FloatLabel variant="on" class="mb-4">
          <label for="username" class="text-surface-900 font-medium mb-2 block">{{
              t('username')
            }}</label>
          <InputText id="username" type="text" class="w-full" v-model="username"/>
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
    <div class="mt-4 absolute top-0 right-4 flex gap-2 items-center justify-evenly p-2 border border-primary w-1/12 m-auto rounded-md">
      <Button @click="changeMode('light')" :severity="lightMode"><i class="pi pi-sun !text-lg"></i></Button>
      <Button @click="changeMode('system')" :severity="system"><i class="pi pi-desktop !text-lg"></i></Button>
      <Button @click="changeMode('dark')" :severity="darkMode"><i class="pi pi-moon !text-lg"></i></Button>
    </div>
  </div>
</template>

<script setup>
import {InputText, Button, Checkbox, FloatLabel, Toast, useToast} from "primevue";
import {onBeforeMount, onMounted, ref} from 'vue';
import {useI18n} from 'vue-i18n'
import axios from "axios";
import router from "@/router/index.js";
const {t} = useI18n()
let username, password;
const toast = ref(null);
const lightMode = ref('secondary');
const darkMode = ref('secondary');
const system = ref('primary');
function changeMode(mode) {
  switch (mode) {
    case "dark":
      localStorage.setItem("colorMode", "dark");
      loadMode();
      break;
    case "system":
      localStorage.setItem("colorMode", "system");
      loadMode();
      break;
    case "light":
      localStorage.setItem("colorMode", "light");
      loadMode();
      break;
    default:
      localStorage.setItem("colorMode", "system");
      loadMode();
      break;
  }
}

function loadMode() {
  const mode = localStorage.getItem("colorMode");
  if (mode === null) {
    localStorage.setItem("colorMode", "system");
  }
  switch (mode) {
    case "dark":
      darkMode.value = "primary";
      system.value = "secondary";
      lightMode.value = "secondary";
      if (!document.documentElement.classList.contains("darkMode")) {
        document.documentElement.classList.add('darkMode');
      }
      break;
    case "system":
      system.value = "primary";
      lightMode.value = "secondary";
      darkMode.value = "secondary";
      const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)");
      if (systemIsDark.matches) {
        if (!document.documentElement.classList.contains('darkMode')) {
          document.documentElement.classList.add('darkMode');
        }
      } else {
        if (document.documentElement.classList.contains('darkMode')) {
          document.documentElement.classList.remove('darkMode');
        }
      }
      break;
    case "light":
      lightMode.value = "primary";
      darkMode.value = "secondary";
      system.value = "secondary";
      if (document.documentElement.classList.contains('darkMode')) {
        document.documentElement.classList.remove('darkMode');
      }
      break;
  }
}


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
      }
      else {
        toast.value.add({
          severity: "error",
          summary: t('loginUserErrorHeader'),
          detail: t('loginUserErrorMessage'),
          closable: true,
          life: 3000
        });
      }
    }).catch((error) => {
      toast.value.add({
        severity: "error",
        summary: t('loginErrorHeader'),
        detail: t('loginErrorMessage', [error]),
        closable: true,
        life: 10000
      });
    });
  }
}

onMounted(() => {
  loadMode();
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
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("isAuthenticated");
  sessionStorage.removeItem("token");
});

onBeforeMount(() => {
  const mode = localStorage.getItem("colorMode") || "system";
  if (mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("darkMode");
  } else {
    document.documentElement.classList.remove("darkMode");
  }
})
</script>