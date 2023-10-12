import Phaser from "phaser";

export default class Chest extends Phaser.Physics.Arcade.Sprite {
    private _id: string;
    private _status: string;
    private _chestOpenAudio: Phaser.Sound.BaseSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    get id(): string {
        return this._id;
    }
    get status(): string {
        return this._status;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, status: string, frame?: string | number) {
        super(scene, x, y, texture, frame);
        this.play('chest-' + status);
        this._id = x + ":" + y;
        this._status = status;
        this._chestOpenAudio = this.scene.sound.add('chest-open-audio');
    }

    open(): number {
        if (this.anims.currentAnim.key !== 'chest-closed') {
            return 0;
        }

        this._status = 'open';

        this.anims.play('chest-open');
        this._chestOpenAudio.play();

        return Phaser.Math.Between(50, 200);
    }
}
