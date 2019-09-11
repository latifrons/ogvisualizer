<template>
    <div id="app" style="margin-left: 10px; margin-top: 10px">
        <!--        <kc-graph @xx="setX" id="toplayer" style="width: 300px; height: 200px;" :myx="this.x+30" :interactive="true"></kc-graph>-->
        <!--        <div style="height: 20px"></div>-->
        <kc-graph style="width: 1536px; height: 600px;"></kc-graph>
<!--        <scrollpanetest style="width: 1500px; height: 400px"></scrollpanetest>-->
    </div>
</template>

<script lang="ts">

    import KcGraph from "./components/KcGraph.vue";
    import {getSeqData, Tx} from "@/ogapi";
    import Component from "vue-class-component"
    import {Prop} from "vue-property-decorator"
    import Vue from 'vue';

    @Component
    export default class App extends Vue{
    }
</script>

<style>
    #app {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }
</style>
