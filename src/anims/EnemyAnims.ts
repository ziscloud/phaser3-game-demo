import Phaser from 'phaser'
const createLizardAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'lizard-idle',
        frames: anims.generateFrameNames('lizard', {
            start: 0,
            end: 3,
            suffix: '.png',
            prefix: 'lizard_m_idle_anim_f'
        }),
        repeat: -1,
        frameRate: 10
    });
    anims.create({
        key: 'lizard-run',
        frames: anims.generateFrameNames('lizard', {
            start: 0,
            end: 3,
            suffix: '.png',
            prefix: 'lizard_m_run_anim_f'
        }),
        repeat: -1,
        frameRate: 10
    });
}

const createWraithAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'wraith-idle',
        frames: anims.generateFrameNames('wraith', {
            start: 0,
            end: 11,
            suffix: '.png',
            prefix: 'Wraith_Idle_',
            zeroPad: 3
        }),
        repeat: -1,
        frameRate: 10
    });
    anims.create({
        key: 'wraith-moving',
        frames: anims.generateFrameNames('wraith', {
            start: 0,
            end: 11,
            suffix: '.png',
            prefix: 'Wraith_Moving Forward_',
            zeroPad: 3
        }),
        repeat: -1,
        frameRate: 10
    });
}

export {
    createLizardAnims, createWraithAnims
}
