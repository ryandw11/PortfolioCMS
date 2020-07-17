function validateForm() {
    const link = document.getElementById("link");
    link.addEventListener('change', function (event) {
        // reset
        link.classList.remove('is-invalid')
        link.classList.remove('is-valid')

        validLink();

        if (link.checkValidity() === false) {
            input.classList.add('is-invalid')
        }
        else {
            link.classList.add('is-valid')
        }
    }, false);
}

function validLink() {
    if (link.value.length < 2) {
        link.setCustomValitation("The link needs to start with a / and have at least one letter.");
    }
    else if (!link.value.startsWith("/")) {
        link.setCustomValitation("The link needs to start with a '/'")
    }
    else if (link.value.endsWith("/")) {
        link.setCustomValitation("The link cannot end with a '/'. Example Link: '/example/page'");
    }
    else {
        link.setCustomValitation();
    }
}

/**
 * This handles the error ids and displays them!!
 */
window.addEventListener("load", () => {
    const url = new URL(location.href);
    const err = url.searchParams.get("err");
    const errorDoc = document.getElementById("page-error");
    if (err == null) return;
    switch (err) {
        case "1":
            errorDoc.getElementsByTagName("span")[0].textContent = "Error: A page with that link already exists!";
            errorDoc.style.display = "block";
            break;
        case "2":
            errorDoc.getElementsByTagName("span")[0].textContent = "Error: Pages require a name to be created!";
            errorDoc.style.display = "block";
            break;
        case "3":
            errorDoc.getElementsByTagName("span")[0].textContent = "Error: The link you provided is not valid!";
            errorDoc.style.display = "block";
            break;
        case "4":
            errorDoc.getElementsByTagName("span")[0].textContent = "Error: Cannot delete that page: invalid UUID!";
            errorDoc.style.display = "block";
            break;
        case "5":
            errorDoc.getElementsByTagName("span")[0].textContent = "Error: You cannot delete the index page!";
            errorDoc.style.display = "block";
            break;
    }
});

/**
 * Make the delete button for index unclickable
 */
window.addEventListener("load", () => {
    const myID = document.getElementById("del-index0");
    myID.insertAdjacentHTML("afterend", `<span class="card-link disable-tooltip" tabindex="0" data-toggle="tooltip" data-placement="bottom"
    title="This page cannot be deleted!">
    <a href="/admin/pages/index0" class="card-link text-danger disable">Delete</a>
</span>`);
    myID.remove();
});

/**
 * Go submit the deletion data to the server.
 * @param {String} uuid The pid of the page.
 */
function submitForm(uuid) {
    const dataPost = document.getElementById("delete");
    dataPost.value = uuid;
    const deleteForm = document.getElementById("del-form");
    deleteForm.submit();
}