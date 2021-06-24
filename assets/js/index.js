// -- initial setup stuff --
// target canvas element and save it in variable
const canvas = document.getElementById('canvas');
// getContext gives access to build canvas methods
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

let score = 0;
let highScore = localStorage.getItem('gameHighScore') || 0;
let frame = 0;
let level = 1;
let paused = false;
let lifePoints = 3;

// font
ctx.font = 'bold 60px Roboto';

// howler.js sounds
const pointSound = new Howl({
	src: ['assets/sound/point.mp3'],
	volume: 0.1,
});

const deductSound = new Howl({
	src: ['assets/sound/deduct.mp3'],
	volume: 0.1,
});

// -- Mouse handling --
let canvasPos = canvas.getBoundingClientRect();

const mouse = {
	x: canvas.width / 2,
	y: canvas.height / 2,
	click: false,
};

canvas.addEventListener('mousedown', (event) => {
	mouse.x = event.x - canvasPos.left;
	mouse.y = event.y - canvasPos.top;
});

canvas.addEventListener('mouseup', () => {
	mouse.click = false;
});

// player properties
const playerLeft = new Image(); //player going left
playerLeft.src = 'assets/img/playerleft.png';

const playerRight = new Image(); // player going right
playerRight.src = 'assets/img/playerright.png';

class Player {
	constructor() {
		this.x = canvas.width / 2; // initial starting coordinates
		this.y = canvas.height / 2; // initial starting coordinates
		this.radius = 50;
		this.angle = 0;
		this.frameX = 0;
		this.frameY = 0;
		this.spriteWidth = 3460 / 5;
		this.spriteHeight = 1797 / 3;
	}

	update() {
		const dx = this.x - mouse.x;
		const dy = this.y - mouse.y;

		this.angle = Math.atan2(dy, dx);

		if (mouse.x !== this.x) {
			this.x -= dx / 30; // divide by 30 to slow down
		}
		if (mouse.y !== this.y) {
			this.y -= dy / 30; // divide by 30 to slow down
		}
	}

	draw() {
		// draw line from mouse position to player
		if (mouse.click) {
			(ctx.lineWidth = 0), 2;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
		}
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);

		if (this.x >= mouse.x) {
			ctx.drawImage(
				playerLeft,
				this.frameX * this.spriteWidth,
				this.frameY * this.spriteHeight,
				this.spriteWidth,
				this.spriteHeight,
				0 - 60, //-60 and -70 to cover the ball with collision
				0 - 70,
				this.spriteWidth / 4,
				this.spriteHeight / 4
			); 
		} else {
			ctx.drawImage(
				playerRight,
				this.frameX * this.spriteWidth,
				this.frameY * this.spriteHeight,
				this.spriteWidth,
				this.spriteHeight,
				0 - 60, //-60 and -70 to cover the ball with collision
				0 - 70,
				this.spriteWidth / 4,
				this.spriteHeight / 4
			); 
		}
		ctx.restore();
	}
}
// create default player object
const player = new Player();

let coinsArray = [];
class Coin {
	constructor() {
		this.x = Math.random() * canvas.width;
		this.y = canvas.height + 100; // spawn below bottom
		this.radius = 35;
		this.speed = Math.random() * 5 + 1;
		this.distance;
		this.hit;
	}
	update() {
		this.y -= this.speed;
		const dx = this.x - player.x;
		const dy = this.y - player.y;
		this.distance = Math.sqrt(dx * dx + dy * dy); // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
	}
	draw() {
		ctx.fillStyle = 'yellow';
		ctx.lineWidth = 10;
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
		ctx.stroke();
		ctx.fillStyle = 'black';
		ctx.font = 'bold 60px Roboto';
		ctx.fillText('$', this.x - 15, this.y + 15);
	}
}

function coinHandler() {
	if (frame % 50 === 0) {
		//run code every 50 frames
		coinsArray.push(new Coin());
		console.log(coinsArray.length);
	}
	// for (let i = 0; i < coinsArray.length; i++) {
	for (let i = coinsArray.length - 1; i >= 0; i--) {
		coinsArray[i].update();
		coinsArray[i].draw();
		if (coinsArray[i].y < 0) {
			// if Coin is outside canvas
			coinsArray.splice(i, 1); // then remove Coin
		}
		if (coinsArray[i].distance < coinsArray[i].radius + player.radius) {
			console.log('Coin Collected');
			if (!coinsArray[i].hit) {
				pointSound.play();
				score++;
				coinsArray[i].hit = true;
				coinsArray.splice(i, 1);
			}
		}
	}
}

let goldenCoinsArray = [];
class GoldenCoin {
	constructor() {
		this.x = Math.random() * canvas.width;
		this.y = canvas.height + 100; // spawn below bottom
		this.radius = 60;
		this.speed = Math.random() * 2 + 1;
		this.distance;
		this.hit;
	}
	update() {
		this.y -= this.speed;
		const dx = this.x - player.x;
		const dy = this.y - player.y;
		this.distance = Math.sqrt(dx * dx + dy * dy); // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
	}
	draw() {
		ctx.fillStyle = 'orange';
		ctx.lineWidth = 10;
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
		ctx.stroke();
		ctx.fillStyle = 'black';
		ctx.font = 'bold 35px Roboto';
		ctx.fillText('Evade', this.x - 47, this.y);
		ctx.fillText('Tax', this.x - 30, this.y + 30);
	}
}

function goldenCoinHandler() {
	if (frame % 500 === 0) {
		//run code every 500 frames
		if (level >= 3) { // only spawn at level 3 and above
		goldenCoinsArray.push(new GoldenCoin());
		console.log(goldenCoinsArray.length);
		}
	}
	for (let g = goldenCoinsArray.length - 1; g >= 0; g--) {
		goldenCoinsArray[g].update();
		goldenCoinsArray[g].draw();
		if (goldenCoinsArray[g].y < 0) {
			// if Coin is outside canvas
			//goldenCoinsArray.splice(g, 1); // then remove Coin¨
			goldenCoinsArray.splice(g, 1);
		}
		if (goldenCoinsArray[g] && goldenCoinsArray[g].distance < goldenCoinsArray[g].radius + player.radius) {
			console.log('Taxes cleared!');
			if (!goldenCoinsArray[g].hit) {
				pointSound.play();
				goldenCoinsArray[g].hit = true;
				goldenCoinsArray.splice(g, 1);
				taxArray = [];
			}
		}
	}
}

let taxArray = [];
class Tax {
	constructor() {
		this.x = canvas.width;
		this.y = canvas.height * Math.random(); // spawn mid?
		this.radius = 45;
		this.speed = Math.random() * 2 + 1;
		this.distance;
		this.hit;
	}
	update() {
		this.x -= this.speed;
		const dx = this.x - player.x;
		const dy = this.y - player.y;
		this.distance = Math.sqrt(dx * dx + dy * dy); // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
	}
	draw() {
		ctx.fillStyle = 'red';
		ctx.lineWidth = 10;
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
		ctx.stroke();
		ctx.fillStyle = 'black';
		ctx.font = 'bold 50px Roboto';
		ctx.fillText('Tax', this.x - 40, this.y + 15);
	}
}

function taxHandler() {
	if (level === 2) {
		if (frame % 150 === 0) {
		//run code every 150 frames
		taxArray.push(new Tax());
		console.log(taxArray.length);
		}
	}
	if (level === 3) {
		if (frame % 100 === 0) {
		//run code every 100 frames
		taxArray.push(new Tax());
		console.log(taxArray.length);
		}
	}
	if (level === 4) {
		if (frame % 50 === 0) {
		//run code every 50 frames
		taxArray.push(new Tax());
		console.log(taxArray.length);
		}
	}
	if (level === 5) {
		if (frame % 25 === 0) {
		//run code every 25 frames
		taxArray.push(new Tax());
		console.log(taxArray.length);
		}
	}
	if (level === 6) {
		if (frame % 20 === 0) {
		//run code every 20 frames
		taxArray.push(new Tax());
		console.log(taxArray.length);
		}
	}
	if (level === 7) {
		if (frame % 15 === 0) {
		//run code every 15 frames
		taxArray.push(new Tax());
		console.log(taxArray.length);
		}
	}
	// for (let i = 0; i < taxArray.length; i++) {
	for (let t = taxArray.length - 1; t >= 0; t--) {
		taxArray[t].update();
		taxArray[t].draw();
		if (taxArray[t].x < 0) {
			// if Coin is outside canvas
			taxArray.splice(t, 1); // then remove Tax
		}
		if (taxArray[t].distance < taxArray[t].radius + player.radius) {
			console.log('Coin Deducted');
			if (!taxArray[t].hit) {
				deductSound.play();
				score = score -5;
				taxArray[t].hit = true;
				taxArray.splice(t, 1);
			}
		}
	}
}

const background = new Image();

function levelHandler() {

	if (score < 0 && lifePoints > 0) {
		background.src = 'assets/img/background1.png';
		ctx.fillStyle = "red";
		ctx.font = 'bold 75px Roboto';
		ctx.fillText('You died and lost a life point!', 500, 500);
		ctx.font = 'bold 50px Roboto';
		ctx.fillText('Press P to unpause and continue', 600, 400);
		lifePoints--;
		togglePause();
		score = 0;

	}

	if (score < 0 && lifePoints < 1) {
		background.src = 'assets/img/background1.png';
		ctx.fillStyle = "red";
		ctx.font = 'bold 120px Roboto';
		ctx.fillText('You lost!', 500, 500);
		togglePause();

	}

	if (score < 5) {
		if (background.src !== 'assets/img/background1.jpg') {
		background.src = 'assets/img/background1.png';
		}
		// console.log('Level 1!');
		level = 1;
	}
	if (score > 10) {
		if (background.src !== 'assets/img/background2.jpg') {
		background.src = 'assets/img/background2.png';
		}
		level = 2;
		// console.log('Level 2!');
	}

	if (score > 20) {
		if (background.src !== 'assets/img/background3.jpg') {
		background.src = 'assets/img/background3.png';
		}
		level = 3;
		// console.log('Level 3!');
	}

	if (score > 30) {
		if (background.src !== 'assets/img/background4.jpg') {
		background.src = 'assets/img/background4.jpg';
		}
		level = 4;
		// console.log('Level 4!');
	}

	if (score > 40) {
		if (background.src !== 'assets/img/background5.jpg') {
		background.src = 'assets/img/background5.jpg';
		}
		level = 5;
		// console.log('Level 5!');
	}

	if (score > 50) {
		if (background.src !== 'assets/img/background6.jpg') {
		background.src = 'assets/img/background6.jpg';
		}	
		level = 6;
		// console.log('Level 6!');
	}

	if (score > 60) {
		if (background.src !== 'assets/img/background7.png') {
			background.src = 'assets/img/background7.png';
		}
		level = 7;
		// console.log('Level 7!');
	}
}

function checkHighScore() {
	if (score > localStorage.getItem('gameHighScore')) {
		localStorage.setItem('gameHighScore', score);
		highScore = score;
	}
}

window.addEventListener('keydown', function (e) {
	const key = e.keyCode;
	if (key === 67) {
		// c key
		localStorage.setItem('gameHighScore', 0);
		highScore = 0;
	}
});


function togglePause() {
	if (!paused) {
		paused = true;
	} else if (paused) {
		paused = false;
	}
}

window.addEventListener('keydown', function (e) {
	const key = e.keyCode;
	if (key === 80) {
		// p key
		togglePause();
	}
});

// animate loop
function animate() {
	if (!paused) { // only draw etc when togglePause is not active
		ctx.clearRect(0, 0, canvas.width, canvas.height); // clearRect on each frame
		ctx.drawImage(background, 10, 0, canvas.width, canvas.height); // draw background as the first thing (the background changes depending on level)
		checkHighScore(); // HighScore handler that uses LocalStorage
		levelHandler(); // levelHandler that changes the background and level values depending on score
		coinHandler(); // coinHandler that spawns coins etc
		taxHandler(); // taxHandler that spawns taxes etc
		goldenCoinHandler(); // goldenCoinHandler that spawns golden coins etc
		player.update(); 
		player.draw();
		if (level === 4 || level === 5 || level === 7) { // certain levels require white text cause of their dark background
			ctx.fillStyle = 'white';
		}
		if (level !== 4 && level !==5 && level !== 7) { // rest of the levels require black text cause of their light background
		ctx.fillStyle = 'black';
		}
		ctx.font = 'bold 60px Roboto'; // we change font several places, so lets make sure the font size is right here
		ctx.fillText('Coins: ' + score, 25, 60);
		ctx.fillText('HighScore: ' + highScore, 25, 120);
		ctx.fillText('Rocket Miner', canvas.width / 2 - 175, 60);
		ctx.fillText('Level: ' + level, canvas.width - 225, 60);
		ctx.fillText('Life Points: ' + lifePoints, canvas.width - 350, canvas.height - 25);
		ctx.font = ctx.font = 'bold 30px Roboto';
		ctx.fillText('Press C to clear HighScore', 50, canvas.height - 25);
		ctx.fillText('Press P to pause/unpause', 50, canvas.height - 60);
		frame++;
	}
	requestAnimationFrame(animate);
}

// run :)
animate();
