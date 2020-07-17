let currentImageCount = 0;

const dataSection = document.getElementById('carouselData');

window.addEventListener("load", () => {
    document.getElementById("save").addEventListener("click", submitForm);
});

function addImage() {
    currentImageCount++;
    let section = document.createElement("section");
    section.setAttribute("id", `img${currentImageCount}`);
    section.setAttribute("class", "mb-3");
    section.setAttribute("data-pid", currentImageCount);
    section.innerHTML += `
    <section class="input-group">
    <div class="input-group-prepend">
        <span class="input-group-text">Image URL</span>
    </div>
    <input class="form-control comp-input" type="url" name="gallery[${currentImageCount}][0]" id="imageLink${currentImageCount}" required />
    <div class="input-group-prepend">
        <span class="input-group-text">Image Title</span>
    </div>
    <input type="text" class="form-control comp-input" name="gallery[${currentImageCount}][1]" id="imageTitle${currentImageCount}" required />
    <div class="input-group-prepend">
        <span class="txt-color"><a class="btn btn-outline-secondary btn-danger"
                onclick="removeImage(${currentImageCount})">Remove</a></span>
    </div>
</section>
<textarea name="gallery[${currentImageCount}][2]" id="imageText${currentImageCount}" class="form-control comp-input"></textarea>
<section class="input-group">
    <div class="input-group-prepend">
        <span class="input-group-text">Link URL</span>
    </div>
    <input class="form-control comp-input" type="text" name="gallery[${currentImageCount}][3]" id="linkURL${currentImageCount}" />
    <div class="input-group-prepend">
        <span class="input-group-text">Link Text</span>
    </div>
    <input type="text" class="form-control comp-input" name="gallery[${currentImageCount}][4]" id="linkText${currentImageCount}" />
</section>
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
        document.getElementById("imageLink" + prevNum).setAttribute("name", `gallery[${i}][0]`);
        document.getElementById("imageLink" + prevNum).setAttribute("id", `imageLink${i}`);
        document.getElementById("imageTitle" + prevNum).setAttribute("name", `gallery[${i}][1]`);
        document.getElementById("imageTitle" + prevNum).setAttribute("id", `imageTitle${i}`);
        document.getElementById("imageText" + prevNum).setAttribute("name", `gallery[${i}][2]`);
        document.getElementById("imageText" + prevNum).setAttribute("id", `imageText${i}`);
        document.getElementById("linkURL" + prevNum).setAttribute("name", `gallery[${i}][3]`);
        document.getElementById("linkURL" + prevNum).setAttribute("id", `linkURL${i}`);
        document.getElementById("linkText" + prevNum).setAttribute("name", `gallery[${i}][4]`);
        document.getElementById("linkText" + prevNum).setAttribute("id", `linkText${i}`);
        document.getElementById("invalid" + prevNum).setAttribute("id", `invalid${i}`);
    }
}

function submitForm(e) {
    renumber();
    e.preventDefault();
    for (let i in dataSection.children) {
        if (isNaN(i)) break;
        let section = dataSection.children[i];

        let imageLink = document.getElementById("imageLink" + i);
        let imageTitle = document.getElementById("imageTitle" + i);
        let linkURL = document.getElementById("linkURL" + i);
        let linkText = document.getElementById("linkText" + i);

        let invalid = document.getElementById("invalid" + i);
        invalid.style.display = "none";

        if (imageLink.validity.valueMissing || imageLink.value === "") {
            imageLink.setCustomValidity("Please enter a valid url!");
            imageLink.setAttribute("class", "form-control comp-input is-invalid");
            invalid.style.display = "block";
            invalid.textContent = imageLink.validationMessage;
        }
        else {
            imageLink.setCustomValidity("");
            imageLink.setAttribute("class", "form-control comp-input is-valid");
        }

        if (imageTitle.validity.valueMissing || imageTitle.value === "") {
            imageTitle.setCustomValidity("Please enter in a title!");
            imageTitle.setAttribute("class", "form-control comp-input is-invalid");
            invalid.style.display = "block";
            invalid.textContent = imageTitle.validationMessage;
        }
        else {
            imageTitle.setCustomValidity("");
            imageTitle.setAttribute("class", "form-control comp-input is-valid");
        }

        // Check to see if both the linkText and the linkURL boxes are filled out.
        if ((linkURL.validity.valueMissing && linkURL.value === "") && (!linkText.validity.valueMissing && linkText.value !== "")) {
            linkURL.setCustomValidity("Please input in the link URL!");
            linkURL.setAttribute("class", "form-control comp-input is-invalid");
            invalid.style.display = "block";
            invalid.textContent = linkURL.validationMessage;
        }
        else if ((!linkURL.validity.valueMissing && linkURL.value !== "") && (linkText.validity.valueMissing && linkText.value === "")) {
            linkText.setCustomValidity("Please enter in the link text!");
            linkText.setAttribute("class", "form-control comp-input is-invalid");
            invalid.style.display = "block";
            invalid.textContent = linkText.validationMessage;
        }
        else {
            linkURL.setCustomValidity("");
            linkURL.setAttribute("class", "form-control comp-input is-valid");
            linkText.setCustomValidity("");
            linkText.setAttribute("class", "form-control comp-input is-valid");
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