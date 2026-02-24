import * as Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    private missionData: any;
    private scoreEarned: number = 0;
    private maxScore: number = 0;
    private uiText!: Phaser.GameObjects.Text;
    private player!: Phaser.Physics.Arcade.Sprite;
    private npc!: Phaser.GameObjects.Sprite;
    private targetCursor?: Phaser.Math.Vector2;

    constructor() {
        super('MainScene');
    }

    preload() {
        // Load pixel art assets directly
        this.load.spritesheet('player', '/src/assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('npc', '/src/assets/sprites/npc.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('trash', '/src/assets/sprites/trash.png');
        this.load.image('bin', '/src/assets/sprites/bin.png');
    }

    create() {
        this.missionData = this.registry.get('missionData') || {};
        this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue

        // Animations
        this.anims.create({
            key: 'player-idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 10,
        });

        this.anims.create({
            key: 'player-walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'npc-walk',
            frames: this.anims.generateFrameNumbers('npc', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1,
            yoyo: true
        });

        // Initialize Player
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.play('player-idle');

        // Initialize an NPC wandering
        this.npc = this.add.sprite(200, 200, 'npc');
        this.npc.play('npc-walk');
        this.tweens.add({
            targets: this.npc,
            x: 250,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        this.uiText = this.add.text(10, 10, 'CIVIC MISSION\n' + (this.missionData.title || 'Unknown'), {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        const level = this.missionData.level_required || 1;

        if (level === 1) {
            this.setupLevel1();
        } else if (level === 2) {
            this.setupLevel2();
        } else {
            this.uiText.setText("Advanced levels coming soon...\nPress EXIT to go back.");
        }

        // Tap-to-move input logic
        this.targetCursor = new Phaser.Math.Vector2();
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            // Ignore if we clicked a UI/interactive object like trash
            if (currentlyOver.length > 0) return;

            this.targetCursor?.set(pointer.x, pointer.y);
            this.physics.moveToObject(this.player, this.targetCursor!, 120);
            this.player.play('player-walk', true);

            // Flip player based on direction
            if (pointer.x < this.player.x) {
                this.player.setFlipX(true);
            } else {
                this.player.setFlipX(false);
            }
        });
    }

    update() {
        if (this.targetCursor && this.player.body) {
            const distance = Phaser.Math.Distance.BetweenPoints(this.player, this.targetCursor);
            if (distance < 4) {
                // Arrived
                this.player.body.reset(this.targetCursor.x, this.targetCursor.y);
                this.player.play('player-idle', true);
                this.targetCursor = undefined;
            }
        }
    }

    setupLevel1() {
        this.uiText.setText("Tap the RED trash to clean!");
        this.maxScore = 1;

        const trash = this.add.sprite(500, 400, 'trash').setInteractive({ cursor: 'pointer' });
        // Scale it up if using very tiny placeholders (like 16x16)
        trash.setScale(2);

        trash.on('pointerdown', () => {
            trash.destroy();
            this.scoreEarned++;
            this.checkMissionComplete();
        });
    }

    setupLevel2() {
        this.uiText.setText("Drag the RED wrappers to the GREEN bin!");
        this.maxScore = 3;

        const bin = this.add.sprite(600, 400, 'bin');
        bin.setScale(2);
        this.physics.add.existing(bin, true);

        for (let i = 0; i < this.maxScore; i++) {
            const x = Phaser.Math.Between(100, 400);
            const y = Phaser.Math.Between(200, 500);
            const t = this.add.sprite(x, y, 'trash').setInteractive({ cursor: 'pointer' });
            t.setScale(2);
            this.input.setDraggable(t);
            this.physics.add.existing(t);

            const body = t.body as Phaser.Physics.Arcade.Body;
            body.setCollideWorldBounds(true);

            this.physics.add.overlap(t, bin, () => {
                t.destroy();
                this.scoreEarned++;
                this.checkMissionComplete(bin);
            });
        }

        this.input.on('drag', (_pointer: any, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
    }

    checkMissionComplete(binTarget?: Phaser.GameObjects.Sprite) {
        if (this.scoreEarned >= this.maxScore) {
            this.uiText.setText("MISSION COMPLETE!\nSending Score...");
            if (binTarget) {
                this.add.text(binTarget.x - 40, binTarget.y - 80, "Happy Earth!", { fontSize: '16px', color: '#10b981', fontStyle: 'bold' });
            }

            const rewards = this.missionData.score_reward || { hygiene: 5 };

            this.time.delayedCall(2000, () => {
                this.game.events.emit('MISSION_COMPLETE', rewards);
                this.uiText.setText("Score updated! Click EXIT to return.");
            });
        }
    }
}
