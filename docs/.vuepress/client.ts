import { defineClientConfig } from "vuepress/client";
import { h } from "vue";
import LayoutToggle from "./components/LayoutToggle.vue";

export default defineClientConfig({
  rootComponents: [
    // 将切换按钮添加为根组件，会在所有页面显示
    () => h(LayoutToggle),
  ],
});
