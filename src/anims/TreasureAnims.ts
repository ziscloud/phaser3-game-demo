import Phaser from "phaser";

const createTreasureAnims = (anims:Phaser.Animations.AnimationManager)=>{
    anims.create({
        key: 'chest-open',
        frames: anims.generateFrameNames('treasure', {
            start: 0,
            end: 2,
            suffix: '.png',
            prefix: 'chest_empty_open_anim_f'
        }),
        frameRate: 10
    });
    anims.create({
        key: 'chest-closed',
        frames: [{key:'treasure', frame:'chest_empty_open_anim_f0.png'}],
    });
}

export {
    createTreasureAnims
}
