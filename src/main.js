import '@/assets/styles.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css'
import 'vue-i18n'
import { createI18n } from 'vue-i18n'
import sl from '@/assets/locales/sl.json'
import en from '@/assets/locales/en.json'
import {definePreset} from "@primevue/themes";
import axios from 'axios'
import VueAxios from 'vue-axios'
import ToastService from 'primevue/toastservice';
import {Toast} from "primevue";
import ConfirmationService from 'primevue/confirmationservice';


let defaultLocale = 'sl';
const i18n = createI18n({
    locale: defaultLocale,
    legacy: false,
    messages: {
        en, sl
    }
});

const CustomPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{teal.50}',
            100: '{teal.100}',
            200: '{teal.200}',
            300: '{teal.300}',
            400: '{teal.400}',
            500: '{teal.500}',
            600: '{teal.600}',
            700: '{teal.700}',
            800: '{teal.800}',
            900: '{teal.900}',
            950: '{teal.950}'
        },
        colorScheme: {
            light: {
                surface: {
                    0: "#ffffff",
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617"
                },
            },
            dark: {
                surface: {
                    0: "#ffffff",
                    50: "#fafafa",
                    100: "#f4f4f5",
                    200: "#e4e4e7",
                    300: "#d4d4d8",
                    400: "#a1a1aa",
                    500: "#71717a",
                    600: "#52525b",
                    700: "#3f3f46",
                    800: "#27272a",
                    900: "#18181b",
                    950: "#09090b"
                },

            }
        }
    }
});
const app = createApp(App)
app.component("Toast", Toast);
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: CustomPreset,
        options:{
            darkModeSelector: '.darkMode',
        },
    },
    locale: sl
});
app.use(ToastService);
app.use(i18n);
app.use(VueAxios, axios);
app.use(ConfirmationService);

app.mount('#app')
