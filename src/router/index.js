import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {computed} from "vue";
const isAuthenticated =  sessionStorage.getItem('isAuthenticated');
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/my-hours',
      name: 'MyHours',
      component: () => import('../views/TotalHoursView.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/SettingsView.vue'),
    }
  ],
})
router.beforeEach((to, from, next) => {
  if (isAuthenticated !== "true" && to.name !== "Login" && from.name !== "Login") {
    sessionStorage.setItem('redirectedToLogin', "true");
    return next({name: "Login"}, {message: "notLoggedIn"});
  }
  return next();
})

export default router
