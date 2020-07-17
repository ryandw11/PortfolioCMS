/**
 * 
 * Code for the drop box.
 * 
 */
const dropContainers = document.getElementsByClassName("upload-box");
for (let container of dropContainers) {
    container.ondragover = container.ondropenter = evt => {
        evt.preventDefault();
        evt.stopPropagation();
    }
    var parentNode = container.parentNode;
    container.ondrop = evt => {
        evt.preventDefault();
        var fileUploader = evt.target.parentNode.querySelector("#files");
        let list = new DataTransfer();
        for (let file of fileUploader.files) {
            list.items.add(file);
        }
        for (let file of evt.dataTransfer.files) {
            list.items.add(file);
        }
        fileUploader.files = list.files;
        updateFileChange(fileUploader, evt.target.parentNode.querySelector(".file-display"));
    };
    parentNode.querySelector(".uploader").onclick = evt => {
        var fileUploader = evt.target.parentNode.querySelector("#files");
        let tempUpload = document.createElement("input");
        tempUpload.type = 'file';
        tempUpload.setAttribute("multiple", "multiple");
        tempUpload.click();
        tempUpload.onchange = () => {
            let list = new DataTransfer();
            for (let file of fileUploader.files) {
                list.items.add(file);
            }
            console.log(tempUpload.files);
            for (let file of tempUpload.files) {
                list.items.add(file);
            }
            fileUploader.files = list.files;
            updateFileChange(fileUploader, evt.target.parentNode.querySelector(".file-display"));

        };
    }
}

/**
 * Update the list of files.
 * @param {Element} fileUploader The file uploader
 * @param {Element} div The div.
 */
function updateFileChange(fileUploader, div) {
    div.innerHTML = "<p>Uploaded Files:</p>";
    for (let file of fileUploader.files) {
        let p = document.createElement("p");
        p.setAttribute("class", "container");
        p.appendChild(document.createTextNode(file.name));
        let anc = document.createElement("a");
        anc.addEventListener("click", evt => {
            let list = new DataTransfer();
            let findFile = file.name;
            for (let file of fileUploader.files) {
                if (file.name == findFile)
                    continue;
                list.items.add(file);
            }
            fileUploader.files = list.files;
            updateFileChange(fileUploader, div);
        });
        anc.setAttribute("class", "deleteFile");
        anc.appendChild(document.createTextNode(`    x`));
        anc.style.color = 'red';
        p.appendChild(anc);
        div.appendChild(p);
    }
}

/**
 *
 *==================================================
 * This regards to the switching of the input type.
 *==================================================
 *
 */

const image = document.getElementById("image");
const imageLink = document.getElementById("imageLink");
const youtube = document.getElementById("youtube");
const compressed = document.getElementById("zip");
deselectOthers('');

document.getElementById("imageR").onchange = evt => {
    if (evt.target.checked) {
        image.style.display = 'block';
        deselectOthers("image");
    }
}

document.getElementById("imageLinkR").onchange = evt => {
    if (evt.target.checked) {
        imageLink.style.display = 'block';
        deselectOthers("imageLink");
    }
}

document.getElementById("youtubeR").onchange = evt => {
    if (evt.target.checked) {
        youtube.style.display = 'block';
        deselectOthers("youtube");
    }
}

document.getElementById("zipR").onchange = evt => {
    if (evt.target.checked) {
        compressed.style.display = 'block';
        deselectOthers("zip");
    }
}

function deselectOthers(currentSelection) {
    if (currentSelection != 'image') {
        image.style.display = 'none';
        image.querySelector('#files').files = new DataTransfer().files;
        image.getElementsByClassName('file-display')[0].innerHTML = "";
    }
    if (currentSelection != 'imageLink') {
        imageLink.style.display = 'none';
    }
    if (currentSelection != 'youtube') {
        youtube.style.display = 'none';
    }
    if (currentSelection != 'zip') {
        compressed.style.display = 'none';
        compressed.querySelector('#files').files = new DataTransfer().files;
        compressed.getElementsByClassName('file-display')[0].innerHTML = "";
    }
}

/**
 *
 * Validator.
 * Check the validation of the form.
 *
 */
var form = document.getElementById('addContent');
form.addEventListener('submit', evt => {
    checkValidity();
    if (form.checkValidity() === false) {
        evt.preventDefault();
        evt.stopPropagation();
    }
});

function checkValidity() {
    for (let txt of document.getElementsByClassName('invalid-feedback')) {
        txt.innerHTML = "";
    }

    if (document.getElementById("imageR").checked) {
        checkImageValidity(form);
    } else if (document.getElementById("imageLinkR").checked) {
        checkImageLinkValidity(form);
    } else if (document.getElementById("youtubeR").checked) {
        checkYoutubeValidity(form);
    } else if (document.getElementById("zipR").checked) {
        checkZIPValidity(form);
    } else {
    }
}

function checkImageValidity() {
    let file = document.querySelector("#image>#files");
    if (file.files.length < 1) {
        document.querySelector("#image>.invalid-feedback").innerHTML = "Please upload at least one file!";
        file.setCustomValidity("Please upload at least one file!");
        return;
    }

    for (let f of file.files) {
        if (!/\.(jpe?g|png|gif)$/i.test(f.name.trim())) {
            document.querySelector("#image>.invalid-feedback").innerHTML = "A file you uploaded is not an image!";
            file.setCustomValidity("A file you uploaded is not an image!");
            return;
        }
    }
    file.setCustomValidity();
    file.classList.replace("is-invalid", "");
    file.classList += "is-valid";
    document.querySelector("#image>.invalid-feedback").innerHTML = "";
}

function checkImageLinkValidity() {
    let link = document.querySelector("#imageLink>#imgLink");
    let name = document.querySelector("#imageLink>#imgName");
    if (name.value.trim().length < 3) {
        document.querySelector("#imageLink>.invalid-feedback").innerHTML = "The name needs to be longer than 2 characters.";
        name.setCustomValidity("The name needs to be longer than 2 characters.");
        name.classList = name.classList.replace("is-invalid", "");
        name.classList = name.classList.replace("is-valid", "");
        name.classList += "is-invalid";
        return;
    } else {
        name.classList = name.classList.replace("is-invalid", "");
        name.classList = name.classList.replace("is-valid", "");
        name.classList += "is-valid";
    }
    if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(link.value.trim())) {
        document.querySelector("#imageLink>.invalid-feedback").innerHTML = "That is not a valid link!";
        link.setCustomValidity("That is not a valid link.");
        link.classList = link.classList.replace("is-invalid", "");
        link.classList = link.classList.replace("is-valid", "");
        link.classList += "is-invalid";
        return;
    } else {
        link.classList = link.classList.replace("is-invalid", "");
        link.classList = link.classList.replace("is-valid", "");
        link.classList += "is-valid";
    }
    name.setCustomValidity();
    link.setCustomValidity();
}

function checkYoutubeValidity() {

}

function checkZIPValidity() {
    let file = document.querySelector("#zip>#files");
    if (file.files.length < 1) {
        document.querySelector("#zip>.invalid-feedback").innerHTML = "Please upload at least one file!";
        file.setCustomValidity("Please upload at least one file!");
        return;
    }

    for (let f of file.files) {
        if (!/\.(zip|tar.gz|.tgz)$/i.test(f.name.trim())) {
            document.querySelector("#zip>.invalid-feedback").innerHTML = "A file you uploaded is not a compressed file!";
            file.setCustomValidity("A file you uploaded is not a compressed file!");
            return;
        }
    }
    file.setCustomValidity();
}