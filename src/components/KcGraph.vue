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

    const TYPE_SEQUENCER = 1;
    const TYPE_TX = 0;

    const MAX_NODES = 200;

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
        // wsURL = "ws://localhost:8765";
        // wsURL = "ws://47.100.122.212:30020/ws";

        // @Prop()
        wsURL: string = "ws://47.100.122.212:30020/ws";

        txs: Tx[] = [];

        app!: PIXI.Application;
        mainArea!: PIXI.Container;
        scrollPane!: ScrollPane;

        canvasElement!: HTMLElement;

        hashTx: Record<string, TxG> = {};
        gc: GraphConfiguration;
        nameTeams: Record<string, Team> = {};
        socket!: WebSocket;
        seqs: TxG[] = [];


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
            wordWrapWidth: 840,
        }));
        private currentHighlighting!: TxG;

        public constructor() {
            super();
            this.gc = new GraphConfiguration(0, 0);
            window.addEventListener("keypress", this.handler);

        }

        repaint() {
            // draw background

            // while (this.app.stage.children.length > 0) {
            //     this.app.stage.removeChildAt(0);
            // }

            // draw all txs
            for (let tx of this.txs) {
                this.handleTx(tx);
            }
            // this.app.stage.addChild(this.gfx);
        }

        repaintTx(gfx: TxG, repaintChildren: boolean= true, repaintParents: boolean = true, parentHighlighing = false, parentHighlighingTxG?: TxG) {
            if (!gfx){
                return;
            }
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
                }else if (parentHighlighing && parentHighlighingTxG != null && parent == parentHighlighingTxG.tx.id) { // highlighted because of hovering on the parent
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
                    this.repaintTx(this.hashTx[child], false, false, gfx.highlighting, gfx);
                }
            }

            gfx.lineStyle(1, 0x0);
            if (gfx.children.length == 0){
                gfx.beginFill(gfx.team.color);
            }else{
                gfx.beginFill(gfx.team.color, 0.5);
            }

            if (gfx.tx.type == TYPE_SEQUENCER){
                gfx.lineStyle(3, 0xEEEEEE);
                gfx.drawCircle(0,0,gfx.radius);
            }else{
                gfx.drawRect(-gfx.radius/2, -gfx.radius/2, gfx.radius, gfx.radius);
            }
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
            this.infoAreaText.text = 'Hover to see the detailed info. Press Enter to take a screenshot.';

            let background = new Graphics();
            background.beginFill(0);
            background.drawRect(0,0,w,h);

            this.app.stage.addChild(background);
            this.app.stage.addChild(this.infoAreaText);

            this.mainArea = new PIXI.Container();
            this.mainArea.interactive = true;

            this.scrollPane = new ScrollPane(this.mainArea,w,h,true);
            this.scrollPane.setMaxX(w);

            this.app.stage.addChild(this.scrollPane);

            this.gc.w = this.app.view.width;
            this.gc.h = this.app.view.height;

            // this.app.stage.interactive = true;
            // this.app.renderer.plugins.interaction.moveWhenInside = true;
            this.app.ticker.add((deltaTime => {
                this.scrollPane.moveForward(deltaTime);
            }))
        }

        handleTx(tx: Tx) {
            if (this.hashTx[tx.id] !== undefined){
                // already there. duplicate tx.
                return;
            }
            while (this.mainArea.children.length > MAX_NODES){
                // remove one
                let canContinue = this.clearOldestSequencer();
                if (!canContinue){
                    break;
                }
            }
            let team = this.judgeTeam(tx);
            let gfx = this.setupTxG(tx,team);

            // this.infoAreaText.text = Object.keys(this.hashTx).length.toString();
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
            this.reload();
            console.log(this.wsURL);

            if (this.$route.query["mode"] != "static"){
                this.wsconnect();
            }
            // this.animate();
        }

        private onWindowResized() {
            let canvasWidth: number = this.canvasElement.offsetWidth;
            let canvasHeight: number = this.canvasElement.offsetHeight;
            this.app.renderer.resize(canvasWidth, canvasHeight);
        }

        private reload() {
            let ogHeight = this.$route.query["height"] as string;
            if (ogHeight ==  null){
                return;
            }
            this.txs = getSeqData(parseInt(ogHeight), this.reloadCallback);
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
            switch (ct.tx.type){
                case TYPE_SEQUENCER:
                    this.infoAreaText.text = `Sequencer ${ct.tx.height} : ${ct.tx.bet}`;
                    break;
                case TYPE_TX:
                    this.infoAreaText.text = `Tx: ${ct.tx.owner} Guarantee: ${ct.tx.bet}`;
                    break;
            }

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

            this.hashTx[tx.id] = gfx;
            // builc children relationship
            // update weight if missing
            let supposeWeight = 0;
            for (let parent of gfx.tx.parents){
                let parentTxg = this.hashTx[parent];
                if (parentTxg){
                    this.hashTx[parent].txChildren.push(tx.id);
                    supposeWeight = Math.max(supposeWeight, parentTxg.tx.weight + 1);
                }
            }

            if (!gfx.tx.weight){
                gfx.tx.weight = supposeWeight;
            }

            gfx.radius = Math.max(Math.log10(gfx.tx.bet) * this.gc.h / 100, 15);
            gfx.x = Math.random() * 70 + tx.weight * 100;

            if (gfx.tx.type == TYPE_SEQUENCER){
                gfx.y = this.gc.h / 2;
            }else{
                gfx.y = gfx.radius + Math.random() * (this.gc.h - gfx.radius * 2);
            }

            // update viewport
            this.scrollPane.setMaxX(Math.max(this.scrollPane.maxX, gfx.x + gfx.radius));
            // update sequencer list
            if (gfx.tx.type == TYPE_SEQUENCER){
                this.seqs.push(gfx);
            }

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
            let tx = Tx.parse(JSON.parse(data.data));
            console.log(tx);
            if (tx == null){
                return;
            }
            this.handleTx(tx);

        }

        wsconnect() {
            console.log("connecting ws");
            this.socket = new WebSocket(this.wsURL);

            this.socket.onopen = () => {
                this.socket.onmessage = this.welcomeNewTx;
            };

            this.socket.onclose = () =>{
                setTimeout(this.wsconnect, 1000);
            };
            this.socket.onerror = (err) =>{
                this.socket.close();
            }
        }


        private removeNode(txg: TxG){
            if (txg === undefined || this.hashTx[txg.tx.id] === undefined){
                return;
            }
            delete(this.hashTx[txg.tx.id]);
            this.mainArea.removeChild(txg);
            // recursively remove all parents
            for (let parent of txg.tx.parents){
                this.removeNode(this.hashTx[parent]);
            }
        }

        private clearOldestSequencer() :boolean{
            if (this.seqs.length <=2){
                console.log("seq length", this.seqs.length);
                return false;
            }
            let toRemoveSeq = this.seqs[0];
            this.removeNode(toRemoveSeq);
            this.seqs.splice(0,1);
            this.scrollPane.setMinX(toRemoveSeq.x);
            console.log("after length", this.seqs.length);
            return true;
        }

        private reloadCallback(txs: Tx[]) {
            this.txs = txs;
            this.repaint();
        }

        handler(e: KeyboardEvent){
            console.log(e);
            if (e.key === "Enter"){
                // save to local png
                this.app.renderer.extract.canvas(this.app.stage).toBlob(function(b){
                    var a = document.createElement('a');
                    document.body.append(a);
                    a.download = "hackathon.png";
                    a.href = URL.createObjectURL(b);
                    a.click();
                    a.remove();
                }, 'image/png');
            }

        }
    }
</script>
<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
