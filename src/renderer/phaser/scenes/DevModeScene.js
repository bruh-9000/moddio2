class DevModeScene extends PhaserScene {
    constructor() {
        super({ key: 'DevMode' });
    }
    init() {
        this.gameScene = taro.renderer.scene.getScene('Game');
        this.pointerInsideButtons = false;
        this.regions = [];
        this.entityImages = [];
        this.showRepublishWarning = false;
        taro.client.on('unlockCamera', () => {
            const camera = this.gameScene.cameras.main;
            camera.stopFollow();
            if (this.gameScene.useBounds)
                camera.useBounds = false;
        });
        taro.client.on('lockCamera', () => {
            var _a, _b, _c, _d;
            taro.client.emit('zoom', taro.client.zoom);
            let trackingDelay = ((_d = (_c = (_b = (_a = taro === null || taro === void 0 ? void 0 : taro.game) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.settings) === null || _c === void 0 ? void 0 : _c.camera) === null || _d === void 0 ? void 0 : _d.trackingDelay) || 3;
            trackingDelay = trackingDelay / 60;
            const camera = this.gameScene.cameras.main;
            if (this.gameScene.cameraTarget)
                camera.startFollow(this.gameScene.cameraTarget, false, trackingDelay, trackingDelay);
            if (this.gameScene.useBounds)
                camera.useBounds = true;
        });
        taro.client.on('enterMapTab', () => {
            this.enterMapTab();
        });
        taro.client.on('leaveMapTab', () => {
            this.leaveMapTab();
        });
        taro.client.on('enterEntitiesTab', () => {
        });
        taro.client.on('leaveEntitiesTab', () => {
        });
        taro.client.on('editTile', (data) => {
            this.tileEditor.edit(data);
        });
        taro.client.on('editRegion', (data) => {
            this.regionEditor.edit(data);
        });
        taro.client.on('editInitEntity', (data) => {
            let found = false;
            this.entityImages.forEach((image) => {
                if (image.entity.action.actionId === data.actionId) {
                    found = true;
                    image.entity.update(data);
                }
            });
            if (!found) {
                this.createEntityImage(data);
            }
        });
        taro.client.on('applyScriptChanges', (data) => {
            taro.network.send('editGlobalScripts', data);
        });
        taro.client.on('editGlobalScripts', (data) => {
            Object.entries(data).forEach(([scriptId, script]) => {
                if (!script.deleted) {
                    taro.developerMode.serverScriptData[scriptId] = script;
                }
                else {
                    delete taro.developerMode.serverScriptData[scriptId];
                }
            });
            taro.script.load(data, true);
            taro.script.scriptCache = {};
        });
        taro.client.on('applyVariableChanges', (data) => {
            taro.network.send('editVariable', data);
        });
        taro.client.on('editVariable', (data) => {
            Object.entries(data).forEach(([key, variable]) => {
                //editing existing variable
                if (taro.game.data.variables[key]) {
                    //deleting variable
                    if (variable.delete) {
                        delete taro.game.data.variables[key];
                        //renaming variable
                    }
                    else if (variable.newKey) {
                        taro.game.data.variables[variable.newKey] = taro.game.data.variables[key];
                        delete taro.game.data.variables[key];
                        //editing variable
                    }
                    else {
                        taro.game.data.variables[key].value = variable.value;
                    }
                    //creating new variable
                }
                else {
                    taro.game.data.variables[key] = {
                        dataType: variable.dataType,
                        value: variable.value
                    };
                }
            });
        });
        taro.client.on('updateInitEntities', () => {
            this.updateInitEntities();
        });
        this.gameScene.input.on('pointerup', (p) => {
            const draggedEntity = taro.unitBeingDragged;
            // taro.unitBeingDragged = {typeId: 'unit id', playerId: 'xyz', angle: 0, entityType: 'unit'}
            if (draggedEntity) {
                // find position and call editEntity function.
                const worldPoint = this.gameScene.cameras.main.getWorldPoint(p.x, p.y);
                const playerId = taro.game.getPlayerByClientId(taro.network.id()).id();
                const data = {
                    action: 'create',
                    entityType: draggedEntity.entityType,
                    typeId: draggedEntity.typeId,
                    playerId: playerId,
                    position: {
                        x: worldPoint.x,
                        y: worldPoint.y
                    },
                    angle: draggedEntity.angle
                };
                taro.developerMode.editEntity(data, playerId);
                taro.unitBeingDragged = null;
            }
        });
    }
    preload() {
        /*const data = taro.game.data;

        data.map.tilesets.forEach((tileset) => {
            const key = `tiles/${tileset.name}`;
            this.load.once(`filecomplete-image-${key}`, () => {
                const texture = this.textures.get(key);
                const canvas = this.mainScene.extrude(tileset,
                    texture.getSourceImage() as HTMLImageElement
                );
                if (canvas) {
                    this.textures.remove(texture);
                    this.textures.addCanvas(`extruded-${key}`, canvas);
                }
            });
            this.load.image(key, this.patchAssetUrl(tileset.image));
        });*/
        this.load.image('cursor', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1666276041347_cursor.png'));
        this.load.image('entity', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1686840222943_cube.png'));
        this.load.image('region', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1666882309997_region.png'));
        this.load.image('stamp', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1666724706664_stamp.png'));
        this.load.image('eraser', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1666276083246_erasergap.png'));
        this.load.image('eyeopen', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1669820752914_eyeopen.png'));
        this.load.image('eyeclosed', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1669821066279_eyeclosed.png'));
        this.load.image('fill', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1675428550006_fill_(1).png'));
        this.load.image('clear', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1681917489086_layerClear.png'));
        this.load.image('save', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1681916834218_saveIcon.png'));
        this.load.image('redo', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1686899810953_redo.png'));
        this.load.image('undo', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1686899853748_undo.png'));
        this.load.image('settings', this.patchAssetUrl('https://cache.modd.io/asset/spriteImage/1707131801364_download.png'));
        this.load.scenePlugin('rexuiplugin', '/assets/js/rexuiplugin.min.js', 
        //'src/renderer/phaser/rexuiplugin.min.js',
        'rexUI', 'rexUI');
    }
    create() {
        const data = taro.game.data;
        const map = this.tilemap = this.make.tilemap({ key: 'map' });
        data.map.tilesets.forEach((tileset) => {
            const key = `tiles/${tileset.name}`;
            const extrudedKey = `extruded-${key}`;
            if (this.textures.exists(extrudedKey)) {
                this.tileset = map.addTilesetImage(tileset.name, extrudedKey, tileset.tilewidth, tileset.tileheight, (tileset.margin || 0) + 2, (tileset.spacing || 0) + 4);
            }
            else {
                this.tileset = map.addTilesetImage(tileset.name, key);
            }
        });
        const gameMap = this.gameScene.tilemap;
        gameMap.currentLayerIndex = 0;
        this.devModeTools = new DevModeTools(this);
        this.tileEditor = this.devModeTools.tileEditor;
        this.tilePalette = this.devModeTools.palette;
        this.regionEditor = this.devModeTools.regionEditor;
        this.gameEditorWidgets = this.devModeTools.gameEditorWidgets;
    }
    enterMapTab() {
        this.gameScene.setResolution(1, false);
        if (this.gameEditorWidgets.length === 0) {
            this.devModeTools.queryWidgets();
            this.gameEditorWidgets = this.devModeTools.gameEditorWidgets;
        }
        this.devModeTools.enterMapTab();
        this.gameScene.renderedEntities.forEach(element => {
            element.setVisible(false);
        });
        if (this.entityImages.length === 0) {
            // create images for entities created in initialize script
            Object.values(taro.game.data.scripts).forEach((script) => {
                var _a, _b;
                if (((_b = (_a = script.triggers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.type) === 'gameStart') {
                    Object.values(script.actions).forEach((action) => {
                        this.createEntityImage(action);
                    });
                }
            });
            if (this.showRepublishWarning) {
                inGameEditor.showRepublishToInitEntitiesWarning();
            }
        }
        taro.network.send('updateClientInitEntities', true);
        this.entityImages.forEach((image) => {
            image.setVisible(true);
        });
    }
    leaveMapTab() {
        var _a;
        this.gameScene.setResolution(this.gameScene.resolutionCoef, false);
        if (this.devModeTools)
            this.devModeTools.leaveMapTab();
        if ((_a = this.devModeTools) === null || _a === void 0 ? void 0 : _a.entityEditor.selectedEntityImage) {
            this.devModeTools.entityEditor.selectEntityImage(null);
        }
        this.entityImages.forEach((image) => {
            image.setVisible(false);
        });
        this.gameScene.renderedEntities.forEach(element => {
            element.setVisible(true);
        });
    }
    createEntityImage(action) {
        var _a, _b, _c;
        if (!action.disabled && ((_a = action.position) === null || _a === void 0 ? void 0 : _a.function) === 'xyCoordinate'
            && !isNaN((_b = action.position) === null || _b === void 0 ? void 0 : _b.x) && !isNaN((_c = action.position) === null || _c === void 0 ? void 0 : _c.y)) {
            if (action.type === 'createEntityForPlayerAtPositionWithDimensions' || action.type === 'createEntityAtPositionWithDimensions'
                && !isNaN(action.width) && !isNaN(action.height) && !isNaN(action.angle)) {
                if (action.actionId)
                    new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action);
                else {
                    this.showRepublishWarning = true;
                }
            }
            else if (action.type === 'createUnitAtPosition' && !isNaN(action.angle)) {
                if (action.actionId)
                    new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'unit');
                else {
                    this.showRepublishWarning = true;
                }
            }
            else if (action.type === 'createUnitForPlayerAtPosition'
                && !isNaN(action.angle) && !isNaN(action.width) && !isNaN(action.height)) {
                if (action.actionId)
                    new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'unit');
                else {
                    this.showRepublishWarning = true;
                }
            }
            else if (action.type === 'spawnItem' || action.type === 'createItemWithMaxQuantityAtPosition') {
                if (action.actionId)
                    new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'item');
                else {
                    this.showRepublishWarning = true;
                }
            }
            else if (action.type === 'createProjectileAtPosition' && !isNaN(action.angle)) {
                if (action.actionId)
                    new EntityImage(this.gameScene, this.devModeTools, this.entityImages, action, 'projectile');
                else {
                    this.showRepublishWarning = true;
                }
            }
        }
    }
    static pointerInsideMap(pointerX, pointerY, map) {
        return (0 <= pointerX && pointerX < map.width
            && 0 <= pointerY && pointerY < map.height);
    }
    pointerInsideWidgets() {
        let inside = false;
        this.gameEditorWidgets.forEach((widget) => {
            if (this.input.activePointer.x >= widget.left
                && this.input.activePointer.x <= widget.right
                && this.input.activePointer.y >= widget.top
                && this.input.activePointer.y <= widget.bottom) {
                inside = true;
                return;
            }
        });
        return inside;
    }
    pointerInsidePalette() {
        return (this.input.activePointer.x > this.tilePalette.scrollBarContainer.x
            && this.input.activePointer.x < this.tilePalette.scrollBarContainer.x + this.tilePalette.scrollBarContainer.width
            && this.input.activePointer.y > this.tilePalette.scrollBarContainer.y - 30
            && this.input.activePointer.y < this.tilePalette.scrollBarContainer.y + this.tilePalette.scrollBarContainer.height);
    }
    update() {
        if (this.tileEditor)
            this.tileEditor.update();
        if (this.devModeTools.entityEditor)
            this.devModeTools.entityEditor.update();
    }
    updateInitEntities() {
        taro.developerMode.initEntities.forEach((action) => {
            let found = false;
            this.entityImages.forEach((image) => {
                if (image.entity.action.actionId === action.actionId) {
                    found = true;
                    image.entity.update(action);
                }
            });
            if (!found) {
                this.createEntityImage(action);
            }
        });
    }
}
//# sourceMappingURL=DevModeScene.js.map