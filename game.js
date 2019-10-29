//start chrome --allow-file-access-from-files
var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer({width: 440, height: 440, backgroundColor: 0x3344ee});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();
stage.sortableChildren = true;


PIXI.Loader.shared.add("spriteSheet.json").load(setup);

PIXI.sound.add('wrongWay', 'wrongWay.wav');
PIXI.sound.add('select', 'select.wav');

var cell_width = 40;
var cols = Math.floor(renderer.width/cell_width);
var rows = Math.floor(renderer.height/cell_width);
var width = cols+1;
var height = rows+1;	

var grid = [];
var maze = [];
var cells = [];
var lives = 3;

var start = new Point(8,8);
var finish;
var playerPos = start;


function setup()
{
	
	let sheet = PIXI.Loader.shared.resources["spriteSheet.json"].spritesheet;

	var Menu = new PIXI.Sprite(sheet.textures["wall1.png"]);
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
	

	generate();
	
	//Cell constructor
	function Cell(c , r, type)
	{
		this.col = c;
		this.row = r;
		this.type = type;

		if(type == "wall")
		{
			this.sprite = new PIXI.Sprite(sheet.textures["wall1.png"]);
			this.walkable = false;
		}
		else if (type == "dirt")
		{
			this.sprite = new PIXI.Sprite(sheet.textures["dirt1.png"]);
			this.walkable = true;
		}
		else if(type == "trap")
		{
			this.sprite = new PIXI.AnimatedSprite(sheet.animations["trap"]);
			this.sprite.animationSpeed = 0.015;
			this.walkable = true;
		}
		else if(type == "ladder")
		{
			this.sprite = new PIXI.Sprite(sheet.textures["ladder.png"]);
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

	function generate()
	{
		const NORTH = "N";
		const SOUTH = "S";
		const EAST = "E";
		const WEST = "W";

		for(var x = 0; x < height; x++)
		{
			maze[x] = [];
			for(var y = 0; y  < width; y++)
			{
				maze[x][y] = false;
			}
		}
		maze[start.x][start.y]=true;


		var back;
		var move;
		var possibleDir;
		var pos = start;
		var max = 0;

		var moves = [];
		moves.push(pos.y+(pos.x*width));
		while(moves.length)
		{
			possibleDir = "";
					
			if ((pos.x + 2 < height ) && (maze[pos.x + 2][pos.y] == false) && (pos.x + 2 != true) && (pos.x + 2 != height - 1) )
			{
				possibleDir += SOUTH;
			}
			
			if ((pos.x - 2 >= 0 ) && (maze[pos.x - 2][pos.y] == false) && (pos.x - 2 != true) && (pos.x - 2 != height - 1) )
			{
				possibleDir += NORTH;
			}
			
			if ((pos.y - 2 >= 0 ) && (maze[pos.x][pos.y - 2] == false) && (pos.y - 2 != true) && (pos.y - 2 != width - 1) )
			{
				possibleDir += WEST;
			}
			
			if ((pos.y + 2 < width ) && (maze[pos.x][pos.y + 2] == false) && (pos.y + 2 != true) && (pos.y + 2 != width - 1) )
			{
				possibleDir += EAST;
			}
			
			if ( possibleDir.length > 0 )
			{
				move = randInt(0, (possibleDir.length));
				switch ( possibleDir.charAt(move) )
				{
					case NORTH: 
						maze[pos.x - 2][pos.y] = true;
						maze[pos.x - 1][pos.y] = true;
						pos.x -=2;
						break;
					
					case SOUTH: 
						maze[pos.x + 2][pos.y] = true;
						maze[pos.x + 1][pos.y] = true;
						pos.x +=2;
						break;
					
					case WEST: 
						maze[pos.x][pos.y - 2] = true;
						maze[pos.x][pos.y - 1] = true;
						pos.y -=2;
						break;
					
					case EAST: 
						maze[pos.x][pos.y + 2] = true;
						maze[pos.x][pos.y + 1] = true;
						pos.y +=2;
						break;        
				}
				
				moves.push(pos.y + (pos.x * width));
			}
			else
			{
				back = moves.pop();
				pos.x = Math.floor(back / width);
				pos.y = back % width;
			}
			if(moves.length > max)
			{
				finish = new Point(pos.x, pos.y);
				max = moves.length;
			}
		}

		for ( var x = 0; x < height; x++ )
		{
			grid[x]=[]
			for ( var y = 0; y < width; y++ )
			{
				if(maze[x][y] == true)
				{
					var chance = randInt(0, 4)
					if(x == start.x && y == start.y)
					{
						var cell = new Cell(x, y, "dirt");
						cell.show()
						grid[x].push(cell);
						cells.push(cell);
					}
					else if(finish.x== x && finish.y == y)
					{
						var cell = new Cell(x, y, "ladder");
						cell.show()
						grid[x].push(cell);
						cells.push(cell);
					}
					else if(chance == 0)
					{
						var cell = new Cell(x, y, "trap");
						cell.show()
						grid[x].push(cell);
						cells.push(cell);
					}
					else
					{
						var cell = new Cell(x, y, "dirt");
						cell.show()
						grid[x].push(cell);
						cells.push(cell);
					}
				}
				else
				{
					var cell= new Cell(x, y, "wall");
					cell.show();
					grid[x].push(cell);
					cells.push(cell);
				}
			}
		}		
	}

	var player = new PIXI.Sprite(sheet.textures["char.png"]);

	player.position.x = start.x * cell_width+20;
	player.position.y = start.y * cell_width+20;
	player.anchor.x = .5;
	player.anchor.y = .5;
	player.zIndex = 15;
	stage.addChild(player);

	function keydownEventHandler(e)
	{	
		//w key
		if(e.keyCode == 87)
		{
			if(player.angle != 0)
			{
				player.angle = 0;
			}
			if(grid[playerPos.x][playerPos.y-1].walkable)
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
			if(grid[playerPos.x][playerPos.y+1].walkable)
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
			if(grid[playerPos.x-1][playerPos.y].walkable)
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
			if(grid[playerPos.x+1][playerPos.y].walkable)
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

	function animate()
	{
		requestAnimationFrame(animate);
		renderer.render(stage);

		for ( var x = 0; x < height; x++ )
		{
			for ( var y = 0; y < width; y++ )
			{
				//console.log("x: "+ x + ", y: " + y + "type: " + grid[x][y].type);
				if(grid[x][y].type == "trap")
				{
					grid[x][y].sprite.play();
					if(playerPos.x ==x && playerPos.y == y && grid[x][y].sprite.currentFrame != 0 && lives > 0 && grid[x][y].sprite.currentFrame !=4)
					{
						lives--;
						PIXI.sound.play('wrongWay');
						if(lives == 0)
						{
							stage.addChild(gameOverText);
							stage.addChild(restartText);
							stage.addChild(Menu);
						}
					}
				}
				else if(grid[x][y].type == "ladder" && playerPos.x ==x && playerPos.y == y)
				{
					generate();
					player.position.x = start.x * cell_width;
					player.position.y = start.y * cell_width;
					playerPos = start;
				}
			}
		}
	}

	animate();
	document.addEventListener('keydown', keydownEventHandler);
}

//Point data structure
function Point(x, y)
{
	this.x = x
	this.y = y;
}

function randInt(min, max)
{
	return Math.floor(Math.random() * max) + min;
}






