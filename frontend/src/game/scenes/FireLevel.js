import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class FireLevel extends Scene {
    constructor() {
        super('FireLevel');
        this.artifacts = [];
        this.score = 0;
        this.missingIndex = -1;
        this.canClick = false;
    }

    create() {
        // Visuals: Dark volcanic floor with a heat-glow effect
        this.add.rectangle(512, 384, 1024, 768, 0x1a0500);

        // Add decorative embers/glow in the background
        for (let i = 0; i < 10; i++) {
            let x = Phaser.Math.Between(0, 1024);
            let y = Phaser.Math.Between(0, 768);
            let glow = this.add.circle(x, y, Phaser.Math.Between(50, 150), 0xff3300, 0.05);
            this.tweens.add({
                targets: glow,
                alpha: 0.1,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }

        // Title - FIXED: y: 100, setOrigin(0.5)
        this.add.text(512, 100, 'Trial of the Fire God', {
            fontFamily: 'Georgia',
            fontSize: '42px',
            color: '#ff4400',
            stroke: '#330000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.scoreText = this.add.text(32, 32, `Power: ${this.score} / 5`, {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#ffffff'
        });

        // Global Click Listener
        this.input.on('pointerdown', (pointer) => {
            if (this.canClick) {
                this.handleGlobalClick(pointer.x, pointer.y);
            }
        });

        EventBus.emit('current-scene-ready', this);
        this.startRound();
    }

    startRound() {
        this.artifacts.forEach(a => a.destroy());
        this.artifacts = [];
        this.canClick = false;

        // Create 5 stars with burning flicker animation
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(200, 800);
            const y = Phaser.Math.Between(200, 600);
            const star = this.add.star(x, y, 5, 20, 40, 0xffcc00);
            star.setInteractive({ useHandCursor: true });

            // Burning flicker effect
            this.tweens.add({
                targets: star,
                scale: 1.1,
                duration: 500 + (i * 100),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.artifacts.push(star);
        }

        this.time.delayedCall(2500, () => this.triggerFireStorm());
    }

    triggerFireStorm() {
        // Visual flash effect
        const fire = this.add.rectangle(512, 384, 1024, 768, 0xffaa00, 0);

        this.tweens.add({
            targets: fire,
            alpha: 1,
            duration: 600,
            yoyo: true,
            onYoyo: () => {
                this.missingIndex = Phaser.Math.Between(0, 4);
                this.artifacts[this.missingIndex].setAlpha(0);
            },
            onComplete: () => {
                fire.destroy();
                this.canClick = true;
                this.instructionText = this.add.text(512, 720, 'Recall the missing artifact!', {
                    fontFamily: 'Georgia',
                    fontSize: '22px',
                    color: '#ffaa00'
                }).setOrigin(0.5);
            }
        });
    }

    handleGlobalClick(clickX, clickY) {
        const missingStar = this.artifacts[this.missingIndex];
        const distance = Phaser.Math.Distance.Between(clickX, clickY, missingStar.x, missingStar.y);

        if (this.instructionText) this.instructionText.destroy();

        if (distance < 70) {
            // CORRECT GUESS
            this.canClick = false;
            missingStar.setAlpha(1);
            this.score++;

            EventBus.emit('fire-power', this.score);
            this.scoreText.setText(`Power: ${this.score} / 5`);
            this.cameras.main.flash(500, 255, 100, 0);

            // Win Condition: Complete Fire Level at score 5
            if (this.score >= 5) {
                this.handleFinalVictory();
            } else {
                this.time.delayedCall(1000, () => this.startRound());
            }
        } else {
            // WRONG GUESS - VISUAL: Camera shake effect
            this.canClick = false;
            missingStar.setAlpha(1).setFillStyle(0xff0000);

            // CRITICAL: Camera shake on mistake (intensity 0.015, duration 500ms)
            this.cameras.main.shake(500, 0.015);

            this.score = 0;
            EventBus.emit('fire-power', this.score);
            this.scoreText.setText(`Power: ${this.score} / 5`);

            this.time.delayedCall(1500, () => this.startRound());
        }
    }

    handleFinalVictory() {
        this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);
        this.add.text(512, 384, 'WORLD PURIFIED\nYOU ARE THE CHOSEN ONE', {
            fontFamily: 'Georgia',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center',
            stroke: '#ffaa00',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Tell React the whole game is done
        EventBus.emit('game-complete');
    }
}