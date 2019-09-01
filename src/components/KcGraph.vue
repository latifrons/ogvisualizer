<template>
    <div>
        <canvas ref="renderCanvas"></canvas>
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import * as PIXI from 'pixi.js'
    import {Tx} from "@/ogapi";
    import {Component, Vue, Prop, Watch} from 'vue-property-decorator';


    @Component
    export default class KcGraph extends Vue{
        // These need to be contained in an object because providers are not reactive.
        PIXIWrapper!: {
            // Expose PIXI and the created app to all descendants.
            PIXI: { Graphics: new () => void; };
            PIXIApp: null;
        };
        // Expose the event bus to all descendants so they can listen for the app-ready event.
        // EventBus!: new Vue();

        @Prop({ type: Array, required: true })
        txs!: Tx[] | undefined;

        @Watch('myx')
        onMyXChanged(newVal: string, oldVal: string){
            this.repaint();

        }

        // Allows any child component to `inject: ['provider']` and have access to it.
        // provide() {
        //     return {
        //         PIXIWrapper: this.PIXIWrapper,
        //         EventBus: this.EventBus
        //     }
        // },


        repaint() {
            let w = this.PIXIWrapper.PIXIApp.view.width;
            let h = this.PIXIWrapper.PIXIApp.view.height;

            while (this.PIXIWrapper.PIXIApp.stage.children.length > 0) {
                this.PIXIWrapper.PIXIApp.stage.removeChildAt(0);
            }

            var graphics = new this.PIXIWrapper.PIXI.Graphics();

            // set the line style to have a width of 5 and set the color to red
            graphics.lineStyle(1, 0xFF0000);
            graphics.beginFill(0x00FF00);

            // draw a rectangle
            graphics.drawRect(0, 0, w - 20, h - 20);
            this.PIXIWrapper.PIXIApp.stage.addChild(graphics);

            // draw all txs
            for (let tx of this.txs) {
                console.log(tx.)
            }


        }


        mounted() {

            // Determine the width and height of the renderer wrapper element.
            const renderCanvas = this.$refs.renderCanvas;
            const w = renderCanvas.offsetWidth - this.myx;
            const h = renderCanvas.offsetHeight;

            // Create a new PIXI app.
            this.PIXIWrapper.PIXIApp = new PIXI.Application(w, h, {
                view: renderCanvas,
                backgroundColor: 0x1099bb
            });

            this.EventBus.$emit('ready');
            this.PIXIWrapper.PIXIApp.stage.interactive = this.interactive;
            this.PIXIWrapper.PIXIApp.renderer.plugins.interaction.moveWhenInside = true;
            this.PIXIWrapper.PIXIApp.stage.mousemove = this.lll;
            this.PIXIWrapper.PIXIApp.stage.touchmove = this.lll;

            this.repaint();
        },
        methods: {
            lll(event) {
                var p = event.data.global;
                this.$emit("xx", p.x);
            },

        }
    }
</script>
<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
