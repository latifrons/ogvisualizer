<template>
    <div id="app" style="margin-left: 10px; margin-top: 10px">
        <!--        <kc-graph @xx="setX" id="toplayer" style="width: 300px; height: 200px;" :myx="this.x+30" :interactive="true"></kc-graph>-->
        <!--        <div style="height: 20px"></div>-->
        <kc-graph style="width: 1600px; height: 800px;">
            <!--            <kc-curve v-for="n in 1" :x="3*n" :y="3*n"></kc-curve>-->
        </kc-graph>
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
        // @Prop()
        // propA: number = 1
        //
        // @Prop({ default: 'default value' })
        // propB: string
        //
        // @Prop([String, Boolean])
        // propC: string | boolean
        //
        // @Prop({ type: null })
        // propD: any

        @Prop()
        x: number = 0;

        @Prop()
        alldata: Tx[] = [];

        mounted() {
            this.alldata = getSeqData(1);
        }

        get computedMsg(){
            return 'computed' + this.x
        }

        setX(x:number){
            this.x =x ;
        }
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
