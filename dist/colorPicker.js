(function() {
    //Just a color library, made more-so for not repeating the same equations over and over again.
    elemental.colorLib = {
        BrightestChannel: (Color) => {
            if (typeof Color == "string") {
                const split = elemental.colorLib.HexToRGB(Color);

                let brightest = split.r;

                if (brightest < split.g) {
                    brightest = split.g;
                }
                if (brightest < split.b) {
                    brightest = split.b;
                }

                return brightest;
            }

            let brightest = Color.r;

            if (brightest < Color.g) {
                brightest = Color.g;
            }
            if (brightest < Color.b) {
                brightest = Color.b;
            }

            return brightest;
        },

        DarkestChannel: (Color) => {
            if (typeof Color == "string") {
                const split = elemental.colorLib.HexToRGB(Color);

                let brightest = split.r;

                if (brightest > split.g) {
                    brightest = split.g;
                }
                if (brightest > split.b) {
                    brightest = split.b;
                }

                return brightest;
            }

            let brightest = Color.r;

            if (brightest > Color.g) {
                brightest = Color.g;
            }
            if (brightest > Color.b) {
                brightest = Color.b;
            }

            return brightest;
        },

        HexToRGB: (Hex) => {
            if (typeof Hex === "string") {
                Hex = Hex.trim();

                if (Hex.length > 7) {
                    const splitHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(Hex) || [0,0,0,255];
                    return {
                        r: parseInt(splitHex[1], 16),
                        g: parseInt(splitHex[2], 16),
                        b: parseInt(splitHex[3], 16),
                        a: parseInt(splitHex[4], 16),
                    };
                } else if (Hex.length > 5) {
                    const splitHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(Hex);
                    return {
                        r: parseInt(splitHex[1], 16),
                        g: parseInt(splitHex[2], 16),
                        b: parseInt(splitHex[3], 16),
                        a: 255,
                    };
                } else {
                    const splitHex = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(Hex);
                    return {
                        r: parseInt(splitHex[1], 16),
                        g: parseInt(splitHex[2], 16),
                        b: parseInt(splitHex[3], 16),
                        a: 255,
                    };
                }
            }

            return {
                r: Math.floor(Hex / 65536),
                g: Math.floor(Hex / 256) % 256,
                b: Hex % 256,
                a: 255,
            };
        },

        RGBToHex: (RGB) => {
            let hexR = Math.floor(RGB.r).toString(16);
            let hexG = Math.floor(RGB.g).toString(16);
            let hexB = Math.floor(RGB.b).toString(16);

            if (hexR.length == 1) hexR = "0" + hexR;
            if (hexG.length == 1) hexG = "0" + hexG;
            if (hexB.length == 1) hexB = "0" + hexB;

            //Transparency
            if (typeof RGB.a == "number") {
                let hexA = Math.floor(RGB.a).toString(16);
                if (hexA.length == 1) hexA = "0" + hexA;

                return `#${hexR}${hexG}${hexB}${hexA.toLowerCase() == "ff" ? "" : hexA}`;
            }

            return `#${hexR}${hexG}${hexB}`;
        },

        RGBToHSV: (RGB) => {
            //Divide the RGB by 255            
            RGB.r /= 255;
            RGB.g /= 255;
            RGB.b /= 255;

            //Get the brightest and darkest channels
            const CMax = elemental.colorLib.BrightestChannel(RGB);
            const CMin = elemental.colorLib.DarkestChannel(RGB);

            const Delta = CMax - CMin;

            let H = 0;

            //Multiply and get the Hue
            if (CMax == RGB.r) {
                H = 60 * (((RGB.g - RGB.b) / Delta) % 6);
            }
            if (CMax == RGB.g) {
                H = 60 * ((RGB.b - RGB.r) / Delta + 2);
            }
            if (CMax == RGB.b) {
                H = 60 * ((RGB.r - RGB.g) / Delta + 4);
            }

            //Set the saturation
            let S = 0;
            if (CMax != 0) {
                S = Delta / CMax;
            }

            //Make sure the hue isn't NaN
            if (isNaN(H)) {
                H = 0;
            }

            //Revert & Return
            RGB.r *= 255;
            RGB.g *= 255;
            RGB.b *= 255;

            if (H < 0) H += 360;

            return {
                h: H,
                s: S,
                v: CMax,
                a: RGB.a,
            };
        },

        HSVToRGB: (HSV) => {
            const h = HSV.h % 360;

            //Some math to get C and X
            const C = HSV.v * HSV.s;
            const X = C * (1 - Math.abs(((h / 60) % 2) - 1));

            const m = HSV.v - C;

            //Make our returned objects
            const RGB = { r: 0, g: 0, b: 0 };

            //And the if statements
            if (0 <= h && h < 60) {
                RGB.r = C;
                RGB.g = X;
            } else if (60 <= h && h < 120) {
                RGB.r = X;
                RGB.g = C;
            } else if (120 <= h && h < 180) {
                RGB.g = C;
                RGB.b = X;
            } else if (180 <= h && h < 240) {
                RGB.g = X;
                RGB.b = C;
            } else if (240 <= h && h < 300) {
                RGB.b = C;
                RGB.r = X;
            } else if (300 <= h && h < 360) {
                RGB.b = X;
                RGB.r = C;
            }

            //Then convert
            RGB.r = (RGB.r + m) * 255;
            RGB.g = (RGB.g + m) * 255;
            RGB.b = (RGB.b + m) * 255;
            RGB.a = HSV.a;

            return RGB;
        },

        HSVToHex: (HSV) => {
            return elemental.colorLib.RGBToHex(elemental.colorLib.HSVToRGB(HSV));
        },

        HexToHSV: (Hex) => {
            return elemental.colorLib.RGBToHSV(elemental.colorLib.HexToRGB(Hex));
        },

        //The object was tweaking if I'm honest with out.
        color: class {
            //Hex code, very simple, but the conversion to others is strange.
            #hex = "#000000";
            set hex(value) {
                this.#hex = value;
                
                const { r, g, b, a } = elemental.colorLib.HexToRGB(value);
                const { h, s, v } = elemental.colorLib.HexToHSV(value);

                this.#r = r;
                this.#g = g;
                this.#b = b;
                this.#a = a;

                this.#h = h;
                this.#s = s;
                this.#v = v;
            }
            get hex() { return this.#hex; }

            //RGB code, simple, but repetitive.
            #r = 0;
            set r(value) {
                this.#r = value;
                this.updateForRGB();
            }
            get r() { return this.#r; }

            #g = 0;
            set g(value) {
                this.#g = value;
                this.updateForRGB();
            }
            get g() { return this.#g; }

            #b = 0;
            set b(value) {
                this.#b = value;
                this.updateForRGB();
            }
            get b() { return this.#b; }

            #a = 0;
            set a(value) {
                this.#a = value;
                this.updateForRGB();
            }
            get a() { return this.#a; }

            //HSV code, also simple, but repetitive.
            #h = 0
            set h(value) {
                this.#h = value;
                this.updateForHSV();
            }
            get h() { return this.#h; }

            #s = 0;
            set s(value) {
                this.#s = value;
                this.updateForHSV();
            }
            get s() { return this.#s; }

            #v = 0;
            set v(value) {
                this.#v = value;
                this.updateForHSV();
            }
            get v() { return this.#v; }

            updateForRGB() {
                this.#hex = elemental.colorLib.RGBToHex({ r: this.r, g: this.g, b: this.b, a: this.a });
                const { h, s, v } = elemental.colorLib.RGBToHSV({ r: this.r, g: this.g, b: this.b });
                this.#h = h;
                this.#s = s;
                this.#v = v;
            }

            updateForHSV() {
                this.#hex = elemental.colorLib.HSVToHex({ h: this.h, s: this.s, v: this.v, a: this.a });
                const { r, g, b } = elemental.colorLib.HSVToRGB({ h: this.h, s: this.s, v: this.v });
                this.#r = r;
                this.#g = g;
                this.#b = b;
            }

            //For some reason css doesn't support hsv? So just add simple hsl support.
            get HSL() {
                const l = Math.max(0, Math.min(1, this.v * (1 - (this.s / 2))));
                return {
                    h: this.h,
                    s: (l == 0 || l == 1) ? 0 : (this.v  - l)/Math.min(l, 1-l),
                    l: l
                }
            }

            constructor(hex) {
                if (typeof hex == "string") this.hex = hex;
            }
        },

        gradient: class {
            modeToCSSFunction = {
                "linear": () => `linear-gradient(${this.angle}rad`,
                "radial": () => `radial-gradient(at center`,
                "conic": () => `conic-gradient(from ${this.angle}rad`,
            }

            get css() {
                let gradient = this.modeToCSSFunction[this.mode]();
                for (let id in this.colors) {
                    gradient += `, ${this.colors[id][0].hex} ${this.colors[id][1] * 100}%`;
                }

                gradient += ")";

                return gradient;
            }

            constructor(contents, mode, angle) {
                //Default to pink and black if no content array is provided
                if (Array.isArray(contents)) {
                    const step = 1 / contents.length;
                    this.colors = [];
                    
                    let cur = 0;
                    for (let colorID in contents) {
                        const color = contents[colorID];
                        if (Array.isArray(color) && color.length >= 2) {
                            if (color[0] instanceof elemental.colorLib.color) this.colors.push([color[0], color[1]]);
                            else this.colors.push([new elemental.colorLib.color(color[0]), color[1]])
                        }
                        else if (typeof color == "string") {
                            cur += step;
                            this.colors.push([new elemental.colorLib.color(color), cur]);
                        }
                        else {
                            cur += step;
                            this.colors.push([new elemental.colorLib.color("#ff00ff"), cur]);
                        }
                    }
                }
                else if (typeof contents == "string") this.parseCSS(contents);
                else this.failSafeColors();

                this.mode = mode || this.mode || "linear";
                this.angle = angle || this.angle || 0;
            }

            //JUST IN CASE
            failSafeColors() {
                this.mode = "linear";
                this.angle = 0;
                this.colors = [
                    [ new elemental.colorLib.color("#ff00ff"), 0 ],
                    [ new elemental.colorLib.color("#000000"), 1 ]
                ];

                return this.colors;
            }

            parseCSSAngle(angle) {
                let parsed = 0;
                //For rads it's a simple find and parse.
                if (angle.endsWith("rad")) {
                    parsed = Number(angle.replace("rad", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                }
                //For degrees we need to convert.
                else if (angle.endsWith("deg")) {
                    parsed = Number(angle.replace("deg", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                    parsed *= 0.01745329;
                }
                //Who uses gradians?
                else if (angle.endsWith("grad")) {
                    parsed = Number(angle.replace("grad", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                    parsed *= 0.01570796;
                }
                //and then turns
                else if (angle.endsWith("turn")) {
                    parsed = Number(angle.replace("turn", "").trim());
                    if (isNaN(parsed)) parsed = 0;
                    parsed *= Math.PI * 2;
                }

                return parsed;
            }

            //Tested with 
            parseColorsFromArgs(args, from) {
                const colors = [];

                //Get step just in case;
                const step = 100 / (args.length - from);
                let cur = 0;

                for (let i=from; i<args.length; i++) {
                    let arg=args[i];
                    
                    //How, but if so just default it to pink
                    if (arg.length == 0) arg = ["#ff00ff", `${cur}%`];
                    else if (arg.length == 1) {
                        cur += step;
                        arg = [arg[0], `${cur}%`];
                    }

                    //Make sure both sides are SOMEWHAT valid
                    if (!arg[0].startsWith("#")) arg[0] = "#ff00ff";
                    if (!arg[1].endsWith("%")) {
                        cur += step;
                        arg[1] = `${cur}%`;
                    }

                    //Final parse
                    arg[0] = new elemental.colorLib.color(arg[0]);
                    arg[1] = Number(arg[1].trim().replace("%", "")) / 100;
                    
                    //If it is somehow still not valid, make it
                    if (isNaN(arg[1])) {
                        cur += step;
                        arg[1] = cur / 100;
                    }
                    else cur = arg[1];

                    //Finally add it to the array;
                    colors.push([arg[0], arg[1]]);
                }

                return colors;
            }

            //The actual parsing of each type;
            cssReaders = {
                "linear": (args) => {
                    if (args.length < 3) return false;
                    this.angle = this.parseCSSAngle(args[0][0]);

                    const parsedColors = this.parseColorsFromArgs(args, 1);
                    if (parsedColors.length < 2) return false;

                    this.colors = parsedColors;

                    return true;
                },
                "radial": (args) => {
                    if (args.length < 3) return false;

                    const parsedColors = this.parseColorsFromArgs(args, 1);
                    if (parsedColors.length < 2) return false;

                    this.colors = parsedColors;

                    return true;
                },
                "conic": (args) => {
                    if (args.length < 3) return false;

                    //Parse the angle, because "From" can be here for some reason
                    if (args[0].length == 0) this.angle = 0;
                    else if (args[0].length == 1) this.angle = this.parseCSSAngle(args[0][0]);
                    else if (args[0].length == 2) this.angle = this.parseCSSAngle(args[0][1]);

                    const parsedColors = this.parseColorsFromArgs(args, 1);
                    if (parsedColors.length < 2) return false;

                    this.colors = parsedColors;

                    return true;
                }
            }

            parseCSS(str) {
                let func = "";
                let i = 0;

                //Grab function
                while (str.charAt(i) != "(" && i < str.length) {
                    func += str.charAt(i);
                    i++;
                }

                //make sure we didn't just hit a dead end.
                if (i >= str.length) return this.failSafeColors();

                //otherwise trim the function name
                func = elemental.colorLib.gradientFunc2Type[func.trim().toLowerCase()];
                if (!func) func = "linear";
                this.mode = func;
                
                //Step off and read args
                i++;

                let args = "";
                while(str.charAt(i) != ")" && i < str.length) {
                    args += str.charAt(i);
                    i++;
                }

                if (i >= str.length || args.length == 0) return this.failSafeColors();

                //Clean up the arguments
                args = args.split(",");
                for (let argsID in args) {
                    //Trim and split each argument into it's components,
                    //Also make sure to fancy them up aswell.
                    args[argsID] = args[argsID].trim().split(" ").reduce(
                        (acc, cur) => { 
                            if (cur) acc.push(cur.trim()) 
                            return acc;
                        }, 
                        []
                    );
                }

                if (this.cssReaders[func]) {
                    const success = this.cssReaders[func](args);
                    if (!success) return this.failSafeColors();
                }
                else return this.failSafeColors();
            }
        },

        gradientFunc2Type: {
            "linear-gradient":"linear",
            "radial-gradient":"radial",
            "conic-gradient": "conic",
        },

        unpackString(str) {
            if (typeof str != "string") return;

            if (str.startsWith("#")) return new elemental.colorLib.color(str);
            else return new elemental.colorLib.gradient(str);
        }
    };

    //Set up configuration and the base module.
    elemental.colorPickerConfig = {
        sliderDirection: {
            primary: "x",
            secondary: "x",
            tertiary: "x",
            alpha: "x",
            hue: "y",
            satValue: "xy"
        },

        sliderTarget: {
            primary: "r",
            secondary: "g",
            tertiary: "b",
            alpha: "a",
            hue: "h",
            satValue: [ "s", "v" ]
        },
        defaultRatio: [8, 4]
    };

    elemental.colorPickerModule = class {
        constructor(parent) {
            this.parent = parent;
            this.build(parent, parent.container);
        }

        build(parent, container) {}
        updateColor(target, value, parent) {}
        destroy(parent) {}

        condition(parent) { return true; }
    }

    //The base sliders for the colour picker
    elemental.colorPickerGeneric = class extends elemental.colorPickerModule {
        build(parent, container) {
            this.sliderContainer = document.createElement('div');
            this.sliderContainer.className = `${parent.prefix}slider-container`;
            
            this.satValueAdjust = document.createElement("div");
            this.satValueAdjust.className = `${parent.prefix}satBrightPicker`;
            
            this.satValueSlider = document.createElement("div");
            this.satValueSlider.className = `${parent.prefix}satValueSlider`;

            this.hueAdjust = document.createElement("div");
            this.hueAdjust.className = `${parent.prefix}-adjust ${parent.prefix}hueAdjust`;
            
            this.hueSlider = document.createElement("div");
            this.hueSlider.className = `${parent.prefix}slider ${parent.prefix}hueSlider`;

            this.colorPickerAdjustHolders = document.createElement("div");
            this.colorPickerAdjustHolders.className = `${parent.prefix}adjustHolder`;
            
            this.firstAdjust = document.createElement("div");
            this.firstAdjust.className = `${parent.prefix}adjust ${parent.prefix}firstAdjust`;
            
            this.firstSlider = document.createElement("div");
            this.firstSlider.className = `${parent.prefix}slider`;
            
            this.secondAdjust = document.createElement("div");
            this.secondAdjust.className = `${parent.prefix}adjust ${parent.prefix}secondAdjust`;
            
            this.secondSlider = document.createElement("div");
            this.secondSlider.className = `${parent.prefix}slider`;
            
            this.thirdAdjust = document.createElement("div");
            this.thirdAdjust.className = `${parent.prefix}adjust ${parent.prefix}thirdAdjust`;
            
            this.thirdSlider = document.createElement("div");
            this.thirdSlider.className = `${parent.prefix}slider`;
            

            this.satValueAdjust.appendChild(this.satValueSlider);

            this.firstAdjust.appendChild(this.firstSlider);
            this.secondAdjust.appendChild(this.secondSlider);
            this.thirdAdjust.appendChild(this.thirdSlider);
            this.hueAdjust.appendChild(this.hueSlider);

            this.colorPickerAdjustHolders.appendChild(this.firstAdjust);
            this.colorPickerAdjustHolders.appendChild(this.secondAdjust);
            this.colorPickerAdjustHolders.appendChild(this.thirdAdjust);

            this.sliderContainer.appendChild(this.satValueAdjust);
            this.sliderContainer.appendChild(this.hueAdjust);
            this.sliderContainer.appendChild(this.colorPickerAdjustHolders);

            //Set up alpha is alpha exists
            if (parent.hasAttribute("alpha")) {
                this.alphaAdjust = document.createElement("div");
                this.alphaAdjust.className = `${parent.prefix}adjust ${parent.prefix}alphaAdjust`;
                
                this.alphaSlider = document.createElement("div");
                this.alphaSlider.className = `${parent.prefix}slider ${parent.prefix}alphaSlider`;

                this.alphaAdjust.appendChild(this.alphaSlider);
                this.colorPickerAdjustHolders.appendChild(this.alphaAdjust);
                parent.setupSliderFunctionality(this.alphaAdjust, "alpha");
            }
            
            container.appendChild(this.sliderContainer);

            parent.setupSliderFunctionality(this.firstAdjust, "primary");
            parent.setupSliderFunctionality(this.secondAdjust, "secondary");
            parent.setupSliderFunctionality(this.thirdAdjust, "tertiary");
            parent.setupSliderFunctionality(this.hueAdjust, "hue");
            parent.setupSliderFunctionality(this.satValueAdjust, "satValue");
        }

        updateColor(target, value, parent) {
            let color = parent.color;
            if (color instanceof elemental.colorLib.gradient) color = color.colors[parent.gradientIndex][0];
            //Set variables needed for each value.
            this.firstSlider.style.setProperty("--x", `${color.r / 2.55}%`);
            this.secondSlider.style.setProperty("--x", `${color.g / 2.55}%`);
            this.thirdSlider.style.setProperty("--x", `${color.b / 2.55}%`);
            if (this.alphaAdjust) this.alphaSlider.style.setProperty("--x", `${color.a / 2.55}%`);
            this.hueSlider.style.setProperty("--x", `${color.h / 3.6}%`);

            this.firstAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ r: 0, g: color.g, b: color.b }));
            this.firstAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ r: 255, g: color.g, b: color.b }));

            this.secondAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ g: 0, r: color.r, b: color.b }));
            this.secondAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ g: 255, r: color.r, b: color.b }));

            this.thirdAdjust.style.setProperty("--combinedLow", elemental.colorLib.RGBToHex({ b: 0, r: color.r, g: color.g }));
            this.thirdAdjust.style.setProperty("--color", elemental.colorLib.RGBToHex({ b: 255, r: color.r, g: color.g }));

            //Then the color properties
            const alphalessHex = elemental.colorLib.RGBToHex({ r: color.r, g: color.g, b: color.b });
            if (this.alphaAdjust) {
                this.alphaAdjust.style.setProperty("--color", alphalessHex);
                this.alphaSlider.style.setProperty("--color", color.hex);
            }

            this.firstSlider.style.setProperty("--color", alphalessHex);
            this.secondSlider.style.setProperty("--color", alphalessHex);
            this.thirdSlider.style.setProperty("--color", alphalessHex);
            this.satValueSlider.style.setProperty("--color", alphalessHex);
            this.hueSlider.style.setProperty("--color", alphalessHex);

            //Set the color on the big square
            this.satValueAdjust.style.setProperty("--color", elemental.colorLib.HSVToHex({ h: color.h, s: 1, v: 1 }));

            //Move the dragger on the big square
            this.satValueSlider.style.setProperty("--x", `${color.s * 100}%`);
            this.satValueSlider.style.setProperty("--y", `${(1 - color.v) * 100}%`);

            //Then the needed for the hue adjuster.
            const { s, l } = color.HSL;
            this.hueAdjust.style.setProperty("--saturation", `${s * 100}%`);
            this.hueAdjust.style.setProperty("--lightness", `${l * 100}%`);
        }
    }

    //Then gradient tools
    elemental.colorPickerGradient = class extends elemental.colorPickerModule {
        //Javascript gets a hissy fit if this is private for some reason.
        set mode(value) {
            const lastMode = this._mode;
            this._mode = value;
            this.updateMode(value, lastMode);
        }

        get mode() {
            return this._mode;
        }

        build(parent, container) {
            //Just make sure gradient index is there.
            parent.gradientIndex = parent.gradientIndex || 0;

            if (parent.color instanceof elemental.colorLib.color) this._mode = "none";
            else this._mode = parent.color.mode;

            this.gradientContainer = document.createElement("div");
            this.gradientContainer.className = `${parent.prefix}gradient-container`;

            this.modeContainer = document.createElement("div");
            this.modeContainer.className = `${parent.prefix}gradient-modes`;

            //Create mode buttons
            this.modes = {
                none: document.createElement("button"),
                linear: document.createElement("button"),
                radial: document.createElement("button"),
                conic: document.createElement("button"),
            };

            this.modes.none.onclick = () => this.mode = "none";
            this.modes.linear.onclick = () => this.mode = "linear";
            this.modes.radial.onclick = () => this.mode = "radial";
            this.modes.conic.onclick = () => this.mode = "conic";

            //Create the display gradient but keep it hidden because it will only appear when a gradient mode is selected.
            this.displayGradient = document.createElement("div");
            this.displayGradient.className = `${parent.prefix}gradient-display`;

            //Append the html elements and update the selected mode.
            this.modeContainer.appendChild(this.modes.none);
            this.modeContainer.appendChild(this.modes.linear);
            this.modeContainer.appendChild(this.modes.radial);
            this.modeContainer.appendChild(this.modes.conic);

            this.gradientContainer.appendChild(this.modeContainer);
            container.appendChild(this.gradientContainer);

            this.updateMode(this.mode, this.mode);

        }

        updateMode(current, last) {
            //Update buttons to reflect current selection.
            for (let buttonMode in this.modes) {
                this.modes[buttonMode].className = `${this.parent.prefix}gradient-mode ${this.parent.prefix}gradient-mode-${buttonMode}`;

                if (this.mode == buttonMode) this.modes[buttonMode].className += ` ${this.parent.prefix}gradient-mode-selected`;
            }

            //Convert the color if need be;
            if (this.mode != "none") { 
                if (!this.displayGradient.parentElement) this.gradientContainer.appendChild(this.displayGradient);
            }
            else if (this.displayGradient.parentElement) this.displayGradient.parentElement.removeChild(this.displayGradient);

            //Now we convert the color if need be;
            if (current != last) {
                //Make sure we are switching from none, and are not a gradient, if so convert to gradient
                if (last == "none" && this.parent.color instanceof elemental.colorLib.color) {
                    //Convert to gradient
                    const grad = new elemental.colorLib.gradient([
                        [this.parent.color, 0],
                        [new elemental.colorLib.color((this.parent.hasAttribute("alpha")) ? "#00000000" : "#000000"), 1],
                    ], current);

                    this.parent.color = grad;
                }
                //Otherwise, check for us being a gradient, and us once being one
                else if (last != "none" && this.parent.color instanceof elemental.colorLib.gradient) {
                    //If we are no longer one, grab the first color from the gradient
                    if (current == "none") {
                        const color = this.parent.color.colors[0][0];
                        this.parent.color = color;
                    }
                    //Otherwise just switch gradient type.
                    else this.parent.color.mode = current;
                }

                this.parent.updateColor(null, 0);
            }
        }

        condition(parent) { return parent.hasAttribute("gradient"); }
    }

    //Modules we have by default if the colour picker element doesn't specify any. Right now a take all situation.
    elemental.colorPickerConfig.modules = [
        elemental.colorPickerGradient,
        elemental.colorPickerGeneric
    ]

    //Define a custom color picker
    elemental.newElement("Color Picker", {
        class: class extends HTMLElement {
            // "isgradient" is moreso for css
            static observedAttributes = ["value", "gradient", "alpha", "isgradient"];

            #fromUpdate = false;
            prefix = "elemental-color-picker-";

            set value(value) {
                this.style.setProperty("--color", value)
                //Update colors if the source of the value being set is not from the update.
                if (!this.#fromUpdate) {
                    //Make sure value is valid
                    if (!value) return;

                    //If so do our thing
                    this.color = elemental.colorLib.unpackString(value);

                    //update gradient attrib
                    const isGradient = this.color instanceof elemental.colorLib.gradient;
                    this.setAttribute("isgradient", isGradient);

                    //Update the value;
                    this.#fromUpdate = true;
                    if (isGradient) this.setAttribute("value", this.color.css);
                    else this.setAttribute("value", this.color.hex);
                    this.#fromUpdate = false;
    
                    //Update the color
                    this.style.setProperty("--color", this.getAttribute("value"));
                }
                else {
                    this.setAttribute("value", value);
                }
            }
            get value() {
                if (this.hasAttribute("value")) return this.getAttribute("value");
                else return "#000000";
            }

            #mouseDownFunc;
            spawnedModules = [];

            constructor() {
                super();
                
                //On click popup
                this.onclick = () => {
                    const clientRect = this.getBoundingClientRect();
                    this.createPopup(clientRect.left, clientRect.top);
                }

                //Now setup our listener functions for when we are popped up.
                const self = this;
                this.#mouseDownFunc = (event) => self.clickHandler.call(self, event);
            }

            setupSliderFunctionality(element, id) {
                element.onmousedown = (downEvent) => {
                    //Make sure we don't accidentally select the background.
                    downEvent.stopPropagation();
                    downEvent.preventDefault();

                    //Function for updating the values
                    const updateOnEvent = (event) => {
                        //Get bounds and calculate new value
                        const target = elemental.colorPickerConfig.sliderTarget[id];
                        if (!target) return;

                        //Switch between possible directions the slider can go.
                        switch (elemental.colorPickerConfig.sliderDirection[id]) {
                            case "x":{
                                const { left, width, right } = element.getBoundingClientRect();
                                const percentage = (Math.max(left, Math.min(event.clientX, right)) - left) / width;
                                this.updateColor(target, percentage);
                                break;
                            }

                            case "y":{
                                const { top, height, bottom } = element.getBoundingClientRect();
                                const percentage = (Math.max(top, Math.min(event.clientY, bottom)) - top) / height;
                                this.updateColor(target, percentage);
                                break;
                            }

                            case "xy":{
                                //Check to make sure the target is valid
                                if ((!Array.isArray(target)) || target.length < 2) return;

                                const { left, width, right, top, height, bottom } = element.getBoundingClientRect();
                                const percentageX = (Math.max(left, Math.min(event.clientX, right)) - left) / width;
                                const percentageY = 1 - ((Math.max(top, Math.min(event.clientY, bottom)) - top) / height);
                                this.updateColor(target[0], percentageX);
                                this.updateColor(target[1], percentageY);
                                break;
                            }
                        
                            default:
                                break;
                        }
                    }

                    //Actually updating the values
                    updateOnEvent(downEvent);
                    const moveSlider = (event) => {
                        event.stopPropagation();
                        event.preventDefault();

                        updateOnEvent(event);
                    }

                    const dropSlider = (event) => {
                        document.removeEventListener("mousemove", moveSlider);
                        document.removeEventListener("mouseup", dropSlider);
                        document.removeEventListener("mouseleave", dropSlider);
                    }

                    document.addEventListener("mousemove", moveSlider);
                    document.addEventListener("mouseup", dropSlider);
                    document.addEventListener("mouseleave", dropSlider);
                }
            }

            buildPopup(x, y) {
                //Create the container
                this.container = document.createElement('div');
                this.container.className = `${this.prefix}container`;
                this.container.style.setProperty("--x", `${x}px`);
                this.container.style.setProperty("--y", `${y}px`);

                if (!this.color) this.color = new elemental.colorLib.color();

                //Then spawn the needed modules
                const modules = elemental.colorPickerConfig.modules;
                for (let moduleID in modules) {
                    //Make sure module is valid, and it's condition is met.
                    if (!modules[moduleID]) continue;

                    if (modules[moduleID].prototype.condition(this)) {
                        const module = new modules[moduleID](this);
                        this.spawnedModules.push(module);
                    }
                }
 
                //Then add the container to the DOM
                document.body.appendChild(this.container);
            }

            updateColor(target, value) {
                let color = this.color;
                if (color instanceof elemental.colorLib.gradient) color = color.colors[this.gradientIndex][0];

                switch (target) {
                    case "r": color.r = Math.floor(value * 255); break;
                    case "g": color.g = Math.floor(value * 255); break;
                    case "b": color.b = Math.floor(value * 255); break;
                    case "h": color.h = Math.max(0, Math.min(value, 1)) * 360; break;
                    case "s": color.s = value; break;
                    case "v": color.v = value; break;
                    case "a": color.a = Math.floor(value * 255); break;
                    case "hex": color.hex = value; break;
                    default: break;
                }

                for (let moduleID in this.spawnedModules) {
                    const module = this.spawnedModules[moduleID];
                    module.updateColor(target, value, this);
                }

                //Get css if gradient, get hex if color
                this.#fromUpdate = true;
                if (this.color instanceof elemental.colorLib.color) {
                    this.setAttribute("isgradient", false);
                    this.value = this.color.hex;
                }
                else if (this.color instanceof elemental.colorLib.gradient) {
                    this.setAttribute("isgradient", true);
                    this.value = this.color.css;
                }
                //Make sure to also put the from update ticker back.
                this.#fromUpdate = false;
            }

            clickHandler(event) {
                if (event.target == this || this.container.contains(event.target)) return;
                this.destroyPopup();
            }

            destroyPopup() {
                if (!this.container.parentElement) return;
                document.body.removeChild(this.container);
                window.removeEventListener("mousedown", this.#mouseDownFunc);
            }

            createPopup(x, y) {
                this.buildPopup(x, y);
                this.updateColor(null, 0);
                
                window.addEventListener("mousedown",  this.#mouseDownFunc);
            }

            connectedCallback() {
                if (!this.color) this.color = new elemental.colorLib.color();
                this.color.hex = this.value || "#000000";
            }

            attributeChangedCallback(name, old, value) {
                if (name == "value" && !this.#fromUpdate) this.value = value;
            }
        },

        css: `
        <el> {
            --color: #ff0000;

            display: inline-block;
            vertical-align: text-top;

            aspect-ratio: 1;

            width: auto;
            height: 0.75em;

            border: 0.125em #dfdfdf outset;

            background: linear-gradient(to right, var(--color) 0%, var(--color) 100%), linear-gradient(to bottom, #9f9f9f 50%, #cfcfcf 50%);
        }

        <el>:hover { border-color: #afafaf; }
        <el>:active { border-style: inset; }

        <el>[isgradient="true"] {
            background: var(--color), linear-gradient(to bottom, #9f9f9f 50%, #cfcfcf 50%);
        }

        .elemental-color-picker-container {
            --x: 0px;
            --y: 0px;

            position: absolute;
            top: var(--y);
            left: var(--x);

            width: 384px;
            height: auto;

            background-color: #efefef;
            border: 4px #dfdfdf outset;

            z-index: 9999;
        }

        .elemental-color-picker-slider-container {
            display: grid;
            grid-template-columns: 50% 10% 40%;
            
            aspect-ratio: 2/1;
        }

        .elemental-color-picker-satBrightPicker {
            --color: #f00;

            margin: 8px;
            border: 4px #dfdfdf inset;
            background: linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, var(--color) 100%);
        }

        .elemental-color-picker-satValueSlider {
            --color: #000000;
            --x: 0%;
            --y: 0%;

            position: relative;
            left: var(--x);
            top: var(--y);

            width: 20px;
            height: 20px;

            border: 4px #dfdfdf outset;
            border-radius: 100%;

            transform: translate(-50%, -50%);

            background-color: var(--color);        
        }
        
        .elemental-color-picker-hueAdjust {
            --saturation: 100%;
            --lightness: 50%;

            margin: 8px 4px 8px 0px;
            border: 4px #dfdfdf inset;

            background: linear-gradient(to bottom, 
                hsla(0deg, var(--saturation), var(--lightness), 100%) 0%,
                hsla(36deg, var(--saturation), var(--lightness), 100%) 10%,
                hsla(72deg, var(--saturation), var(--lightness), 100%) 20%,
                hsla(108deg, var(--saturation), var(--lightness), 100%) 30%,
                hsla(144deg, var(--saturation), var(--lightness), 100%) 40%,
                hsla(180deg, var(--saturation), var(--lightness), 100%) 50%,
                hsla(216deg, var(--saturation), var(--lightness), 100%) 60%,
                hsla(252deg, var(--saturation), var(--lightness), 100%) 70%,
                hsla(288deg, var(--saturation), var(--lightness), 100%) 80%,
                hsla(324deg, var(--saturation), var(--lightness), 100%) 90%,
                hsla(360deg, var(--saturation), var(--lightness), 100%) 100%
            );
        }

        .elemental-color-picker-adjustHolder {
            display: grid;
            grid-template-rows: 25% 25% 25% 25%;
            margin: 4px 0px 4px 0px;
        }

        .elemental-color-picker-adjust  {
            --combinedLow: #000000;
            --color: #ff0000;

            margin: 4px;
            border: 4px #dfdfdf inset;

            overflow: hidden;
            display: block;
        }

        .elemental-color-picker-firstAdjust { 
            --color: #ff0000;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }
        .elemental-color-picker-secondAdjust { 
            --color: #00ff00;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }
        .elemental-color-picker-thirdAdjust {
            --color: #0000ff;
            background: linear-gradient(to right, var(--combinedLow) 0%, var(--color) 100%);
        }

        .elemental-color-picker-alphaAdjust {
            --color: #ffffff;
            background: linear-gradient(to right, transparent 0%, var(--color) 100%), linear-gradient(to bottom, transparent 50%, #00000033 50%);
        }

        .elemental-color-picker-slider {
            --color: #000000;

            --x: 0%;
            
            position: relative;
            left: var(--x);
            top: 0px;

            width: 8px;
            height: calc(100% - 8px);
            border: 4px #dfdfdf outset;

            transform: translate(-50%, 0%);

            background-color: var(--color);
        }

        .elemental-color-picker-alphaSlider {
            background: linear-gradient(to top, var(--color) 0%, var(--color) 100%), linear-gradient(to bottom, #00000033 0%, transparent 100%);
        }

        .elemental-color-picker-hueSlider {
            position: relative;
            left: 0px;
            top: var(--x);

            width: calc(100% - 8px);
            height: 8px;

            transform: translate(0%, -50%);
        }

        .elemental-color-picker-gradient-container {
            display: grid;
            grid-template-rows: auto auto;
            margin: 4px;
        }

        .elemental-color-picker-gradient-modes {
            display: flex;
            justify-content: center;
        }

        .elemental-color-picker-gradient-mode {
            --gradientColor: #5f5f5f;

            width: 20px;
            height: auto;

            aspect-ratio: 1;

            background: var(--gradientColor);
        }

        .elemental-color-picker-gradient-mode-selected {
            --gradientColor: #18a3ff;
        }

        .elemental-color-picker-gradient-mode-linear {
            background: linear-gradient(to right, transparent 0%, var(--gradientColor) 100%);
        }

        .elemental-color-picker-gradient-mode-radial {
            background: radial-gradient(at center, var(--gradientColor) 0%, transparent 100%);
        }

        .elemental-color-picker-gradient-mode-conic {
            background: conic-gradient(at center, var(--gradientColor) 0%, transparent 100%);
        }

        .elemental-color-picker-gradient-display {
            /* Ha ha half life reference! */
            --gradient: linear-gradient(to right, #000000 50%, #ff00ff 50%);

            background: var(--gradient), linear-gradient(to bottom, #00000033 0%, transparent 100%);
            border: 4px #dfdfdf outset;

            margin: 4px;
            height: 16px;
        }
        `
    });
})();