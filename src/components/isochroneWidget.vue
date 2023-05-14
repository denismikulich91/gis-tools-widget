<template>
  <div class="row bg-secondary items-center justify-between">
    <p class="text-white" style="margin-left: 12px; margin-bottom: 0px; font-size: 15px;">
        Start location
    </p>
    <q-btn size="sm" class="col-auto" outline 
      :color="getCoordsMode ? 'red' : 'white'"  icon="my_location" 
      style="margin: 5px 12px; width: 20px;" 
      @click="getCoordsMode = !getCoordsMode"> 
      <q-tooltip class="bg-gray" :offset="[0, 10]" :delay="1000">
          <span style="font-size: 10px;">Click on the City map to get coordinates</span>
      </q-tooltip>
    </q-btn>
</div>
<div class="row">
    <q-input class="col" v-model="coordinates[0]" filled label="X" style="margin-top: 0px;"/>
    <q-input class="col" v-model="coordinates[1]" filled label="Y" />
</div>  
<q-input v-model="distanceMinutes" filled label="Set the isochrone distance in minutes" />
<q-btn-toggle
    style="margin-top: 10px;"
    v-model="pathChoice"
    spread
    toggle-color="secondary"
    text-color="black"
    color="accent"
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
<p>{{pathChoice}}</p>
<div class="row justify-between items-center" style="margin-top: 30px">
    <div class="row justify-start col-10">
        <q-btn class="col-2" :style="{ backgroundColor: isochroneColor }" style="color:white" icon="format_color_fill">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="isochroneColor" default-view="palette" format-model="hex"/>
            </q-popup-proxy>
        </q-btn>
        <q-slider
            class="col-6 self-end"
            size="s"
            v-model="opacity"
            :label-value="'Opacity: ' + opacity + '%'"
            :min="0"
            :max="100"
            label-always
            color="positive"
            style="margin-left: 20px; height: 15px;"
        />
    </div>
        <q-btn 
        @click="addComponent"
        style="height: 15px; width:15px" 
        class="col-auto self-center" 
        outline 
        color="secondary" 
        icon="add"
        />
    </div>
    <div class="row" style="margin-top: 10px">
    <settings-icon-component
    v-for="(component, index) in settingsComponents"
    @dblclick.native="removeComponent(index)"
    :icon="component.icon"
    :iconColor="component.color"
    :time="component.time" 
    :key="index" />
  </div>
<q-btn class="row run-button" 
    @click="getIsochroneRequest" 
    style="margin-top: 30px" 
    color="secondary" 
    label="Get isochrone"
/>
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
import settingsIconComponent from './settingsIconComponents.vue';

export default {
  name: 'IsochroneWidget',
  components: {
        settingsIconComponent,
      },
    data() {
        return {
          settingsComponents: [],
          getCoordsMode: false,
          opacity: 60,
          isochroneColor:'#42a2da',
          widgetId: widget.id,
          // key: widget.getValue("key"),
          key: "5b3ce3597851110001cf6248575c5a9ab2384617b5665773e5e51a29",
          currentCRS: "4326",
          coordinates: [8.68149, 49.41],
          distanceMinutes: 10,
          pathChoice: "Walk",
          // pathOptions: ["Walk", "Bicycle", "Electric-bike", "Car"],
          mainColor: widget.getValue("mainColor"),
          mainSize: `${widget.getValue("size")}px`,
          headerColor: "bg-" + widget.getValue("mainColor"),
          pathMapping: {
              "Walk" : "foot-walking",
              "Bicycle": "cycling-regular",
              "Electric-bike": "cycling-electric",
              "Car": "driving-car"
          },
          iconMapping: {
            "Walk" : "hiking",
              "Bicycle": "directions_bike",
              "Electric-bike": "electric_moped",
              "Car": "directions_car"
          },
        };
    },

    computed: {

        getOpacityFactor() {
            return this.opacity / 100;
        }
    },

    async mounted() {
    const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
    if (this.getCoordsMode) {
      platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onClick" ? this.getCoords(result) : null);
      // platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onSelect" ? console.log(result): null);
      platformAPI.subscribe('3DEXPERIENCity.AddPolygonReturn', result => console.log(result))
      }
    },
    methods: {
      getPathKey(settingsComponent) {
            return settingsComponent.pathChoice;
        },
    addComponent() {
      this.settingsComponents.push({'color': this.isochroneColor,
                                    'opacity': this.opacity, 
                                    'icon': this.iconMapping[this.pathChoice],
                                    'time': this.distanceMinutes,
                                    'coordinates': this.coordinates,
                                    'path': this.pathMapping[this.pathChoice],
                                  })
      console.log(this.settingsComponents)
    },
    removeComponent(index) {
      this.settingsComponents.splice(index, 1);
    },
    getCoords(result) {
      console.log(result);
      this.currentCRS = result.data.projection.split(':')[1];
      const pathRoot = result.data.click.world;
      this.coordinates[1] = pathRoot.lat;
      this.coordinates[0] = pathRoot.lon;
      this.getCoordsMode = false;
    },
    async getIsochroneRequest() {
      for (const singleRequest of this.settingsComponents) {
        console.log(singleRequest)
        const body = {
            "locations": [singleRequest.coordinates],
            "range": [singleRequest.time * 60]
        };
        console.log('time:', singleRequest.time*60)
        try {
            const response = await axios.post(
                // TODO: check if the key wrong
            `https://api.openrouteservice.org/v2/isochrones/${singleRequest.path}`,
            body,
            {
                headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Content-Type': 'application/json',
                'Authorization': this.key
                }
            }
            );
            console.log('data', response.data)
            singleRequest.requestResults = response.data;
            singleRequest.requestResults.crs = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" }}
            this.sendResults(singleRequest)
        } catch (error) {
            // Handle the error
            console.error(error);
        }
        }
      },
    async sendResults(singleRequest) {
        console.log(this.requestResults)
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
                    "color": singleRequest.color,
                    "opacity": singleRequest.opacity,
                },
                "representation": {
                    "geometryType": "Point",
                    "id": `isochrones_${singleRequest.path}_${singleRequest.time}`,
                    "name": `Isochrone-${singleRequest.path}-${singleRequest.time}`,
                },
                "geojson": singleRequest.requestResults
            },
            "widgetId": [
            "9ovld2yA23OaauiKkGek"
            ]
        });
    }
  }
};
</script>