<template>
    <div class="flex column flex-center" style="background-color: #F8F8F8">
        <div v-show="windowWidth > 500">
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
        <div v-show="windowWidth <= 500">
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
        <div style="color: #005685; padding-top: 15px; text-align: center;">
            {{ address }}
        </div>
        <div style="background-color: #F8F8F8; padding: 15px;">
            <q-btn
                outline
                round
                size="sm"
                icon="place"
                :color="getCoordsMode ? 'red' : 'primary'"
                @click="getCoordsMode = !getCoordsMode"
            />
        </div>
    </div>
</template>

<script>
import { getAddress } from "../plugins/utils.js";
export default {
	name: "WeatherWidget",
	data() {
		return {
			windowWidth: 0,
			widgetType: "compact",
			dataLat: 52.408,
			dataLng: -1.509,
			getCoordsMode: false,
			address: null
		};
	},
	async mounted() {
		const platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
		platformAPI.subscribe("xCity.resolve", result => (
		result.topic === "xCity.onClick" && this.getCoordsMode ? this.getCoords(result) : null));      
	},
	created() {
		this.updateWindowWidth();
		window.addEventListener("resize", this.updateWindowWidth);
	},
	unmounted() {
		window.removeEventListener("resize", this.updateWindowWidth);
	},
	methods: {
		updateWindowWidth() {
			this.windowWidth = window.innerWidth;
		},
		async getCoords(result) {
			const pathRoot = result.data.click.world;
			this.dataLat = pathRoot.lat.toFixed(3);
			this.dataLng = pathRoot.lon.toFixed(3);
			const script = document.createElement("script");
			script.async = true;
			script.src = "https://windy.app/widgets-code/forecast/windy_weather_async.js?v16";
			document.getElementById("windy-widget").appendChild(script);
			this.getCoordsMode = false;
			const data = await getAddress(this.dataLat, this.dataLng);
			this.address = data.display_name;
		}
	}
};
</script>