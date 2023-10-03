import Phaser from 'phaser'
//import {debugDraw} from "../utils/debug";
import {createLizardAnims} from "../anims/EnemyAnims";
import {createFaunaAnims} from "../anims/CharacterAnims";
import Lizard from "../enemies/Lizard";
import '../characters/Fauna';
import Fauna from "../characters/Fauna";
import {sceneEvents} from "../events/EventBus";
import {createTreasureAnims} from "../anims/TreasureAnims";
import Chest from "../items/Chest";

export default class Game extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private fauna!: Fauna;

    private faunaAndLizardCollider?: Phaser.Physics.Arcade.Collider;
    private knives!: Phaser.Physics.Arcade.Group;
    private lizards!: Phaser.Physics.Arcade.Group;

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

        const map = this.make.tilemap({key: 'dungeon'});
        const tileSet = map.addTilesetImage('dungeon_tiles', 'tiles');

        map.createLayer('Ground', tileSet, 0, 0);
        const wallsLayer = map.createLayer('Walls', tileSet, 0, 0);
        wallsLayer.setCollisionByProperty({collides: true});

        //debugDraw(wallsLayer, this);

        this.fauna = this.add.fauna(128, 128, 'fauna');

        this.physics.add.collider(this.fauna, wallsLayer);
        this.cameras.main.startFollow(this.fauna, true);


        this.lizards = this.physics.add.group({
            classType: Lizard,
            createCallback: (go) => {
                const lizGo = go as Lizard;
                lizGo.body.onCollide = true;
            }
        });

        const lizardsObjLayer = map.getObjectLayer('Lizards');
        lizardsObjLayer.objects.forEach((lizardObj) => {
            this.lizards.get(lizardObj.x! + lizardObj.width! * 0.5, lizardObj.y! - lizardObj.height! * 0.5, 'lizard');
        });

        this.physics.add.collider(this.lizards, wallsLayer);

        this.faunaAndLizardCollider = this.physics.add.collider(this.lizards, this.fauna, this.handlePlayerLizardCollision, undefined, this);

        this.knives = this.physics.add.group({classType: Phaser.Physics.Arcade.Image, maxSize: 3});
        this.physics.add.collider(this.knives, this.lizards, this.handleKnifeAndLizardCollision, undefined, this);
        this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeAndWallCollision, undefined, this);

        this.fauna.setKnives(this.knives);

        const chests = this.physics.add.staticGroup({
            classType: Chest
        });

        const chestsObjLayer = map.getObjectLayer('Chests');
        chestsObjLayer.objects.forEach((chestObj) => {
            chests.get(chestObj.x! + chestObj.width! * 0.5, chestObj.y! - chestObj.height! * 0.5, 'treasure');
        });

        this.physics.add.collider(this.fauna, chests, this.handlePlayerChestCollision, undefined, this);
    }

    update(/*time: number, delta: number*/) {
        if (!this.fauna) {
            return;
        }

        this.fauna.update(this.cursors);
    }

    private handlePlayerLizardCollision(go1: Phaser.GameObjects.GameObject, go2: Phaser.GameObjects.GameObject) {
        const lizard = go2 as Lizard;
        const dx = this.fauna.x - lizard.x;
        const dy = this.fauna.y - lizard.y;
        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

        this.fauna.handleDamage(dir);

        sceneEvents.emit('player-health-changed', this.fauna.health);

        if (this.fauna.health <= 0) {
            this.faunaAndLizardCollider?.destroy();
            this.scene.start('game-over');
        }
    }

    private handleKnifeAndLizardCollision(go1: Phaser.GameObjects.GameObject, go2: Phaser.GameObjects.GameObject) {
        this.knives.killAndHide(go1);
        this.lizards.killAndHide(go2);
    }

    private handleKnifeAndWallCollision(go1: Phaser.GameObjects.GameObject, go2: Phaser.GameObjects.GameObject) {
        this.knives.killAndHide(go1);
    }

    private handlePlayerChestCollision(go1: Phaser.GameObjects.GameObject, go2: Phaser.GameObjects.GameObject) {
        const chest = go2 as Chest;
        this.fauna.setChest(chest);
    }
}
