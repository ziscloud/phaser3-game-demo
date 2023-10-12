import Phaser from "phaser";
import {sceneEvents} from "../events/EventBus";

export default class GameOver extends Phaser.Scene {

    constructor() {
        super('game-over');
    }

    create() {
        const width = this.scale.width
        const height = this.scale.height

        this.add.text(width * 0.5, height * 0.5, 'Game Over', {
            fontSize: '48px'
        }).setOrigin(0.5);

        this.add.text(width * 0.5, height * 0.5 + 30, 'press SPACE to restart', {
            fontSize: '14px'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game');
            sceneEvents.emit('game-restarted')
        });
    }
}
