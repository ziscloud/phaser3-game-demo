import Phaser from "phaser";
export default class Preloader extends  Phaser.Scene {
    constructor( ) {
        super('preloader');
    }

    preload(){
        this.load.image('tiles', 'tiles/dungeon_tiles.png');
        this.load.tilemapTiledJSON('dungeon','tiles/dungeon.json');
        this.load.atlas('fauna', "character/fauna.png", "character/fauna.json");
        this.load.atlas('lizard', "enemies/lizard.png", "enemies/lizard.json");
        this.load.atlas('wraith', "enemies/wraith.png", "enemies/wraith.json");
        this.load.atlas('treasure', "items/treasure.png", "items/treasure.json");

        this.load.image('ui-heart-empty', 'ui/ui_heart_empty.png');
        this.load.image('ui-heart-full', 'ui/ui_heart_full.png');
        this.load.image('knife', 'weapons/weapon_knife.png');

        this.load.audio('chest-open-audio', ['audios/chest-open.ogg', 'audios/chest-open.wav']);
        this.load.audio('gold-coin-audio', ['audios/gold-coin.ogg','audios/gold-coin.wav']);
        this.load.audio('throw_knife-audio', ['audios/throw_knife.ogg','audios/throw_knife.wav']);
        this.load.audio('hurts-audio', ['audios/hurts.ogg','audios/hurts.wav']);
        this.load.audio('game-over-audio', ['audios/game-over.ogg','audios/game-over.wav']);
    }

    create() {
        this.scene.start('game')
    }
}
