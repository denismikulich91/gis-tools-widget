import { widget, disableDefaultCSS, onVisibilityChange, requirejs } from "@widget-lab/3ddashboard-utils";
import x3DSIconVue from "@widget-lab/3ds-icons-vue3";
import { createApp } from "vue";
import App from "./components/app.vue";
import { store } from "./store";
import { Quasar } from "./plugins/quasar";
function start() {
    disableDefaultCSS(true);

    window.title = "Widget Template Vue";
    widget.setTitle(window.title);

    const app = createApp(App);

    // app.use(Quasar, { plugins: [useQuasar] });
    app.use(Quasar, {
        config: {
          brand: {
            primary: "#005685",
            secondary: "#42a2da",
            accent: "#F2F2F2",
      
            dark: "#1d1d1d",
            "dark-page": "#1a1515",
      
            positive: "#64B83F",
            negative: "#ea4f37",
            info: "#31CCEC",
            warning: "#e87b00"
          }
        }
      }),
    app.use(store);
    app.use(x3DSIconVue);
    app.mount("App");

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
