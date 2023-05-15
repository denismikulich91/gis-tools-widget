<template>
  <div class="col q-pa-xs">   
    <q-input square filled v-model="formattedFrom" label="From" :dense="dense" label-color="positive">
        <template v-slot:append>
        <q-btn outline round size="sm"
         icon="place" 
         :color="getCoordsModeFrom ? 'red' : 'positive'"
         @click="getCoordsModeFrom = !getCoordsModeFrom; point='p1'"
         />
        </template>
    </q-input>
    <q-input square filled v-model="formattedTo" label="To" :dense="dense" label-color="positive">
        <template v-slot:append>
        <q-btn outline round size="sm" icon="place" style="width=25px" 
        :color="getCoordsModeTo ? 'red' : 'positive'"
         @click="getCoordsModeTo = !getCoordsModeTo; point='p2'"/>
        </template>
    </q-input>
    <q-btn-toggle
    style="margin-top: 10px;"
        v-model="travelChoice"
        spread
        toggle-color="secondary"
        color="positive"
        :options="[
        {value: 'Walk', slot: '1'},
        {value: 'Bicycle', slot: '2'},
        {value: 'Electric-bike', slot: '3'},
        {value: 'Car', slot: '4'}
        ]"
    >
        <template v-slot:1>
            <q-icon name="hiking" />
        </template>
        <template v-slot:2>
            <q-icon name="directions_bike" />
        </template>
        <template v-slot:3>
            <q-icon name="electric_moped" />
        </template>
        <template v-slot:4>
            <q-icon name="directions_car" />
        </template>
    </q-btn-toggle>
    <q-btn class="run-button" 
            @click="getIsochroneRequest" 
            style="margin-top: 30px;" 
            color="secondary" 
            label="Get route" />
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
import axios from 'axios';
import { widget, requirejs } from "@widget-lab/3ddashboard-utils";
export default {
    name: 'RouteWidget',
    data() {
        return {
            coordinates: {
                'p1': [-0.4957, 51.7086], 
                'p2': [-0.3713, 51.5196]
            },
            point: 'p1',
            getCoordsModeFrom: false,
            getCoordsModeTo: false,
            widgetId: widget.id,
            routeNumberCount: 1,
            dense: null,
            key: "5b3ce3597851110001cf6248575c5a9ab2384617b5665773e5e51a29",
            travelChoice: 'Walk',
            fromLocation: null,
            toLocation: null,
            pathMapping: {
                "Walk" : "foot-walking",
                "Bicycle": "cycling-regular",
                "Electric-bike": "cycling-electric",
                "Car": "driving-car"
          },
        };
    },
    computed: {
        getPathParameter: function() {
            return this.pathMapping[this.travelChoice]
        },
        formattedFrom: function() {
        return `long: ${this.coordinates.p1[0].toFixed(4)}, lat: ${this.coordinates.p1[1].toFixed(4)}`;
      },
      formattedTo: function() {
        return `long: ${this.coordinates.p2[0].toFixed(4)}, lat: ${this.coordinates.p2[1].toFixed(4)}`;
      },
    },

    async mounted() {
    const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
      platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onClick" ? this.getCoords(result) : null);
    },
    methods: {
        getCoords(result) {
        if (this.getCoordsModeFrom || this.getCoordsModeTo) {
            console.log('From', result);
            // this.currentCRS = result.data.projection.split(':')[1];
            const pathRoot = result.data.click.world;
            this.coordinates[this.point][1] = pathRoot.lat;
            this.coordinates[this.point][0] = pathRoot.lon;
            this.getCoordsModeFrom = false;
            this.getCoordsModeTo = false;
            this.centralPointCounter += 1;
            }
        },
        async getIsochroneRequest() {
            const body = {
                "coordinates": [this.coordinates.p1, this.coordinates.p2],
                "geometry_simplify":"true",
                "instructions":"false"
            };
            try {
                const response = await axios.post(
                    // TODO: check if the key wrong
                `https://api.openrouteservice.org/v2/directions/${this.getPathParameter}/geojson`,
                body,
                {
                    headers: {
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    'Content-Type': 'application/json',
                    'Authorization': this.key
                    }
                }
                );
                this.sendResults(response.data);
                this.routeNumberCount =+ 1;
            } catch (error) {
            // Handle the error
            console.error(error);
            }
        },
        async sendResults(response) {
        console.log('data:', response);
        const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");

        platformAPI.publish('xCity.addData', {
            "messageId": "fb5c5587-ba4e-4db4-9dfd-7b54338dd444",
            "publisher": this.widgetId,
            "data": {
                "representation": {
                    "id": `route-${this.routeNumberCount}`,
                    "name": `route-${this.routeNumberCount}`,
                },
                "geojson": response
            },
            "widgetId": [
            "9ovld2yA23OaauiKkGek"
            ]
        });
        },
      }
    }
</script>