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

import { getResults } from "../plugins/tempModule";
import { widget } from "@widget-lab/3ddashboard-utils";
export default {
  name: "StoreData",
  data() {
    return {
      mainColor: widget.getValue("mainColor"),
      storeData: null,
      test: 'dog'
    };
  },
  // computed: {
  //   async getData() {
  //     let { results } = await import ("../plugins/tempModule");
  //     return results;
  //   }
  // },

  //     requirejs(["DS/PlatformAPI/PlatformAPI"], PlatformAPI => {
  //       PlatformAPI.subscribe("xCity.resolve", result => {
  //         if (result.topic === "xCity.onSelect") {
  //           let dataRoot = result.data.geojson.features[0].properties;
  //           this.StoreData.name = dataRoot.NAME;
  //           this.StoreData.country = dataRoot.country;
  //           this.StoreData.coords = dataRoot.TRANS.split(" ").map(el => parseFloat(el).toFixed(2));
  //           // Why is it still string type?
  //           // console.log("fetched data;", this.StoreData);
  //     }
  //     });
  //   });
  //   return this.StoreData;
  //   }
  // },
  methods: {
    check() {
      console.log(this.storeData);
      // this.$forceUpdate();
    }
  },
  created() {
    this.storeData = getResults()
  },
  watch: {
    storeData: {
      handler() {
        console.log('test')
      },
      deep: true,
      immediate: true
    }
  }
};
</script>