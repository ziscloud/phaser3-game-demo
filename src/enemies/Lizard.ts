import Phaser from "phaser";


enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

const randomDirction = (exclude: Direction) => {
    let nextDirection = Phaser.Math.Between(0, 3);
    while (nextDirection === exclude) {
        nextDirection = Phaser.Math.Between(0, 3);
    }

    return nextDirection;
}

export default class Lizard extends Phaser.Physics.Arcade.Sprite {
    private direction: Direction = Direction.RIGHT;
    private moveEvent: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame: string | number) {
        super(scene, x, y, texture, frame);

        this.anims.play({key: 'lizard-run'});

        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this);

        this.moveEvent = scene.time.addEvent({
                delay: 2000,
                callback: () => {
                    this.direction = randomDirction(this.direction);
                },
                loop: true
            }
        )
    }

    protected preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        const speed: number = 50;
        switch (this.direction) {
            case Direction.UP:
                this.setVelocity(0, -speed);
                break;
            case Direction.DOWN:
                this.setVelocity(0, speed);
                break;
            case Direction.LEFT:
                this.setVelocity(-speed, 0)
                break;
            case Direction.RIGHT:
                this.setVelocity(speed, 0)
                break;
        }
    }

    destroy(fromScene?: boolean) {
        this.moveEvent.destroy();
        super.destroy(fromScene);
    }

    private handleTileCollision(gameObject: Phaser.GameObjects.GameObject/*, tile: Phaser.Tilemaps.Tile, body: Phaser.Physics.Arcade.Body*/) {
        if (gameObject !== this) {
            return;
        }

        this.direction = randomDirction(this.direction);
    }
}
