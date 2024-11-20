<template>
  <div class="h-screenflex flex-col justify-between">
    <ConfirmDialog></ConfirmDialog>
    <Menu :model="userItems" mode="vertical" class="md:w-60 h-screen flex flex-col justify-between pt-5 pb-5">
      <template #start>
        <span class="inline-flex items-center gap-1 px-2 py-2">
          <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
                <path
                    d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
                    fill="var(--p-primary-color)"></path>
                <path
                    d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
                    fill="var(--p-text-color)"></path>
            </svg>
            <span class="text-xl font-semibold">XPRO<span class="text-primary">DELOVNIK</span></span>
        </span>
      </template>
      <template #item="{ item, props }">
        <router-link v-if="item.role == userRole" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-bind="props.action" @click="confirmAction(item.label)" aria-hidden="false">
            <span :class="item.icon"/>
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
      <template #end>
        <span class="relative overflow-hidden w-full border-0 bg-transparent flex flex-col items-center p-2 pl-4 gap-1">
          <Avatar :image="profileImage" shape="circle" size="xlarge"/>
        <span class="relative overflow-hidden w-full border-0 bg-transparent flex  flex-col items-start p-2 pl-4 gap-1">
          <span>{{ t('navbarLoggedInAs') }}</span>
          <span class="inline-flex items-center gap-2">
                <span class="font-bold">{{ name }}</span>
                <span class="font-bold">{{ surname }}</span>
            </span>
        </span>
        </span>
        <div
            class="theme-toggler mt-4 flex gap-2 items-center justify-evenly p-2 pl-4 border border-primary w-10/12 m-auto rounded-md">
          <Button @click="changeMode('light')" :severity="lightMode"><i class="pi pi-sun !text-lg"></i></Button>
          <Button @click="changeMode('system')" :severity="system"><i class="pi pi-desktop !text-lg"></i></Button>
          <Button @click="changeMode('dark')" :severity="darkMode"><i class="pi pi-moon !text-lg"></i></Button>

        </div>
      </template>
    </Menu>

  </div>
</template>
<script setup>
import {Menu, useConfirm, ConfirmDialog, Avatar, Button} from "primevue";
import {useI18n} from "vue-i18n";
import router from "@/router/index.js";
import axios from "axios";
import {onMounted, ref} from "vue";

let name = ref('');
let surname = ref('');
const {t} = useI18n();
const confirm = useConfirm();
const lightMode = ref('secondary');
const darkMode = ref('secondary');
const system = ref('primary');
const profileImage = ref();
const userRole = ref();

let userItems = [
  {
    label: t('navbarCurrentDayLabel'),
    icon: "pi pi-clock",
    route: "/dashboard",
    role: "user"
  },
  {
    label: t('navbarMyHoursLabel'),
    icon: "pi pi-calendar",
    route: "/my-hours",
    role: "user"
  },
  {
    label: t('navbarSettingsLabel'),
    icon: "pi pi-cog",
    route: "/settings",
    role: "user"
  },
  {
    label: t('navbarLogoutLabel'),
    icon: "pi pi-sign-out",
    route: "/",
    role: "user"
  },
  {
    label: t('navbarCurrentDayLabel'),
    icon: "pi pi-clock",
    route: "/dashboard",
    role: "admin"
  },
  {
    label: t('navbarMyHoursLabel'),
    icon: "pi pi-calendar",
    route: "/my-hours",
    role: "admin"
  },
  {
    label: t('navbarSettingsLabel'),
    icon: "pi pi-cog",
    route: "/settings",
    role: "admin"
  },
  {
    label: t('navbarEditUsersLabel'),
    icon: "pi pi-users",
    route: "/users",
    role: "admin"
  },
  {
    label: t('navbarLogoutLabel'),
    icon: "pi pi-sign-out",
    route: "/",
    role: "admin"
  },
]

function confirmAction(label) {

  if (label === t('navbarLogoutLabel')) {
    confirm.require({
      header: t('logoutConfirmHeader'),
      icon: "pi pi-question",
      message: t('logoutConfirmMessage'),
      acceptLabel: t('acceptLabel'),
      rejectLabel: t('cancelLabel'),
      acceptIcon: "pi pi-check-circle",
      rejectIcon: "pi pi-times-circle",
      blockScroll: true,
      accept: () => {
        // Perform logout action here, for example:
        sessionStorage.setItem("isAuthenticated", "false");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        router.push('/');
      },
      reject: () => {
        // Optional reject action, if you want any specific behavior on cancel
        console.log('Logout cancelled');
      },
    });
  } else {
    const item = userItems.find(item => item.label === label);
    if (item && item.route) {
      router.push(item.route);
    }
  }
}

function loadData() {
  const loginUrl = "http://localhost:5064/api/User/GetUser";
  const data = new FormData();
  data.append("id", sessionStorage.getItem("userId"));
  axios.post(
      loginUrl,
      data,
      {
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
        }
      }
  ).then((response) => {
    name.value = response.data.name;
    surname.value = response.data.surname;
    if (response.data.profileImage) {
      profileImage.value = `data:image/*;base64,${response.data.profileImage}`
    }  else {
      profileImage.value = "https://seccdn.libravatar.org/avatar/40f8d096a3777232204cb3f796c577b7?d=retro&f=y"
    }
    userRole.value = response.data.role
  }).catch((error) => {
    if (error.status === 401 && error.response) {
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("workId");
      sessionStorage.setItem("redirectedToLogin", "true");
      router.push("/");
    }
  });
}

function checkLoginStatus() {
  const isAuthenticated = sessionStorage.getItem("isAuthenticated");
  const token = sessionStorage.getItem("token");
  if (isAuthenticated !== "true" || token === undefined) {

    localStorage.setItem("redirectedToLogin", "true");
    console.log("Set redirectedToLogin to" + localStorage.getItem("redirectedToLogin"))
    router.push('/');
    return false;
  }
  return true;
}

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


onMounted(() => {
  checkLoginStatus();
    loadMode();
    loadData();
});
</script>