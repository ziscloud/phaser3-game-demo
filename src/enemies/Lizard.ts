import Phaser from "phaser";
import Enemy from "./Enemy";

export default class Lizard extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame: string | number) {
        super(scene, x, y, texture, frame);

        this.anims.play({key: 'lizard-run'});
    }

}
