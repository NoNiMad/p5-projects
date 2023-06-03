const progressFlag = [
	"#E40303",
	"#FF8C00",
	"#FFED00",
	"#008026",
	"#24408E",
	"#732982",
	"#FFFFFF",
	"#FFAFC8",
	"#74D7EE",
	"#613915",
	"#000000"
];
const prideFlag = [
	"#E40303",
	"#FF8C00",
	"#FFED00",
	"#008026",
	"#24408E",
	"#732982"
];
const transFlag = [
	"#74D7EE",
	"#FFAFC8",
	"#FFFFFF",
	"#FFAFC8",
	"#74D7EE"
];
const enbyFlag = [
	"#FCF434",
	"#FFFFFF",
	"#9C59D1",
	"#2C2C2C"
];
const frenchFlag = [
	"#002395",
	"#FFFFFF",
	"#ED2939"
];
const flagUrl = "";//"Gender-Bisexual-Pride-Flag.png";
let flagImg = null;
const horizontalFlag = true;
const colorList = prideFlag;
const colorsCount = colorList.length;

const width = 300;
const height = 300;

let totalTime = 0;
let drops = [];
let firstFill = true;
const dropsMaxCount = 100;

let flagBehindRenderer;

function preload()
{
	if (flagUrl !== "")
	{
		flagImg = loadImage(flagUrl);
	}
}

function setup()
{
	createCanvas(width, height);
	frameRate(60);

	flagBehindRenderer = createGraphics(width, height);
	flagBehindRenderer.noStroke();

	if (horizontalFlag)
	{
		const bandHeight = height / colorsCount;
		for (let i = 0; i < colorsCount; i++)
		{
			flagBehindRenderer.fill(colorList[i]);
			flagBehindRenderer.rect(0, i * bandHeight, width, bandHeight);
		}
	}
	else
	{
		const bandWidth = width / colorsCount;
		for (let i = 0; i < colorsCount; i++)
		{
			flagBehindRenderer.fill(colorList[i]);
			flagBehindRenderer.rect(i * bandWidth, 0, bandWidth, height);
		}
	}

	if (flagImg !== null)
	{
		flagBehindRenderer.image(flagImg, 0, 0, width, height);
	}
}

function draw()
{
	const secDelta = deltaTime / 1000 * globalSpeedMultiplier;
	totalTime += secDelta;

	image(flagBehindRenderer, 0, 0, width, height);

	for(const drop of drops)
	{
		stroke(drop.strokeColor);
		fill(drop.fillColor);
		rect(drop.x, drop.y, drop.size, drop.size, 10);
		drop.x = drop.startX + sin(totalTime + drop.timeOffset) * drop.xWaveSize;
		drop.y -= drop.speed * secDelta * 100;
	}
	
	drops = drops.filter(drop => drop.y > -drop.size);
	
	while (drops.length < dropsMaxCount)
	{
		const fillColor = randFromArrayExcept(colorList);
		const strokeColor = randFromArrayExcept(colorList, fillColor);

		let startX = random(width);
		drops.push({
			startX,
			x: startX,
			y: firstFill ? random(height) : height + 10,
			size: random(10, 30),
			speed: random(0.2, 1),
			xWaveSize: random(width / 8, width / 4),
			timeOffset: random(-50, 50),
			strokeColor,
			fillColor
		});
	}

	firstFill = false;
}

function randFromArrayExcept(array, exceptions)
{
	exceptions = exceptions || [];
	while (true)
	{
		const randIndex = Math.floor(random(array.length));
		const randEl = array[randIndex];
		if (!exceptions.includes(randEl))
		{
			return randEl;
		}
	}
}

let globalSpeedMultiplier = 1;

function keyPressed()
{
	if (key === "s")
	{
		saveGif("mySketch", 3, { delay: 5, units: "seconds" });
		//saveFrames("out", "png", 1, 60);
	}

	if (key === "p")
	{
		globalSpeedMultiplier = 5;
	}
	else if (key === "m")
	{
		globalSpeedMultiplier = 1;
	}
}