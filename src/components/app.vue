<template>
    <div id="q-app">
        <q-layout view="lHh Lpr lFf">
            <q-header elevated :class="headerColor">
                <q-toolbar>
                    <q-btn flat dense round icon="menu" aria-label="Menu" />
                    <q-toolbar-title>ASDA Logistics</q-toolbar-title>
                </q-toolbar>
            </q-header>

            <q-page-container>
                <img class="image" src="../static/images/asda-logo.png" alt="" height="150" width="300"/>
                <!-- <q-btn :color="mainColor" icon="info" label="Get data" @click="StoreData.check" /> -->
                <!-- <ds-icon @click="testMethod" :size="mainSize" :color="mainColor">info-circled</ds-icon> -->
                <div class="store-data">
                    <StoreData />
                </div>
            </q-page-container>
        </q-layout>
    </div>
</template>

<!-- no scope for app.vue, style defined here is global for the app -->
<style>
    .q-page-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }
    .body--light {
        background-color: white;
}

    .body--dark #q-app {
        background-color: rgb(27, 38, 31);
}
</style>

<script>
import { widget } from "@widget-lab/3ddashboard-utils";
// import { subscription } from "../plugins/tempModule";
import { useQuasar } from "quasar";
import StoreData from "./StoreData.vue";
// let { subscription } = await import("../plugins/tempModule");
import "@widget-lab/3ds-icons-vue3/out/static/3ds-icons.css";
// widget object is available everywhere !
export default {
    components: {
        StoreData
    },
    setup () {
    const $q = useQuasar();
    $q.dark.set(widget.getValue("nightMode"));
  },
    data() {
        return {
            mainColor: widget.getValue("mainColor"),
            mainSize: `${widget.getValue("size")}px`,
            headerColor: "bg-" + widget.getValue("mainColor") 
        };
    }
    // computed: {
    //     descGetter() {
    //         return subscription();
    //     }
    // },
};
</script>
