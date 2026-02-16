import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class WaterLevel extends Scene {
    constructor() {
        super('WaterLevel');
        this.bubbles = [];
        this.sequence = [];
        this.playerIndex = 0;
        this.round = 1;
        this.isPlayingSequence = false;
        this.inputEnabled = false;
        this.centerX = 512;
        this.centerY = 384;
        this.radius = 180;
    }

    create() {
        // Visuals: Deep ocean gradient-style background
        this.add.rectangle(this.centerX, this.centerY, 1024, 768, 0x000b1a);

        // Title - FIXED: y: 100, setOrigin(0.5)
        this.add.text(this.centerX, 100, 'Trial of the Water God', {
            fontFamily: 'Georgia',
            fontSize: '42px',
            color: '#88ddff',
            stroke: '#002233',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.roundText = this.add.text(32, 32, `Round: ${this.round} / 5`, {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#ffffff'
        });

        this.createBubbles();

        EventBus.emit('current-scene-ready', this);

        this.time.delayedCall(1000, () => {
            this.startNewLevel();
        });
    }

    createBubbles() {
        this.bubbles = [];
        const count = 5;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const x = this.centerX + Math.cos(angle) * this.radius;
            const y = this.centerY + Math.sin(angle) * this.radius;

            // Decorative aura behind each bubble
            const aura = this.add.circle(x, y, 55, 0x00ffff, 0.15);
            this.tweens.add({
                targets: aura,
                scale: 1.3,
                alpha: 0,
                duration: 2000,
                repeat: -1
            });

            // Create the bubble
            const bubble = this.add.circle(x, y, 45, 0x66ccff);
            bubble.setStrokeStyle(4, 0x1a9cff);
            bubble.defaultFill = 0x66ccff;
            bubble.highlightFill = 0xaee9ff;

            // CRITICAL: setInteractive with useHandCursor
            bubble.setInteractive({ useHandCursor: true });
            bubble.on('pointerdown', () => this.onBubbleClicked(i));

            // VISUAL: Add pulse tween to bubbles (continuous idle animation)
            this.tweens.add({
                targets: bubble,
                scale: 1.08,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.bubbles.push(bubble);
        }
    }

    startNewLevel() {
        this.sequence = [];
        this.round = 1;
        this.addNewToSequence();
        this.playSequence();
    }

    addNewToSequence() {
        const next = Phaser.Math.Between(0, 4);
        this.sequence.push(next);

        EventBus.emit('water-progress', this.round);
        this.roundText.setText(`Round: ${this.round} / 5`);
    }

    playSequence() {
        this.isPlayingSequence = true;
        this.inputEnabled = false;
        this.playerIndex = 0;

        let delay = 500;
        const pace = 700;

        this.sequence.forEach((bubbleIdx, i) => {
            this.time.delayedCall(delay + (i * pace), () => {
                this.flashBubble(bubbleIdx);
            });
        });

        this.time.delayedCall(delay + (this.sequence.length * pace), () => {
            this.isPlayingSequence = false;
            this.inputEnabled = true;
        });
    }

    flashBubble(idx) {
        const bubble = this.bubbles[idx];
        if (!bubble) return;

        bubble.setFillStyle(bubble.highlightFill);

        // Flash tween with smooth animation
        this.tweens.add({
            targets: bubble,
            scale: 1.3,
            duration: 300,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => {
                bubble.setFillStyle(bubble.defaultFill);
            }
        });
    }

    onBubbleClicked(index) {
        if (!this.inputEnabled || this.isPlayingSequence) return;

        this.flashBubble(index);

        if (index === this.sequence[this.playerIndex]) {
            this.playerIndex++;

            if (this.playerIndex === this.sequence.length) {
                this.inputEnabled = false;

                // Check Win Condition: Win Water Level at Round 5
                if (this.round >= 5) {
                    this.handleWin();
                } else {
                    this.round++;
                    this.time.delayedCall(1000, () => {
                        this.addNewToSequence();
                        this.playSequence();
                    });
                }
            }
        } else {
            // Wrong bubble - reset
            this.inputEnabled = false;
            const bubble = this.bubbles[index];
            bubble.setFillStyle(0xff0000);

            this.time.delayedCall(1000, () => {
                bubble.setFillStyle(bubble.defaultFill);
                this.startNewLevel();
            });
        }
    }

    handleWin() {
        this.add.text(this.centerX, this.centerY, 'WATER PURIFIED', {
            fontFamily: 'Georgia',
            fontSize: '64px',
            color: '#88ddff',
            stroke: '#002233',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Progress to Fire Level
        this.time.delayedCall(2000, () => {
            this.scene.start('FireLevel');
        });
    }
}