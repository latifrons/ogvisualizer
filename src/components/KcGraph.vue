<template>
    <div ref="renderArea">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import * as PIXI from 'pixi.js'
    import {Tx} from "@/ogapi";
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';

    @Component
    export default class KcGraph extends Vue{
        // These need to be contained in an object because providers are not reactive.
        // PIXIWrapper : {
            // Expose PIXI and the created app to all descendants.
        // };
        // Expose the event bus to all descendants so they can listen for the app-ready event.
        // EventBus!: new Vue();

        @Prop()
        txs: Tx[] = [];

        // @Watch('myx')
        // onMyXChanged(newVal: string, oldVal: string){
        //     this.repaint();
        // }

        app: PIXI.Application;
        canvasElement: HTMLElement;
        private readonly gfx: PIXI.Graphics;


        public constructor() {
            super();
            // Determine the width and height of the renderer wrapper element.
            this.canvasElement = this.$refs.renderArea as HTMLElement;
            const w = this.canvasElement.offsetWidth;
            const h = this.canvasElement.offsetHeight;

            let pixiOptions : PIXI.ApplicationOptions = { transparent: false, backgroundColor: 0x1099bb, width: w, height: h };
            this.app = new PIXI.Application(pixiOptions);
            this.canvasElement.appendChild(this.app.view);

            //fix scrolling when touching the canvas on mobile
            this.app.renderer.plugins["interaction"].autoPreventDefault = false;
            this.app.renderer.view.style.setProperty('touch-action','auto');

            //register the window resize event to resize the pixi renderer
            window.addEventListener("resize", () => this.onWindowResized());

            this.gfx = new PIXI.Graphics();
            this.app.stage.addChild(this.gfx);
            this.app.stage.interactive = true;
            this.app.renderer.plugins.interaction.moveWhenInside = true;
            // this.app.stage.mousemove = this.lll;
            // this.app.stage.touchmove = this.lll;
        }

        repaint() {
            let w = this.app.view.width;
            let h = this.app.view.height;

            while (this.app.stage.children.length > 0) {
                this.app.stage.removeChildAt(0);
            }

            // set the line style to have a width of 5 and set the color to red
            this.gfx.lineStyle(1, 0xFF0000);
            this.gfx.beginFill(0x00FF00);

            // draw a rectangle
            this.gfx.drawRect(0, 0, w - 20, h - 20);

            // draw all txs
            for (let tx of this.txs) {
                console.log(tx.bet);

            }
        }

        mounted() {
            this.repaint();
        }

        private onWindowResized() {
            let canvasWidth : number = this.canvasElement.offsetWidth;
            let canvasHeight : number = this.canvasElement.offsetHeight;

            this.app.renderer.resize(canvasWidth, canvasHeight);
        }
    }
</script>
<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
