const barHeight = 15;

export class ScrollPane extends PIXI.Container{
    content: PIXI.DisplayObject;
    widthDesign: number;
    heightDesign: number;
    scrollBar!: PIXI.Graphics;
    minX = 0;
    maxX = 0;

    viewX = 0;
    scrollBarDragging = false;
    smoothForward = false;
    isFollowing = true;
    scrollBarStartingXOffset = 0;


    constructor(content: PIXI.DisplayObject, width: number, height: number, smoothForward: boolean = false){
        // scroll bar
        super();
        this.content = content;
        this.widthDesign = width;
        this.heightDesign = height;
        this.maxX = this.width;
        this.smoothForward = smoothForward;
        this.addChild(this.content);

        this.setupScrollBar();
        this.addChild(this.scrollBar);
        window.addEventListener("keypress", this.handler);

    }

    handler = (e: KeyboardEvent) => {
        console.log(e);
        if (e.key === " "){
            this.isFollowing = true;
        }

    };

    setMaxX(maxX: number){
        if (this.maxX != maxX){
            this.updateRange(this.minX, maxX);
        }

    }
    setMinX(minX: number){
        if (this.minX != minX){
            this.updateRange(minX, this.maxX);
        }
    }

    setupScrollBar(){
        this.scrollBar = new PIXI.Graphics();
        this.scrollBar.interactive = true;
        this.scrollBar.buttonMode = true;
        this.scrollBar.y = this.heightDesign - barHeight;
        this.scrollBar
        // events for drag start
            .on('mousedown', this.onDragStart, this)
            .on('touchstart', this.onDragStart, this)
            // events for drag end
            .on('mouseup', this.onDragEnd, this)
            .on('mouseupoutside', this.onDragEnd, this)
            .on('touchend', this.onDragEnd, this)
            .on('touchendoutside', this.onDragEnd, this)
            // events for drag move
            .on('mousemove', this.onDragMove, this)
            .on('touchmove', this.onDragMove, this);
            // .on('mouseover', this.onMouseOver)
            // .on('mouseout', this.onMouseOut);
        this.repaintScrollBar();
    }

    private onDragStart(event: PIXI.interaction.InteractionEvent) {
        let p = event.data.getLocalPosition(event.currentTarget.parent);
        this.scrollBarDragging = true;
        this.scrollBarStartingXOffset = p.x - this.getCurrentBarX();
        this.isFollowing = false;
    }

    private onDragEnd(event: PIXI.interaction.InteractionEvent) {
        this.scrollBarDragging = false;
        this.isFollowing = this.isKeepingLatest()
    }

    private onDragMove(event: PIXI.interaction.InteractionEvent) {
        if (!this.scrollBarDragging){
            return;
        }
        let p = event.data.getLocalPosition(event.currentTarget.parent);
        let newX = p.x - this.scrollBarStartingXOffset;
        newX = Math.max(0, Math.min(newX, this.widthDesign - this.getCurrentBarWidth()));
        this.viewX = this.minX + (this.maxX - this.minX) * (newX / this.widthDesign);
        this.updateViewX();
    }

    updateViewX(){
        this.content.x = -this.getCurrentViewX();
        this.repaintScrollBar();
    }

    isKeepingLatest(){
        return Math.abs(this.getCurrentBarX() + this.getCurrentBarWidth() - this.widthDesign) < 0.001;
    }

    /**
     * redefine the left and right bound of the whole canvas to show.
     * it will also repaint the scrollbar since the full range is changed.
     * @param minX
     * @param maxX
     */
    updateRange(minX: number, maxX: number){
        this.minX = minX;
        this.maxX = maxX;
        // viewX is not changing unless it is out of range.
        this.viewX = Math.min(this.maxX, this.viewX);
        this.viewX = Math.max(this.minX, this.viewX);
        this.repaintScrollBar();
        // this.updateViewX(this.viewPercentage)
    }


    getCurrentViewX(): number{
        return this.viewX;
    }

    getCurrentBarX() : number{
        return (this.viewX-this.minX) / (this.maxX - this.minX) * this.widthDesign;
    }

    getCurrentViewPercentage(): number{
        return this.widthDesign / (this.maxX - this.minX);
    }

    getCurrentBarWidth(): number{
        return this.widthDesign * this.widthDesign / (this.maxX - this.minX);
    }
    getMaxViewPercentage():number{
        return Math.max(0, 1- this.widthDesign / this.maxX)
    }

    repaintScrollBar(){
        this.scrollBar.clear();
        // background
        this.scrollBar.beginFill(0x333333,0.5);
        this.scrollBar.drawRect(0,0, this.width, barHeight);
        // foreground
        this.scrollBar.beginFill(0x888888,0.5);
        this.scrollBar.drawRect(this.getCurrentBarX(),0, this.getCurrentBarWidth(), barHeight);
    }

    moveForward(deltaTime: number) {
        if (!this.smoothForward || !this.isFollowing){
            return;
        }
        // this is the target
        // this.content.x = -this.getCurrentViewX();
        // here is the gap
        let gap = (this.maxX - this.widthDesign) - (-this.content.x);
        // console.log("gap", (this.maxX - this.widthDesign), this.content.x, gap);
        if (gap > 0.001){
            this.viewX += deltaTime * (Math.max(1, gap / 20));
            this.updateViewX();
        }
    }
}
