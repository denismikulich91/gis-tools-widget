<template>
    <div class="q-pa-md example-column-row-width">
        <q-list bordered>
            <q-expansion-item
                group="openRouteWidgets"
                icon="explore"
                label="Create isochrone"
                header-class="bg-primary text-white"
            >
            <q-card>
                <q-card-section>
                    <q-input v-model="distanceMinutes" filled label="Set the isochrone distance in minutes" />
                    <q-select 
                        v-model="pathChoice" 
                        filled :options="pathOptions" 
                        label="Path parameter"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        />
                        <div class="row bg-secondary items-center justify-between" style="margin-top: 30px;">
                            <p class="text-white" style="margin-left: 12px; margin-bottom: 0px; font-size: 15px;">
                                Start location
                            </p>
                            <q-btn size="sm" class="col-auto" outline color="white" icon="my_location" 
                            style="margin: 5px 12px; width: 20px;" > 
                                <q-tooltip class="bg-gray" :offset="[0, 10]" :delay="1000">
                                    <span style="font-size: 10px;">Click on the City map to get coordinates</span>
                                </q-tooltip>
                            </q-btn>
                        </div>
                    <q-input v-model="coordinates[0]" filled label="X" style="margin-top: 0px;"/>
                    <q-input v-model="coordinates[1]" filled label="Y" />
                    <q-btn class="run-button" 
                        @click="getOpenRouterRequest" 
                        style="margin-top: 30px;" 
                        color="secondary" 
                        label="Get isochrone" />
                    </q-card-section>
                </q-card>
            </q-expansion-item>

            <q-separator />

            <q-expansion-item
                group="openRouteWidgets"
                icon="place"
                label="Get directions"
                header-class="bg-positive text-white"
                default-opened
            >
        <q-card>
          <q-card-section>
            <div class="col q-pa-xs">
                <q-input square filled v-model="fromLocation" label="From" :dense="dense" label-color="positive">
                    <template v-slot:append>
                    <q-btn outline round size="sm" icon="place" color="positive"/>
                    </template>
                </q-input>
                <q-input square filled v-model="toLocation" label="To" :dense="dense" label-color="positive">
                    <template v-slot:append>
                    <q-btn outline round size="sm" icon="place" color="positive" style="width=25px" />
                    </template>
                </q-input>
                <q-btn-toggle
                style="margin-top: 10px;"
                    v-model="travelChoice"
                    spread
                    toggle-color="secondary"
                    color="positive"
                    :options="[
                    {value: 'byWalk', slot: '1'},
                    {value: 'byBike', slot: '2'},
                    {value: 'byCar', slot: '3'},
                    {value: 'byPublic', slot: '4'}
                    ]"
                >
                    <template v-slot:1>
                        <q-icon name="directions_walk" />
                    </template>
                    <template v-slot:2>
                        <q-icon name="directions_bike" />
                    </template>
                    <template v-slot:3>
                        <q-icon name="directions_car" />
                    </template>
                    <template v-slot:4>
                        <q-icon name="directions_bus" />
                    </template>
                </q-btn-toggle>
                <q-btn class="run-button" 
                        @click="getOpenRouterRequest" 
                        style="margin-top: 30px;" 
                        color="secondary" 
                        label="Get route" />
            </div>
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
import axios from 'axios';
import { widget, requirejs } from "@widget-lab/3ddashboard-utils";
import "@widget-lab/3ds-icons-vue3/out/static/3ds-icons.css";
// import { ref } from "vue";
export default {
    data() {
        return {
            travelChoice: 'byWalk',
            fromLocation: null,
            toLocation: null,
            widgetId: widget.id,
            key: widget.getValue("key"),
            // key: "5b3ce3597851110001cf6248575c5a9ab2384617b5665773e5e51a29",
            requestResults: "",
            currentCRS: "4326",
            coordinates: [0, 0],
            distanceMinutes: 10,
            pathChoice: "",
            pathOptions: ["Walk", "Bicycle", "Electric-bike", "Car"],
            mainColor: widget.getValue("mainColor"),
            mainSize: `${widget.getValue("size")}px`,
            headerColor: "bg-" + widget.getValue("mainColor"),
            pathMapping: {
                "Walk" : "foot-walking",
                "Bicycle": "cycling-regular",
                "Electric-bike": "cycling-electric",
                "Car": "driving-car"
            },
            colorMapping: {
                "Walk" : "rgb(255,0,0)",
                "Bicycle": "rgb(0,255,0)",
                "Electric-bike": "rgb(0,255,50)",
                "Car": "rgb(0,0,255)"
            }
        };
    },

    computed: {
        getDistanceSeconds() {
        return this.distanceMinutes * 60;
        },
        getPathKey() {
            return (this.pathChoice !== '') ? this.pathMapping[this.pathChoice] : 'driving-car';
        }
    },

    async mounted() {
    const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
    platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onClick" ? this.getCoords(result) : null);
    platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onSelect" ? console.log(result): null);
    platformAPI.subscribe('3DEXPERIENCity.AddPolygonReturn', result => console.log(result))
    },

    methods: {
    getCoords(result) {
      console.log(result);
      this.currentCRS = result.data.projection.split(':')[1];
      const pathRoot = result.data.click.world;
      this.coordinates[1] = pathRoot.lat;
      this.coordinates[0] = pathRoot.lon;
    },
    async getOpenRouterRequest() {
        if (this.pathChoice === '') this.pathChoice = 'Car';
        const body = {
            "locations": [[this.coordinates[0], this.coordinates[1]]],
            "range": [this.getDistanceSeconds]
        };
        try {
            const response = await axios.post(
            `https://api.openrouteservice.org/v2/isochrones/${this.getPathKey}`,
            body,
            {
                headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Content-Type': 'application/json',
                'Authorization': this.key
                }
            }
            );
            this.requestResults = response.data;
            this.requestResults.crs = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" }}
            this.sendResults()
        } catch (error) {
            // Handle the error
            console.error(error);
        }
        },
    async sendResults() {
        console.log(this.widgetId)
        const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
        // platformAPI.publish('3DEXPERIENCity.AddPolygon', {
        //     geojson: {
        //         "type": "FeatureCollection",						
        //         "features": this.requestResults,
        //     },
        //     layer: {
        //         id: "searchResultPolygons", 
        //         name: "Search Result Polygons"
        //     },
        //     folder: {
        //         "id": "searchResults",
        //         "name": 'Search Results',
        //         "parent_id": 'Search'
        //     },
        //     render: {
        //         renderMode: 'dual',
        //         color: "rgb(255,0,0)"
        //     },
        //     options: {
        //         "addTerrainHeight" : false
        //     }
        // });
        platformAPI.publish('xCity.addData', {
            "messageId": "fb5c5587-ba4e-4db4-9dfd-7b54338dd444",
            "publisher": this.widgetId,
            "data": {
                "rendering": {
                    "color": "#21ba45",
                    "opacity": 0.5,
                },
                "representation": {
                    "geometryType": "Point",
                    "id": `isochrones_${this.pathChoice}_${this.distanceMinutes}`,
                    "name": `Isochrone-${this.pathChoice}-${this.distanceMinutes}`,
                },
                "geojson": this.requestResults
            },
            "widgetId": [
            "9ovld2yA23OaauiKkGek"
            ]
        });
    }
  }
};
</script>
