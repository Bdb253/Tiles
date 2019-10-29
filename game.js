//start chrome --allow-file-access-from-files
var gameport = document.getElementById("gameport");

var GAME_SCALE = 1;
var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;

var renderer = PIXI.autoDetectRenderer({width: GAME_WIDTH, height: GAME_HEIGHT, backgroundColor: 0x3344ee});
gameport.appendChild(renderer.view);
var stage = new PIXI.Container();
stage.scale.x = GAME_SCALE;
stage.scale.y = GAME_SCALE;
stage.sortableChildren = true;

// Scene objects get loaded in the ready function
var player;
var world;
var sheet;

var cell_width = 40;
var cols = 100
var rows = 100


var map = [];


var start = new Point(6,6);
var playerPos = start;

PIXI.Loader.shared.add("spriteSheet.json").load(setup);

// The move function starts or continues movement
function keydownEventHandler(e)
{	
	//w key
	if(e.keyCode == 87)
	{
		if(player.angle != 0)
		{
			player.angle = 0;
		}
		if(map[playerPos.x][playerPos.y-1].walkable)
		{
			var newy = player.position.y - 40;
			createjs.Tween.get(player.position).to({x: player.position.x, y: newy}, 250);
			playerPos.y-=1;
		}
		else
		{
			PIXI.sound.play('wrongWay');
		}
	}
	//s key
	if(e.keyCode == 83)
	{
		if(player.angle != 180)
		{
			player.angle = 180;
		}
		if(map[playerPos.x][playerPos.y+1].walkable)
		{
			var newy = player.position.y + 40;
			createjs.Tween.get(player.position).to({x: player.position.x, y: newy}, 250);
			playerPos.y+=1;
		}
		else
		{
			PIXI.sound.play('wrongWay');
		}
	}
	//a key
	if(e.keyCode == 65)
	{
		if(player.angle != -90)
		{
			player.angle = -90;
		}
		if(map[playerPos.x-1][playerPos.y].walkable)
		{
			var newX = player.position.x - 40;
			createjs.Tween.get(player.position).to({x: newX, y: player.position.y}, 250);
			playerPos.x -=1;
		}
		else
		{
			PIXI.sound.play('wrongWay');
		}
	}
	//d key
	if(e.keyCode == 68)
	{
		if(player.angle != 90)
		{
			player.angle = 90;
		}
		if(map[playerPos.x+1][playerPos.y].walkable)
		{
			var newX = player.position.x + 40;
			createjs.Tween.get(player.position).to({x: newX, y: player.position.y}, 250);
			playerPos.x+=1;
		}
		else
		{
			PIXI.sound.play('wrongWay');
		}
	}


}

function setup()
{
	sheet = PIXI.Loader.shared.resources["spriteSheet.json"].spritesheet;

	$.getJSON("tilemap.json", function(jsonFile) {
		//console.log(jsonFile);
		for( var x=0; x < rows; x++)
		{
			map[x] = [];
			for(var y = 0; y < cols; y++)
			{
				//console.log((x*rows)+y);
				var cell = new Cell(x, y, jsonFile.layers[0].data[(x*rows)+y]);
				cell.show();
				map[x][y]=cell;
			}
		}
	});
	
	
	player = new PIXI.Sprite(sheet.textures["char.png"]);

	player.position.x = start.x * cell_width;
	player.position.y = start.y * cell_width;
	//player.anchor.x = .5;
	//player.anchor.y = .5;
	player.zIndex = 15;
	stage.addChild(player);

	animate();
}	

/*

//gameOver text
const gameOverStyle = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 60,
	fontWeight: 'bold',
	fill: '#FF0000',
	strokeThickness: 5,
});

gameOverText = new PIXI.Text("GAME OVER");
gameOverText.x = 20;
gameOverText.y = 175;
gameOverText.zIndex = 150;
gameOverText.style = gameOverStyle;

//restart text
const restartStyle = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 45,
	fontWeight: 'bold',
	fill: '#FF0000',
	strokeThickness: 5,
});

restartText = new PIXI.Text("Restart?");
restartText.x = 125;
restartText.y = 250;
restartText.zIndex = 150;
restartText.style = restartStyle;
restartText.interactive = true;
restartText.click = function(e)
{
	PIXI.sound.play('select');
	location.reload();
};
*/

/*
{var Menu = new PIXI.Sprite(sheet.textures["wall1.png"]);
Menu.zIndex = 100;
Menu.scale.x = 11;
Menu.scale.y = 11;
Menu.sortableChildren = true;
stage.addChild(Menu);

//Title text
const titleStyle = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 65,
	fontWeight: 'bold',
	fill: '#FFC300',
	strokeThickness: 5,
});

titleText = new PIXI.Text("Cave Dweller");
titleText.x = 15;
titleText.y = 50;
titleText.zIndex = 150
titleText.style = titleStyle;

//start text
const startStyle = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 45,
	fontWeight: 'bold',
	fill: '#FFC300',
	strokeThickness: 5,
});

startText = new PIXI.Text("Start");
startText.x = 125;
startText.y = 170;
startText.zIndex = 150
startText.style = startStyle;
startText.interactive = true;
startText.click = function(e)
{
	stage.removeChild(Menu);
	stage.removeChild(startText);
	stage.removeChild(titleText);
	stage.removeChild(creditText);
	PIXI.sound.play('select');
};

creditText = new PIXI.Text("Credits");
creditText.x = 125;
creditText.y = 250;
creditText.zIndex = 150;
creditText.style = startStyle;
creditText.interactive = true;
creditText.click = function(e)
{
	stage.removeChild(startText);
	stage.removeChild(titleText);
	stage.removeChild(creditText);
	stage.addChild(backText);
	stage.addChild(authorText);
	PIXI.sound.play('select');
}

backText = new PIXI.Text("Back");
backText.x = 10;
backText.y = 10;
backText.zIndex = 150;
backText.style = startStyle;
backText.interactive = true;
backText.click = function(e)
{
	PIXI.sound.play('select');
	stage.removeChild(backText);
	stage.removeChild(authorText);
	stage.addChild(startText);
	stage.addChild(titleText);
	stage.addChild(creditText);
}

//author style
const authorStyle = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 35,
	fontWeight: 'bold',
	fill: '#FFC300',
	strokeThickness: 5,
});

authorText = new PIXI.Text("Art, Sound and Design:\n Bowen Boyd");
authorText.x = 10;
authorText.y = 200;
authorText.zIndex = 150;
authorText.style =authorStyle;

stage.addChild(startText);
stage.addChild(titleText);
stage.addChild(creditText);
*/
	
	

//Point data structure
function Point(x, y)
{
	this.x = x
	this.y = y;
}

//Cell constructor
function Cell(x, y, type)
{
	this.row = x;
	this.col = y;
	this.type = type;

	if(type == "1")
	{
		this.sprite = new PIXI.Sprite(sheet.textures["wall1.png"]);
		this.walkable = false;
	}
	else if (type == "2")
	{
		this.sprite = new PIXI.Sprite(sheet.textures["dirt1.png"]);
		this.walkable = true;
	}
	else if (type == "3")
	{
		this.sprite = new PIXI.Sprite(sheet.textures["TopLeftHouse.png"]);
		this.walkable = false;
	}
	else if (type == "4")
	{
		this.sprite = new PIXI.Sprite(sheet.textures["TopRightHouse.png"]);
		this.walkable = false;
	}
	else if (type == "5")
	{
		this.sprite = new PIXI.Sprite(sheet.textures["BottomLeftHouse.png"]);
		this.walkable = true;
	}
	else if (type == "6")
	{
		this.sprite = new PIXI.Sprite(sheet.textures["BottomRightHouse.png"]);
		this.walkable = true;
	}

	this.show = function()
	{
		var x = this.col*cell_width;
		var y = this.row*cell_width;

		this.sprite.x = x;
		this.sprite.y = y;
		this.sprite.zIndex = 5;
		stage.addChild(this.sprite);
	}
}

function animate()
{
	requestAnimationFrame(animate);
	update_camera();
	renderer.render(stage);
}


function randInt(min, max)
{
	return Math.floor(Math.random() * max) + min;
}

function update_camera()
{
  stage.x = -player.x*GAME_SCALE + GAME_WIDTH/2 - player.width/2*GAME_SCALE;
  stage.y = -player.y*GAME_SCALE + GAME_HEIGHT/2 - player.height/2*GAME_SCALE;
  stage.x = -Math.max(0, Math.min(4000*GAME_SCALE - GAME_WIDTH, -stage.x));
  stage.y = -Math.max(0, Math.min(4000*GAME_SCALE - GAME_HEIGHT, -stage.y));
}

document.addEventListener('keydown', keydownEventHandler);