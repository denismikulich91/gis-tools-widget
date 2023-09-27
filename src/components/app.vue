<template>
    <div class="container">
        <q-list bordered>
            <q-expansion-item
                group="openRouteWidgets"
                icon="explore"
                label="Create isochrone"
                header-class="bg-primary text-white"
                :default-opened="getActiveWidget==='isochrone'"
            >
                <q-card>
                    <q-card-section>
                        <isochrone-widget />
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-separator />
            <q-expansion-item
                group="openRouteWidgets"
                icon="place"
                label="Get directions"
                header-class="bg-positive text-white"
                :default-opened="getActiveWidget==='routes'"
            >
                <q-card>
                    <q-card-section>
                        <route-widget />
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-separator />
            <q-expansion-item
                group="openRouteWidgets"
                icon="sunny"
                label="Get weather"
                header-class="bg-primary text-white"
                :default-opened="getActiveWidget==='weather'"
            >
                <q-card>
                    <q-card-section>
                        <weather-widget />
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-expansion-item
                group="openRouteWidgets"
                icon="build"
                label="Utilities"
                header-class="bg-positive text-white"
                :default-opened="getActiveWidget==='weather'"
            >
                <q-card>
                    <q-card-section>
                        <utility-widget />
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-separator />
        </q-list>     
    </div>
</template>

<style>
/* Styles to set if day/night mode toggled */
.body--light {
  background-color: white;
}
.body--dark #q-app {
  background-color: rgb(27, 38, 31);
}
</style>

<script>
import IsochroneWidget from "./isochroneWidget.vue";
import { useQuasar } from "quasar";
import RouteWidget from "./routeWidget.vue";
import WeatherWidget from "./weatherWidget.vue";
import UtilityWidget from "./utilityWidget.vue";
import { widget } from "@widget-lab/3ddashboard-utils";
export default {
  components: {
    IsochroneWidget,
    RouteWidget,
    WeatherWidget,
    UtilityWidget
  },
  setup () {
    const $q = useQuasar();
    $q.dark.set(widget.getValue("nightMode"));
  },
  computed: {
    getActiveWidget() {
      return widget.getValue("defaultWidget");
    }
  }
};
</script>
