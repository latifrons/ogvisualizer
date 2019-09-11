const barHeight = 20;

export class ScrollPane extends PIXI.Container{
    viewPercentage: number = 0;
    content: PIXI.DisplayObject;
    widthDesign: number;
    heightDesign: number;
    scrollBar!: PIXI.Graphics;
    minX = 0;
    maxX = 0;

    scrollBarDragging = false;
    scrollBarDraggingStartingPercentage = 0;
    scrollBarDraggingStartingX = 0;
    smoothForward = false;


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
    }

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
        this.scrollBarDraggingStartingPercentage = this.viewPercentage;
        this.scrollBarDraggingStartingX = p.x;
    }

    private onDragEnd(event: PIXI.interaction.InteractionEvent) {
        this.scrollBarDragging = false;
    }

    private onDragMove(event: PIXI.interaction.InteractionEvent) {
        if (!this.scrollBarDragging){
            return;
        }
        let p = event.data.getLocalPosition(event.currentTarget.parent);
        let newX = (p.x - this.scrollBarDraggingStartingX) + this.widthDesign * this.scrollBarDraggingStartingPercentage;
        newX = Math.max(0, Math.min(newX, this.widthDesign - this.getCurrentBarWidth()));
        this.viewPercentage = newX / this.widthDesign;
        this.updateViewX(this.viewPercentage);
    }

    updateViewX(viewPercentage:number){
        this.viewPercentage = viewPercentage;
        this.content.x = -this.getCurrentViewX();
        this.repaintScrollBar();
    }

    isKeepingLatest(){
        return Math.abs(this.viewPercentage - this.getMaxViewPercentage()) < 0.00001
    }

    updateRange(minX: number, maxX: number){
        // test if the scroll bar is on the very right
        let keepLatest = this.isKeepingLatest();
        this.minX = minX;
        this.maxX = maxX;
        if (keepLatest){
            this.viewPercentage = this.getMaxViewPercentage();
        }
        this.repaintScrollBar();
        // this.updateViewX(this.viewPercentage)
    }


    getCurrentViewX(): number{
        return this.minX + (this.maxX - this.minX)*this.viewPercentage;
    }

    getCurrentBarX() : number{
        return this.widthDesign * this.viewPercentage;
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
        if (!this.smoothForward || !this.isKeepingLatest()){
            return;
        }
        // this is the target
        // this.content.x = -this.getCurrentViewX();
        // here is the gap
        let gap = this.getCurrentViewX() - (-this.content.x);
        if (gap > 0){
            this.content.x -= deltaTime * (Math.max(1, gap / 20));
        }
    }
}
