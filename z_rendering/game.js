//rendering chunks
var player;
var worldOffset = {
  x: null,
  y: null
}
var SPEED = 10;
var chunks = [];
var loadedChunks = [];
var visibleChunks = [];
var currentChunk = {
  x: 0,
  y: 0
}

var GameConst = {
  SCREEN_WIDTH : 1200,
  SCREEN_HEIGHT : 800,
  UPDATE_RATE : 30,
  TILE_SIZE : 56,
  CHUNK_SIZE : 32,
  BIOME_SIZE : 4
}

var typesEnum = {
  FIELD : 0, 
  GRASS : 1, 
  SAND : 2,
  ROCK : 3,
  WATER : 4,
  LAVA : 5,
  TEST : 6,
  TOTAL : 7
};

var chunkStatesEnum = {
  UNLOADED : 0, 
  LOADED : 1, 
  VISIBLE : 2,
  TOTAL : 3
};

var treeTypes = {
  FIELD : 0,
  FOREST : 1,
  DESERT : 2,
  MOUTAIN : 3,
  VOLCANO : 4,
  TOTAL : 5
}

var lakes = [];

function startGame() {
  center = new tile(0, 0, 0, 0, typesEnum.TEST, 0);

  player = new player(600, 450, 56, 56, "assets/coin.png");

  loadNewChunks();

  myGameArea.start();
}

var myGameArea = {
  //regular shit
  canvas : document.createElement("canvas"),
  start: function() {
    this.canvas.width = GameConst.SCREEN_WIDTH;
    this.canvas.height = GameConst.SCREEN_HEIGHT;
    this.canvas.style = "border:1px solid";
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, GameConst.UPDATE_RATE);
    //keybaord movement
    window.addEventListener("keydown", function (e) {
      myGameArea.keys = (myGameArea.keys || []);
      myGameArea.keys[e.keyCode] = true;
    })
    window.addEventListener("keyup", function (e) {
      myGameArea.keys[e.keyCode] = false;
    })
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function component(cX, cY, type) {
  this.cX = cX;
  this.cY = cY;
  this.type = type;
  this.isVisible = true;

  if(this.type == "tree") {
    this.width = 90;
    this.height = Math.floor(Math.random() * 180) + 130;
    this.x = cX * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE + Math.floor(Math.random() * (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE)) - (this.width / 2);
    this.y = cY * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE + Math.floor(Math.random() * (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE)) - (this.height);
    this.image = new Image();
    //check for image type
    this.biome = Math.floor(distance(0, 0, this.x, this.y) / 
    (GameConst.BIOME_SIZE * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE 
      + Math.floor(Math.random() * 2000) - 1000));
    if(this.biome == treeTypes.FIELD) {
      if(Math.floor(Math.random() * 2) == 0) {
        this.image.src = "assets/willow.png";
      } else {
        this.image.src = "assets/birch.png";
      }
    } else if(this.biome == treeTypes.FOREST) {
      if(Math.floor(Math.random() * 2) == 0) {
        this.image.src = "assets/oak.png";
      } else {
        this.image.src = "assets/pine.png";
      }
    } else if(this.biome == treeTypes.DESERT) {
      if(Math.floor(Math.random() * 2) == 0) {
        this.image.src = "assets/palm_tree.png";
      } else {
        this.image.src = "assets/cactus.png";
      }
    } else if(this.biome == treeTypes.MOUTAIN) {
      if(Math.floor(Math.random() * 2) == 0) {
        this.image.src = "assets/dead_bush.png";
      } else {
        this.image.src = "assets/dead_tree.png";
      }
    } else {
      if(Math.floor(Math.random() * 2) == 0) {
        this.image.src = "assets/black_tree.png";
      } else {
        this.image.src = "assets/pillar.png";
      }
    }

    //lakes
    for(l = 0; l < lakes.length; l++) {
      if(distance(lakes[l].x, lakes[l].y,
      this.x + (this.width / 2), this.y + (this.height)) < lakes[l].size * GameConst.TILE_SIZE) {
        this.isVisible = false;
      }
    }


  } else if(this.type == "rock") {
    this.width = 90;
    this.height = Math.floor(Math.random() * 180) + 130;
    this.x = cX * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE + Math.floor(Math.random() * (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE)) - (this.width / 2);
    this.y = cY * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE + Math.floor(Math.random() * (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE)) - (this.height);
    this.image = new Image();
    //check for image type
    this.biome = Math.floor(distance(0, 0, this.x, this.y) / 
    (GameConst.BIOME_SIZE * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE 
      + Math.floor(Math.random() * 2000) - 1000));
    if(this.biome == treeTypes.FIELD) {
      this.image.src = "assets/quartz_rock.png";
    } else if(this.biome == treeTypes.FOREST) {
      this.image.src = "assets/grey_rock.png";
    } else if(this.biome == treeTypes.DESERT) {
      this.image.src = "assets/red_rock.png";
    } else if(this.biome == treeTypes.MOUTAIN) {
      this.image.src = "assets/brown_rock.png";
    } else {
      this.image.src = "assets/black_rock.png";
    }
  }

  this.update = function() {
    if(this.isVisible) {
      ctx = myGameArea.context;
      ctx.drawImage(
        this.image,
        this.x - worldOffset.x,
        this.y - worldOffset.y,
        this.width, 
        this.height
      );
    }
  }
}

function player(x, y, height, width, image) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.cX = Math.floor(this.x / (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE));
  this.cY = Math.floor(this.y / (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE));
  this.column = 0;
  this.row = 0;
  this.tileType = 0;

  this.speedX = 0;
  this.speedY = 0;

  this.image = new Image();
  this.image.src = image;

  this.update = function() {
    ctx = myGameArea.context;
    ctx.drawImage(
      this.image,
      600,
      450,
      this.width, 
      this.height
    );
  }

  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    worldOffset.x = this.x - 600;
    worldOffset.y = this.y - 450;
    this.cX = Math.floor(this.x / (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE));
    this.cY = Math.floor(this.y / (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE));
    this.column = Math.floor((this.x - (this.cX * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE)) / GameConst.TILE_SIZE);
    this.row = Math.floor((this.y - (this.cY * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE)) / GameConst.TILE_SIZE);
    for(i = 0; i < loadedChunks.length; i++) {
      if(loadedChunks[i].isVisible()) {
        if(loadedChunks[i].cX == this.cX && loadedChunks[i].cY == this.cY) {
          this.tileType = loadedChunks[i].tiles[(this.column * GameConst.CHUNK_SIZE) + this.row].type;
        }
      }
    }
  }
}

function lake(cX, cY) {
  this.cX = cX;
  this.cY = cY;
  this.column = Math.floor(Math.random() * GameConst.CHUNK_SIZE),
  this.row = Math.floor(Math.random() * GameConst.CHUNK_SIZE),
  this.size = Math.floor(Math.random() * 12) + 4;
  if(distance(0, 0, cX, cY) < 10) {
    this.type = Math.floor(Math.random() * 10);
  } else {
    this.type = Math.floor(Math.random() * 2);
  }
  this.x = (this.column * GameConst.TILE_SIZE) + (this.cX * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE);
  this.y = (this.row * GameConst.TILE_SIZE) + (this.cY * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE);
}

function chunk(cX, cY) {
  if(Math.floor(Math.random() * 3) == 0) {
    lakes.push(new lake(cX, cY));
  }

  this.tiles = [];
  for(i = 0; i < GameConst.CHUNK_SIZE; i++) {
    for(j = 0; j < GameConst.CHUNK_SIZE; j++) {
      this.tiles.push(new tile(cX, cY, i, j, 
          -1,
          Math.floor(Math.random() * 2)));
    }
  }

  this.objects = [];
  var number_of_trees = Math.floor(Math.random() * 30) + 10;
  for(i = 0; i < number_of_trees; i++) {
    this.objects.push(new component(cX, cY, "tree"));
  }
  var number_of_rocks = Math.floor(Math.random() * 20) + 10;
  for(i = 0; i < number_of_rocks; i++) {
    this.objects.push(new component(cX, cY, "rock"));
  }

  this.cX = cX;
  this.cY = cY;
  this.state = chunkStatesEnum.VISIBLE;

  this.update = function() {
    for (j = 0; j < this.tiles.length; j++) {
      this.tiles[j].update();
    }
    for (j = 0; j < this.objects.length; j++) {
      this.objects[j].update();
    }
  }

  this.isVisible = function() {
    var buffer = GameConst.TILE_SIZE * 4;
    return boxCollision(
      worldOffset.x - buffer,
      worldOffset.y - buffer,
      GameConst.SCREEN_WIDTH + (buffer * 2),
      GameConst.SCREEN_HEIGHT + (buffer * 2),
      this.cX * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE,
      this.cY * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE,
      GameConst.CHUNK_SIZE * GameConst.TILE_SIZE,
      GameConst.CHUNK_SIZE * GameConst.TILE_SIZE
    );
  }
}

function boxCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  var left1 = x1;
  var right1 = x1 + w1;
  var top1 = y1;
  var bottom1 = y1 + h1;
  var left2 = x2;
  var right2 = x2 + w2;
  var top2 = y2;
  var bottom2 = y2 + h2;
  var collision = false;
  if(left1 < right2 &&
    right1 > left2 &&
    top1 < bottom2 &&
    bottom1 > top2) {
    collision = true;
  }
  return collision;
}

function tile(cX, cY, column, row, type, variation) {
  this.x = column * GameConst.TILE_SIZE + cX * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE;
  this.y = row * GameConst.TILE_SIZE + cY * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE;

  this.image = new Image();
  this.variation = variation;

  //broken borken borken working on tile control

  if(type == -1) {
    //if type is generation-based, generate type
    this.type = Math.floor(distance(0, 0, this.x, this.y) / 
    (GameConst.BIOME_SIZE * GameConst.CHUNK_SIZE * GameConst.TILE_SIZE 
      + Math.floor(Math.random() * 2000) - 1000));
    this.image.src = "assets/tile_set.png";
    if(this.type > typesEnum.ROCK) {
      //if type greater than rock make it lava
      this.type = typesEnum.LAVA - (Math.floor(Math.random() * 2) * 2);
      if(this.type == typesEnum.LAVA) {
        this.image.src = "assets/lava.png";
      } else {
        this.image.src = "assets/tile_set.png";
      }
    }

    //change for lakes!
    for(k = 0; k < lakes.length; k++) {
      if(distance(column + cX * GameConst.CHUNK_SIZE, row + cY * GameConst.CHUNK_SIZE, lakes[k].column + lakes[k].cX * GameConst.CHUNK_SIZE, lakes[k].row + lakes[k].cY * GameConst.CHUNK_SIZE) < lakes[k].size) {
        if(lakes[k].type != 0) {
          this.image.src = "assets/water2.png";
          this.type = typesEnum.WATER;
        } else {
          this.image.src = "assets/lava.png";
          this.type = typesEnum.LAVA;
        }
      } else if(distance(column + cX * GameConst.CHUNK_SIZE, row + cY * GameConst.CHUNK_SIZE, lakes[k].column + lakes[k].cX * GameConst.CHUNK_SIZE, lakes[k].row + lakes[k].cY * GameConst.CHUNK_SIZE) < lakes[k].size + Math.floor(Math.random() * 3.5) + 1.5 && this.type != typesEnum.WATER) {
        this.image.src = "assets/tile_set.png";
        if(lakes[k].type != 0) {
          this.type = typesEnum.SAND;
        } else {
          this.type = typesEnum.ROCK;
        }
      }
    }
    
  } else {
    //if not a generated tile
    this.type = type;
    if(this.type == typesEnum.TEST) {
      this.image.src = "assets/testTile.png";
    } else if(this.type < typesEnum.WATER) {
      this.image.src = "assets/tile_set.png";
    } else if(this.type == typesEnum.WATER) {
      this.image.src = "assets/water2.png";
    } else if(this.type == typesEnum.LAVA) {
      this.image.src = "assets/lava.png";
    } else {
      this.image.src = "assets/testTile2.png";
    }
  }

  this.update = function() {
    ctx = myGameArea.context;
    if(this.type == typesEnum.WATER || this.type == typesEnum.LAVA) {
        ctx.drawImage(
          this.image,
          8 * (Math.sin((myGameArea.frameNo / (this.type - 3) * Math.PI / 180) + (3 * Math.PI/20)) + 1),
          8 * (Math.sin((myGameArea.frameNo / (this.type - 3) * Math.PI / 180) + (Math.PI/2)) + 1),
          16,
          16,
          this.x - worldOffset.x,
          this.y - worldOffset.y,
          GameConst.TILE_SIZE, 
          GameConst.TILE_SIZE
        );
    } else if(this.type == typesEnum.TEST) {
      ctx.drawImage(
        this.image,
        this.x - worldOffset.x,
        this.y - worldOffset.y,
        GameConst.TILE_SIZE, 
        GameConst.TILE_SIZE
      );
    } else {
      ctx.drawImage(
        this.image,
        this.type * 16,
        this.variation * 16,
        16,
        16,
        this.x - worldOffset.x,
        this.y - worldOffset.y,
        GameConst.TILE_SIZE, 
        GameConst.TILE_SIZE
      );
    }
  }
}

function newChunks(chunksAdded) {
  if(chunksAdded[0] == 0) {
    chunks.push(new chunk(player.cX - 1, player.cY - 1));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[1] == 0) {
    chunks.push(new chunk(player.cX, player.cY - 1));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[2] == 0) {
    chunks.push(new chunk(player.cX + 1, player.cY - 1));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[3] == 0) {
    chunks.push(new chunk(player.cX - 1, player.cY));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[4] == 0) {
    chunks.push(new chunk(player.cX, player.cY));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[5] == 0) {
    chunks.push(new chunk(player.cX + 1, player.cY));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[6] == 0) {
    chunks.push(new chunk(player.cX - 1, player.cY + 1));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[7] == 0) {
    chunks.push(new chunk(player.cX, player.cY + 1));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
  if(chunksAdded[1] == 0) {
    chunks.push(new chunk(player.cX + 1, player.cY + 1));
    loadedChunks.push(chunks[chunks.length - 1]);
  }
}

function loadNewChunks() {
  var newLoadedChunks = [];
  var chunksAdded = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for(i = 0; i < chunks.length; i++) {
    if(chunks[i].cX == player.cX && chunks[i].cY == player.cY) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[4] = 1;
    } else if(chunks[i].cX == player.cX - 1 && chunks[i].cY == player.cY - 1) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[0] = 1;
    } else if(chunks[i].cX == player.cX && chunks[i].cY == player.cY - 1) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[1] = 1;
    } else if(chunks[i].cX == player.cX + 1 && chunks[i].cY == player.cY - 1) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[2] = 1;
    } else if(chunks[i].cX == player.cX - 1 && chunks[i].cY == player.cY) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[3] = 1;
    } else if(chunks[i].cX == player.cX + 1 && chunks[i].cY == player.cY) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[5] = 1;
    } else if(chunks[i].cX == player.cX - 1 && chunks[i].cY == player.cY + 1) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[6] = 1;
    } else if(chunks[i].cX == player.cX && chunks[i].cY == player.cY + 1) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[7] = 1;
    } else if(chunks[i].cX == player.cX + 1 && chunks[i].cY == player.cY + 1) {
      newLoadedChunks.push(chunks[i]);
      chunksAdded[8] = 1;
    }
  }

  loadedChunks = newLoadedChunks;
  newChunks(chunksAdded);
}

function updateGameArea() {
  myGameArea.clear();

  player.speedX = 0;
  player.speedY = 0;
  if(myGameArea.keys && myGameArea.keys[65]) {
    player.speedX = -SPEED;
  }
  if(myGameArea.keys && myGameArea.keys[68]) {
    player.speedX = SPEED;
  }
  if(myGameArea.keys && myGameArea.keys[87]) {
    player.speedY = -SPEED;
  }
  if(myGameArea.keys && myGameArea.keys[83]) {
    player.speedY = SPEED;
  }
  if(myGameArea.keys && myGameArea.keys[32]) {
    player.x = 500000;
    player.y = 500000;
  }

  player.newPos();

  if(player.cX != currentChunk.x || player.cY != currentChunk.y) {
    currentChunk.x = player.cX;
    currentChunk.y = player.cY;
    loadNewChunks();
  }

  for(i = 0; i < loadedChunks.length; i++) {
    visibleChunks = [];
    if(loadedChunks[i].isVisible()) {
      loadedChunks[i].update();
    }
  }

  center.update();
  player.update();

  ctx = myGameArea.context;
  ctx.font = "30px" + " " + "Consolas";
  ctx.fillStyle = "black";
  ctx.fillText(player.cX.toString() + " " + player.cY.toString(), 50, 50);

  myGameArea.frameNo += 1;
} 

function distance(x1, y1, x2, y2) {
    return Math.sqrt(((x2 - x1)*(x2 - x1)) + ((y2 - y1)*(y2 - y1)));
}

startGame();