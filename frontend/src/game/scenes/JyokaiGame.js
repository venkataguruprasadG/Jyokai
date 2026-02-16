import { Scene } from 'phaser';

export class JyokaiGame extends Scene {
    constructor() {
        super('JyokaiGame');
    }

    create() {
        // 1. Add a background color or title
        this.add.text(400, 50, 'Jyokai: Memory Training', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // 2. Data for our cards (just colors for now)
        const cardColors = [0xff0000, 0xff0000, 0x00ff00, 0x00ff00];
        // Shuffle the colors so it's a real game
        const shuffledColors = Phaser.Utils.Array.Shuffle(cardColors);

        // 3. Create a 2x2 Grid
        let count = 0;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const x = 300 + (col * 200);
                const y = 250 + (row * 200);

                // Create the 'back' of the card
                const card = this.add.rectangle(x, y, 150, 180, 0x888888);
                card.setInteractive();

                // Store the hidden color inside the card object
                card.secretColor = shuffledColors[count];
                count++;

                // 4. Handle Clicks
                card.on('pointerdown', () => {
                    card.setFillStyle(card.secretColor); // "Flip" the card
                    console.log("Flipped a card!");
                });
            }
        }
    }
}