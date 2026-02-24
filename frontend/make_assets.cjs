const fs = require('fs');

const createPNG = (filename, width, height, r, g, b, a) => {
    // This creates a valid uncompressed minimal RGBA tEXt PNG.
    // However, it's easier to just use canvas or a minimal 1x1 base64 string and scale it, but since we need an actual file the game engine can load...
    // Let's create a minimal 1x1 PNG and we can scale it later, or even better, we can write a tiny base64 encoded PNG for different colors.
    
    // Minimal 1x1 PNGs (base64)
    const pngs = {
        blue: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"), // 0,0,255
        red: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"), // 255,0,0
        green: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"), // 0,255,0
        yellow: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "base64") // 255,255,0
    };

    let data;
    if (r===0 && g===0 && b===255) data = pngs.blue;
    else if (r===255 && g===0 && b===0) data = pngs.red;
    else if (r===0 && g===255 && b===0) data = pngs.green;
    else data = pngs.yellow;

    fs.writeFileSync(filename, data);
};

// We will use 1x1 images, and in Phaser we can set their display size or scale if we want them bigger, 
// OR a better approach: we can use a small canvas script to generate actual 32x32 images.

const { createCanvas } = require('canvas');

function generateSprite(path, w, h, frames, r, g, b) {
    const canvas = createCanvas(w * frames, h);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    // Fill the whole spritesheet with color
    ctx.fillRect(0, 0, w * frames, h);
    
    // Add some "details" to make animations visible (e.g. eyes or borders)
    ctx.fillStyle = 'black';
    for(let i = 0; i < frames; i++) {
        // Outline frame
        ctx.strokeRect(i * w, 0, w, h);
        
        // Eyes
        ctx.fillRect(i * w + w*0.3, h*0.2, w*0.15, h*0.15); // Left eye
        ctx.fillRect(i * w + w*0.6, h*0.2, w*0.15, h*0.15); // Right eye
        
        // Animation modifier (move eyes slightly down on even frames)
        if (i % 2 === 1) {
            ctx.fillStyle = 'white';
            ctx.fillRect(i * w + w*0.3, h*0.2, w*0.15, h*0.15); // Clear
            ctx.fillRect(i * w + w*0.6, h*0.2, w*0.15, h*0.15); // Clear
            ctx.fillStyle = 'black';
            ctx.fillRect(i * w + w*0.3, h*0.25, w*0.15, h*0.15); // Left eye down
            ctx.fillRect(i * w + w*0.6, h*0.25, w*0.15, h*0.15); // Right eye down
        }
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path, buffer);
    console.log(`Created ${path}`);
}

try {
    generateSprite('src/assets/sprites/player.png', 32, 32, 4, 100, 150, 255); // Blue-ish player (4 frames)
    generateSprite('src/assets/sprites/npc.png', 32, 32, 4, 255, 150, 100); // Orange-ish npc (4 frames)
    generateSprite('src/assets/sprites/trash.png', 16, 16, 1, 255, 50, 50); // Red trash (1 frame)
    generateSprite('src/assets/sprites/bin.png', 32, 32, 1, 50, 200, 50); // Green bin (1 frame)
} catch (e) {
    console.error("Canvas module might not be installed. Falling back to simple base64 1x1 pngs...");
    createPNG('src/assets/sprites/player.png', 32, 32, 0, 0, 255, 255);
    createPNG('src/assets/sprites/npc.png', 32, 32, 255, 255, 0, 255);
    createPNG('src/assets/sprites/trash.png', 16, 16, 255, 0, 0, 255);
    createPNG('src/assets/sprites/bin.png', 32, 32, 0, 255, 0, 255);
}
