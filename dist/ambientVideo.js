(function() {
    elemental.ambientVideoConfig = {
        sizeDivider: 10,
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
                "width",
                "height",
                "playsinline",
                "muted",
                "poster",
                "preload",
                "fadespeed"
            ];

            #video;
            #canvas;
            #gl;
            #resizeObserver;

            get video() {
                return this.#video;
            }

            _updateSpeed() {
                let speed = Number(this.getAttribute("fadespeed"));
                if (isNaN(speed)) speed = 1;

                this.fadeSpeed = speed;
            }

            updateFade(dt) {
                this.#gl.globalAlpha = Math.max(Math.min(1, this.fadeSpeed * dt), 0);
                this.#gl.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
            }

            constructor() {
                super();
                
                this.#video = document.createElement("video");
                this.#canvas = document.createElement("canvas");

                this.#gl = this.#canvas.getContext("2d");
                this.#video.src = this.getAttribute("src");

                this.#resizeObserver = new ResizeObserver(() => {
                    const { width, height } = this.#video.getBoundingClientRect();
                    this.#canvas.width = Math.max(1, Math.ceil(width / elemental.ambientVideoConfig.sizeDivider));
                    this.#canvas.height = Math.max(1, Math.ceil(height / elemental.ambientVideoConfig.sizeDivider));

                    this.#canvas.style.setProperty("--width", `${width}px`);
                    this.#canvas.style.setProperty("--height", `${height}px`);
                });

                this.#resizeObserver.observe(document.body);
                this.#resizeObserver.observe(this);
                this.#resizeObserver.observe(this.#video);
            }


            syncAttribs() {
                const attribs = this.getAttributeNames();
                //Sync values between elements
                for (let attribID=0;attribID<attribs.length;attribID++) {
                    //Make sure the values aren't the same
                    const attrib = attribs[attribID];
                    const newValue = this.getAttribute(attrib);
                    const oldValue = this.#video.getAttribute(attrib);

                    if (oldValue != newValue) this.#video.setAttribute(attrib, newValue);
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
                this.syncAttribs();

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
                mix-blend-mode: lighten;
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
            videos[i].updateFade(dt);
        }
    }

    window.requestAnimationFrame(loop);
})();