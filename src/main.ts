import Phaser from 'phaser'

import Game from './scenes/Game'
import Preloader from "./scenes/Preloader";
import MainUI from "./ui/MainUI";
import GameOver from "./scenes/GameOver";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: '100%',
    height: '100%',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: false
        },
    },
    scene: [Preloader, Game, MainUI, GameOver],
}

export default new Phaser.Game(config)
