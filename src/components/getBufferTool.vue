<template>
    <div class="q-pa-xs">
        <div class="q-gutter-md" style="max-width: 300px">
            <q-btn class="col-1" :style="{ backgroundColor: bufferColor }" size="sm" style="color: white" icon="format_color_fill">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="bufferColor" default-view="palette" format-model="hex" />
                </q-popup-proxy>
            </q-btn>
            <q-btn size="sm" outline :color="getDataMode ? 'red' : 'primary'" label="Select" @click="runFunc" />
            <q-btn size="sm" round outline :color="repeateMode ? 'red' : 'primary'" icon="restart_alt" @click="repeateMode = !repeateMode" />
            <q-input size="sm" outlined v-model="bufferRadius" label="Buffer radius, km" />
        </div>
    </div>
</template>

<script>
import { widget, requirejs } from "@widget-lab/3ddashboard-utils";
import { retrieveReferential, retrieveGeoItemDatasetRepresentations } from "../js/request.js";
import * as turf from "@turf/turf";
export default {
    name: "getBufferTool",
    data() {
        return {
            pathFile: "",
            polygonFile: "",
            REFERENTIAL_UUID: "",
            getDataMode: false,
            repeateMode: false,
            pointNumber: 1,
            folderNumber: 1,
            bufferRadius: null,
            bufferColor: "#ff0000"
        };
    },
    async mounted() {
        await retrieveReferential().then(data => {
            this.REFERENTIAL_UUID = data.uuid;
        });
        const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
        platformAPI.subscribe("xCity.resolve", result => (result.topic === "xCity.onSelect" ? this.getLayer(result) : null));
    },
    methods: {
        runFunc() {
            this.getDataMode = !this.getDataMode;
            if (!this.getDataMode) {
                this.repeateMode = this.getDataMode;
                this.folderNumber += 1;
                this.pointNumber = 1;
            }
        },
        async getLayer(result) {
            if (this.getDataMode) {
                if (!this.repeateMode) {
                    this.getDataMode = false;
                }
                this.getBuffer(result, this.bufferRadius);
            }
        },

        async getBuffer(result, radius) {
            console.log(result);
            const pointWorldCoord = result.data.representation.position.world;
            var point = turf.point([pointWorldCoord.lon, pointWorldCoord.lat]);
            var bufferedPoint = turf.buffer(point, radius, { units: "kilometers" });
            console.log("point: ", result);
            console.log("buffer: ", bufferedPoint);
            const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
            platformAPI.publish("3DEXPERIENCity.AddPolygon", {
                geojson: {
                    type: "FeatureCollection",
                    features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: bufferedPoint.geometry.coordinates } }]
                },
                layer: {
                    id: `buffered-point-${this.pointNumber}-${this.folderNumber}`,
                    name: `buffered-point-${this.pointNumber}`
                },
                folder: {
                    id: `buffer-collection-${this.folderNumber}`,
                    name: `buffer-collection-${this.folderNumber}`
                },
                render: {
                    renderMode: "dual",
                    color: this.bufferColor,
                    opacity: 0.6
                },
                options: {
                    projection: {
                        from: "WGS84"
                    }
                }
            });
            this.pointNumber += 1;
        }
    }
};
</script>
