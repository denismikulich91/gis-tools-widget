<template>
    <div class="q-pa-md example-column-row-width">
        <q-banner inline-actions class="text-white bg-blue">
            <div class="widget-name" style="font-size: 25px;">Isochrones generator</div>
        </q-banner>
        <q-input v-model="distanceMinutes" filled label="Set the isochrone distance in minutes" />
        <q-select v-model="pathChoice" filled :options="pathOptions" label="Path parameter" />
        <p style="margin-top: 35px;">Selected coordinates:</p>
        <q-input v-model="coordinates[0]" filled label="X" />
        <q-input v-model="coordinates[1]" filled label="Y" />
        <q-btn class="run-button" @click="getOpenRouterRequest" style="margin-top: 25px;" color="primary" label="Get isochrone" />
        <div class="results">
            <!-- <p>{{ requestResults }}</p> -->
        </div>       
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
// import { ref } from "vue";
export default {
    data() {
        return {
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
    platformAPI.subscribe('3DEXPERIENCity.AddPolygonReturn', result => console.log(result))
    },

    methods: {
    getCoords(result) {
      console.log(result.data);
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
        platformAPI.publish('3DEXPERIENCity.AddPolygon', {
            geojson: {
                "type": "FeatureCollection",						
                "features": this.requestResults,
            },
            layer: {
                id: "searchResultPolygons", 
                name: "Search Result Polygons"
            },
            folder: {
                "id": "searchResults",
                "name": 'Search Results',
                "parent_id": 'Search'
            },
            render: {
                renderMode: 'dual',
                color: "rgb(255,0,0)"
            },
            options: {
                "addTerrainHeight" : false
            }
        });
        platformAPI.publish('xCity.addData', {
            "messageId": "fb5c5587-ba4e-4db4-9dfd-7b54338dd444",
            "publisher": this.widgetId,
            "data": {
                "representation": {
                    "id": `isochrones_${this.pathChoice}_${this.distanceMinutes}`,
                    "name": `Isochrone-${this.pathChoice}-${this.distanceMinutes}`,
                    // "color": `${this.colorMapping[this.pathChoice]}`
                    "Color": "#ea0101"
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
