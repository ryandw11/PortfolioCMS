class Gallery {
    /**
     * The name displayed to the user.
     */
    getName() {
        return "Image Gallery";
    }

    /**
     * The tech name used in the database (No Spaces)
     */
    getTechName() {
        return "gallery";
    }

    /**
     * Create a component from the POST data provided.
     * @param {*} responseBody The response body from the express request.
     * @returns The data to be placed inside of the componentData slot in the storage table.
     */
    createComponent(req, response) {
        if (req.body.gallery == null)
            return null;
        let gallery = req.body.gallery;
        let output = [];
        for (let i in gallery) {
            if (isNaN(i)) break;
            let imageLink = gallery[i][0];
            let imageTitle = gallery[i][1];
            let imageText = gallery[i][2];
            let urlLink = gallery[i][3];
            let urlText = gallery[i][4];

            if (imageLink == null || imageLink == "") return null;
            if (imageTitle == null || imageTitle == "") return null;
            if (imageText == null) return null;
            if (urlLink == null || urlText == null) return null;
            if ((urlLink != "" && urlText == "") || (urlLink == "" && urlText != "")) return null;

            output.push({
                imageLink: imageLink,
                imageTitle: imageTitle,
                imageText: imageText,
                urlLink: urlLink,
                urlText: urlText
            });
        }

        return JSON.stringify(output);
    }

    /**
     * What is displayed on the component preview.
     * @param {String} componentData The component data.
     * @returns The string to display.
     */
    getPreview(componentData) {
        return `${JSON.parse(componentData).length} images.`;
    }

    /**
     * Turn the componenetData string into a JSON objects to be displayed on the
     * edit page. 
     * @param {String} componentData The component data from the table.
     * @returns The JSON data (or whatever format the data should be in.)
     */
    getEditComponentData(componentData) {
        return JSON.parse(componentData);
    }

    /**
     * Take the data from the edit page and turn it into a string to be stored.
     * @param {*} body The body.
     * @param {*} response The response.
     * @returns The string or null if invalid.
     */
    editComponentData(req, response) {
        if (req.body.gallery == null)
            return null;
        let gallery = req.body.gallery;
        let output = [];
        for (let i in gallery) {
            if (isNaN(i)) break;
            let imageLink = gallery[i][0];
            let imageTitle = gallery[i][1];
            let imageText = gallery[i][2];
            let urlLink = gallery[i][3];
            let urlText = gallery[i][4];

            if (imageLink == null || imageLink == "") return null;
            if (imageTitle == null || imageTitle == "") return null;
            if (imageText == null) return null;
            if (urlLink == null || urlText == null) return null;
            if ((urlLink != "" && urlText == "") || (urlLink == "" && urlText != "")) return null;

            output.push({
                imageLink: imageLink,
                imageTitle: imageTitle,
                imageText: imageText,
                urlLink: urlLink,
                urlText: urlText
            });
        }

        return JSON.stringify(output);
    }

    /**
     * Take the data from the componentData (in the page table) and turn it into something to be displayed on your component partial.
     * @param {String} componentData The component data in string from.
     * @return The data in what ever from you need it to be in for your partial.
     */
    getComponentData(componentData) {
        return JSON.parse(componentData);
    }
}

module.exports = Gallery;