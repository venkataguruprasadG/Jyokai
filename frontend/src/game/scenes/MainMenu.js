import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Background - Dark mystical theme
        this.add.rectangle(512, 384, 1024, 768, 0x0a0a0a);

        // Decorative magical particles in background
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(50, 974);
            const y = Phaser.Math.Between(50, 718);
            const particle = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0x8dff7a, 0.3);
            this.tweens.add({
                targets: particle,
                alpha: 0.1,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1
            });
        }

        // Title
        this.add.text(512, 150, 'JYOKAI', {
            fontFamily: 'Georgia',
            fontSize: '72px',
            color: '#d4af37',
            stroke: '#8B7355',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(512, 220, 'Purify the Spirit', {
            fontFamily: 'Georgia',
            fontSize: '28px',
            color: '#8dff7a',
            italic: true
        }).setOrigin(0.5);

        // Create the Start Game button as a glowing scroll
        this.createScrollButton(512, 420);

        // Instructions text
        this.add.text(512, 620, 'Test your memory and focus through three trials', {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#f0e6d2'
        }).setOrigin(0.5);

        EventBus.emit('current-scene-ready', this);
    }

    createScrollButton(x, y) {
        // Scroll background (parchment-style rectangle)
        const scrollBg = this.add.rectangle(x, y, 220, 80, 0xf5deb3);
        scrollBg.setStrokeStyle(3, 0x8B7355);

        // Inner decorative border for scroll effect
        const innerBorder = this.add.graphics();
        innerBorder.lineStyle(1, 0xd4af37, 1);
        innerBorder.strokeRectShape(new Phaser.Geom.Rectangle(x - 100, y - 30, 200, 60));

        // Start Game text
        const buttonText = this.add.text(x, y, 'START GAME', {
            fontFamily: 'Georgia',
            fontSize: '24px',
            color: '#2b1d14',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Glowing aura effect
        const glowAura = this.add.circle(x, y, 130, 0xd4af37, 0);
        this.tweens.add({
            targets: glowAura,
            scale: 1.2,
            alpha: 0.3,
            duration: 1500,
            repeat: -1,
            yoyo: true
        });

        // Group interactive elements
        const buttonGroup = this.add.container(x, y, [scrollBg]);
        buttonGroup.setSize(220, 80);
        buttonGroup.setInteractive({ useHandCursor: true });

        // Hover effects
        buttonGroup.on('pointerover', () => {
            this.tweens.add({
                targets: scrollBg,
                scale: 1.1,
                duration: 200
            });
            buttonText.setColor('#d4af37');
            glowAura.setAlpha(0.5);
        });

        buttonGroup.on('pointerout', () => {
            this.tweens.add({
                targets: scrollBg,
                scale: 1,
                duration: 200
            });
            buttonText.setColor('#2b1d14');
            glowAura.setAlpha(0.3);
        });

        // Click to start
        buttonGroup.on('pointerdown', () => {
            this.scene.start('EarthLevel');
        });

        // Add scroll ornaments at the edges
        this.add.circle(x - 120, y - 3, 8, 0x8B7355);
        this.add.circle(x + 120, y - 3, 8, 0x8B7355);
    }
}
