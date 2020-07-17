let currentImageCount = 0;

const dataSection = document.getElementById('carouselData');

window.addEventListener("load", () => {
    document.getElementById("save").addEventListener("click", submitForm);
});

function addImage() {
    currentImageCount++;
    let section = document.createElement("section");
    section.setAttribute("id", `img${currentImageCount}`);
    section.setAttribute("class", "input-group mb-3");
    section.setAttribute("data-pid", currentImageCount);
    section.innerHTML += `
                <div class="input-group-prepend">
                    <span class="input-group-text">Image URL</span>
                </div>
                <input class="form-control comp-input" type="url" name="imageLink[${currentImageCount}]" id="imageLink${currentImageCount}" />
                <div class="input-group-prepend">
                    <span class="input-group-text">Image Subtitle (Optional)</span>
                </div>
                <input type="text" class="form-control comp-input" name="imageSubtitle[${currentImageCount}]" id="imageSubtitle${currentImageCount}" />
                <div class="input-group-prepend">
                    <span class="txt-color"><a class="btn btn-outline-secondary btn-danger"
                            onclick="removeImage(${currentImageCount})">Remove</a></span>
                </div>
                <div id="invalid${currentImageCount}" class="invalid-feedback" style="display: none !important;">
                    ;
                </div>
    `;
    dataSection.appendChild(section);
}

function removeImage(imgCount) {
    currentImageCount--;
    document.getElementById("img" + imgCount).remove();
    renumber();
}

function renumber() {
    for (let i in dataSection.children) {
        let section = dataSection.children[i];
        if (isNaN(i)) break;
        if (section.dataset.pid == i) {
            continue;
        }
        let prevNum = section.dataset.pid;
        section.dataset.pid = i;
        section.setAttribute("id", "img" + i);
        document.getElementById("imageLink" + prevNum).setAttribute("name", `imageLink[${i}]`);
        document.getElementById("imageLink" + prevNum).setAttribute("id", `imageLink${i}`);
        document.getElementById("imageSubtitle" + prevNum).setAttribute("name", `imageSubtitle[${i}]`);
        document.getElementById("imageSubtitle" + prevNum).setAttribute("id", `imageSubtitle${i}`);
        document.getElementById("invalid" + prevNum).setAttribute("id", `invalid${i}`);
    }
}

function submitForm(e) {
    renumber();
    e.preventDefault();
    for (let i in dataSection.children) {
        if (isNaN(i)) break;
        let section = dataSection.children[i];
        let prevNum = section.dataset.pid;
        section.dataset.pid = i;
        let imageLink = document.getElementById("imageLink" + prevNum);

        let invalid = document.getElementById("invalid" + i);
        invalid.style.display = "none";

        if (imageLink.value === "") {
            imageLink.setCustomValidity("This field must be filled out!");
            imageLink.setAttribute("class", "form-control comp-input is-invalid");
            invalid.style.display = "block";
            invalid.textContent = imageLink.validationMessage;
        }
        else if (imageLink.validity.valueMissing || imageLink.value === "") {
            imageLink.setCustomValidity("The image must be a valid link!");
            imageLink.setAttribute("class", "form-control comp-input is-invalid");
            invalid.style.display = "block";
            invalid.textContent = imageLink.validationMessage;
        }
        else {
            imageLink.setCustomValidity("");
            imageLink.setAttribute("class", "form-control comp-input is-valid");

        }
    }

    if (document.getElementById("form").checkValidity()) {
        document.getElementById("form").submit();
    }
}

function updateImageCount() {
    if (!isNaN(dataSection.lastElementChild.dataset.pid)) {
        currentImageCount = parseInt(dataSection.lastElementChild.dataset.pid);
    }
}