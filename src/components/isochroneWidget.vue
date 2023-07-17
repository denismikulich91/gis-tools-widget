<template>
    <div class="row bg-secondary items-center justify-between">
        <p class="text-white" style="margin-left: 12px; margin-bottom: 0px; font-size: 15px">Start location</p>
        <q-btn
            size="sm"
            class="col-auto"
            outline
            :color="getCoordsMode ? 'red' : 'white'"
            icon="my_location"
            style="margin: 5px 12px; width: 20px"
            @click="getCoordsMode = !getCoordsMode"
        >
            <q-tooltip class="bg-gray" :offset="[0, 10]" :delay="1000">
                <span style="font-size: 10px">Click on the City map to get coordinates</span>
            </q-tooltip>
        </q-btn>
    </div>
    <div class="row">
        <q-input v-model="address" class="col" filled label="Address" style="margin-top: 0px" />
    </div>
    <q-input v-model="distanceMinutes" filled label="Set the isochrone distance in minutes" />
    <q-btn-toggle
        v-model="pathChoice"
        style="margin-top: 10px"
        spread
        toggle-color="secondary"
        text-color="black"
        color="accent"
        :options="[
            { value: 'Walk', slot: '1' },
            { value: 'Bicycle', slot: '2' },
            { value: 'Electric-bike', slot: '3' },
            { value: 'Car', slot: '4' }
        ]"
    >
        <template #1>
            <q-icon name="hiking" />
        </template>
        <template #2>
            <q-icon name="directions_bike" />
        </template>
        <template #3>
            <q-icon name="electric_moped" />
        </template>
        <template #4>
            <q-icon name="directions_car" />
        </template>
    </q-btn-toggle>
    <p>{{ pathChoice }}</p>
    <div class="row justify-between items-center" style="margin-top: 30px">
        <div class="row justify-start col-8">
            <q-btn class="col-1" :style="{ backgroundColor: isochroneColor }" style="color: white" icon="format_color_fill">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="isochroneColor" default-view="palette" format-model="hex" />
                </q-popup-proxy>
            </q-btn>
            <q-slider
                v-model="opacity"
                class="col-7 self-end"
                size="s"
                :label-value="'Opacity: ' + opacity + '%'"
                :min="0"
                :max="100"
                label-always
                color="positive"
                style="margin-left: 20px; height: 15px"
            />
        </div>
        <div class="row justify-start">
             <q-btn style="height: 15px; width: 15px; margin-right: 10px;" color="secondary" icon="restart_alt" @click="settingsComponents=[]" />
            <q-btn style="height: 15px; width: 15px" color="secondary" icon="add" @click="addComponent" />
        </div>
      </div>
    <div class="row" style="margin-top: 10px">
        <settings-icon-component
            v-for="(component, index) in settingsComponents"
            :key="index"
            :icon="component.icon"
            :icon-color="component.color"
            :time="component.time"
            @dblclick="removeComponent(index)"
        />
    </div>
    <q-btn class="row run-button" label="Get isochrone" style="margin-top: 30px" color="secondary" @click="getIsochroneRequest">
        <q-popup-proxy v-if="!isHasRequests">
            <q-banner>
                <template #avatar>
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
import axios from "axios";
import { widget, requirejs } from "@widget-lab/3ddashboard-utils";
import settingsIconComponent from "./settingsIconComponents.vue";
import { getAddress } from '../plugins/utils.js'

export default {
    name: "IsochroneWidget",
    components: {
        settingsIconComponent
    },
    data() {
        return {
            address: null,
            centralPointCounter: 0,
            settingsComponents: [],
            getCoordsMode: false,
            opacity: 60,
            isochroneColor: "#42a2da",
            widgetId: widget.id,
            key: widget.getValue("key"),
            currentCRS: "4326",
            coordinates: [0, 0],
            distanceMinutes: 10,
            pathChoice: "Walk",
            pathMapping: {
                Walk: {code: "foot-walking", icon: "hiking"},
                Bicycle: {code: "cycling-regular", icon: "directions_bike"},
                "Electric-bike": {code: "cycling-electric", icon: "electric_moped"},
                Car: {code: "driving-car", icon: "directions_car"}
            }
        };
    },
    computed: {
        getOpacityFactor() {
            return this.opacity / 100;
        },

        isHasRequests() {
            return this.settingsComponents.length > 0;
        }
    },

    async mounted() {
        const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
        platformAPI.subscribe("xCity.resolve", result => (result.topic === "xCity.onClick" ? this.getCoords(result) : null));
        // platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onSelect" ? console.log(result): null);
        platformAPI.subscribe("3DEXPERIENCity.AddPolygonReturn", result => console.log(result));
    },
    methods: {
        getPathKey(settingsComponent) {
            return settingsComponent.pathChoice;
        },
        addComponent() {
            this.settingsComponents.push({
                color: this.isochroneColor,
                opacity: this.opacity,
                icon: this.pathMapping[this.pathChoice].icon,
                time: this.distanceMinutes,
                coordinates: this.coordinates,
                path: this.pathMapping[this.pathChoice].code
            });
        },
        removeComponent(index) {
            this.settingsComponents.splice(index, 1);
        },
        async getClickedAddress(lat, long) {
            const result = await getAddress(lat, long);
            this.address = result.display_name;
        },
        async getCoords(result) {
            if (this.getCoordsMode) {
                console.log("coords: ", result);
                this.currentCRS = result.data.projection.split(":")[1];
                const pathRoot = result.data.click.world;
                const pathRootLocal = result.data.click.local;
                this.coordinates[1] = pathRoot.lat;
                this.coordinates[0] = pathRoot.lon;
                this.getClickedAddress(this.coordinates[1], this.coordinates[0]);
                this.centralPointCounter += 1;
                this.getCoordsMode = false;       
                const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
                platformAPI.publish("3DEXPERIENCity.AddMarker", {
                    widgetID: this.widgetId,
                    position: [pathRootLocal.x, pathRootLocal.y],
                    geojson: {
                        type: "FeatureCollection",
                        features: [{ type: "Feature", geometry: { type: "Point", coordinates: [[pathRootLocal.x], [pathRootLocal.y]] } }]
                    },
                    layer: {
                        id: `p${this.centralPointCounter}-${pathRootLocal.x}-${pathRootLocal.y}`,
                        name: `Start location-${this.centralPointCounter}`
                    },
                    folder: {
                        id: `searchResults${this.centralPointCounter}`,
                        name: `Search Results ${this.centralPointCounter}`
                    },
                    render: {
                        renderMode: "dual",
                        color: "#005685",
                        shape: "sphere",
                        scale: [12, 12, 12],
                        switchDistance: 750,
                        opacity: 0.9,
                        iconName: "transportation-walk"
                    }
                });
            }
        },
        async getIsochroneRequest() {
            if (this.isHasRequests) {
                for (const singleRequest of this.settingsComponents) {
                    const body = {
                        locations: [singleRequest.coordinates],
                        range: [singleRequest.time * 60]
                    };
                    try {
                        const response = await axios.post(
                            // TODO: check if the key wrong
                            `https://api.openrouteservice.org/v2/isochrones/${singleRequest.path}`,
                            body,
                            {
                                headers: {
                                    Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                                    "Content-Type": "application/json",
                                    Authorization: this.key
                                }
                            }
                        );
                        singleRequest.requestResults = response.data;
                        // singleRequest.requestResults.features.crs = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" }}
                        this.sendResults(singleRequest);
                    } catch (error) {
                        // Handle the error
                        console.error(error);
                    }
                }
            }
        },
        async sendResults(singleRequest) {
            console.log("Received data:", singleRequest);
            // const passingCoords = singleRequest.requestResults.features[0].geometry.coordinates[0];
            // passingCoords = convertCoordsArray(passingCoords)
            const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
            platformAPI.publish("3DEXPERIENCity.AddPolygon", {
                geojson: {
                    type: "FeatureCollection",
                    features: singleRequest.requestResults.features
                },
                layer: {
                    id: `p${this.centralPointCounter}_isochrones_${singleRequest.path}_${singleRequest.time}`,
                    name: `p${this.centralPointCounter}_Isochrone-${singleRequest.path}-${singleRequest.time}`,
                },
                folder: {
                    id: `searchResults${this.centralPointCounter}`,
                    name: `Search Results ${this.centralPointCounter}`
                },
                render: {
                    renderMode: "dual",
                    color: singleRequest.color,
                    opacity: singleRequest.opacity / 100
                },
                options: {
                    projection: {
                        from: "WGS84"
                    }
                }
            });
            // const myStyle = {
            //        "color": "#00a300",
            //        "opacity": 1
            //     };
            // platformAPI.publish('xCity.addData', {
            //     "messageId": "fb5c5587-ba4e-4db4-9dfd-7b54338dd444",
            //     "publisher": this.widgetId,
            //     "data": {
            //         "representation": {
            //             "id": `p${this.centralPointCounter}_isochrones_${singleRequest.path}_${singleRequest.time}`,
            //             "name": `p${this.centralPointCounter}_Isochrone-${singleRequest.path}-${singleRequest.time}`,
            //             "type": "Geometry",
            //             "geometryType": "Polygon",

            //         },
            //         "options": {
            //             "color": "red",
            //         },
            //         "geojson": singleRequest.requestResults
            //     },
            //     'style': myStyle,
            //     "widgetId": [
            //     "9ovld2yA23OaauiKkGek"
            //     ]
            // });
            // platformAPI.publish('xCity.set', {
            // "messageId": "ce33219f-26d8-4cb8-9386-de565b7231ec",
            //     "publisher": this.widgetId,
            //     "data": {
            //         "representation": {
            //             "id": `p${this.centralPointCounter}_isochrones_${singleRequest.path}_${singleRequest.time}`,
            //             "name": `p${this.centralPointCounter}_isochrone_${singleRequest.path}_${singleRequest.time}`,
            //             "selected": false,
            //             "visible": true,
            //             "type": "Polygon"
            //             // name: "08a4c267-0505-4f94-b21d-35b9933e3f9a_polygon_1"
            //         },
            //         "rendering": {
            //             "opacity": singleRequest.opacity / 100,
            //             "color": singleRequest.color,
            //             "elevationMode": "geometry",
            //             "elevationOffset": 0
            //         }
            //     },
            //     "widgetId": [
            //         "9ovld2yA23OaauiKkGek"
            //     ]
            // });
        }
    }
};
</script>
