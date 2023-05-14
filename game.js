// Get a reference to the canvas
let canvas = document.querySelector('canvas');

// Get a 2D drawing context
let ctx = canvas.getContext('2d');

// Set the canvas size to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define the ghost
let ghost = {
    x: 100,
    y: 500,
    dx: 0,
    dy: 0,
    width: 50,
    height: 50,
    speed: 5,
    gravity: 0.5,
    jumpForce: 10,
    jumping: false,
    jumpCount: 0
};

// Define the coin
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.counted = false;
    }

    draw() {
        if (!this.collected) {
            ctx.drawImage(coinImage, frameIndex * coinImage.width / 5, 0, coinImage.width / 5, coinImage.height, this.x, this.y, this.width, this.height);
        }
    }
}

// Create an array to hold the coins
let coins = [];

// Define the platform
class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 10;
    }

    draw() {
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Create an array to hold the platforms
let platforms = [];

// Function to generate coins and platforms at random positions
function generateCoinsAndPlatforms() {
    for (let i = 0; i < 13; i++) {
        let x = Math.random() * (canvas.width - 60);
        let y = Math.random() * (canvas.height - 60);
        let platform = new Platform(x, y, 60);
        let coin = new Coin(platform.x + platform.width / 2 - 10, platform.y - 20);
        coins.push(coin);
        platforms.push(platform);
    }
}

// Function to update the coins
function updateCoins() {
    for (let coin of coins) {
        coin.draw();

        // Check if the ghost has collected the coin
        if (ghost.x < coin.x + coin.width &&
            ghost.x + ghost.width > coin.x &&
            ghost.y < coin.y + coin.height &&
            ghost.y + ghost.height > coin.y) {
            coin.collected = true;

            // Increment the score
            if (!coin.counted) {
                score++;
                coin.counted = true; // Prevent the score from incrementing more than once per coin
                coinSound.play(); // Play coin sound
            }
        }
    }
}

// Function to update the platforms
function updatePlatforms() {
    for (let platform of platforms) {
        platform.draw();
    }
}

// Define the star
class Star {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Create an array to hold the stars
let stars = [];

// Function to generate stars at random positions
function generateStars() {
    for (let i = 0; i < 200;
    i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * (canvas.height / 2);
        let size = Math.random() * 3;
        let star = new Star(x, y, size);
        stars.push(star);
    }
}

// Function to draw stars
function drawStars() {
    for (let star of stars) {
        star.draw();
    }
}

// Define the score counter
let score = 0;

// Function to draw the score
function drawScore() {
    ctx.font = '30px Courier';
    ctx.fillStyle = 'white';
    ctx.fillText(score, 10, 50);
}

// Function to draw game completion text
function drawCompletionText() {
    if (score === 13) {
        ctx.font = '40px Courier';
        ctx.fillStyle = 'white';
        ctx.fillText("You collected 13 coins. Spooky!", canvas.width / 2 - 200, canvas.height / 2 - 50);
        ctx.fillText("↻", canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Function to draw the ghost
function drawGhost() {
    ctx.fillStyle = 'white';
    ctx.fillRect(ghost.x, ghost.y, ghost.width, ghost.height);
}

// Function to make the ghost jump
function jump() {
    if (ghost.jumpCount < 2) {
        ghost.dy = -ghost.jumpForce;
        ghost.jumping = true;
        ghost.jumpCount++;
    }
}

// Add event listener for keydown
window.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        jump();
    } else if (e.code === 'ArrowRight') {
        ghost.dx = ghost.speed;
    } else if (e.code === 'ArrowLeft') {
        ghost.dx = -ghost.speed;
    }
});

// Add event listener for keyup
window.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        ghost.dx = 0;
    }
});

// Add event listener for mouse clicks
window.addEventListener('click', function(e) {
    if (score === 13 &&
        e.clientX > canvas.width / 2 - 20 &&
        e.clientX < canvas.width / 2 + 20 &&
        e.clientY > canvas.height / 2 &&
        e.clientY < canvas.height / 2 + 100) {
        // Restart the game
        score = 0;
        coins = [];
        platforms = [];
        generateCoinsAndPlatforms();
    }
});

// Function to update the game state
function update() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the stars
    drawStars();

    // Draw the score
    drawScore();

    // Draw game completion text
    drawCompletionText();

    // Update the ghost's position
    ghost.x += ghost.dx;
    ghost.y += ghost.dy;

    // Make the ghost bounce off the sides
    if (ghost.x < 0 || ghost.x + ghost.width > canvas.width) {
        ghost.dx *= -1;
        ghost.dy = -ghost.jumpForce * 1.5; // Higher jump force
    }

    // Apply gravity
    if (ghost.y + ghost.height < canvas.height) {
        let onPlatform = false;
        for (let platform of platforms) {
            if (ghost.x + ghost.width > platform.x &&
                ghost.x < platform.x + platform.width &&
                ghost.y + ghost.height > platform.y &&
                ghost.y + ghost.height < platform.y + platform.height) {
                onPlatform = true;
                ghost.jumpCount = 0;
            }
        }
        if (!onPlatform) {
            ghost.dy += ghost.gravity;
            ghost.jumping = false;
        } else {
            ghost.dy = 0;
        }
    } else {
        // Ground
        ghost.y = canvas.height - ghost.height;
        ghost.dy = 0;
        ghost.jumpCount = 0;
    }

    // Update the coins
    updateCoins();

    // Update the platforms
    updatePlatforms();

    // Draw the ghost
    drawGhost();

    // End game if all coins collected
    if (score === 13 && !gotItPlayed) {
        gotItSound.play();
        gotItPlayed = true;
        setTimeout(() => {
            dekuSound.play();
        }, 1000);
    }
}

// Define the coin image
let coinImage = new Image();
coinImage.src = 'coinsprite.png';

// Coin animation
let frameIndex = 0;
setInterval(() => {
    frameIndex = (frameIndex + 1) % 5;
}, 80); // Speed up animation by 15%

// Define the coin sound
let coinSound = new Audio();
coinSound.src = 'coin.mp3';

// Define the gotIt sound
let gotItSound = new Audio();
gotItSound.src = 'gotit.mp3';
let gotItPlayed = false;

// Define the deku sound
let dekuSound = new Audio();
dekuSound.src = 'deku.mp3';

// Generate the coins and platforms
generateCoinsAndPlatforms();

// Generate the stars
generateStars();

// Start the game loop
setInterval(update, 20);
        
