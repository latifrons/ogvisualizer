<template>
    <div id="app" style="margin-left: 10px; margin-top: 10px">
        <!--        <kc-graph @xx="setX" id="toplayer" style="width: 300px; height: 200px;" :myx="this.x+30" :interactive="true"></kc-graph>-->
        <!--        <div style="height: 20px"></div>-->
        <kc-graph @xx="setX" style="width: 1800px; height: 950px;" :myx="this.x" :interactive="true" :txs="alldata">
            <!--            <kc-curve v-for="n in 1" :x="3*n" :y="3*n"></kc-curve>-->
        </kc-graph>
    </div>
</template>

<script>
    import KcGraph from "./components/KcGraph.vue";
    import {getSeqData, Tx} from "@/ogapi";

    export default {
        data() {
            return {
                x: 0,
                alldata: Tx[]  = [],
            }
        },
        name: "app",
        components: {
            KcGraph,
            // KcCurve,
        },
        methods: {
            setX(x) {
                this.x = x;
            }
        },
        mounted() {
            this.alldata = getSeqData(1);
        }
    };


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
