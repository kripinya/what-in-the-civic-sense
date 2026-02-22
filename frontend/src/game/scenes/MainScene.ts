import * as Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    private missionData: any;
    private userData: any;
    private trashItems: Phaser.GameObjects.Sprite[] = [];
    private scoreEarned: number = 0;
    private maxScore: number = 0;
    private uiText!: Phaser.GameObjects.Text;

    constructor() {
        super('MainScene');
    }

    preload() {
        // Generate simple placeholder textures dynamically instead of loading external images
        const graphics = this.add.graphics();

        // Trash / Wrapper (Red quad)
        graphics.fillStyle(0xff0000, 1.0);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('trash', 32, 32);
        graphics.clear();

        // Dustbin (Green quad)
        graphics.fillStyle(0x00ff00, 1.0);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('bin', 64, 64);
        graphics.clear();

        // Player Character (Blue quad)
        graphics.fillStyle(0x0000ff, 1.0);
        graphics.fillRect(0, 0, 32, 48);
        graphics.generateTexture('player', 32, 48);
        graphics.clear();
    }

    create() {
        this.missionData = this.registry.get('missionData') || {};
        this.userData = this.registry.get('user') || {};

        this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue

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
    }

    setupLevel1() {
        // Level 1: Just tap the trash (Age 1-3)
        this.uiText.setText("Tap the RED trash to clean!");
        this.maxScore = 1;

        const trash = this.add.sprite(400, 300, 'trash').setInteractive({ cursor: 'pointer' });
        trash.on('pointerdown', () => {
            trash.destroy();
            this.scoreEarned++;
            this.checkMissionComplete();
        });
    }

    setupLevel2() {
        // Level 2: Drag and drop into bin
        this.uiText.setText("Drag the RED wrappers to the GREEN bin!");
        this.maxScore = 3;

        const bin = this.add.sprite(600, 400, 'bin');
        this.physics.add.existing(bin, true); // static body

        for (let i = 0; i < this.maxScore; i++) {
            const x = Phaser.Math.Between(100, 400);
            const y = Phaser.Math.Between(200, 500);
            const t = this.add.sprite(x, y, 'trash').setInteractive({ cursor: 'pointer' });
            this.input.setDraggable(t);
            this.physics.add.existing(t);

            // Ensure its a dynamic body for overlap check
            const body = t.body as Phaser.Physics.Arcade.Body;
            body.setCollideWorldBounds(true);

            this.physics.add.overlap(t, bin, () => {
                t.destroy();
                this.scoreEarned++;
                this.checkMissionComplete(bin);
            });
        }

        this.input.on('drag', (pointer: any, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
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

            // Read score rewards from mission data
            const rewards = this.missionData.score_reward || { hygiene: 5 };

            // Delay to let user see "Mission Complete", then fire event to React
            this.time.delayedCall(2000, () => {
                this.game.events.emit('MISSION_COMPLETE', rewards);
                this.uiText.setText("Score updated! Click EXIT to return.");
            });
        }
    }
}
