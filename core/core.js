import * as PIXI from '../lib/pixi.min.js';
import walk from "../assets/sprites/walk/walk.json";

console.log("here")
//Create a Pixi Application
const app = new PIXI.Application({
    width: 1280,         // default: 800
    height: 720,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

PIXI.Loader.shared
    .add(walk)
    .load(setup);

function setup() {
    // get a reference to the sprite sheet we've just loaded:
    let sheet = PIXI.Loader.shared.resources[walk];
    // create an animated sprite
    animatedCapguy = new PIXI.AnimatedSprite(sheet.animations["down"]);

    // set speed, start playback and add it to the stage
    animatedCapguy.animationSpeed = 0.167;
    animatedCapguy.play();
    app.stage.addChild(animatedCapguy);
}