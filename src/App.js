import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { forEach } from 'lodash';
import './App.css';
import { loadMapLayerData } from './util/mapUtils';

const app = new PIXI.Application({
  width: 1280,         // default: 800
  height: 720,        // default: 600
  antialias: false,    // default: false
  transparent: false, // default: false
  resolution: 1       // default: 1
});
const ticker = PIXI.Ticker.shared;

const loadQueue = [];
const queueLoad = ({ id, uri, onLoad, onLoadParams }) => {
  var resource = { id, uri, onLoad, onLoadParams };
  loadQueue.push(resource);
}

let viewport = new PIXI.Container();
let baseMap = new PIXI.Container();
let actors = new PIXI.Container();
let aboveActorMap = new PIXI.Container();

app.stage.addChild(viewport);
viewport.addChild(baseMap, actors, aboveActorMap);

fetch(process.env.PUBLIC_URL + '/assets/map/demo.json')
  .then((r) => r.json())
  .then((mapData) => {
    let layerData = loadMapLayerData(mapData);
    forEach(mapData.tilesets, (tileset, idx) => {
      let tilsetSource = tileset.source.substring(2);
      queueLoad({
        id: tilsetSource,
        uri: `${process.env.PUBLIC_URL}/assets/${tilsetSource}`,
        onLoad: (onLoadParams) => {
          forEach(layerData, (layer, layerNum) => {
            layer.forEach(tile => {
              const resources = PIXI.Loader.shared.resources[tilsetSource];
              const sprite = new PIXI.Sprite(resources.textures[`tile${String(tile.tileId - 1).padStart(3, '0')}.png`]);

              sprite.x = tile.x;
              sprite.y = tile.y;

              if (layerNum <= 1) {
                baseMap.addChild(sprite)
              } else {
                aboveActorMap.addChild(sprite);
              }
            });
          });
        },
        onLoadParams: { tileset }
      });

    });
  });

ticker.add(() => {
  if (!PIXI.Loader.shared.loading && loadQueue.length > 0) {
    let resource = loadQueue.shift();

    PIXI.Loader.shared
      .add(resource.id, resource.uri)
      .load(() => resource.onLoad(resource.onLoadParams));
  }
})
queueLoad({ id: 'walk', uri: process.env.PUBLIC_URL + '/assets/sprites/walk/walk.json', onLoad: setup });

function setup() {
  let sheet = PIXI.Loader.shared.resources['walk'].spritesheet;
  actors.sortableChildren = true;
  let sprites = [
    new PIXI.AnimatedSprite(sheet.animations['down']),
    new PIXI.AnimatedSprite(sheet.animations['left']),
    new PIXI.AnimatedSprite(sheet.animations['up']),
    new PIXI.AnimatedSprite(sheet.animations['right']),
    new PIXI.AnimatedSprite(sheet.animations['down']),
    new PIXI.AnimatedSprite(sheet.animations['left']),
    new PIXI.AnimatedSprite(sheet.animations['up']),
    new PIXI.AnimatedSprite(sheet.animations['right'])
  ]
  forEach(sprites, (actor) => {
    actor.animationSpeed = 0.167;
    actor.y = Math.random() * 666;
    actor.x = Math.random() * 1000;
    actor.play();
    actor.vx = Math.random() * 6 + 1;
    actor.vy = Math.random() * 6 + 1;
  });

  actors.addChild(...sprites);
  ticker.add((delta) => {
    forEach(sprites, (actor) => {
      if (actor.x >= 48*48-48 || actor.x <= 0) {
        actor.vx = (actor.x >= 1280 - 48 ? -1 : 1) * (Math.random() * 6 + 2);
      }
      if (actor.y >= 48*48-48 || actor.y <= 0) {
        actor.vy = (actor.y >= 720 - 48 ? -1 : 1) * (Math.random() * 6 + 2);
      }
      actor.y += actor.vy;
      actor.x += actor.vx;
      actor.zIndex = actor.y;
    });

    viewport.pivot.x = Math.floor(sprites[0].position.x);
    viewport.pivot.y = Math.floor(sprites[0].position.y);
    viewport.position.x = Math.floor(1280 / 2);
    viewport.position.y = Math.floor(720 / 2);
  })
}

function App() {
  useEffect(() => {
    const element = document.getElementById('canvas');
    element.appendChild(app.view);
  }, []);

  return (
    <div id="canvas" className="App">
    </div>
  );
}

export default App;
