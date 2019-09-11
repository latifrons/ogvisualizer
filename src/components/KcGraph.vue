<template>
    <div ref="renderArea">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import * as PIXI from "pixi.js";
    import {getSeqData, Tx} from "@/ogapi";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import Vue from "vue";
    import Graphics = PIXI.Graphics;
    import randomcolor from "randomcolor"
    import {ScrollPane} from "@/components/ScrollPane"

    class Team {
        public name: string;
        public color: number;

        constructor(name: string, color: number) {
            this.name = name;
            this.color = color;
        }
    }

    class TxG extends Graphics {
        public tx: Tx;
        public team: Team;
        public dragging: boolean = false;
        public txChildren: string[] = [];
        public highlighting: boolean = false;
        public radius: number = 0;

        constructor(tx: Tx, team: Team) {
            super();
            this.tx = tx;
            this.team = team;
        }
    }

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

        @Prop()
        txs: Tx[] = [];

        app!: PIXI.Application;
        mainArea!: PIXI.Container;
        scrollPane!: ScrollPane;

        canvasElement!: HTMLElement;

        hashTx: Record<string, TxG> = {};
        gc: GraphConfiguration;
        nameTeams: Record<string, Team> = {};
        socket: WebSocket;

        infoAreaText: PIXI.Text = new PIXI.Text("", new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            // fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2,
            wordWrap: true,
            wordWrapWidth: 440,
        }));
        private currentHighlighting!: TxG;

        public constructor() {
            super();
            this.socket = new WebSocket("ws://localhost:8765");
            this.gc = new GraphConfiguration(0, 0);
        }

        repaint() {
            console.log("repaint");
            this.gc.w = this.app.view.width;
            this.gc.h = this.app.view.height;

            // draw background

            // while (this.app.stage.children.length > 0) {
            //     this.app.stage.removeChildAt(0);
            // }

            // draw all txs
            for (let tx of this.txs) {
                console.log(tx.bet);
                this.handleTx(tx);
            }
            // this.app.stage.addChild(this.gfx);
        }

        repaintTx(gfx: TxG, repaintChildren: boolean= true, repaintParents: boolean = true, parentHighlighing = false) {
            gfx.clear();

            // locate other and connect them
            for (let parent of gfx.tx.parents){
                let parentGfx = this.hashTx[parent];
                if (parentGfx === undefined){
                    // TODO: makeup one
                    continue;
                }
                if (gfx.highlighting){ // self highlighting
                    gfx.lineStyle(3, 0xec4e20, 1);
                }else if (parentHighlighing) { // highlighted because of hovering on the parent
                    gfx.lineStyle(2, 0xe5d4ce, 0.7);
                }else{
                    gfx.lineStyle(1, 0xfcffa6, 0.4);
                }

                gfx.moveTo(0,0);
                gfx.lineTo(parentGfx.x - gfx.x, parentGfx.y - gfx.y);
                if (repaintParents){
                    this.repaintTx(parentGfx, false, false);
                }
            }


            if (repaintChildren){
                for (let child of gfx.txChildren){
                    console.log("repaint children", gfx.tx);
                    this.repaintTx(this.hashTx[child], false, false, gfx.highlighting);
                }
            }

            gfx.lineStyle(1, 0x0);
            if (gfx.children.length == 0){
                gfx.beginFill(gfx.team.color);
            }else{
                gfx.beginFill(gfx.team.color, 0.5);
            }

            gfx.drawRect(-gfx.radius/2, -gfx.radius/2, gfx.radius, gfx.radius);

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

            //fix scrolling when touching the canvas on mobile
            this.app.renderer.plugins["interaction"].autoPreventDefault = false;
            this.app.renderer.view.style.setProperty("touch-action", "auto");

            //register the window resize event to resize the pixi renderer
            window.addEventListener("resize", () => this.onWindowResized());

            // add info area
            this.infoAreaText.text = 'Hover to see the detailed info';

            this.app.stage.addChild(this.infoAreaText);

            this.mainArea = new PIXI.Container();
            this.mainArea.interactive = true;

            this.scrollPane = new ScrollPane(this.mainArea,w,h);
            this.scrollPane.setMaxX(w);

            this.app.stage.addChild(this.scrollPane);
            // this.app.stage.interactive = true;
            // this.app.renderer.plugins.interaction.moveWhenInside = true;
        }

        handleTx(tx: Tx) {
            if (this.hashTx[tx.id] !== undefined){
                // already there. duplicate tx.
                return;
            }
            let team = this.judgeTeam(tx);
            let gfx = this.setupTxG(tx,team);
            this.repaintTx(gfx);
            this.mainArea.addChild(gfx);
        }

        onDragStart(event: PIXI.interaction.InteractionEvent) {
            // store a reference to the data
            // the reason for this is because of multitouch
            // we want to track the movement of this particular touch

            let currentTarget: TxG = event.currentTarget as TxG;
            let data = event.data;
            let type = event.type;
            currentTarget.dragging = true;

            let p = event.data.getLocalPosition(event.currentTarget.parent);

            // console.log(type, "moving to ", p);
            currentTarget.x = p.x;
            currentTarget.y = p.y;
            this.repaintTx(currentTarget);
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
            let currentTarget: TxG = event.currentTarget as TxG;
            let data = event.data;
            let type = event.type;
            currentTarget.dragging = false;
            this.repaintTx(currentTarget);
            // console.log(event);
        }

        onDragMove(event: PIXI.interaction.InteractionEvent) {
            // if (this.dragging) {
            // const newPosition = this.data.getLocalPosition(event..parent);
            // context.x = newPosition.x;
            // context.y = newPosition.y;
            // }
            let currentTarget: TxG = event.currentTarget as TxG;
            let data = event.data;
            let type = event.type;

            let p = event.data.getLocalPosition(event.currentTarget.parent);

            if (currentTarget.dragging) {
                currentTarget.x = p.x;
                currentTarget.y = p.y;
                this.repaintTx(currentTarget);
            }
            // console.log(event);
        }

        animate() {
            this.app.renderer.render(this.app.stage);
            requestAnimationFrame(this.animate);
        }

        mounted() {
            this.init();
            this.reload(1);
            this.repaint();
            this.wsconnect();
            // this.animate();
        }

        private onWindowResized() {
            let canvasWidth: number = this.canvasElement.offsetWidth;
            let canvasHeight: number = this.canvasElement.offsetHeight;
            this.app.renderer.resize(canvasWidth, canvasHeight);
        }

        private reload(height: number) {
            console.log("reload");
            this.txs = getSeqData(1);
        }

        private onMouseOver(event: PIXI.interaction.InteractionEvent) {
            let ct: TxG = event.currentTarget as TxG;
            if (this.currentHighlighting){
                if (this.currentHighlighting !== ct){
                    this.currentHighlighting.highlighting = false;
                    this.repaintTx(this.currentHighlighting)
                }
            }

            ct.highlighting = true;
            this.currentHighlighting = ct;
            this.repaintTx(this.currentHighlighting);
            this.infoAreaText.text = `Type: ${ct.tx.type} Team: ${ct.tx.owner} Bet: ${ct.tx.bet}`
        }
        private onMouseOut(event: PIXI.interaction.InteractionEvent) {
            if (this.currentHighlighting){
                this.currentHighlighting.highlighting = false;
                this.repaintTx(this.currentHighlighting);
            }
        }


        private setupTxG(tx: Tx, team: Team): TxG{
            let gfx = new TxG(tx, team);
            gfx.interactive = true;
            gfx.buttonMode = true;
            gfx
            // events for drag start
                .on('mousedown', this.onDragStart)
                .on('touchstart', this.onDragStart)
                // events for drag end
                .on('mouseup', this.onDragEnd)
                .on('mouseupoutside', this.onDragEnd)
                .on('touchend', this.onDragEnd)
                .on('touchendoutside', this.onDragEnd)
                // events for drag move
                .on('mousemove', this.onDragMove)
                .on('touchmove', this.onDragMove)
                .on('mouseover', this.onMouseOver)
                .on('mouseout', this.onMouseOut);

            gfx.radius = Math.min(Math.log10(gfx.tx.bet) * this.gc.h / 100, 20);
            gfx.x = Math.random() * 70 + tx.weight * 100;
            let suggestedY = gfx.radius + Math.random() * (this.gc.h - gfx.radius * 2);
            gfx.y = suggestedY;

            this.hashTx[tx.id] = gfx;
            // builc children relationship
            for (let parent of gfx.tx.parents){
                this.hashTx[parent].txChildren.push(tx.id);
            }
            // update viewport
            this.scrollPane.setMaxX(Math.max(this.scrollPane.maxX, gfx.x));
            return gfx;
        }

        private judgeTeam(tx: Tx) :Team{
            let team = this.nameTeams[tx.owner];

            if (team === undefined) {
                // randomly pick a color for this team.
                let s  = randomcolor({
                    luminosity: 'light',
                    format: 'hex',
                });
                let color = parseInt(s.substr(1,6),16);
                this.nameTeams[tx.owner] = new Team(tx.owner, color);
            }
            team = this.nameTeams[tx.owner];
            return team;
        }

        welcomeNewTx(data: MessageEvent){
            console.log(data.data);
            let tx = Tx.parse(data.data);
            console.log(tx);
            if (tx == null){
                return;
            }
            this.handleTx(tx);

        }

        wsconnect() {
            this.socket.onopen = () => {
                this.socket.onmessage = this.welcomeNewTx;
            };
        }
        disconnect() {
            this.socket.close();
        }
        sendMessage(e: string) {
            this.socket.send(e);
        }

    }
</script>
<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
