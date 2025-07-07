import {drawbase, darkenColor, branch, sleep} from "./utils.js";
const canvases = document.querySelectorAll("[data-bonsai]");

const BASE_TYPES = [
    [
        "(---./~~~\\.---)",
        " (           ) ",
        "  (_________)  "
    ],
    [
        ":________./~~~\\.________:", 
        " \\                     / ", 
        "  \\___________________/ ", 
        "  (_)               (_)"
    ]
];

class JsBonsai {
    constructor (canvas) {
        this.canvas             = canvas;
        this.ctx                = this.canvas.getContext("2d");
        this.CELL_SIZE          = parseInt(this.canvas.getAttribute("data-size")) || 12;

        this.getDimensions();
        // How many rows and cols are possible?
        // With Flooring
        // No Stretching
        this.cols               = Math.floor(this.canvas.width / this.CELL_SIZE);
        this.rows               = Math.floor(this.canvas.height / this.CELL_SIZE);

        // Calculate grid alignment and any offset
        this.alignX             = this.canvas.getAttribute("data-align").split(" ")[1] || "center";
        this.alignY             = this.canvas.getAttribute("data-align").split(" ")[0] || "center";

        this.offsetX            = this.calculateOffset('x', this.alignX);
        this.offsetY            = this.calculateOffset('y', this.alignY);

        // Bounds
        // In Pixels
        // Our Internal Canvas
        this.maxX               = this.offsetX + this.cols * this.CELL_SIZE;
        this.maxY               = this.offsetY + this.rows * this.CELL_SIZE;

        // Minimum Tree Grid Size
        this.treeGridSize       = BASE_TYPES[1][0].length;
        // Object Asign
        Object.assign(this, this.getUserInput());
    }

    // Get Canvas Dimensions
    getDimensions() {
        const computedStyles    = getComputedStyle(this.canvas);
        const width             = parseInt(computedStyles.width);
        const height            = parseInt(computedStyles.height);
        this.canvas.width       = width;
        this.canvas.height      = height;
    }

    getUserInput() {
        const dataBase          = parseInt(this.canvas.getAttribute("data-base-type")) || 1;
        const baseType          = dataBase <= 2 && dataBase > 0 ? dataBase - 1 : 0;

        const potColor          = this.canvas.getAttribute("data-pot-color") || "grey";
        const leavesColor       = this.canvas.getAttribute("data-leaves-color") || "#5cbd9b";
        const deadLeavesColor   = this.canvas.getAttribute("data-dead-leaves-color") || "#e26554";
        const branchColor       = this.canvas.getAttribute("data-branch-color") || "#7c5c5c";
        
        const dataRepeat        = this.canvas.getAttribute("data-repeat");
        const repeat            = dataRepeat === "true" || dataRepeat === "" ? true : false;
        
        const dataLoop          = this.canvas.getAttribute("data-loop");
        const loop              = dataLoop === "true" || dataLoop === "" ? true : false;

        const dataSpeed         = parseInt(this.canvas.getAttribute("data-speed")) || 7;
        const sleepDuration     = 150 - ((dataSpeed - 1) * (130 / 9)); // maps 1–10 to 150–20
        let life                = parseInt(this.canvas.getAttribute("data-life")) || 22;

        let startingLife        = life;
        let multiplier          = parseInt(this.canvas.getAttribute("data-multiplier")) || 5;
        let MAX_BRANCHES        = 500;

        return {multiplier, baseType, potColor, leavesColor, deadLeavesColor, branchColor, repeat, loop, sleepDuration, MAX_BRANCHES, life, startingLife}

    }

    // Valid Align top, left, center, bottom, right
    calculateOffset(axis, align) {
        const cells = axis === 'x' ? this.cols : this.rows;
        const canvasSize = axis === 'x' ? this.canvas.width : this.canvas.height;
        const totalGridSize = cells * this.CELL_SIZE;
        const spare = canvasSize - totalGridSize;

        switch (align) {
            case "left":
            case "top":
                return 0
            case "right":
            case "bottom":
                return spare;
            case "center":
            default:
                return Math.floor(spare / 2)
        }
    }

    getTreeGridOffset(gridCols, gridRows, align) {
        //  The offset represents the inside canvas or grid canvas start in PX
        let offsetX = this.offsetX;
        let offsetY = this.offsetY;

        const [verticalAlign, horizontalAlign] = align.split(" ");

        // Horizontal
        switch (horizontalAlign) {
            case "left":
                offsetX = this.offsetX;
                break;
            case "center":
                offsetX = this.offsetY + Math.floor((this.cols - gridCols) * this.CELL_SIZE / 2);
                break;
            case "right":
                offsetX = this.maxX - gridCols * this.CELL_SIZE;
                break;
            default:
                console.warn("Unknown horizontal align:", horizontalAlign);
        }

        
        // Vertical
        switch (verticalAlign) {
            case "top":
                offsetY = this.offsetX;
                break;
            case "center":
                offsetY = this.offsetY + Math.floor((this.rows - gridRows) * this.CELL_SIZE / 2);
                break;
            case "bottom":
                offsetY = this.maxY - gridRows * this.CELL_SIZE;
                break;
            default:
                console.warn("Unknown vertical align:", verticalAlign);
        }
        return { offsetX, offsetY, cols: gridCols, rows: gridRows };
    }

    drawTreeGrid () {
        const cols = this.treeGridSize;
        const rows = this.treeGridSize;
        
        const { offsetX, offsetY, cols: gridCols, rows: gridRows } = this.getTreeGridOffset(cols, rows, align);
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";

        // Draw rows
        for (let row = 0; row <= gridRows; row++) {
            const y = offsetY + row * this.CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, y);
            this.ctx.lineTo(offsetX + gridCols * this.CELL_SIZE, y);
            this.ctx.stroke();
        }
    
        // Draw cols
        for (let col = 0; col <= gridCols; col++) {
            const x = offsetX + col * this.CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(x, offsetY);
            this.ctx.lineTo(x, offsetY + gridRows * this.CELL_SIZE);
            this.ctx.stroke();
        }

    }

    async drawTree() {
        const align = `${this.alignY} ${this.alignX}`;

        const cols = this.treeGridSize;
        const rows = this.treeGridSize;
        
        const { offsetX, offsetY, cols: gridCols, rows: gridRows } = this.getTreeGridOffset(cols, rows, align);

        // Relative Porinter or Grid Pointer needs to be added with origin to show true value
        let pointerX = Math.floor(gridCols / 2);
        let pointerY = gridRows;
        const bounds = {
            offsetX, 
            offsetY, 
            maxX:gridCols, 
            maxY: gridRows,
            pointerX,
            pointerY,
            CELL_SIZE: this.CELL_SIZE,
            ctx: this.ctx,
            MAX_BRANCHES: this.MAX_BRANCHES || 500,
        };
        const base = BASE_TYPES[0];
        const colors = {
            potColor: this.potColor,
            leavesColor: this.leavesColor,
            darkLeavesColor: darkenColor(this.leavesColor),
            branchColor: this.branchColor,
        }
        const counter = { branch: 0, shoots: 0, shootCounter: 0};
        const multiplier = 3;

        drawbase(this.ctx, bounds, base, colors);
        await branch('trunk', this.life, this.startingLife, bounds, bounds.pointerX, bounds.pointerY, counter, multiplier, colors, 50);
    }

    async drawRepeatedTrees() {
        const promises = [];

        const treeCols = this.treeGridSize;
        const treeRows = this.treeGridSize;

        const gridWidth = treeCols * this.CELL_SIZE;
        const gridHeight = treeRows * this.CELL_SIZE;

        const countX = Math.ceil(this.canvas.width / gridWidth);
        const countY = Math.ceil(this.canvas.height / gridHeight);

        const base = BASE_TYPES[this.baseType];
        const colors = {
            potColor: this.potColor,
            leavesColor: this.leavesColor,
            darkLeavesColor: darkenColor(this.leavesColor),
            branchColor: this.branchColor,
        };

        for (let y = 0; y < countY; y++) {
            for (let x = 0; x < countX; x++) {
                const offsetX = x * gridWidth;
                const offsetY = y * gridHeight;

                const bounds = {
                    offsetX,
                    offsetY,
                    maxX: treeCols,
                    maxY: treeRows,
                    pointerX: Math.floor(treeCols / 2),
                    pointerY: treeRows,
                    CELL_SIZE: this.CELL_SIZE,
                    ctx: this.ctx,
                    MAX_BRANCHES: this.MAX_BRANCHES,
                };

                const counter = { branch: 0, shoots: 0, shootCounter: 0 };

                drawbase(this.ctx, bounds, base, colors);
                const tree =  branch('trunk', this.life, this.startingLife, bounds, bounds.pointerX, bounds.pointerY, counter, this.multiplier, colors, this.sleepDuration);
                // await branch('trunk', this.life, this.startingLife, bounds, bounds.pointerX, bounds.pointerY, counter, this.multiplier, colors, this.sleepDuration);
                promises.push(tree);
            }
        }

        await Promise.all(promises);

    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "#ccc";

        // Draw rows (horizontal lines)
        for (let index = 0; index <= this.rows; index++) {
            const y = this.offsetY + index * this.CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX, y);
            this.ctx.lineTo(this.offsetX + this.cols * this.CELL_SIZE, y);
            this.ctx.stroke();
        }

        // Draw columns (vertical lines)
        for (let index = 0; index <= this.cols; index++) {
            const x = this.offsetX + index * this.CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.offsetY);
            this.ctx.lineTo(x, this.offsetY + this.rows * this.CELL_SIZE);
            this.ctx.stroke();
        }

    }

    async generate() {
        const generateFunc = this.repeat 
            ? this.drawRepeatedTrees.bind(this) 
            : this.drawTree.bind(this);
            
        if (this.loop) {
            while (this.loop) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                await generateFunc();
                await sleep(2000);
            }
        } else {
            await generateFunc();
        }
    }

    start() {
        this.generate();
    }
}

canvases.forEach((canvas) => {
    const jsBonsai = new JsBonsai(canvas);
    jsBonsai.start();
});


export default JsBonsai;