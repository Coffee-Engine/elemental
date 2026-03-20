(function() {
    elemental.ambientVideoConfig = {
        sizeDivider: 5,
        videos: []
    };

    elemental.newElement("Ambient Video", {
        class: class extends HTMLElement {
            static observedAttributes = [
                //From the basic <video element>
                "src", 
                "autoplay", 
                "controls", 
                "controlsList", 
                "crossorigin", 
                "disablepictureinpicture", 
                "disableremoteplayback",
                "speed"
            ];

            #video;
            #canvas;
            #gl;
            #resizeObserver;

            _updateSpeed() {
                let speed = Number(this.getAttribute("fadespeed"));
                if (isNaN(speed)) speed = 1;

                this.fadeSpeed = speed;
            }

            constructor() {
                super();
                
                this.#video = document.createElement("video");
                this.#canvas = document.createElement("canvas");

                this.#gl = this.#canvas.getContext("2d");
                this.#video.src = this.getAttribute("src");

                setInterval(() => {
                    this.#gl.globalAlpha = Math.max(Math.min(1, this.fadeSpeed * this.delta), 0);
                    console.log(this.fadeSpeed);
                    this.#gl.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
                }, 1/60);

                this.#resizeObserver = new ResizeObserver(() => {
                    this.#canvas.width = Math.floor(this.#video.videoWidth / elemental.ambientVideoConfig.sizeDivider);
                    this.#canvas.height = Math.floor(this.#video.videoHeight / elemental.ambientVideoConfig.sizeDivider);
                    this.#canvas.style.setProperty("--width", `${this.#video.width || this.#video.videowidth}px`);
                    this.#canvas.style.setProperty("--height", `${this.#video.height || this.#video.videoHeight}px`);
                });

                this.#resizeObserver.observe(document.body);
                this.#resizeObserver.observe(this);
                this.#resizeObserver.observe(this.#video);
            }

            syncAttribs() {
                const attribs = this.getAttributeNames();
                for (let attribID=0;attribID<attribs.length;attribID++) {
                    const attrib = attribs[attribID];
                    this.#video.setAttribute(attrib, this.getAttribute(attrib));
                }
            }

            connectedCallback() {
                this.appendChild(this.#canvas);
                this.appendChild(this.#video);

                this.syncAttribs();
                this._updateSpeed();
                elemental.ambientVideoConfig.videos.push(this);
            }

            disconnectedCallback() {
                const index = elemental.ambientVideoConfig.videos.indexOf(this);
                if (index != -1) elemental.ambientVideoConfig.videos.splice(index, 1);
            }

            attributeChangedCallback(name, old, value) {
                this.syncAttribs()

                console.log(name);
                if (name == "fadespeed") {
                    this._updateSpeed();
                }
            }
        },

        css: `
            <el> > canvas {
                position: absolute;

                width: var(--width);
                height: var(--height);

                filter: blur(3vmin);
                z-index: -100;
            }

            <el> > video {
                position: relative;
            }
        `
    });

    let last = performance.now();
    const loop = () => {
        window.requestAnimationFrame(loop);

        const dt = (performance.now() - last) / 1000;
        last = performance.now();

        const videos = elemental.ambientVideoConfig.videos;
        for (let i=0;i<videos.length;i++) {
            videos[i].delta = dt;
        }
    }

    window.requestAnimationFrame(loop);
})();