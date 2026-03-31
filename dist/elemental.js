//Elemental, the quick and dirty way to define HTML elements using JS;
(function() {
    let defaultCSS = "";
    window.elemental = {
        elements: {},

        newElement: (name, options) => {
            if (!name || !options) return;

            //Define the new element
            let definedElement = class extends HTMLElement {};
            if (!options.class) {
                definedElement = class extends HTMLElement {

                    constructor() { super(); this.created(this); }

                    adoptedCallback() { this.adopted(this, this.parentElement != null, this.parentElement); }
                    
                    attributeChangedCallback(name, oldValue, newValue) { this.attributeChanged(this, name, oldValue, newValue); }

                    created() {}
                    adopted(added, parentElement) {}
                    attributeChanged() {}
                };

                if (options.created) definedElement.prototype.created = options.created;
                if (options.adopted) definedElement.prototype.adopted = options.adopted;
                if (options.attributeChanged) definedElement.prototype.attributeChanged = options.attributeChanged;
                if (options.attributes) definedElement.prototype.observedAttributes = options.attributes;
            }
            else definedElement = options.class;

            //Get the safe name and css prefix
            const safeName = name.toLowerCase().replaceAll(/\s/g, "-");
            options.prefix = options.prefix || `elemental-${safeName}-`;
            definedElement.prototype.cssPrefix = options.prefix;

            //Add css is available
            if (options.css) {
                defaultCSS += `\n/*${name}*/\n${options.css
                    .replaceAll("<el>", safeName)
                    .replaceAll("<element-name>", safeName)
                    .replaceAll("<pr>", `.${options.prefix}`)
                    .replaceAll("<prefix>", `.${options.prefix}`)
                }`;
                elemental.styleElement.innerHTML = defaultCSS;
            }
            
            customElements.define(safeName, definedElement, {
                extends: options.extends
            });

            //Add entries for the desired name and the safe name;
            elemental.elements[name] = definedElement;
            elemental.elements[safeName] = definedElement;

            return definedElement;
        },

        DOMParser: new DOMParser(),
        //Just in case.
        badElements: [
            "script",
            "foreignobject",
            "style",
            "link",
            "iframe",
            "embed",
            "title"
        ],

        sanitizeDOM: (svg) => {
            //Make sure the DOM is valid;
            let DOM = elemental.DOMParser.parseFromString(`<elementalSanitizer>${svg}</elementalSanitizer>`, "application/xml");
            if (DOM.documentElement.tagName == "parsererror") return "<p>Invalid DOM</p>";

            //Search through children, and give the final result
            const children = [...DOM.querySelectorAll("*")];
            for (let childID = 0; childID < children.length; childID++) {
                const child = children[childID];
                if (elemental.badElements.includes(child.tagName.toLowerCase())) child.parentElement.removeChild(child);

                //Search through attributes
                const names = child.getAttributeNames();
                for (let attributeID = 0; attributeID < names.length; attributeID++) {
                    const attribute = names[attributeID];

                    //If possibly an event
                    if (attribute.startsWith("on")) child.removeAttribute(attribute);
                    //If we have any odd values, like a "javascript:" uri
                    else {
                        const data = child.getAttribute(attribute);
                        if (data.startsWith("javascript:")) child.removeAttribute(attribute);
                    }
                }
            }

            //Return the final sanitized HTML
            return DOM.documentElement.innerHTML;
        }
    }

    elemental.styleElement = document.createElement("style");
    document.head.appendChild(elemental.styleElement);
})();