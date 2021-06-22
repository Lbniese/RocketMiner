// -- initial setup stuff --
// target canvas element and save it in variable
const canvas = document.getElementById('canvas');
// getContext gives access to build canvas methods
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

let score = 0;
let frame = 0;
let level = 1;
let paused = false;

// font?
ctx.font = 'bold 60px Roboto';


const pointSound = new Howl({
    src: ['assets/sound/point.mp3'],
    volume: 0.1,
  });

// -- Mouse handling --

let canvasPos = canvas.getBoundingClientRect();

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    click: false,
}

canvas.addEventListener('mousedown', function(event){
    mouse.x = event.x - canvasPos.left;
    mouse.y = event.y - canvasPos.top;
});

canvas.addEventListener('mouseup', function(){
    mouse.click = false;
});

// player properties

const playerLeft = new Image(); //player when mouse click left
playerLeft.src = 'assets/img/jetpack_going_left.png';

const playerRight = new Image(); // player when mouse click right
playerRight.src = 'assets/img/jetpack_going_right.png';

class Player {
    constructor() {
        this.x = canvas.width / 2; // initial starting coordinates
        this.y = canvas.height / 2; // initial starting coordinates
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 3460 / 5;
        this.spriteHeight = 1797 / 3;
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;

        let theta = Math.atan2(dy, dx);
        this.angle = theta;

        if (mouse.x != this.x) {
            this.x -= dx / 30; // divide by 30 to slow down
        }
        if (mouse.y != this.y) {
            this.y -= dy / 30; // divide by 30 to slow down
        }
    }

    draw(){ // draw line from mouse position to player
            if (mouse.click) {
                ctx.lineWidth = 0,2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
            /*
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            ctx.fillRect(this.x, this.y, this.radius, 10);
            */
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            if (this.x >= mouse.x) {
                ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                    this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 70, this.spriteWidth/4, this.spriteHeight/4); //-60 and -70 to cover the ball with collission
            } else {
                ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                    this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 70, this.spriteWidth/4, this.spriteHeight/4); //-60 and -70 to cover the ball with collission
            }
            ctx.restore();
        }
}
// create blank player object
const player = new Player();

const coinsArray = [];
class Coin {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100; // spawn below bottom
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.speedUpdated = false;
        this.distance;
        this.hit;
        this.coinHeight = 618;
        this.coinWidth = 618;
    }
    update() {
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx * dx + dy * dy); // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    }
    /*
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(coin, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
    }
    */
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.lineWidth = 10;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.fillText('$', this.x - 15, this.y + 15);
    }

}

function handleCoins() {
    if (frame % 50 == 0) { //run code every 50 frames
            coinsArray.push(new Coin());
            console.log(coinsArray.length);
    }
    // for (let i = 0; i < coinsArray.length; i++) {
    for (let i = coinsArray.length - 1; i >= 0; i--) {
        coinsArray[i].update();
        coinsArray[i].draw();
        if (coinsArray[i] < 0) { // if Coin is outside canvas
            coinsArray.splice(i, 1); // then remove Coin
        }
        if (coinsArray[i].distance < coinsArray[i].radius + player.radius) {
            (console.log('collision'));
            if (!coinsArray[i].hit) {
                pointSound.play();
                score++;
                coinsArray[i].hit = true;
                coinsArray.splice(i, 1);
            }
        }
    }
}

const background = new Image();

function levelHandler() {
    if (score < 5) {
        background.src = 'assets/img/background1.png';
        // console.log('Level 1!');
    }
    if (score > 10 && level == 1) {
        background.src = 'assets/img/background2.png';
        level = 2;
        // console.log('Level 2!');
    }

    if (score > 20 && level == 2) {
        background.src = 'assets/img/background3.png';
        level = 3;
        // console.log('Level 3!');
    }

    if (score > 30 && level == 3) {
        background.src = 'assets/img/background4.jpg';
        level = 4;
        // console.log('Level 4!');
    }

    if (score > 40 && level == 4) {
        background.src = 'assets/img/background5.jpg';
        level = 5;
        // console.log('Level 4!');
    }

    if (score > 50 && level == 5) {
        background.src = 'assets/img/background6.jpg';
        level = 6;
        // console.log('Level 4!');
    }

}

function togglePause() {
    if (!paused) {
        paused = true; 
    } else if (paused) {
        paused = false;
    }
}

window.addEventListener('keydown', function (e) {
    var key = e.keyCode;
    if (key === 80)// p key
    {
        togglePause();
    }
    });

// animate loop
function animate() {
    if (!paused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 10, 0, canvas.width, canvas.height);
    levelHandler();
    handleCoins();
    player.update();
    player.draw();
    ctx.fillText('Score: ' + score, 25, 60);
    ctx.fillText('Rocket Miner', canvas.width / 2 - 175, 60);
    ctx.fillText('Level: ' + level, canvas.width - 225, 60);
    ctx.fillText('Press P for Pause', 25, canvas.height - 25);
    ctx.fillText('by Lukas', canvas.width - 275, canvas.height - 25);
    frame++;
    }
    requestAnimationFrame(animate);
    
}

// run :)
animate();