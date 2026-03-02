import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class FireLevel extends Scene {
    constructor() {
        super('FireLevel');
        this.artifacts = [];
        this.score = 0;
        this.missingIndex = -1;
        this.canClick = false;
        this.centerX = 512;
        this.centerY = 384;
    }

    preload() {
        // 1. Load the realistic fire background
        this.load.image('fire_bg', 'assets/FireLevel.png');

        // Create an in-memory glow texture for realistic embers
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('ember_particle', 16, 16);
    }

    create() {
        // 2. Realistic Background Scaling
        const bg = this.add.image(this.centerX, this.centerY, 'fire_bg');
        const scale = Math.max(1024 / bg.width, 768 / bg.height);
        bg.setScale(scale);

        // 3. Polishing: Heat Haze & Rising Embers Particle System
        this.createWeatherEffects();

        // 4. UI - Title and Score (Styled for Fire)
        this.add.text(this.centerX, 100, 'Trial of the Fire God', {
            fontFamily: 'Georgia',
            fontSize: '48px',
            color: '#ffcc00',
            stroke: '#660000',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff4400', blur: 20, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.scoreText = this.add.text(32, 32, `Power: ${this.score} / 5`, {
            fontFamily: 'Georgia',
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#00000044',
            padding: { x: 10, y: 5 }
        });

        // 5. Global Click Listener
        this.input.on('pointerdown', (pointer) => {
            if (this.canClick) {
                this.handleGlobalClick(pointer.x, pointer.y);
            }
        });

        this.showInstructions();

        EventBus.emit('current-scene-ready', this);
    }

    createWeatherEffects() {
        // Rising Embers - Makes the background feel "alive"
        this.add.particles(0, 800, 'ember_particle', {
            x: { min: 0, max: 1024 },
            y: 800,
            lifespan: 4000,
            speedY: { min: -100, max: -250 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [0xffaa00, 0xff4400, 0xff0000],
            quantity: 2,
            blendMode: 'ADD'
        });

        // Background Heat Glows
        for (let i = 0; i < 8; i++) {
            let x = Phaser.Math.Between(0, 1024);
            let y = Phaser.Math.Between(400, 768);
            let glow = this.add.circle(x, y, Phaser.Math.Between(100, 200), 0xff3300, 0.08);
            this.tweens.add({
                targets: glow,
                alpha: 0.15,
                scale: 1.2,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    showInstructions() {
        const overlay = this.add.container(0, 0).setDepth(1000);
        const dim = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);

        // Tablet-style UI
        const scroll = this.add.rectangle(512, 384, 640, 420, 0x2b1d14).setStrokeStyle(4, 0xff4400);

        const title = this.add.text(512, 240, 'THE FIRE TRIAL', {
            fontFamily: 'Georgia', fontSize: '36px', color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);

        const rules = this.add.text(512, 360,
            'The spatial heat tests your focus.\n\n' +
            '• Observe the artifacts on the molten floor.\n' +
            '• A flare will conceal one of them.\n' +
            '• Click the location of the missing relic.',
            { fontFamily: 'Georgia', fontSize: '22px', color: '#ffffff', align: 'center', lineSpacing: 12 }
        ).setOrigin(0.5);

        const btnBg = this.add.rectangle(512, 510, 220, 60, 0xaa2200).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(512, 510, 'START TRIAL', {
            fontFamily: 'Georgia', fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btnBg.on('pointerdown', () => {
            this.tweens.add({
                targets: overlay, alpha: 0, duration: 400,
                onComplete: () => { overlay.destroy(); this.startRound(); }
            });
        });

        overlay.add([dim, scroll, title, rules, btnBg, btnText]);
    }

    startRound() {
        this.artifacts.forEach(a => a.destroy());
        this.artifacts = [];
        this.canClick = false;

        // Create 5 Glowing Artifacts
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(150, 874);
            const y = Phaser.Math.Between(300, 650);

            // Outer Glow
            const aura = this.add.circle(x, y, 35, 0xffaa00, 0.2);
            // Core Relic (Star shape)
            const star = this.add.star(x, y, 5, 15, 30, 0xffcc00).setStrokeStyle(2, 0xffffff);

            this.tweens.add({
                targets: [star, aura],
                scale: 1.2,
                alpha: 0.5,
                duration: 800 + (i * 150),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Store both as one group
            const container = this.add.container(0, 0, [aura, star]);
            container.xPos = x; container.yPos = y;
            this.artifacts.push(container);
        }

        this.time.delayedCall(3000, () => this.triggerFireStorm());
    }

    triggerFireStorm() {
        // Bright Orange Heat Flash
        const fire = this.add.rectangle(512, 384, 1024, 768, 0xffaa00, 0);

        this.tweens.add({
            targets: fire,
            alpha: 1,
            duration: 500,
            yoyo: true,
            onYoyo: () => {
                this.missingIndex = Phaser.Math.Between(0, 4);
                this.artifacts[this.missingIndex].setAlpha(0);
            },
            onComplete: () => {
                fire.destroy();
                this.canClick = true;
                this.showHintText('RECALL THE VANISHED RELIC');
            }
        });
    }

    showHintText(msg) {
        if (this.instructionText) this.instructionText.destroy();
        this.instructionText = this.add.text(512, 720, msg, {
            fontFamily: 'Georgia', fontSize: '26px', color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    handleGlobalClick(clickX, clickY) {
        const target = this.artifacts[this.missingIndex];
        const distance = Phaser.Math.Distance.Between(clickX, clickY, target.xPos, target.yPos);

        if (this.instructionText) this.instructionText.destroy();

        if (distance < 80) {
            this.canClick = false;
            target.setAlpha(1);
            this.score++;

            EventBus.emit('fire-power', this.score);
            this.scoreText.setText(`Power: ${this.score} / 5`);
            this.cameras.main.flash(500, 255, 200, 0);

            if (this.score >= 5) {
                this.handleFinalVictory();
            } else {
                this.time.delayedCall(1200, () => this.startRound());
            }
        } else {
            this.canClick = false;
            // Reveal the correct one in red to show the mistake
            target.setAlpha(1).setScale(1.5);
            this.cameras.main.shake(500, 0.02);

            this.score = 0;
            EventBus.emit('fire-power', this.score);
            this.scoreText.setText(`Power: ${this.score} / 5`);

            this.time.delayedCall(2000, () => this.startRound());
        }
    }

    handleFinalVictory() {
        const endBG = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.9).setDepth(2000);
        this.add.text(512, 384, 'WORLD PURIFIED\nYOU ARE THE CHOSEN ONE', {
            fontFamily: 'Georgia', fontSize: '56px', color: '#ffffff',
            align: 'center', stroke: '#ffaa00', strokeThickness: 10
        }).setOrigin(0.5).setDepth(2001);

        EventBus.emit('game-complete');
    }
}