<template>
  <div class="col q-pa-xs">
    <q-input square filled v-model="fromLocation" label="From" :dense="dense" label-color="positive">
        <template v-slot:append>
        <q-btn outline round size="sm" icon="place" color="positive"/>
        </template>
    </q-input>
    <q-input square filled v-model="toLocation" label="To" :dense="dense" label-color="positive">
        <template v-slot:append>
        <q-btn outline round size="sm" icon="place" color="positive" style="width=25px" />
        </template>
    </q-input>
    <q-btn-toggle
    style="margin-top: 10px;"
        v-model="travelChoice"
        spread
        toggle-color="secondary"
        color="positive"
        :options="[
        {value: 'byWalk', slot: '1'},
        {value: 'byBike', slot: '2'},
        {value: 'byCar', slot: '3'},
        {value: 'byPublic', slot: '4'}
        ]"
    >
        <template v-slot:1>
            <q-icon name="directions_walk" />
        </template>
        <template v-slot:2>
            <q-icon name="directions_bike" />
        </template>
        <template v-slot:3>
            <q-icon name="directions_car" />
        </template>
        <template v-slot:4>
            <q-icon name="directions_bus" />
        </template>
    </q-btn-toggle>
    <q-btn class="run-button" 
            @click="getRouteRequest" 
            style="margin-top: 30px;" 
            color="secondary" 
            label="Get route" />
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
export default {
    name: 'RouteWidget',
    data() {
        return {
            dense: null,
            travelChoice: 'byWalk',
            fromLocation: null,
            toLocation: null,
        };
    }
}
</script>