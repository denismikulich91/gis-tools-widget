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
    <q-input class="col" v-model="formattedLong" filled label="Longitude" style="margin-top: 0px;"/>
    <q-input class="col" v-model="formattedLat" filled label="Latitude" />
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
  <q-btn
    class="row run-button" 
    @click="getIsochroneRequest"
    style="margin-top: 30px" 
    color="secondary" 
    label="Get isochrone"
  >
  <q-popup-proxy v-if="!isHasRequests">
    <q-banner>
      <template v-slot:avatar>
        <q-icon name="add_box" color="primary" />
      </template>
      The request list is empty, please click the "add" button to add a new request
    </q-banner>
  </q-popup-proxy>
  </q-btn>
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
          centralPointCounter: 0,
          settingsComponents: [],
          getCoordsMode: false,
          opacity: 60,
          isochroneColor:'#42a2da',
          widgetId: widget.id,
          key: widget.getValue("key"),
          // key: "5b3ce3597851110001cf6248575c5a9ab2384617b5665773e5e51a29",
          currentCRS: "4326",
          coordinates: [0, 0],
          distanceMinutes: 10,
          pathChoice: "Walk",
          // pathOptions: ["Walk", "Bicycle", "Electric-bike", "Car"],
          mainSize: `${widget.getValue("size")}px`,
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
        },
      formattedLong: function() {
        return this.coordinates[0].toFixed(4);
      },
      formattedLat: function() {
        return this.coordinates[1].toFixed(4);
      },
        isHasRequests() {
          return this.settingsComponents.length > 0;
        }
    },

    async mounted() {
    const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
      platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onClick" ? this.getCoords(result) : null);
      // platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onSelect" ? console.log(result): null);
      platformAPI.subscribe('3DEXPERIENCity.AddPolygonReturn', result => console.log(result))
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
      if (this.getCoordsMode) {
        console.log('test', result);
        this.currentCRS = result.data.projection.split(':')[1];
        const pathRoot = result.data.click.world;
        this.coordinates[1] = pathRoot.lat;
        this.coordinates[0] = pathRoot.lon;
        this.getCoordsMode = false;
        this.centralPointCounter += 1;
      }
    },
    async getIsochroneRequest() {
      if (this.isHasRequests) {
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
            singleRequest.requestResults = response.data;
            // singleRequest.requestResults.crs = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" }}
            // singleRequest.requestResults.features[0].properties.color = singleRequest.color;
            this.sendResults(singleRequest)
        } catch (error) {
          // Handle the error
          console.error(error);
        }
        }
      }
    },
    checkResolve(result) {
      console.log('resolved...',result.topic, result);
    },
    checkReject(result) {
      console.log('rejected', result.topic, result);
    },
    async sendResults(singleRequest) {
        console.log('data', singleRequest);
        const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");ё
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
                "representation": {
                    "id": `p${this.centralPointCounter}_isochrones_${singleRequest.path}_${singleRequest.time}`,
                    "name": `p${this.centralPointCounter}_Isochrone-${singleRequest.path}-${singleRequest.time}`,
                },
                "geojson": singleRequest.requestResults
            },
            "widgetId": [
            "9ovld2yA23OaauiKkGek"
            ]
        });
        platformAPI.publish('xCity.set', {
          // "messageId": "ce33219f-26d8-4cb8-9386-de565b7231ec",
          "publisher": this.widgetId,
          "data": {
              "representation": {
                  "id": `p${this.centralPointCounter}_isochrones_${singleRequest.path}_${singleRequest.time}`,
                  "name": `p${this.centralPointCounter}_isochrone_${singleRequest.path}_${singleRequest.time}`,
                  "selected": false,
                  "visible": true,
                  "type": "Polygon"
                  // name: "08a4c267-0505-4f94-b21d-35b9933e3f9a_polygon_1"
              },
              "rendering": {
                  "opacity": singleRequest.opacity / 100,
                  "color": singleRequest.color,
                  "elevationMode": "geometry",
                  "elevationOffset": 0
              }
          },
          "widgetId": [
              "9ovld2yA23OaauiKkGek"
          ]
      });
        // platformAPI.subscribe('xCity.resolve', result => this.checkResolve(result))
        // platformAPI.subscribe('xCity.reject', result => this.checkReject(result))
    }
  }
};
</script>