export class ScrollPane extends PIXI.Container{
    x: number = 0;
    content!: PIXI.DisplayObject;
    scrollBar!: PIXI.Graphics;
    scrollBarDragging = false;
    minX = 0;
    maxX = 0;

    constructor(content: PIXI.DisplayObject){
        // scroll bar
        super();
        this.content = content;
        this.maxX = this.width;
        this.setupScroolBar();
        this.addChild(this.content);
        this.addChild(this.scrollBar);
    }

    setMaxX(maxX: number){
        this.maxX = maxX;
        this.updateRange();
    }
    setMinX(minX: number){
        this.minX = minX;
        this.updateRange();
    }

    setupScroolBar(){
        this.scrollBar = new PIXI.Graphics();
        this.scrollBar.interactive = true;
        this.scrollBar.buttonMode = true;
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

    repaint(){

    }

    private onDragStart(event: PIXI.interaction.InteractionEvent) {
        this.scrollBarDragging = true;
        let p = event.data.getLocalPosition(event.currentTarget.parent);
        this.repaintScrollBar();
    }

    private onDragEnd(event: PIXI.interaction.InteractionEvent) {
        this.scrollBarDragging = false;
        this.repaintScrollBar();
    }

    private onDragMove(event: PIXI.interaction.InteractionEvent) {
        this.repaintScrollBar();
    }

    updateRange(){

    }

    getBarX(x: number) : number{
        return (this.x - this.minX) / (this.maxX - this.minX) * this.width;
    }

    repaintScrollBar(){
        this.scrollBar.clear();
        // background
        this.scrollBar.beginFill(0x333333);
        this.scrollBar.drawRect(0,0, this.width, 20);
        // foreground
        this.scrollBar.beginFill(0x888888);
        let left = this.getBarX(this.x);

        this.scrollBar.drawRect(0,0, this.width, 20);
    }
}
