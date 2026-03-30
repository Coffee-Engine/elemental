//Small unfancy script to do this s*$#!

const elements = {
    "color-picker": "dist/colorPicker.js",
    "ambient-video": "dist/ambientVideo.js",
}

const checkboxes = {}

const elementContainer = document.getElementById("elementContainer");

for (let tag in elements) {
    const url = elements[tag];
    
    //Create the actual dom part and append it
    const text = document.createElement("p");
    const checkbox = document.createElement("input");

    checkbox.checked = true;

    //Add them to the dom
    text.innerText = `${tag} : `;
    text.appendChild(checkbox);
    elementContainer.appendChild(text);

    //then add them to the list
    checkbox.type = "checkbox";
    checkboxes[url] = checkbox;
}

document.getElementById("download").onclick = () => {
    const toDownload = [
        "dist/elemental.js"
    ];

    for (let url in checkboxes) {
        let checkbox = checkboxes[url];
        if (checkbox.checked) toDownload.push(url);
    }

    let compiled = "";
    (new Promise(async (resolve) => {
        for (let urlID in toDownload) {
            const code = await fetch(toDownload[urlID]).then(res => res.text());
            compiled += `/*  ${Number(urlID) + 1} : ${toDownload[urlID]}  */\n{\n${code}\n}\n`;
        }

        resolve();
    })).then(() => {
        console.log(compiled);
    })
}