class PhaserRegion extends Phaser.GameObjects.Container {
    constructor(scene, region) {
        super(scene);
        this.region = region;
        this.region = region;
        const stats = this.region._stats.default;
        // draw rectangle
        const rectangle = this.rectangle = scene.add.graphics();
        const width = this.width = stats.height;
        const height = this.height = stats.width;
        rectangle.fillStyle(0xFF0000, 0.4);
        rectangle.fillRect(0, 0, width, height);
        this.x = stats.x;
        this.y = stats.y;
        this.add(rectangle);
        scene.add.existing(this);
        scene.events.on('update', this.update, this);
    }
    update( /*time: number, delta: number*/) {
        const region = this.region;
        const container = region.regionUi._pixiContainer;
        if (region._destroyed || container._destroyed) {
            this.scene.events.off('update', this.update, this);
            this.destroy();
            return;
        }
        const stats = this.region._stats.default;
        if (this.x != stats.x)
            this.x = stats.x;
        if (this.y != stats.y)
            this.y = stats.y;
        if (this.width != stats.width || this.height != stats.height) {
            this.width = stats.width;
            this.height = stats.height;
            const rectangle = this.rectangle;
            rectangle.clear();
            rectangle.fillStyle(0xFF0000, 0.4);
            rectangle.fillRect(0, 0, stats.width, stats.height);
        }
    }
}
