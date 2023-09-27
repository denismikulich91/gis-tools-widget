<template>
    <div class="q-pa-xs">
        <div class="q-gutter-md" style="max-width: 300px">
            <q-btn size="sm" outline :color="getDataMode ? 'red' : 'primary'" label="Choose" @click="getDataMode = !getDataMode; if(!getDataMode) repeateMode = getDataMode" />
            <q-btn size="sm" round outline :color="repeateMode ? 'red' : 'primary'" icon="restart_alt" @click="repeateMode = !repeateMode; getDataMode = repeateMode"/>
            <p v-show="polylineLength>0">Polygon length: {{ polylineLength }} km</p>
        </div>
    </div>
</template>

<script>
import { widget, requirejs } from "@widget-lab/3ddashboard-utils";
import { retrieveReferential, retrieveGeoItemDatasetRepresentations } from '../js/request.js';
import * as turf from '@turf/turf';
export default {
	name: "getLengthTool",
	data() {
		return {
			pathFile: "",
			polygonFile: "",
			REFERENTIAL_UUID: "",
			getDataMode: false,
      repeateMode: false,
      polylineLength: 0
		};
	},
  async mounted() {
    await retrieveReferential().then(data => {
        this.REFERENTIAL_UUID = data.uuid;
    });
    const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
    platformAPI.subscribe("xCity.resolve", result => (
        result.topic === "xCity.onSelect" ? this.getLayer(result) : null));
},
methods: {
  async getLayer(result) {
    if (this.getDataMode) {
        if (!this.repeateMode) {
          this.getDataMode = false;
        }
        this.calcLength(result);
    }
  },
        // this.inProcess = true;
  calcLength(result) {
    var line = turf.lineString(result.data.geojson.features[0].geometry.coordinates)
      var lineWgs84 = turf.toWgs84(line);
      this.polylineLength = turf.length(lineWgs84, {units: "kilometers"}).toFixed(2)
  }


    //     retrieveGeoItemDatasetRepresentations(polygonsFilter, selectedLayer, REFERENTIAL_UUID.value).then((data) => {
    //         polygonData.value = data.features;
    //         console.log("pol", data)
    //         retrieveGeoItemDatasetRepresentations(pathFilter, selectedLayer, REFERENTIAL_UUID.value).then((data) => {
    //             console.log("line", data)
    //             pathData.value = data.features;

    // }}))
  }
}
// const pathData = ref();
// const polygonData = ref();
</script>
