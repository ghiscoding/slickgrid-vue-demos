import '@slickgrid-universal/common/dist/styles/sass/slickgrid-theme-bootstrap.scss';
import 'bootstrap';
import './styles.scss';

import { createApp } from 'vue';

import App from './App.vue';
import { router } from './router/index.js';

createApp(App).use(router).mount('#app');
