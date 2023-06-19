<template>
    <div class="col q-pa-xs">
        <q-input v-model="formattedFrom" square filled label="From" label-color="positive">
            <template #append>
                <q-btn
                    outline
                    round
                    size="sm"
                    icon="place"
                    :color="getCoordsModeFrom ? 'red' : 'positive'"
                    @click="getCoordsModeFrom = !getCoordsModeFrom; point = 'p1'"
                />
            </template>
        </q-input>
        <q-input v-model="formattedTo" square filled label="To" label-color="positive">
            <template #append>
                <q-btn
                    outline
                    round
                    size="sm"
                    icon="place"
                    style="width=25px"
                    :color="getCoordsModeTo ? 'red' : 'positive'"
                    @click="getCoordsModeTo = !getCoordsModeTo; point = 'p2'"
                />
            </template>
        </q-input>
        <q-btn-toggle
            v-model="travelChoice"
            style="margin-top: 10px"
            spread
            toggle-color="secondary"
            color="positive"
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
        <p>{{ travelChoice }}</p>
        <q-btn class="run-button" style="margin-top: 25px" color="secondary" label="Get route" @click="getRouteRequest" />
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
import axios from "axios";
import { widget, requirejs } from "@widget-lab/3ddashboard-utils";
export default {
    name: "RouteWidget",
    data() {
        return {
            // TODO: read the existing search results folders in order to avoid collisions, probably keep it in the local storage
            coordinates: {
                p1: [0, 0],
                p2: [0, 0]
            },
            point: "p1",
            getCoordsModeFrom: false,
            getCoordsModeTo: false,
            widgetId: widget.id,
            routeNumberCount: 1,
            pointType: "",
            key: widget.getValue("key"),
            // key: "5b3ce3597851110001cf6248575c5a9ab2384617b5665773e5e51a29",
            travelChoice: "Walk",
            pathMapping: {
                Walk: "foot-walking",
                Bicycle: "cycling-regular",
                "Electric-bike": "cycling-electric",
                Car: "driving-car"
            },
            numberPrecision: 3
        };
    },
    computed: {
        getPathParameter() {
            return this.pathMapping[this.travelChoice];
        },
        getPointType() {
            return this.pointType === "Start" ? "Finish" : "Start";
        },
        getPointColor() {
            return  this.pointType === "Start" ? "#00a300" : "#d60000";
        },
        formattedFrom() {
            return `long: ${this.coordinates.p1[0].toFixed(this.numberPrecision)},\tlat: ${this.coordinates.p1[1].toFixed(this.numberPrecision)}`;
        },
        formattedTo() {
            return `long: ${this.coordinates.p2[0].toFixed(this.numberPrecision)},\tlat: ${this.coordinates.p2[1].toFixed(this.numberPrecision)}`;
        }
    },

    async mounted() {
        const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
        platformAPI.subscribe("xCity.resolve", result => (result.topic === "xCity.onClick" ? this.getCoords(result) : null));
    },
    methods: {
        async getCoords(result) {
            if (this.getCoordsModeFrom || this.getCoordsModeTo) {
                console.log("From", result);
                const pathRoot = result.data.click.world;
                const pathRootLocal = result.data.click.local;
                this.coordinates[this.point][1] = pathRoot.lat;
                this.coordinates[this.point][0] = pathRoot.lon;
                this.getCoordsModeFrom = false;
                this.getCoordsModeTo = false;
                this.pointType = this.getPointType;
                console.log(pathRootLocal.x, pathRootLocal.y);
                console.log(this.key);

                const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
                platformAPI.publish("3DEXPERIENCity.AddMarker", {
                    widgetID: this.widgetId,
                    position: [pathRootLocal.x, pathRootLocal.y],
                    geojson: {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: { type: "Point", coordinates: [[pathRootLocal.x], [pathRootLocal.y]] }
                            }
                        ]
                    },
                    layer: {
                        id: `p${this.routeNumberCount}-${pathRoot.lon}-${pathRoot.lat}`,
                        name: `${this.pointType}`
                    },
                    folder: {
                        id: `RouteResults${this.routeNumberCount}`,
                        name: `Route Results ${this.routeNumberCount}`
                    },
                    render: {
                        renderMode: "dual",
                        color: this.getPointColor,
                        scale: [10, 10, 10],
                        switchDistance: 750,
                        iconName: "transportation-walk"
                    }
                });
            }
        },
        async getRouteRequest() {
            const body = {
                coordinates: [this.coordinates.p1, this.coordinates.p2],
                geometry_simplify: "true",
                instructions: "false"
            };
            try {
                const response = await axios.post(
                    // TODO: check if the key wrong
                    `https://api.openrouteservice.org/v2/directions/${this.getPathParameter}/geojson`,
                    body,
                    {
                        headers: {
                            Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                            "Content-Type": "application/json",
                            Authorization: this.key
                        }
                    }
                );
                this.sendResults(response.data);
            } catch (error) {
                // Handle the error
                console.error(error);
            }
        },
        async sendResults(response) {
            const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
            platformAPI.publish("3DEXPERIENCity.AddLine", {
                        geojson: {
            				"type": "FeatureCollection",
            				"features": response.features,
                            "attributes": {"test": "test", "data":"123"}
            			},
                        layer: {
                            id: `searchResultLines${this.routeNumberCount}`,
                            name: "Route results directions"
                        },
                        folder: {
                            "id": `RouteResults${this.routeNumberCount}`,
                            "name": `Route Results ${this.routeNumberCount}`
                        },
                        render: {
                            renderMode: "dual",
                            color: "#d600d6",
                            minWidth: 2,
                            lineWidth: 4
                        },
                        options: {
                            projection: {
                                from: "WGS84"
                                }
                            }
                    });
                    this.routeNumberCount += 1;
                    console.log('route data:', response);
            // response.features[0].properties.style = { color: "#00d600", width: 3 };
            // platformAPI.publish("xCity.addData", {
            //     messageId: "fb5c5587-ba4e-4db4-9dfd-7b54338dd444",
            //     publisher: this.widgetId,
            //     data: {
            //         representation: {
            //             id: `route-${this.routeNumberCount}`,
            //             name: `route-${this.routeNumberCount}`
            //         },
            //         geojson: response
            //     },
            //     widgetId: ["9ovld2yA23OaauiKkGek"]
            // });
        }
    }
};
</script>
