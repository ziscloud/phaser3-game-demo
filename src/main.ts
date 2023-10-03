import Phaser from 'phaser'

import Game from './scenes/Game'
import Preloader from "./scenes/Preloader";
import MainUI from "./ui/MainUI";
import GameOver from "./scenes/GameOver";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 400,
    height: 250,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        },
    },
    scene: [Preloader, Game, MainUI, GameOver],
}

export default new Phaser.Game(config)
