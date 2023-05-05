import { widget, disableDefaultCSS, onVisibilityChange, requirejs } from "@widget-lab/3ddashboard-utils";
import x3DSIconVue from "@widget-lab/3ds-icons-vue3";
import { createApp } from "vue";
import App from "./components/app.vue";
import { store } from "./store";
import { Quasar, useQuasar } from "./plugins/quasar";

function start() {
    disableDefaultCSS(true);

    window.title = "Widget Template Vue";
    widget.setTitle(window.title);

    const app = createApp(App);

    app.use(Quasar, { plugins: [useQuasar] });
    app.use(store);
    app.use(x3DSIconVue);
    app.mount("app");

    requirejs(["DS/PlatformAPI/PlatformAPI"], (/* PlatformAPI */) => {
        // use 3DDashboard APIs
    });

    onVisibilityChange((/* visibility  */) => {
        // widget (or fullpage) visibility has changed
        // you can enable/disable periodic data refresh based on visibility
    });
}

widget.addEvent("onLoad", () => {
    start();
});

widget.addEvent("onRefresh", () => {
    window.location.reload();
});
