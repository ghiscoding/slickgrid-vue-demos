import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';

import Example1 from '../components/Example01.vue';
import Example2 from '../components/Example02.vue';
import Example3 from '../components/Example03.vue';
import Home from '../Home.vue';

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'root', redirect: '/example1' },
  { path: '/home', name: 'home', component: Home },
  { path: '/example1', name: '1- Basic Grid / 2 Grids', component: Example1 },
  { path: '/example2', name: '2- Single Custom Locale', component: Example2 },
  { path: '/example50', name: '3- Master/Detail Grids', component: Example3 },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
