import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Load the background image
        this.load.image('menu_bg', 'assets/MAIN_MENU.png');
    }

    create() {
        // 1. Add the background
        const bg = this.add.image(512, 384, 'menu_bg');

        // 2. FIXED SCALING: Use Math.min to ensure the WHOLE image fits on screen
        // This stops the top and bottom from being cut off.
        const scaleX = 1024 / bg.width;
        const scaleY = 768 / bg.height;
        const scale = Math.min(scaleX, scaleY);
        bg.setScale(scale);

        // 3. UI and Event logic
        EventBus.emit('current-scene-ready', this);
        EventBus.emit('menu-active', true);

        // 4. Move button slightly higher (y: 600) so it's safely inside the image
        this.createScrollButton(512, 600);
    }

    createScrollButton(x, y) {
        // 1. ADD: A glowing aura behind the button to make it pop against the art
        const glowAura = this.add.circle(x, y, 110, 0x8dff7a, 0.3); // Semi-transparent green
        this.tweens.add({
            targets: glowAura,
            scale: 1.5,
            alpha: 0,
            duration: 2000,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 2. FIXED: Change from solid color to semi-transparent
        // The "0.6" at the end sets it to 60% transparent (60% visible)
        const scrollBg = this.add.rectangle(0, 0, 260, 80, 0xf5deb3, 0.6);

        // 3. ENHANCED: Thicker, semi-transparent stroke for the button frame
        scrollBg.setStrokeStyle(6, 0x8B7355, 0.8);

        // 4. FIXED: Change text color to stand out against the artwork
        const buttonText = this.add.text(0, 0, 'START GAME', {
            fontFamily: 'Georgia',
            fontSize: '30px', // Made slightly larger
            color: '#FFFFFF', // Pure White for high contrast
            fontStyle: 'bold',
            stroke: '#000000', // Added a black stroke for readability
            strokeThickness: 5
        }).setOrigin(0.5);

        // Group interactive elements into a container
        const buttonGroup = this.add.container(x, y, [glowAura, scrollBg, buttonText]);
        buttonGroup.setSize(260, 80);
        buttonGroup.setInteractive({ useHandCursor: true });

        // 5. FIXED: Smoother hover animations for the whole button
        buttonGroup.on('pointerover', () => {
            this.tweens.add({
                targets: buttonGroup,
                scale: 1.1,
                duration: 150
            });
            scrollBg.setFillStyle(0xFFFFFF, 0.9); // Turn brighter white on hover
            buttonText.setColor('#d4af37'); // Change text color to gold
        });

        buttonGroup.on('pointerout', () => {
            this.tweens.add({
                targets: buttonGroup,
                scale: 1,
                duration: 150
            });
            scrollBg.setFillStyle(0xf5deb3, 0.6); // Return to semi-transparent
            buttonText.setColor('#FFFFFF'); // Return text to white
        });

        // 6. ENHANCED: A smooth fade-out effect when starting the game
        buttonGroup.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0); // Fade to black over 0.5s
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('EarthLevel');
            });
        });
    }
}