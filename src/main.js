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


let defaultLocale = 'en';
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
        }
    }
});
const app = createApp(App)
app.component("Toast", Toast);
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: CustomPreset
    }
});
app.use(ToastService);
app.use(i18n);
app.use(VueAxios, axios);
app.use(ConfirmationService);

app.mount('#app')
