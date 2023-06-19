<template>
    <div class="flex flex-center q-pa-xs">
        <div
            id="windy-widget"
            data-windywidget="windy-weather"
            data-thememode="light"
            data-appid="53899e6a1228424a73639a79f914dca1"
            data-spotid="2645505"
            data-starthour="12"
            data-windunit="knots"
            data-tempunit="F"
            data-mode="full"
        >
        </div>
    </div>
</template>

<script>
    export default {
    name: "WeatherWidget",
    data() {
        return {
            text: "test"
        }
    },
    mounted() {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://windy.app/widgets-code/forecast/windy_weather_async.js?v16';
        document.getElementById('windy-widget').appendChild(script);
  },
}
</script>