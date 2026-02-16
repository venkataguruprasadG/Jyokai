import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Create a loading screen with geometric shapes only
        this.add.rectangle(512, 384, 1024, 768, 0x1a1a1a);

        // Loading bar background
        this.add.rectangle(512, 384, 468, 32, 0x222222).setStrokeStyle(2, 0xd4af37);

        // Progress bar
        this.bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xd4af37);

        // Loading text
        this.loadingText = this.add.text(512, 320, 'Preparing trials...', {
            fontFamily: 'Georgia',
            fontSize: '24px',
            color: '#d4af37'
        }).setOrigin(0.5);
    }

    preload() {
        // No external assets to load - all content is generated with Phaser geometric shapes
        // Simulate a load progress event
        const startTime = Date.now();
        const simulatedProgress = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 800, 1); // Arbitrary 800ms load time
            this.bar.width = 4 + (460 * progress);

            if (progress >= 1) {
                clearInterval(simulatedProgress);
            }
        }, 16);
    }

    create() {
        // All assets are generated with geometric shapes at runtime
        // Move to the MainMenu
        this.scene.start('MainMenu');
    }
}
