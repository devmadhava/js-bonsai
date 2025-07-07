const canvases = document.querySelectorAll(".js-bonsai");
const hiddenDom = document.createElement("div");

class JsBonsai {
    // ctx;
    // baseType;
    // // Color
    // potColor;
    // leavesColor;
    // deadLeavesColor;
    // branchColor;
    // // Expansion
    // multiplier;
    // life;
    // startingLife;
    // // Sizes
    // CELL_SIZE;
    // MAX_BRANCHES;
    // // Darken Colors;
    // darkLeavesColor;
    // darkDeadLeavesColor;
    // darkBranchColor;
    // // Mode
    // repeat;
    // repeatMode;
    // loop;
    // sleepDuration;

    constructor(canvas) {
        this.canvas = canvas;
        this.branchType = ['trunk', 'shootleft', 'shootright', 'dying', 'dead'];
        // this.MAX_BRANCHES = 500;

        Object.assign(this, this.#getDefaultCanvasValues());
        this.#setDarkColor();
        
        // Cols and Rows
        this.cols = Math.floor(this.width / this.CELL_SIZE);
        this.rows = Math.floor(this.height / this.CELL_SIZE);
        
        // Max and max size
        this.maxX = this.cols;
        this.maxY = this.rows;

        // Center Values
        this.centerX = Math.floor(this.cols / 2);
        this.centerY = Math.floor(this.rows / 2);

        // Pointer
        this.pointerX = this.centerX;
        this.pointerY = this.maxY - 1;
    }

    #getDefaultCanvasValues() {
        const ctx               = this.canvas.getContext("2d");
        const computedStyles    = getComputedStyle(this.canvas);

        const width             = parseInt(computedStyles.width);
        const height            = parseInt(computedStyles.height);
        this.canvas.width       = width;
        this.canvas.height      = height;

        const baseType          = this.canvas.getAttribute("data-base-type") || "1";
        const potColor          = this.canvas.getAttribute("data-pot-color") || "grey";

        const leavesColor       = this.canvas.getAttribute("data-leaves-color") || "#5cbd9b";
        const deadLeavesColor   = this.canvas.getAttribute("data-dead-leaves-color") || "#e26554";
        const branchColor       = this.canvas.getAttribute("data-branch-color") || "#7c5c5c";
        
        const dataRepeat        = this.canvas.getAttribute("data-repeat");
        const repeat            = dataRepeat === "true" || dataRepeat === "" ? true : false;
        const repeatMode        = this.canvas.getAttribute("data-repeat-mode");
        
        const dataLoop          = this.canvas.getAttribute("data-loop");
        const loop              = dataLoop === "true" || dataLoop === "" ? true : false;

        const dataSpeed         = parseInt(this.canvas.getAttribute("data-speed")) || 7;
        const sleepDuration     = 150 - ((dataSpeed - 1) * (130 / 9)); // maps 1–10 to 150–20

        let life                = parseInt(this.canvas.getAttribute("data-life")) || 24;
        // life                    = (life > 0 && life < 36) ? life : 24;
        // let startingLife        = parseInt(this.canvas.getAttribute("data-life")) || 24;
        let startingLife        = life;
        let multiplier          = parseInt(this.canvas.getAttribute("data-multiplier")) || 3;
        multiplier              = (multiplier > 0 && multiplier < 5) ? multiplier : 5;
        let CELL_SIZE           = parseInt(this.canvas.getAttribute("data-size")) || 8;
        let MAX_BRANCHES        = 500;

        return {
            ctx,
            baseType,
            width,
            height,
            // Colors
            potColor,
            leavesColor,
            deadLeavesColor,
            branchColor,
            // Size and Expansion
            life,
            startingLife,
            multiplier,
            CELL_SIZE,
            MAX_BRANCHES,
            // Modes and user inputs
            repeat,
            repeatMode,
            loop,
            sleepDuration
        };
    }
    
    #resetCoords () {
        // Cols and Rows
        this.cols = Math.floor(this.width / this.CELL_SIZE);
        this.rows = Math.floor(this.height / this.CELL_SIZE);
        
        // Max and max size
        this.maxX = this.cols;
        this.maxY = this.rows;

        // Center Values
        this.centerX = Math.floor(this.cols / 2);
        this.centerY = Math.floor(this.rows / 2);

        // Pointer
        this.pointerX = this.centerX;
        this.pointerY = this.maxY - 1;
    }

    #drawBase () {
        this.ctx.font = `${this.CELL_SIZE}px monospace`;
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = this.potColor;
        
        let lines;
        if (this.baseType === "2") {
            lines = [
                ":________./~~~\\.________:", 
                " \\                     / ", 
                "  \\___________________/ ", 
                "  (_)               (_)"
            ];
        } else {
            lines = [
                "(---./~~~\\.---)",
                " (           ) ",
                "  (_________)  "
            ];
        }

        const startRow = this.rows - lines.length;
        const startCol = Math.floor((this.cols - lines[0].length) / 2);

        lines.forEach((line, rowOffset) => {
            for (let col = 0; col < line.length; col++) {
                const char = line[col];

                if (rowOffset === 0) {
                    if (char === '/' || char === '\\' || char === '~' || char === '.') {
                        this.ctx.fillStyle = this.branchColor;

                    } else if (char === '_' || char === '-' || char === '.') {
                        this.ctx.fillStyle = this.leavesColor;
                        
                    } else {
                        this.ctx.fillStyle = this.potColor;
                    }
                } else {
                    this.ctx.fillStyle = this.potColor;
                }


                this.ctx.fillText(
                    char,
                    (startCol + col) * this.CELL_SIZE,
                    (startRow + rowOffset) * this.CELL_SIZE
                );
            }
        });

        // Move pointerY to just above the base
        this.pointerX = this.centerX - 2;
        // This is the new max
        // The tree cant be below this
        this.pointerY = this.maxY - (lines.length);
        this.maxY = this.pointerY;
    }

    #getColorData(string) {
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

    #darkenColor(string, percent) {
        const rgba = this.#getColorData(string);

        const r =  Math.max(0, Math.min(255, Math.floor(rgba.r * (1 - percent))));
        const g =  Math.max(0, Math.min(255, Math.floor(rgba.g * (1 - percent))));
        const b =  Math.max(0, Math.min(255, Math.floor(rgba.b * (1 - percent))));

        if (rgba.a !== 1) {
            return `rgba(${r}, ${g}, ${b}, ${rgba.a})`;
        }

        return `rgb(${r}, ${g}, ${b})`;
    }

    #setDarkColor() {
        this.darkLeavesColor = this.#darkenColor(this.leavesColor, 0.15);
        this.darkDeadLeavesColor = this.#darkenColor(this.darkDeadLeavesColor, 0.2);
        this.darkBranchColor = this.#darkenColor(this.branchColor, 0.3);
    }

    #roll(mod) {
        return Math.floor(Math.random() * mod); // returns 0 to mod - 1
    }

    #sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    #rand(n) {
        return Math.floor(Math.random() * n);
    }

    #chooseBranchColor (branchType, life, colors ) {
        if (life < 4) branchType = 'dying';

        switch (branchType) {
            case 'trunk':
            case 'shootLeft':
            case 'shootRight':
                return Math.random() < 0.7 ? this.branchColor : this.darkBranchColor;
            case 'dying':
                return Math.random() < 0.5 ? this.leavesColor : this.darkLeavesColor;
            case 'dead':
                return Math.random() < 0.1 ? this.deadLeavesColor : this.darkDeadLeavesColor;
            default:
                return this.branchColor;
        }
    };

    #setDelta(type, life, age, multiplier) {
        let dx = 0;
        let dy = 0;
        let dice;

        switch (type) {
            case 'trunk':
                if (age <= 2 || life < 4) {
                    dy = 0;
                    dx = this.#roll(3) - 1; // -1, 0, 1
                } else if (age < multiplier * 3) {
                    if (age % Math.floor(multiplier * 0.5) === 0) dy = -1;    
                    else dy = 0;
                
                    dice = this.#roll(10);
                    if (dice === 0) dx = -2;
                    else if (dice >= 1 && dice <= 3) dx = -1;
                    else if (dice >= 4 && dice <= 5) dx = 0;
                    else if (dice >= 6 && dice <= 8) dx = 1;
                    else dx = 2;
                
                } else {
                    dice = this.#roll(10);
                    dy = dice > 2 ? -1 : 0;
                    dx = this.#roll(3) - 1;
                }

            break;
        
            case 'shootleft':
                dice = this.#roll(10);
                if (dice <= 1) dy = -1;
                else if (dice <= 7) dy = 0;
                else dy = 1;
        
                dice = this.#roll(10);
                if (dice <= 1) dx = -2;
                else if (dice <= 5) dx = -1;
                else if (dice <= 8) dx = 0;
                else dx = 1;
                break;
        
            case 'shootright':
                dice = this.#roll(10);
                if (dice <= 1) dy = -1;
                else if (dice <= 7) dy = 0;
                else dy = 1;
                
                dice = this.#roll(10);
                if (dice <= 1) dx = 2;
                else if (dice <= 5) dx = 1;
                else if (dice <= 8) dx = 0;
                else dx = -1;
                break;
                
            case 'dying':
                dice = this.#roll(10);
                if (dice <= 1) dy = -1;
                else if (dice <= 8) dy = 0;
                else dy = 1;
                
                dice = this.#roll(15);
                if (dice === 0) dx = -3;
                else if (dice <= 2) dx = -2;
                else if (dice <= 5) dx = -1;
                else if (dice <= 8) dx = 0;
                else if (dice <= 11) dx = 1;
                else if (dice <= 13) dx = 2;
                else dx = 3;
                break;
        
            case 'dead':
                dice = this.#roll(10);
                if (dice <= 2) dy = -1;
                else if (dice <= 6) dy = 0;
                else dy = 1;
                dx = this.#roll(3) - 1; // -1, 0, 1
                break;
        }

        return { dx, dy };
    }

    #chooseString (type, life, dx, dy, leaves = ['&']) {
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

    async #branch (
        type, 
        life = this.startingLife, 
        x = this.pointerX, 
        y = this.pointerY, 
        startingLife = this.startingLife, 
        bounds,
        counter,
    ) {
        if (counter.branch >= this.MAX_BRANCHES || life <= 0) return;
        counter.branch++;
            
        let dx = 0;
        let dy = 0;
        let age = 0;
        let shootCooldown = this.multiplier * 2;

        while (life > 0) {
            life--;
            age = startingLife - life;

            ({dx, dy} = this.#setDelta(type, life, age, this.multiplier));

            // DY ad DX should not be close to ground;
            if (dy > 0 && y > (this.maxY - 2)) dy--;

            if (life < 3) await this.#branch('dead', life, x , y, life, bounds, counter);

            // dying trunk or shoot
            else if ((type === 'trunk' || type === 'shootleft' || type === 'shootright') && life < (this.multiplier + 2)) {
                await this.#branch('dying', life, x, y, life, bounds, counter);
            }
                
            // dying trunk should branch into a lot of leaves
            // trunks should re-branch if not close to ground AND either randomly, or upon every <multiplier> steps
            else if (type === 'trunk' && (this.#rand(3) === 0 || (life % this.multiplier === 0))) {
                if (this.#rand(8) === 0 && life > 7) {
                    shootCooldown = this.multiplier * 2;
                    const newLife = life + this.#rand(5) - 2;
                    await this.#branch('trunk', newLife, x, y, newLife, bounds, counter);
                
                } else if (shootCooldown <= 0) {
                    shootCooldown = this.multiplier * 2;
                    const shootLife = life + this.multiplier;
                    counter.shoots++;
                    counter.shootCounter++;
                    const shootType = this.branchType[(counter.shootCounter % 2) + 1];
                    await this.#branch(shootType, shootLife, x, y, shootLife, bounds, counter);
                }
            }

            shootCooldown--;

            x += dx;
            y += dy;

            // CLAMPING
            if (x < bounds.originX - bounds.maxX) x = bounds.originX - bounds.maxX;
            else if (x > bounds.originX + bounds.maxX) x = bounds.originX + bounds.maxX;
            if (y < 0) y = 0;
            else if (y > bounds.maxY) y = bounds.maxY;

            const CELL_SIZE = this.CELL_SIZE;
            const color = this.#chooseBranchColor(type, life);

            this.ctx.font = `${CELL_SIZE}px monospace`;
            this.ctx.fillStyle = color;
            this.ctx.textBaseline = 'top';
            this.ctx.textAlign = 'left';

            const str = this.#chooseString(type, life, dx, dy, ['&']);

            this.ctx.clearRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE * str.length, CELL_SIZE);
            this.ctx.fillText(str, x * CELL_SIZE, y * CELL_SIZE);

            await this.#sleep(this.sleepDuration);
        }
    }

    #getTreeUnitSize () {
        const lines = this.baseType === "2"
            ? [":________./~~~\\.________:"]
            : ["(---./~~~\\.---)"];
        
        const baseWidth = lines[0].length; // max width of base = first line
        return baseWidth + 12; // add 2-cell padding each side
    }

    #calculateGridLayout() {
        const unitMinSize = this.#getTreeUnitSize();

        const cols = Math.floor(this.cols / unitMinSize);
        const rows = Math.floor(this.rows / unitMinSize);

        const extraX = this.cols - (cols * unitMinSize);
        const extraY = this.rows - (rows * unitMinSize);

        const gapX = extraX / (cols + 1);
        const gapY = extraY / (rows + 1);

        return { cols, rows, unitMinSize, gapX, gapY };
    }

    #drawBaseInGrid (gridX, gridY, unitSize) {
        this.ctx.font = `${this.CELL_SIZE}px monospace`;
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = 'left';

        let lines;
        if (this.baseType === "2") {
            lines = [
                ":________./~~~\\.________:", 
                " \\                     / ", 
                "  \\___________________/ ", 
                "  (_)               (_)"
            ];
        } else {
            lines = [
                "(---./~~~\\.---)",
                " (           ) ",
                "  (_________)  "
            ];
        }

        const baseWidth = lines[0].length;
        const paddingX = Math.floor((unitSize - baseWidth) / 2);

        const startCol = gridX * unitSize + 2; // 2-cell padding
        const startRow = (gridY + 1) * unitSize - lines.length; // draw from bottom

        lines.forEach((line, rowOffset) => {
            for (let col = 0; col < line.length; col++) {
                const char = line[col];

                if (rowOffset === 0) {
                    if ('/\\~.'.includes(char)) {
                        this.ctx.fillStyle = this.branchColor;
                    } else if ('_-'.includes(char)) {
                        this.ctx.fillStyle = this.leavesColor;
                    } else {
                        this.ctx.fillStyle = this.potColor;
                    }
                } else {
                    this.ctx.fillStyle = this.potColor;
                }

                this.ctx.fillText(
                    char,
                    (startCol + col) * this.CELL_SIZE,
                    (startRow + rowOffset) * this.CELL_SIZE
                );
            }
        });

        // Update pointer for branching
        this.pointerX = startCol + Math.floor(baseWidth / 2);
        // this.pointerX = gridX * unitSize + Math.floor(unitSize / 2);
        this.pointerY = startRow - 1;
        this.maxY = this.pointerY;
    }

    async #generateSubTree(gridX, gridY, unitSize) {
        // Generate Base Grid
        this.#drawBaseInGrid(gridX, gridY, unitSize);

        // Create Grid Specific Bounds
        const bounds = {
            originX: gridX * unitSize + Math.floor(unitSize / 2),
            maxX: Math.floor(unitSize / 2),  // allow horizontal growth half unit size left and right
            maxY: this.pointerY  // vertical max is the top line before base
        };
        const counter = { branch: 0, shoots: 0, shootCounter: 0};

        // Make Branch
        await this.#branch('trunk', this.startingLife, this.pointerX, this.pointerY, this.startingLife, bounds, counter);
    }

    async generateTree () {
        // Draw up the base
        this.#drawBase();

        // Create Grid Specific Bounds and Counter
        const bounds = { originX: 0, maxX: this.maxX, maxY: this.maxY};
        const counter = { branch: 0, shoots: 0, shootCounter: 0};

        // Generate branch
        await this.#branch('trunk', this.startingLife, this.pointerX, this.pointerY, this.startingLife, bounds, counter);
    }

    async generateForestConcurrently () {
        const { cols, rows, unitMinSize, gapX, gapY } = this.#calculateGridLayout();
        const promises = [];

        for (let gy = 0; gy < rows; gy++) {
            for (let gx = 0; gx < cols; gx++) {
                const tree = this.#generateSubTree(gx, gy, unitMinSize, gapX, gapY);
                promises.push(tree);
            }
        }

        await Promise.all(promises);
    }
    
    async generateForestInSequence () {
        const { cols, rows, unitMinSize, gapX, gapY } = this.#calculateGridLayout();
        for (let gy = 0; gy < rows; gy++) {
            for (let gx = 0; gx < cols; gx++) {
                await this.#generateSubTree(gx, gy, unitMinSize, gapX, gapY);
            }
        }
    }

    async #generate() {
        const generateFunc = this.repeat 
            ? (this.repeatMode === 'sequence' ?  this.generateForestInSequence.bind(this) : this.generateForestConcurrently.bind(this)) 
            : this.generateTree.bind(this);
            
        if (this.loop) {
            while (this.loop) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.#resetCoords();
                await generateFunc();
                await this.#sleep(2000);
            }
        } else {
            await generateFunc();
        }
    }

    start () {
        this.#generate();
    }
}

canvases.forEach((canvas) => {
    const jsBonsai = new JsBonsai(canvas);
    jsBonsai.start();
});
