<template>
  <div class="box">
    <q-btn :color="mainColor" icon="info" label="Get data" @click="check"/>
    <div class="store-data">
      <p v-if="storeData.name !== undefined">Adress: {{ storeData.name }}</p>
      <p v-if="storeData.country !== undefined">Country: {{ storeData.country }}</p>
      <p v-if="storeData.coords !== undefined">Coordinates: {{ storeData.coords.slice(0, 2) }}</p>
    </div>
  </div> 
</template>

<style>
  .store-data {
    padding: 10px;
    align-content: flex-start;
  }
  .box {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    /* align-items: flex-start; */
  }
</style>
<script>
// import { requirejs } from "@widget-lab/3ddashboard-utils";

// import { getResults } from "../plugins/tempModule";
import { widget, requirejs } from "@widget-lab/3ddashboard-utils";
export default {
  name: "StoreData",
  data() {
    return {
      mainColor: widget.getValue("mainColor"),
      storeData: {}
    };
  },
  async mounted() {
    const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
    platformAPI.subscribe("xCity.resolve", result => result.topic === "xCity.onSelect" ? this.getData(result) : null);
  },
  methods: {
    getData(result) {
      console.log(result);
      let dataRoot = result.data.geojson.features[0].properties;
      this.storeData.name = dataRoot.NAME;
      this.storeData.country = dataRoot.country;
      this.storeData.coords = dataRoot.TRANS.split(" ").map(el => parseFloat(el).toFixed(2));
      console.log(this.storeData);
      // this.$forceUpdate();

  }
}
};
</script>