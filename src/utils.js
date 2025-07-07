const hiddenDom = document.createElement("div");

export const branchType = ['trunk', 'shootleft', 'shootright', 'dying', 'dead'];

export function getColorData(string) {
    hiddenDom.style.color = string;
    hiddenDom.style.display = "none"; // keep hidden
    document.body.appendChild(hiddenDom);

    const computedColor = getComputedStyle(hiddenDom).color;
    document.body.removeChild(hiddenDom);
    
    // Parse rgb or rgba from computedColor string
    const rgbaMatch = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!rgbaMatch) {
        return null;
    }
    
    return {
        r: parseInt(rgbaMatch[1], 10),
        g: parseInt(rgbaMatch[2], 10),
        b: parseInt(rgbaMatch[3], 10),
        a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
}

export function darkenColor(string, percent) {
    const rgba = getColorData(string);

    const r =  Math.max(0, Math.min(255, Math.floor(rgba.r * (1 - percent))));
    const g =  Math.max(0, Math.min(255, Math.floor(rgba.g * (1 - percent))));
    const b =  Math.max(0, Math.min(255, Math.floor(rgba.b * (1 - percent))));

    if (rgba.a !== 1) {
        return `rgba(${r}, ${g}, ${b}, ${rgba.a})`;
    }

    return `rgb(${r}, ${g}, ${b})`;
}

export function roll(mod) {
    return Math.floor(Math.random() * mod); // returns 0 to mod - 1
}

export function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function rand(n) {
    return Math.floor(Math.random() * n);
}

export function chooseBranchColor (branchType, life, colors ) {
    if (life < 4) branchType = 'dying';

    switch (branchType) {
        case 'trunk':
        case 'shootLeft':
        case 'shootRight':
            return Math.random() < 0.7 ? colors.branchColor : darkenColor(colors.branchColor, 0.25);
        case 'dying':
            return Math.random() < 0.5 ? colors.leavesColor : darkenColor(colors.leavesColor, 0.2);
        case 'dead':
            return Math.random() < 0.1 ? colors.deadLeavesColor : darkenColor(colors.deadLeavesColor, 0.15);
        default:
            return colors.branchColor;
    }
};

export function setDelta(type, life, age, multiplier) {
    let dx = 0;
    let dy = 0;
    let dice;

    switch (type) {
        case 'trunk':
            if (age <= 2 || life < 4) {
                dy = 0;
                dx = roll(3) - 1;
            } else if (age < multiplier * 3) {
                if (age % Math.floor(multiplier * 0.5) === 0) dy = -1;    
                else dy = 0;
            
                dice = roll(10);
                if (dice === 0) dx = -2;
                else if (dice >= 1 && dice <= 3) dx = -1;
                else if (dice >= 4 && dice <= 5) dx = 0;
                else if (dice >= 6 && dice <= 8) dx = 1;
                else if (dice === 9) dx = 2;
                // else dx = 2;
            
            } else {
                dice = roll(10);
                dy = dice > 2 ? -1 : 0;
                dx = roll(3) - 1;
            }

        break;
    
        case 'shootleft':
            dice = roll(10);
            if (dice <= 1) dy = -1;
            else if (dice <= 7) dy = 0;
            else dy = 1;
    
            dice = roll(10);
            if (dice <= 1) dx = -2;
            else if (dice <= 5) dx = -1;
            else if (dice <= 8) dx = 0;
            else dx = 1;
            break;
    
        case 'shootright':
            dice = roll(10);
            if (dice <= 1) dy = -1;
            else if (dice <= 7) dy = 0;
            else dy = 1;
            
            dice = roll(10);
            if (dice <= 1) dx = 2;
            else if (dice <= 5) dx = 1;
            else if (dice <= 8) dx = 0;
            else dx = -1;
            break;
            
        case 'dying':
            dice = roll(10);
            if (dice <= 1) dy = -1;
            else if (dice <= 8) dy = 0;
            else dy = 1;
            
            dice = roll(15);
            if (dice === 0) dx = -3;
            else if (dice <= 2) dx = -2;
            else if (dice <= 5) dx = -1;
            else if (dice <= 8) dx = 0;
            else if (dice <= 11) dx = 1;
            else if (dice <= 13) dx = 2;
            else dx = 3;
            break;
    
        case 'dead':
            dice = roll(10);
            if (dice <= 2) dy = -1;
            else if (dice <= 6) dy = 0;
            else dy = 1;
            dx = roll(3) - 1; // -1, 0, 1
            break;
    }

    return { dx, dy };
}

export function chooseString (type, life, dx, dy, leaves = ['&']) {
    let str = '?';
    if (life < 4) type = 'dying';
    
    switch (type) {
        case 'trunk':
            if (dy === 0) str = "/~";
            else if (dx < 0) str = "\\|";
            else if (dx === 0) str = "/|\\";
            else if (dx > 0) str = "|/";
            break;

        case 'shootleft':
            if (dy > 0) str = '\\';
            else if (dy === 0) str = '\\_';
            else if (dx < 0) str = '\\|';
            else if (dx === 0) str = '/|';
            else if (dx > 0) str = '/';
            break;

        case 'shootright':
            if (dy > 0) str = '/';
            else if (dy === 0) str = '_/';
            else if (dx < 0) str = '\\|';
            else if (dx === 0) str = '/|';
            else if (dx > 0) str = '/';
            break;

        case 'dying':
        case 'dead':
            if (leaves.length > 0) str = leaves[Math.floor(Math.random() * leaves.length)];
            else str = '&'; // fallback leaf
            break;
    }

    return str;
}

// Base Drawing
export function drawbase(ctx, bounds, base, colors) {
    ctx.font = `${bounds.CELL_SIZE}px monospace`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.potColor;
    
    let lines = base;

    const startRow = bounds.maxY - lines.length;
    const startCol = Math.floor((bounds.maxX - lines[0].length) / 2);

    lines.forEach((line, rowOffset) => {
        for (let col = 0; col < line.length; col++) {
            const char = line[col];

            if (rowOffset === 0) {
                if (char === '/' || char === '\\' || char === '~' || char === '.') {
                    ctx.fillStyle = colors.branchColor;

                } else if (char === '_' || char === '-' || char === '.') {
                    ctx.fillStyle = colors.leavesColor;
                    
                } else {
                    ctx.fillStyle = colors.potColor;
                }
            } else {
                ctx.fillStyle = colors.potColor;
            }

            ctx.fillText(
                char,
                bounds.offsetX + (startCol + col) * bounds.CELL_SIZE,
                bounds.offsetY + (startRow + rowOffset) * bounds.CELL_SIZE
            );
        }
    });

    // This is the new max
    // Move pointerY to just above the base
    // The tree cant be below this
    bounds.pointerX =  Math.floor(bounds.maxX / 2);
    bounds.pointerY = bounds.maxY - (lines.length + 1);
    bounds.maxY = bounds.pointerY;
}


// Branch Drawing
export async function branch (
    type, 
    life, 
    startingLife, 
    bounds,
    x, y,
    counter,
    multiplier,
    colors,
    sleepDuration
) {
    if (counter.branch >= bounds.MAX_BRANCHES || life <= 0) return;
    counter.branch++;
        
    let dx = 0;
    let dy = 0;
    let age = 0;
    let shootCooldown = multiplier * 2;

    while (life > 0) {
        life--;
        age = startingLife - life;

        ({dx, dy} = setDelta(type, life, age, multiplier));
        if (dy > 0 && y > (bounds.maxY - 2)) dy--;

        if (life < 3) await branch('dead', life, life, bounds, x, y, counter, multiplier, colors, sleepDuration);

        else if ((type === 'trunk' || type === 'shootleft' || type === 'shootright') && life < (multiplier + 2)) {
            await branch('dying', life, life, bounds, x, y, counter, multiplier, colors, sleepDuration);
        }

        else if (type === 'trunk' && (rand(3) === 0 || (life % multiplier === 0))) {
            if (rand(8) === 0 && life > 7) {
                shootCooldown = multiplier * 2;
                const newLife = life + rand(5) - 2;
                await branch('trunk', newLife, newLife, bounds, x, y, counter, multiplier, colors, sleepDuration)
                
            } else if (shootCooldown <= 0) {
                shootCooldown = multiplier * 2;
                const shootLife = life + multiplier;
                counter.shoots++;
                counter.shootCounter++;
                const shootType = branchType[(counter.shootCounter % 2) + 1];
                await branch(shootType, shootLife, shootLife, bounds, x, y, counter, multiplier, colors, sleepDuration)
            }
        }

        shootCooldown--;
        x += dx;
        y += dy;

        x = Math.min(x, bounds.maxX - 3);
        y = Math.min(y, bounds.maxY);

        const CELL_SIZE = bounds.CELL_SIZE;
        const color = chooseBranchColor(type, life, colors);
        const str = chooseString(type, life, dx, dy, ['&']);
        
        bounds.ctx.font = `${CELL_SIZE}px monospace`;
        bounds.ctx.fillStyle = color;
        bounds.ctx.textBaseline = 'top';
        bounds.ctx.textAlign = 'left';

        bounds.ctx.clearRect(
            x * bounds.CELL_SIZE + bounds.offsetX, 
            y * bounds.CELL_SIZE + bounds.offsetY,
            CELL_SIZE * str.length, 
            CELL_SIZE
        );

        bounds.ctx.fillText(
            str, 
            x * bounds.CELL_SIZE + bounds.offsetX, 
            y * bounds.CELL_SIZE + bounds.offsetY
        );

        await sleep(sleepDuration)  ;

    }
}
