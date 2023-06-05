const { createApp, nextTick } = Vue
createApp({
  	data()
	{
    		return {
			ioData: "",
			lastSave: null,
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
			config: {
				background: {
					draw: true,
					clearBackground: false,
					clearColor: "#000000",
					horizontal: true
				},
				colors: [],
				bubbles: {
					maxCount: 100,
					border: true,
					minSize: 10,
					maxSize: 30,
					roundness: 10,
					minSpeed: 0.2,
					maxSpeed: 1
				}
			},
			renderCalls: {
				resetBubbles: null,
				redrawFlag: null
			}
    		}
  	},
	computed:
	{
		colorCount() { return this.config.colors.length; },
		totalWeight() {
			let sum = 0;
			this.config.colors.forEach(color => sum += color.weight);
			return sum;
		}
	},
	methods:
	{
		resetAll()
		{
			localStorage.removeItem("auto-save");
			location.reload();
		},
		saveToLocalStorage()
		{
			localStorage.setItem("auto-save", btoa(JSON.stringify(this.config)));
			this.lastSave = new Date();
		},
		doExport()
		{
			this.ioData = JSON.stringify(this.config, null, "\t");
		},
		doImport()
		{
			try
			{
				this.config = JSON.parse(this.ioData);
			}
			catch
			{
				alert("Failed to parse data.");
			}
		},
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
			this.config.background.horizontal = preset.horizontal;
			this.config.colors = preset.colors.map(color => {
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
			this.config.colors.push(...preset.colors.map(color => {
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
		addNewColor(index)
		{
			index = index ?? this.config.colors.length;
			this.config.colors.splice(index, 0, { weight: 1, value: this.getRandomColor() });
		},
		randomizeColors()
		{
			this.config.colors.forEach(color => {
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
		"config.colors":
		{
			handler(newValue, oldValue)
			{
				this.doRenderCall(this.renderCalls.redrawFlag);
			},
			deep: true
		},
		"config.background.horizontal"(newValue, oldValue)
		{
			this.doRenderCall(this.renderCalls.redrawFlag);
		}
	},
	mounted()
	{
		this.selectedPreset = Object.keys(this.presets)[0];

		const autoSaveContent = localStorage.getItem("auto-save");
		if (autoSaveContent !== null)
		{
			try
			{
				this.config = JSON.parse(atob(autoSaveContent));
			}
			catch
			{
				this.resetAll();
			}
		}
		else
		{
			this.applyPreset(this.selectedPreset);
		}
		setInterval(() => this.saveToLocalStorage(), 5000);

		const sketchScript = sketch => {
			const flagUrl = "";
			let flagImg = null;
			
			const width = 300;
			const height = 300;
			
			let totalTime = 0;
			let globalSpeedMultiplier = 1;
		
			let drops = [];
			let firstFill = true;
			
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
				if (this.config.background.horizontal)
				{
					let heightSum = 0;
					for (const color of this.config.colors)
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
					for (const color of this.config.colors)
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

				if (this.config.background.clearBackground)
				{
					sketch.background(this.config.background.clearColor);
				}

				if (this.colorCount == 0)
					return;
			
				if (this.config.background.draw)
				{
					sketch.image(flagBehindGraphics, 0, 0, width, height);
				}
			
				const doStrokes = this.config.bubbles.border;
				if (!doStrokes)
				{
					sketch.noStroke();
				}
				for(const drop of drops)
				{
					if (doStrokes)
					{
						sketch.stroke(drop.strokeColor.value);
					}
					sketch.fill(drop.fillColor.value);
					sketch.rect(drop.x, drop.y, drop.size, drop.size, this.config.bubbles.roundness);
					drop.x = drop.startX + sketch.sin(totalTime + drop.timeOffset) * drop.xWaveSize;
					drop.y -= drop.speed * secDelta * 100;
				}
				
				drops = drops.filter(drop => drop.y > -drop.size);
				
				while (drops.length < this.config.bubbles.maxCount)
				{
					const fillColor = weightedRandFromArray(this.config.colors);
					const strokeColor = this.colorCount > 1
						? weightedRandFromArray(this.config.colors.filter(color => color !== fillColor))
						: fillColor;
			
					let startX = sketch.random(width);
					drops.push({
						startX,
						x: startX,
						y: firstFill ? sketch.random(height) : height + 10,
						size: sketch.random(this.config.bubbles.minSize, this.config.bubbles.maxSize),
						speed: sketch.random(this.config.bubbles.minSpeed, this.config.bubbles.maxSpeed),
						xWaveSize: sketch.random(width / 8, width / 4),
						timeOffset: sketch.random(-50, 50),
						strokeColor,
						fillColor
					});
				}
			
				firstFill = false;
			}

			function weightedRandFromArray(array)
			{
				const toPickFrom = [];
				for (const el of array)
				{
					for (let i = 0; i < el.weight; i++)
					{
						toPickFrom.push(el);
					}
				}
				return toPickFrom[Math.floor(Math.random() * toPickFrom.length)];
			}
		};
		const p5instance = new p5(sketchScript, document.getElementById("render"));
	}
}).mount("#vue");