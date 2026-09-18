import { defineClientConfig } from "vuepress/client";
import { defineAsyncComponent, h } from "vue";
import DeferredLayoutToggle from "./components/DeferredLayoutToggle.vue";
import ClickImagePreview from "./components/ClickImagePreview.vue";
import LazyMermaid from "./components/LazyMermaid.vue";
import GlobalUnlock from "./components/unlock/GlobalUnlock.vue";

const UnlockContent = defineAsyncComponent(
  () => import("./components/unlock/UnlockContent.vue"),
);

const CHUNK_LOAD_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i;

const getCurrentLocation = (): string =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

export default defineClientConfig({
  enhance({ app, router }) {
    app.component("Mermaid", LazyMermaid);
    app.component("UnlockContent", UnlockContent);

    router.onError((error, to) => {
      if (typeof window === "undefined") return;

      const message = error instanceof Error ? error.message : String(error);
      if (!CHUNK_LOAD_ERROR_PATTERN.test(message)) return;

      const target = to?.fullPath || getCurrentLocation();
      const reloadKey = `javaguide:chunk-reload:${target}`;

      if (window.sessionStorage.getItem(reloadKey) === "1") return;

      window.sessionStorage.setItem(reloadKey, "1");
      window.location.assign(target);
    });

    router.afterEach((to) => {
      if (typeof window === "undefined") return;
      window.sessionStorage.removeItem(`javaguide:chunk-reload:${to.fullPath}`);
    });
  },
  rootComponents: [
    () => h(DeferredLayoutToggle),
    () => h(GlobalUnlock),
    () => h(ClickImagePreview),
  ],
});
