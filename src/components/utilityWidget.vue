<template>
   <q-list>
              <q-expansion-item
                group="utilities"
                icon="straighten"
                label="Get length"
                header-class="bg-accent text-black"
            >
                <q-card>
                    <q-card-section>
                      <getLengthTool />
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-separator />
              <q-expansion-item
                group="utilities"
                icon="timeline"
                label="Create points on the polyline"
                header-class="bg-info text-black"
            >
                <q-card>
                    <q-card-section>
                      <p>Tool 2</p>
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-separator />
              <q-expansion-item
                group="utilities"
                icon="screenshot_region"
                label="Get area"
                header-class="bg-accent text-black"
            >
                <q-card>
                    <q-card-section>
                      <p>Tool 4</p>
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-separator />
              <q-expansion-item
                group="utilities"
                icon="select_all"
                label="Create bounding box"
                header-class="bg-info text-black"
            >
                <q-card>
                    <q-card-section>
                      <p>Tool 3</p>
                      <getLengthTool />
                    </q-card-section>
                </q-card>
            </q-expansion-item>
            <q-separator />
        </q-list>     
</template>
<script>
import getLengthTool from './getLengthTool.vue';
  export default {
	name: "UtilityWidget",
  components: {
    getLengthTool,
  },
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
}
</script>