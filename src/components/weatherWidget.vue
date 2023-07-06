<template>
    <div v-show="windowWidth > 500" class="flex flex-center q-pa-xs" style="background-color: #F8F8F8">
        <div
            id="windy-widget"
            data-windywidget="windy-weather"
            data-thememode="light"
            :data-lat="dataLat"
            :data-lng="dataLng"
            data-appid="53899e6a1228424a73639a79f914dca1"
            data-starthour="12"
            data-windunit="knots"
            data-tempunit="C"
            data-mode="full"
        >
        </div>
    </div>
    <div v-show="windowWidth <= 500" class="flex flex-center q-pa-xs" style="background-color: #F8F8F8">
        <div
            id="windy-widget"
            :data-lat="dataLat"
            :data-lng="dataLng"
            data-windywidget="windy-weather"
            data-thememode="light"
            data-appid="53899e6a1228424a73639a79f914dca1"
            data-starthour="12"
            data-windunit="knots"
            data-tempunit="C"
            data-mode="compact"
        >
        </div>
      </div>
      <div class="flex" style="background-color: #F8F8F8; padding: 0px 0px 15px 15px;">
        <q-btn
          outline
          round
          size="sm"
          icon="place"
          :color="getCoordsMode ? 'red' : 'primary'"
          @click="getCoordsMode = !getCoordsMode"
      />
    </div>
</template>

<script>
    export default {
    name: "WeatherWidget",
    data() {
        return {
            windowWidth: 0,
            widgetType: "compact",
            dataLat: 0,
            dataLng: 0,
            getCoordsMode: false
        }
    },
    async mounted() {
      const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
      platformAPI.subscribe("xCity.resolve", result => (
        result.topic === "xCity.onClick" && this.getCoordsMode ? this.getCoords(result) : null));
      // const script = document.createElement('script');
      // script.async = true;
      // script.src = 'https://windy.app/widgets-code/forecast/windy_weather_async.js?v16';
      // document.getElementById('windy-widget').appendChild(script);
      
  },
  methods: {
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    },
    async getCoords(result) {
      const pathRoot = result.data.click.world;
      this.dataLat = pathRoot.lat;
      this.dataLng = pathRoot.lon;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://windy.app/widgets-code/forecast/windy_weather_async.js?v16';
      document.getElementById('windy-widget').appendChild(script);
      this.getCoordsMode = false;
  },
},
  created() {
    this.updateWindowWidth();
    window.addEventListener('resize', this.updateWindowWidth);
  },
  destroyed() {
    window.removeEventListener('resize', this.updateWindowWidth);
  }
}
</script>