import Phaser from 'phaser';
import { MainMenu } from './scenes/MainMenu';
import { EarthLevel } from './scenes/EarthLevel';
import { WaterLevel } from './scenes/WaterLevel';
import { FireLevel } from './scenes/FireLevel';

export default function StartGame(parent = 'game-container') {
    return new Phaser.Game({
        type: Phaser.AUTO,
        width: 1024,
        height: 768,
        parent: parent,
        backgroundColor: '#1a1a1a',
        scene: [MainMenu, EarthLevel, WaterLevel, FireLevel]
    });
}