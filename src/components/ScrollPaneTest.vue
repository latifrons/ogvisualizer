<template>
    <div ref="renderArea">
        <slot></slot>
    </div>
</template>
<script lang="ts">
    import * as PIXI from "pixi.js";
    import Graphics = PIXI.Graphics;
    import {Component} from "vue-property-decorator"
    import Vue from "vue";
    import {ScrollPane} from "@/components/ScrollPane"

    class GraphConfiguration {
        public w: number;
        public h: number;
        public unitSize: number;

        constructor(w: number, h: number) {
            this.w = w;
            this.h = h;
            this.unitSize = h / 20;
        }
    }

    @Component
    export default class KcGraph extends Vue {
        app!: PIXI.Application;
        gc!: GraphConfiguration;
        canvasElement!: HTMLElement;
        scrollPane!: ScrollPane;

        public constructor() {
            super();
        }

        init() {
            this.canvasElement = this.$refs.renderArea as HTMLElement;
            // Determine the width and height of the renderer wrapper element.
            const w = this.canvasElement.offsetWidth;
            const h = this.canvasElement.offsetHeight;

            let pixiOptions: PIXI.ApplicationOptions = {
                transparent: false,
                backgroundColor: 0x0,
                width: w,
                height: h,
                antialias: true,
            };
            this.app = new PIXI.Application(pixiOptions);
            this.canvasElement.appendChild(this.app.view);

            // //fix scrolling when touching the canvas on mobile
            // this.app.renderer.plugins["interaction"].autoPreventDefault = false;
            // this.app.renderer.view.style.setProperty("touch-action", "auto");

            let gfx = new Graphics();
            gfx.lineStyle(5, 0xffffff,1);
            gfx.moveTo(0,0);
            gfx.lineTo(15000,400);

            gfx.moveTo(15000,0);
            gfx.lineTo(0,400);

            this.scrollPane = new ScrollPane(gfx, w, h, true);
            this.scrollPane.setMaxX(7000);
            this.scrollPane.setMinX(0);

            this.app.stage.addChild(this.scrollPane);
            this.app.ticker.add((deltaTime => {
                this.scrollPane.moveForward(deltaTime);
            }))

            // this.app.stage.interactive = true;
            // this.app.renderer.plugins.interaction.moveWhenInside = true;
        }

        mounted() {
            this.init();
            this.startMoving();
        }


        private startMoving() {
            let intervalId = setInterval(() => {
                this.scrollPane.setMaxX(this.scrollPane.maxX + 100);
            }, 2000)
        }
    }


</script>
<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
