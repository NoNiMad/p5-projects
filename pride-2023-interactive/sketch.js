const { createApp, nextTick } = Vue
createApp({
  	data()
	{
    		return {
			horizontalStripes: true,
			selectedPreset: "",
			presets: {
				"Rainbow":
				{
					horizontal: true,
					colors: [ "#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982" ]
				},
				"Transgender":
				{
					horizontal: true,
					colors: [ "#74D7EE", "#FFAFC8", "#FFFFFF", "#FFAFC8", "#74D7EE" ]
				},
				"Non-binary":
				{
					horizontal: true,
					colors: [ "#FCF434", "#FFFFFF", "#9C59D1", "#2C2C2C" ]
				},
				"Progress":
				{
					horizontal: true,
					colors: [ "#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982", "#FFFFFF", "#FFAFC8", "#74D7EE", "#613915", "#000000" ]
				},
				"Bisexual":
				{
					horizontal: true,
					colors: [ { weight: 2, value: "#D60270" }, "#9B4F96", { weight: 2, value: "#0038A8" } ]
				},
				"Androgyne":
				{
					horizontal: false,
					colors: [ "#FE007F", "#9832FF", "#00B8E7" ]
				}
			},
			colors: [],
			renderCalls: {
				resetBubbles: null,
				redrawFlag: null
			}
    		}
  	},
	computed:
	{
		colorCount() { return this.colors.length; },
		totalWeight() {
			let sum = 0;
			this.colors.forEach(color => sum += color.weight);
			return sum;
		}
	},
	methods:
	{
		doRenderCall(renderCall)
		{
			if (renderCall)
			{
				renderCall();
			}	
		},
		applyPreset(name)
		{
			const preset = this.presets[name];
			this.horizontalStripes = preset.horizontal;
			this.colors = preset.colors.map(color => {
				if (typeof(color) == "string")
				{
					return {
						weight: 1,
						value: color
					};
				}
				return color;
			});

			this.doRenderCall(this.renderCalls.resetBubbles);
		},
		appendPreset(name)
		{
			const preset = this.presets[name];
			this.colors.push(...preset.colors.map(color => {
				if (typeof(color) == "string")
				{
					return {
						weight: 1,
						value: color
					};
				}
				return color;
			}));
		},
		addNewColor()
		{
			this.colors.push({ weight: 1, value: this.getRandomColor() });
		},
		randomizeAll()
		{
			this.colors.forEach(color => {
				color.weight = Math.floor(1 + Math.random() * 3);
				color.value = this.getRandomColor();
			});
		},
		getRandomColor()
		{
			const characters = "0123456789ABCDEF";
			let randomColor = "";
			for (let i = 0; i < 6; i++)
			{
				randomColor += characters[Math.floor(Math.random() * characters.length)];
			}
			return `#${randomColor}`;
		}
	},
	watch:
	{
		colors:
		{
			handler(newValue, oldValue)
			{
				this.doRenderCall(this.renderCalls.redrawFlag);
			},
			deep: true
		},
		horizontalStripes(newValue, oldValue)
		{
			this.doRenderCall(this.renderCalls.redrawFlag);
		}
	},
	mounted()
	{
		this.selectedPreset = Object.keys(this.presets)[0];
		this.applyPreset(this.selectedPreset);

		const sketchScript = sketch => {
			const flagUrl = "";
			let flagImg = null;
			
			const width = 300;
			const height = 300;
			
			let totalTime = 0;
			let globalSpeedMultiplier = 1;
		
			let drops = [];
			let firstFill = true;
			const dropsMaxCount = 100;
			
			let flagBehindGraphics;
		
			sketch.preload = () => {
				if (flagUrl !== "")
				{
					flagImg = sketch.loadImage(flagUrl);
				}
			};
			
			sketch.setup = () => {
				sketch.createCanvas(width, height);
				sketch.frameRate(60);
			
				flagBehindGraphics = sketch.createGraphics(width, height);
				flagBehindGraphics.noStroke();
				drawFlag(flagBehindGraphics);

				this.renderCalls.redrawFlag = () => {
					drawFlag(flagBehindGraphics);
				}

				this.renderCalls.resetBubbles = () => {
					drops = [];
					firstFill = true;
				};
			}
		
			const drawFlag = graphics =>
			{
				const totalWeight = this.totalWeight;
				if (this.horizontalStripes)
				{
					let heightSum = 0;
					for (const color of this.colors)
					{
						const stripeHeight = Math.ceil(color.weight * height / totalWeight);
						graphics.fill(color.value);
						graphics.rect(0, heightSum, width, stripeHeight);
						heightSum += stripeHeight;
					}
				}
				else
				{
					let widthSum = 0;
					for (const color of this.colors)
					{
						const stripeWidth = Math.ceil(color.weight * height / totalWeight);
						graphics.fill(color.value);
						graphics.rect(widthSum, 0, stripeWidth, height);
						widthSum += stripeWidth;
					}
				}
			
				if (flagImg !== null)
				{
					graphics.image(flagImg, 0, 0, width, height);
				}
			}
			
			sketch.draw = () => {
				const secDelta = sketch.deltaTime / 1000 * globalSpeedMultiplier;
				totalTime += secDelta;
			
				sketch.image(flagBehindGraphics, 0, 0, width, height);
			
				for(const drop of drops)
				{
					sketch.stroke(drop.strokeColor.value);
					sketch.fill(drop.fillColor.value);
					sketch.rect(drop.x, drop.y, drop.size, drop.size, 10);
					drop.x = drop.startX + sketch.sin(totalTime + drop.timeOffset) * drop.xWaveSize;
					drop.y -= drop.speed * secDelta * 100;
				}
				
				drops = drops.filter(drop => drop.y > -drop.size);
				
				while (drops.length < dropsMaxCount)
				{
					const fillColor = randFromArrayExcept(this.colors);
					const strokeColor = randFromArrayExcept(this.colors, [ fillColor ]);
			
					let startX = sketch.random(width);
					drops.push({
						startX,
						x: startX,
						y: firstFill ? sketch.random(height) : height + 10,
						size: sketch.random(10, 30),
						speed: sketch.random(0.2, 1),
						xWaveSize: sketch.random(width / 8, width / 4),
						timeOffset: sketch.random(-50, 50),
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
					const randIndex = Math.floor(sketch.random(array.length));
					const randEl = array[randIndex];
					if (!exceptions.includes(randEl))
					{
						return randEl;
					}
				}
			}
		};
		const p5instance = new p5(sketchScript, document.getElementById("render"));
	}
}).mount("#vue");