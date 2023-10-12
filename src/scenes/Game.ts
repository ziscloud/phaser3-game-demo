import Phaser from 'phaser'
//import {debugDraw} from "../utils/debug";
import {createLizardAnims, createWraithAnims} from "../anims/EnemyAnims";
import {createFaunaAnims} from "../anims/CharacterAnims";
import '../characters/Fauna';
import Fauna from "../characters/Fauna";
import {sceneEvents} from "../events/EventBus";
import {createTreasureAnims} from "../anims/TreasureAnims";
import Chest from "../items/Chest";
import {Mrpas} from "mrpas";
import Wraith from "../enemies/Wraith";

export default class Game extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private fauna!: Fauna;

    private faunaAndEnemyCollider!: Phaser.Physics.Arcade.Collider;
    private knives!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;

    private map!: Phaser.Tilemaps.Tilemap;
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private chestsObjLayer!: Phaser.Tilemaps.ObjectLayer;
    private enemiesObjLayer!: Phaser.Tilemaps.ObjectLayer;
    private wallsLayer!: Phaser.Tilemaps.TilemapLayer;
    private chests!: Phaser.Physics.Arcade.StaticGroup;

    private fov!: Mrpas

    private _enemiesStatus: Map<string, string | undefined> = new Map<string, string | undefined>();
    private _chestsStatus: Map<string, string | undefined> = new Map<string, string | undefined>();

    constructor() {
        super('game')
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {
        this.scene.run('main-ui');

        createFaunaAnims(this.anims);
        createLizardAnims(this.anims);
        createTreasureAnims(this.anims);
        createWraithAnims(this.anims);

        this.map = this.make.tilemap({key: 'dungeon'});
        const tileSet = this.map.addTilesetImage('dungeon_tiles', 'tiles');

        this.groundLayer = this.map.createLayer('Ground', tileSet, 0, 0);

        this.wallsLayer = this.map.createLayer('Walls', tileSet, 0, 0);
        this.wallsLayer.setCollisionByProperty({collide: true});

        //debugDraw(this.wallsLayer, this);

        this.fauna = this.add.fauna(128, 128, 'fauna');

        this.physics.add.collider(this.fauna, this.wallsLayer);
        this.cameras.main.startFollow(this.fauna, true);

        this.enemies = this.physics.add.group({
            classType: Wraith,
            createCallback: (go) => {
                const ego = go as Wraith;
                ego.body.onCollide = true;
                //ego.setScale(0.07, 0.07)
                ego.body.setSize(16, 20, true);
            }
        });

        this.enemiesObjLayer = this.map.getObjectLayer('Enemies');

        this.physics.add.collider(this.enemies, this.wallsLayer);

        this.faunaAndEnemyCollider = this.physics.add.collider(this.enemies, this.fauna, this.handlePlayerEnemyCollision, undefined, this);

        this.knives = this.physics.add.group({classType: Phaser.Physics.Arcade.Image, maxSize: 3});
        this.physics.add.collider(this.knives, this.enemies, this.handleKnifeAndEnemyCollision, undefined, this);
        this.physics.add.collider(this.knives, this.wallsLayer, this.handleKnifeAndWallCollision, undefined, this);

        this.fauna.setKnives(this.knives);

        this.chests = this.physics.add.staticGroup({
            classType: Chest
        });

        this.chestsObjLayer = this.map.getObjectLayer('Chests');

        this.physics.add.collider(this.fauna, this.chests, this.handlePlayerChestCollision, undefined, this);

        this.fov = new Mrpas(this.map.width, this.map.height, (x, y) => {
            const tile = this.wallsLayer!.getTileAt(x, y)
            if (tile) {
                return !tile.collides
            }

            const gtile = this.groundLayer!.getTileAt(x, y)
            if (gtile) {
                return true;
            }
            return false
        });

        sceneEvents.on('game-restarted', () => {
            this._chestsStatus.clear();
            this._enemiesStatus.clear();
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            console.log('shutdown')
            sceneEvents.off('game-restarted');
        });
    }

    update(/*time: number, delta: number*/) {
        this.computeFOV();

        if (!this.fauna) {
            return;
        }

        this.fauna.update(this.cursors);
    }

    private handlePlayerEnemyCollision(_: Phaser.GameObjects.GameObject, go2: Phaser.GameObjects.GameObject) {
        const ego = go2 as Wraith;
        const dx = this.fauna.x - ego.x;
        const dy = this.fauna.y - ego.y;
        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

        this.fauna.handleDamage(dir);

        sceneEvents.emit('player-health-changed', this.fauna.health);

        if (this.fauna.health <= 0) {
            this.faunaAndEnemyCollider?.destroy();
            this.physics.pause();
            this.scene.start('game-over');
        }
    }

    private handleKnifeAndEnemyCollision(go1: Phaser.GameObjects.GameObject, go2: Phaser.GameObjects.GameObject) {
        this.knives.killAndHide(go1);
        go1.destroy(true);
        this._enemiesStatus.set((go2 as Wraith).id, 'dead');
        go2.destroy(true);
        this.enemies.killAndHide(go2);

        const coins = Phaser.Math.Between(10, 100);
        this.fauna.addCoins(coins);
    }

    private handleKnifeAndWallCollision(go1: Phaser.GameObjects.GameObject, _: Phaser.GameObjects.GameObject) {
        this.knives.killAndHide(go1);
        go1.destroy(true)
    }

    private handlePlayerChestCollision(_: Phaser.GameObjects.GameObject, go2: Phaser.GameObjects.GameObject) {
        const chest = go2 as Chest;
        this.fauna.setChest(chest);
    }

    private computeFOV() {
        if (!this.fov || !this.map || !this.groundLayer || !this.fauna) {
            return
        }

        // get camera view bounds
        const camera = this.cameras.main
        const bounds = new Phaser.Geom.Rectangle(
            this.map.worldToTileX(camera.worldView.x) - 1,
            this.map.worldToTileY(camera.worldView.y) - 1,
            this.map.worldToTileX(camera.worldView.width) + 2,
            this.map.worldToTileY(camera.worldView.height) + 3
        )

        // set all tiles beyond camera view to invisible
        for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
            for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
                if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
                    continue
                }

                const tile = this.groundLayer.getTileAt(x, y)
                if (tile) {
                    tile.alpha = 0
                    //tile.tint = 0x404040
                }

                const wtile = this.wallsLayer?.getTileAt(x, y)
                if (wtile) {
                    wtile.alpha = 0
                    //wtile.tint = 0x404040
                }

                this.enemies.children.each(l => {
                    const l1 = l as Phaser.GameObjects.Sprite;
                    l1.alpha = 0;
                })

                this.chests?.children.each(l => {
                    const l1 = l as Phaser.GameObjects.Sprite;
                    l1.alpha = 0;
                })
            }
        }

        // get player's position
        const px = this.map.worldToTileX(this.fauna.x)
        const py = this.map.worldToTileY(this.fauna.y)


        for (const o of this.enemies.children.getArray()) {
            const o1 = o as Wraith;
            const ox = this.map.worldToTileX(o1.x)
            const oy = this.map.worldToTileY(o1.y)
            const d = Phaser.Math.Distance.Between(px, py, ox, oy)
            const alpha = Math.min(2 - d / 6, 1)
            if (alpha > 0) {
                // console.log('yes')
                o1.alpha = alpha
                o1.tint = 0xffffff
            } else {
                // console.log('not')
                this._enemiesStatus.set(o1.id, undefined);
                o1.destroy(true);
            }
        }

        for (const o1 of this.enemiesObjLayer.objects) {
            const ox = this.map.worldToTileX(o1.x!)
            const oy = this.map.worldToTileY(o1.y!)
            const d = Phaser.Math.Distance.Between(px, py, ox, oy)
            const alpha = Math.min(2 - d / 6, 1)

            const key = (o1.x! + o1.width! * 0.5) + ":" + (o1.y! - o1.height! * 0.5)

            const newVar1 = this._enemiesStatus.get(key);
            if (alpha > 0 && !newVar1) {
                //console.log('yes', alpha)
                const newVar = this.enemies.get(o1.x! + o1.width! * 0.5, o1.y! - o1.height! * 0.5, 'wraith');
                //console.log(newVar)
                newVar.alpha = alpha
                newVar.tint = 0xffffff
                this._enemiesStatus.set(key, 'alive');
            } else {
                // console.log('not')
            }
        }

        for (const o of this.chests.children.getArray()) {
            const o1 = o as Chest;
            const ox = this.map.worldToTileX(o1.x)
            const oy = this.map.worldToTileY(o1.y)
            const d = Phaser.Math.Distance.Between(px, py, ox, oy)
            const alpha = Math.min(2 - d / 6, 1)
            if (alpha > 0) {
                // console.log('yes')
                o1.alpha = alpha
                o1.tint = 0xffffff
            } else {
                // console.log('not')
                this._chestsStatus.set(o1.id, 'destroyed:' + o1.status);
                o1.destroy(true);
            }
        }

        for (const o1 of this.chestsObjLayer.objects) {
            const ox = this.map.worldToTileX(o1.x!)
            const oy = this.map.worldToTileY(o1.y!)
            const d = Phaser.Math.Distance.Between(px, py, ox, oy)
            const alpha = Math.min(2 - d / 6, 1)

            const key = (o1.x! + o1.width! * 0.5) + ":" + (o1.y! - o1.height! * 0.5)

            let status = this._chestsStatus.get(key);
            if (alpha > 0) {
                let newChest: any;
                if (!status) {
                    status = 'destroyed:closed'
                }

                if (status.startsWith('destroyed')) {
                    newChest = this.chests.get(o1.x! + o1.width! * 0.5, o1.y! - o1.height! * 0.5, 'treasure', status.split(':')[1]);
                    newChest.alpha = alpha
                    newChest.tint = 0xffffff
                    this._chestsStatus.set(key, status.split(':')[1]);
                }
                //console.log('yes', alpha)
                //console.log(newChest)
            } else {
                // console.log('not')
            }
        }

        // compute fov from player's position
        this.fov.compute(
            px,
            py,
            7,
            (x, y) => {
                const tile = this.groundLayer!.getTileAt(x, y)
                if (tile) {
                    return tile.tint === 0xffffff
                }
                const wtile = this.wallsLayer!.getTileAt(x, y)
                if (wtile) {
                    return wtile.tint === 0xffffff
                }
                return false;
            },
            (x, y) => {
                const d = Phaser.Math.Distance.Between(px, py, x, y)
                const alpha = Math.min(2 - d / 6, 1)
                const tile = this.groundLayer!.getTileAt(x, y)
                if (tile) {
                    tile.tint = 0xffffff
                    tile.alpha = alpha
                }
                const wtile = this.wallsLayer!.getTileAt(x, y)
                if (wtile) {
                    wtile.tint = 0xffffff
                    wtile.alpha = alpha
                }
            }
        )
    }
}
