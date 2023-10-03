import Phaser from "phaser";
import Chest from "../items/Chest";
import {sceneEvents} from "../events/EventBus";
import {createSpeechBubble} from "../utils/Speech";

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            fauna(x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number): Fauna;
        }
    }
}

enum HealthState {
    IDEL,
    DAMAGE,
    DEAD
}

export default class Fauna extends Phaser.Physics.Arcade.Sprite {
    private healthState: HealthState = HealthState.IDEL;
    private damageTime: number = 0;
    private _health: number = 3;
    private knives?: Phaser.Physics.Arcade.Group;
    private activeChest?: Chest;
    private _coins: number = 0;


    get health(): number {
        return this._health;
    }

    setKnives(knives: Phaser.Physics.Arcade.Group) {
        this.knives = knives;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame: string | number) {
        super(scene, x, y, texture, frame);
        //
        this.anims.play('fauna-idle-down');
    }

    handleDamage(dir: Phaser.Math.Vector2) {
        if (this._health <= 0) {
            return;
        }
        if (this.healthState == HealthState.DAMAGE) {
            return;
        }

        --this._health;

        if (this._health <= 0) {
            this.healthState = HealthState.DEAD;
            this.anims.play('fauna-faint');
            this.setVelocity(0, 0);
        } else {
            this.setVelocity(dir.x, dir.y);
            this.setTint(0xff0000);
            this.healthState = HealthState.DAMAGE;
            this.damageTime = 0;
        }
    }

    protected preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        switch (this.healthState) {
            case HealthState.DAMAGE:
                this.damageTime += delta;
                if (this.damageTime >= 250) {
                    this.healthState = HealthState.IDEL;
                    this.setTint(0xffffff);
                    this.damageTime = 0;
                }
                break;
            case HealthState.IDEL:
                break;
        }
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (!cursors) {
            return;
        }

        if (this.healthState == HealthState.DAMAGE || this.healthState == HealthState.DEAD) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.space!)) {
            if (this.activeChest) {
                const coins: number = this.activeChest.open();
                this._coins += coins;
                this.activeChest = undefined;
                sceneEvents.emit('player-coins-changed', this._coins);
            } else {
                this.throwKnife();
            }
            return;
        }

        const speed = 100;
        const left = cursors.left.isDown;
        const right = cursors.right.isDown;
        const up = cursors.up.isDown;
        const down = cursors.down.isDown;
        const isMove = left || right || up || down;

        if (left) {
            this.anims.play('fauna-run-side', true);
            this.setVelocity(-speed, 0);
            this.scaleX = -1;
            this.body.offset.x = 24
        } else if (right) {
            this.anims.play('fauna-run-side', true);
            this.setVelocity(speed, 0);
            this.scaleX = 1;
            this.body.offset.x = 8
        } else if (up) {
            this.anims.play('fauna-run-up', true);
            this.setVelocity(0, -speed);
        } else if (down) {
            this.anims.play('fauna-run-down', true);
            this.setVelocity(0, speed);
        } else {
            const split = this.anims.currentAnim.key.split('-');
            split[1] = 'idle';
            this.anims.play(split.join('-'));
            this.setVelocity(0, 0);
        }

        if (isMove) {
            this.activeChest = undefined;
        }
    }

    private throwKnife() {
        if (!this.knives) {
            return;
        }

        const knife = this.knives?.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image;
        if (!knife) {
            return;
        }

        const split = this.anims.currentAnim.key.split('-');
        const direction = split[2];
        const vec = new Phaser.Math.Vector2(0, 0);
        switch (direction) {
            case 'up':
                vec.y = -1;
                break;
            case 'down':
                vec.y = 1;
                break;
            case 'side':
                if (this.scaleX < 0) {
                    vec.x = -1;
                } else {
                    vec.x = 1;
                }
                break;
        }
        const angle = vec.angle();
        knife.setRotation(angle);
        knife.setActive(true);
        knife.setVisible(true);

        knife.x += vec.x * 16;
        knife.y += vec.y * 16;

        createSpeechBubble(this.x-14, this.y-60, 100, 40,
            '“And now you\'re a boss, too... of this pile of rubble.”',
            this.scene);

        const speed = 300;
        knife.setVelocity(vec.x * speed, vec.y * speed);

    }

    setChest(chest: Chest) {
        this.activeChest = chest;
    }
}

Phaser.GameObjects.GameObjectFactory.register('fauna', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string | Phaser.Textures.Texture, frame: string | number) {
    const fauna = new Fauna(this.scene, x, y, texture, frame);
    this.displayList.add(fauna);
    this.updateList.add(fauna);
    this.scene.physics.world.enableBody(fauna, Phaser.Physics.Arcade.DYNAMIC_BODY);

    fauna.body.setSize(fauna.width * 0.5, fauna.width * 0.8);
    return fauna;
})
