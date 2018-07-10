//rendering chunks
var player;
var worldOffset = {
  x: null,
  y: null
}
var SPEED = 8;
var chunks = [];
var loadedChunks = [];
var currentChunk = {
  x: 0,
  y: 0
}

var GameConst = {
  SCREEN_WIDTH : 1200,
  SCREEN_HEIGHT : 800,
  UPDATE_RATE : 30,
  TILE_SIZE : 56,
  CHUNK_SIZE : 32
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

var lakes = [];

function startGame() {
  //terrain generation

  // chunks.push(new chunk(0, 0));
  // loadedChunks = chunks;

  center = new tile(0, 0, 0, 0, typesEnum.TEST, 0);

  player = new component(600, 450, 56, 56, "assets/coin.png");

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

function component(x, y, height, width, image) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.cX = Math.floor(this.x / (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE));
  this.cY = Math.floor(this.y / (GameConst.CHUNK_SIZE * GameConst.TILE_SIZE));

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
  }
}

function lake(cX, cY) {
  this.cX = cX;
  this.cY = cY;
  this.column = Math.floor(Math.random() * GameConst.CHUNK_SIZE),
  this.row = Math.floor(Math.random() * GameConst.CHUNK_SIZE),
  this.size = Math.floor(Math.random() * 7) + 3;
  this.type = 0;
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

  this.cX = cX;
  this.cY = cY;
  this.state = chunkStatesEnum.VISIBLE;

  this.update = function() {
    for (j = 0; j < this.tiles.length; j++) {
      this.tiles[j].update();
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



  if(type == -1) {
    this.type = Math.floor(distance(0, 0, cX * column, cY * row) / 128);
  }



  if(type != typesEnum.TEST) {
    if(distance(column + cX * GameConst.CHUNK_SIZE, row + cY * GameConst.CHUNK_SIZE, lake.column, lake.row) < lake.size || type == typesEnum.WATER) {
      this.image.src = "assets/water2.png";
      this.type = typesEnum.WATER;
    } else if(distance(column + cX * GameConst.CHUNK_SIZE, row + cY * GameConst.CHUNK_SIZE, lake.column, lake.row) < lake.size + Math.floor(Math.random() * 2.5) + 1.5 && type != typesEnum.WATER) {
      this.image.src = "assets/tile_set.png";
      this.type = typesEnum.SAND;
    } else if(type == typesEnum.LAVA) {
      this.image.src = "assets/lava.png";
      this.type = typesEnum.LAVA;
    } else {
      this.image.src = "assets/tile_set.png";
      this.type = type;
    }
    if(column == 0 && row == 0) {
      this.image.src = "assets/testTile2.png";
      this.type = typesEnum.TEST;
    }
  } else {
    this.image.src = "assets/testTile.png";
    this.type = type;
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
    if(loadedChunks[i].isVisible()) {
      loadedChunks[i].update();
    }
  }

  center.update();
  player.update();

  ctx = myGameArea.context;
  ctx.font = "30px" + " " + "Consolas";
  ctx.fillStyle = "black";
  ctx.fillText(player.x.toString() + " " + player.y.toString(), 50, 50);

  myGameArea.frameNo += 1;
} 

function distance(x1, y1, x2, y2) {
    return Math.sqrt(((x2 - x1)*(x2 - x1)) + ((y2 - y1)*(y2 - y1)));
}

startGame();