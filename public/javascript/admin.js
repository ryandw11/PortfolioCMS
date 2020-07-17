for (var child of document.getElementById("dropList").children) {
    child.addEventListener("dragstart", handleDragStart, false);
    child.addEventListener("drop", handleDrop, false);
    child.addEventListener('dragover', handleDragOver, false);
}

function handleDragStart(e) {
    //console.log('start');
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }

    if (draggedItem != this) { //MH - swap if we're not dragging the item onto itself
        var parent = this.parentNode,
            insertionPoint, elem = this;

        do {
            elem = elem.nextSibling;
        } while (elem && elem !== draggedItem);

        insertionPoint = elem ? this : this.nextSibling;
        parent.insertBefore(draggedItem, insertionPoint);
        draggedItem = null;
    }

    return false;
}

function submitData() {
    let list = [];
    for (var child of document.getElementById("dropList").children) {
        list.push(child.dataset.pid);
    }
    document.getElementById("compOrder").value = JSON.stringify(list);
    document.getElementById("navform").submit();
}

window.addEventListener("load", () => {
    const url = new URL(location.href);
    const err = url.searchParams.get("success");
    const errorDoc = document.getElementById("page-success");
    if (err == null) return;
    switch (err) {
        case "1":
            errorDoc.getElementsByTagName("span")[0].textContent = "Successfuly updated the navigation bar!";
            errorDoc.style.display = "block";
            break;
    }
});

window.addEventListener("load", () => {
    const url = new URL(location.href);
    const err = url.searchParams.get("err");
    const errorDoc = document.getElementById("page-error");
    if (err == null) return;
    switch (err) {
        case "1":
            errorDoc.getElementsByTagName("span")[0].textContent = "An error has occured when attempting to post the data!";
            errorDoc.style.display = "block";
            break;
        case "2":
            errorDoc.getElementsByTagName("span")[0].textContent = "You must select a page to add!";
            errorDoc.style.display = "block";
            break;
    }
});