import { defineClientConfig } from "vuepress/client";
import { h } from "vue";
import LangSwitch from "./LangSwitch.vue";

export default defineClientConfig({
  rootComponents: [() => h(LangSwitch)],
});
