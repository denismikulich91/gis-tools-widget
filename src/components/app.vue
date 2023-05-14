<template>
    <div class="q-pa-md example-column-row-width">
        <q-list bordered>
            <q-expansion-item
                group="openRouteWidgets"
                icon="explore"
                label="Create isochrone"
                header-class="bg-primary text-white"
                default-opened
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
            >
        <q-card>
          <q-card-section>
            <route-widget />
          </q-card-section>
        </q-card>
      </q-expansion-item>
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
import IsochroneWidget from './isochroneWidget.vue';
import RouteWidget from './routeWidget.vue';
export default {
    components: {
        IsochroneWidget,
        RouteWidget
            },
}
</script>
