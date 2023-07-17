<template>
    <q-btn
        size="sm"
        no-caps
        flat
        style="margin: 0 5px 5px 0;"
        :color="color" 
        :icon-right="icon" 
        :label="time+'min'" 
        :style="{ backgroundColor: iconColor }" 
    />
</template>

<script>
  export default {
    name: "SettingsIconComponent",
    props: ["iconColor", "time", "icon"],
    data() {
      return {
        color: "#42a2da"
      };
    }
  };
</script>