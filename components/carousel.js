class Carousel {
    /**
     * The name displayed to the user.
     */
    getName() {
        return "Carousel";
    }

    /**
     * The tech name used in the database (No Spaces)
     */
    getTechName() {
        return "slider";
    }

    /**
     * Create a component from the POST data provided.
     * @param {*} responseBody The response body from the express request.
     * @returns The data to be placed inside of the componentData slot in the storage table.
     */
    createComponent(req, response) {
        let imageLinks = req.body.imageLink;
        let imageSubtitles = req.body.imageSubtitle;
        if (imageLinks == null || imageSubtitles == null || imageLinks.length !== imageSubtitles.length) {
            return null;
        }
        let data = [];
        for (let i in imageLinks) {
            data.push({
                image: imageLinks[i],
                subtitle: imageSubtitles[i]
            });
        }
        return JSON.stringify(data);
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
        let imageLinks = req.body.imageLink;
        let imageSubtitles = req.body.imageSubtitle;
        if (imageLinks == null || imageSubtitles == null || imageLinks.length !== imageSubtitles.length) {
            return null;
        }
        let data = [];
        for (let i in imageLinks) {
            data.push({
                image: imageLinks[i],
                subtitle: imageSubtitles[i]
            });
        }
        return JSON.stringify(data);
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

module.exports = Carousel;