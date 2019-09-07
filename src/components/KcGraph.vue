<template>
    <div ref="renderArea">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import * as PIXI from "pixi.js";
    import {Tx} from "@/ogapi";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import Vue from "vue";
    import Graphics = PIXI.Graphics;


    @Component
    export default class KcGraph extends Vue {
        // These need to be contained in an object because providers are not reactive.
        // PIXIWrapper : {
        // Expose PIXI and the created app to all descendants.
        // };
        // Expose the event bus to all descendants so they can listen for the app-ready event.
        // EventBus!: new Vue();

        @Prop()
        txs: Tx[] = [];

        // public $refs!: {
        //     renderArea: HTMLElement
        // };


        // @Watch('myx')
        // onMyXChanged(newVal: string, oldVal: string){
        //     this.repaint();
        // }

        app!: PIXI.Application;
        canvasElement!: HTMLElement;
        gfx!: PIXI.Graphics;

        dragging: boolean = false;


        public constructor() {
            super();
            // this.app.stage.mousemove = this.lll;
            // this.app.stage.touchmove = this.lll;
        }

        repaint() {
            console.log("repaint");
            let w = this.app.view.width;
            let h = this.app.view.height;


            // while (this.app.stage.children.length > 0) {
            //     this.app.stage.removeChildAt(0);
            // }
            console.log(w, h);

            // set the line style to have a width of 5 and set the color to red
            this.gfx.lineStyle(1, 0xFF0000);
            this.gfx.beginFill(0x004F00);

            // draw a rectangle
            // this.gfx.drawRect(200, 500, 500,500);
            this.gfx.drawCircle(0, 0, 30);

            // draw all txs
            for (let tx of this.txs) {
                console.log(tx.bet);
            }
            // this.app.stage.addChild(this.gfx);
        }

        init() {
            // Determine the width and height of the renderer wrapper element.
            this.canvasElement = this.$refs.renderArea as HTMLElement;
            const w = this.canvasElement.offsetWidth;
            const h = this.canvasElement.offsetHeight;

            let pixiOptions: PIXI.ApplicationOptions = {
                transparent: false,
                backgroundColor: 0x1099bb,
                width: w,
                height: h
            };
            this.app = new PIXI.Application(pixiOptions);
            this.canvasElement.appendChild(this.app.view);

            //fix scrolling when touching the canvas on mobile
            this.app.renderer.plugins["interaction"].autoPreventDefault = false;
            this.app.renderer.view.style.setProperty("touch-action", "auto");

            //register the window resize event to resize the pixi renderer
            window.addEventListener("resize", () => this.onWindowResized());

            this.gfx = new PIXI.Graphics();
            this.gfx.interactive = true;
            this.gfx.buttonMode = true;
            this.gfx
                .on("pointerdown", this.onDragStart)
                .on("pointerup", this.onDragEnd)
                .on("pointerupoutside", this.onDragEnd)
                .on("pointermove", this.onDragMove);
            this.gfx.x = this.gfx.y = 100;

            this.app.stage.addChild(this.gfx);
            this.app.stage.interactive = true;
            // this.app.renderer.plugins.interaction.moveWhenInside = true;
        }

        onDragStart(event: PIXI.interaction.InteractionEvent) {
            // store a reference to the data
            // the reason for this is because of multitouch
            // we want to track the movement of this particular touch
            let currentTarget: Graphics = event.currentTarget as Graphics;
            let data = event.data;
            let type = event.type;
            this.dragging = true;

            let p = event.data.getLocalPosition(event.currentTarget.parent);

            // console.log(type, "moving to ", p);
            currentTarget.x = p.x;
            currentTarget.y = p.y;
            // context.data = event.data;
            // event.data.
            // context.alpha = 0.5;
            // context.dragging = true;
        }

        onDragEnd(event: PIXI.interaction.InteractionEvent) {
            // context.alpha = 1;
            // this.dragging = false;
            // set the interaction data to null
            // this.data = null;
            let currentTarget: Graphics = event.currentTarget as Graphics;
            let data = event.data;
            let type = event.type;
            this.dragging = false;
            // console.log(event);
        }

        onDragMove(event: PIXI.interaction.InteractionEvent) {
            // if (this.dragging) {
            // const newPosition = this.data.getLocalPosition(event..parent);
            // context.x = newPosition.x;
            // context.y = newPosition.y;
            // }
            let currentTarget: Graphics = event.currentTarget as Graphics;
            let data = event.data;
            let type = event.type;

            let p = event.data.getLocalPosition(event.currentTarget.parent);

            if (this.dragging) {
                // console.log(type, "moving to ", p);
                currentTarget.x = p.x;
                currentTarget.y = p.y;
            }
            // console.log(event);
        }

        animate() {
            this.app.renderer.render(this.app.stage);
            requestAnimationFrame(this.animate);
        }

        mounted() {
            this.init();
            this.repaint();
            this.animate();
        }

        private onWindowResized() {
            let canvasWidth: number = this.canvasElement.offsetWidth;
            let canvasHeight: number = this.canvasElement.offsetHeight;
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
