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
    }

    preload() {
        // Load the new high-quality background
        this.load.image('water_bg', 'assets/WaterLevel.png');

        // Creating a small white circle texture for particles in-memory 
        // (This saves you from needing to find a separate bubble image)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('particle_bubble', 16, 16);
    }

    create() {
        // 1. Proportional Background Scaling
        const bg = this.add.image(this.centerX, this.centerY, 'water_bg');
        const scale = Math.max(1024 / bg.width, 768 / bg.height);
        bg.setScale(scale);

        // 2. Ambient Particle Effects (Rising Bubbles)
        this.createAmbientParticles();

        // 3. UI Elements
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

        // 4. Create Game Bubbles in a Straight Line
        this.createBubbles();

        // 5. Show Instructions
        this.showInstructions();

        EventBus.emit('current-scene-ready', this);
    }

    createAmbientParticles() {
        // Create a particle emitter for the background "underwater" feel
        const emitter = this.add.particles(0, 800, 'particle_bubble', {
            x: { min: 0, max: 1024 },
            y: 800,
            lifespan: 5000,
            speedY: { min: -50, max: -150 },
            scale: { start: 0.1, end: 0.4 },
            alpha: { start: 0.6, end: 0 },
            quantity: 1,
            frequency: 200,
            blendMode: 'ADD'
        });
        emitter.setDepth(0.5); // Keep particles behind the game bubbles but in front of BG
    }

    createBubbles() {
        this.bubbles = [];
        const count = 5;
        const spacing = 150;
        const startX = this.centerX - ((count - 1) * spacing) / 2;

        for (let i = 0; i < count; i++) {
            const x = startX + (i * spacing);
            const y = this.centerY + 80; // Lowered to show off the castle BG

            // Glow Aura
            const aura = this.add.circle(x, y, 55, 0x00ffff, 0.15);
            this.tweens.add({
                targets: aura,
                scale: 1.4,
                alpha: 0,
                duration: 2000,
                repeat: -1
            });

            // The Interactive Sphere
            const bubble = this.add.circle(x, y, 45, 0x66ccff);
            bubble.setStrokeStyle(4, 0x1a9cff);
            bubble.defaultFill = 0x66ccff;
            bubble.highlightFill = 0xaee9ff;

            bubble.setInteractive({ useHandCursor: true });
            bubble.on('pointerdown', () => this.onBubbleClicked(i));

            // Floating "Wave" Animation
            this.tweens.add({
                targets: bubble,
                y: y - 15,
                duration: 1500 + (i * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.bubbles.push(bubble);
        }
    }

    showInstructions() {
        const overlay = this.add.container(0, 0).setDepth(1000);
        const dim = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
        const scroll = this.add.rectangle(512, 384, 600, 400, 0xf5deb3).setStrokeStyle(6, 0x8B7355);

        const title = this.add.text(512, 250, 'THE WATER TRIAL', {
            fontFamily: 'Georgia', fontSize: '32px', color: '#003366', fontStyle: 'bold'
        }).setOrigin(0.5);

        const rules = this.add.text(512, 360,
            'The tides demand a perfect memory.\n\n' +
            '• Watch the sequence of glowing bubbles.\n' +
            '• Repeat the pattern exactly to advance.\n' +
            '• Reach Round 5 to purify the Water.',
            { fontFamily: 'Georgia', fontSize: '20px', color: '#2b1d14', align: 'center', lineSpacing: 10 }
        ).setOrigin(0.5);

        const btnBg = this.add.rectangle(512, 500, 200, 50, 0x005588).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(512, 500, 'BEGIN TRIAL', {
            fontFamily: 'Georgia', fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btnBg.on('pointerdown', () => {
            this.tweens.add({
                targets: [overlay], alpha: 0, duration: 400,
                onComplete: () => { overlay.destroy(); this.startNewLevel(); }
            });
        });

        overlay.add([dim, scroll, title, rules, btnBg, btnText]);
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
        this.roundText.setText(`Round: ${this.round} / 5`);
    }

    playSequence() {
        this.isPlayingSequence = true;
        this.inputEnabled = false;
        this.playerIndex = 0;

        this.sequence.forEach((bubbleIdx, i) => {
            this.time.delayedCall(500 + (i * 800), () => {
                this.flashBubble(bubbleIdx);
            });
        });

        this.time.delayedCall(500 + (this.sequence.length * 800), () => {
            this.isPlayingSequence = false;
            this.inputEnabled = true;
        });
    }

    flashBubble(idx) {
        const bubble = this.bubbles[idx];
        if (!bubble) return;
        bubble.setFillStyle(bubble.highlightFill);
        this.tweens.add({
            targets: bubble, scale: 1.3, duration: 300, yoyo: true, ease: 'Back.easeOut',
            onComplete: () => { bubble.setFillStyle(bubble.defaultFill); }
        });
    }

    onBubbleClicked(index) {
        if (!this.inputEnabled || this.isPlayingSequence) return;
        this.flashBubble(index);

        if (index === this.sequence[this.playerIndex]) {
            this.playerIndex++;
            if (this.playerIndex === this.sequence.length) {
                this.inputEnabled = false;
                if (this.round >= 5) { this.handleWin(); }
                else {
                    this.round++;
                    this.time.delayedCall(1000, () => { this.addNewToSequence(); this.playSequence(); });
                }
            }
        } else {
            this.inputEnabled = false;
            this.bubbles[index].setFillStyle(0xff0000);
            this.time.delayedCall(1000, () => {
                this.bubbles[index].setFillStyle(this.bubbles[index].defaultFill);
                this.startNewLevel();
            });
        }
    }

    handleWin() {
        this.add.text(this.centerX, this.centerY, 'WATER PURIFIED', {
            fontFamily: 'Georgia', fontSize: '64px', color: '#88ddff', stroke: '#002233', strokeThickness: 4
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => { this.scene.start('FireLevel'); });
    }
}