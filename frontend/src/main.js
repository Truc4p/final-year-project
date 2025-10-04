import "./assets/index.css"; // Import Tailwind CSS
import './assets/base.css'; // Import custom styles
import './assets/styles.css'; // Import our new design system

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import i18n from './i18n'; // Import the i18n configuration

createApp(App)
  .use(router)
  .use(i18n) // Use the i18n instance
  .mount("#app");