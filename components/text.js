var MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();

class Text {
    /**
     * The name displayed to the user.
     */
    getName() {
        return "Text";
    }

    /**
     * The tech name used in the database (No Spaces)
     */
    getTechName() {
        return "txt";
    }

    /**
     * Create a component from the POST data provided.
     * @param {*} responseBody The response body from the express request.
     * @returns The data to be placed inside of the componentData slot in the storage table.
     */
    createComponent(req, response) {
        const text = req.body.text;
        if (text.length < 1) {
            return null;
        }
        return text;
    }

    /**
     * What is displayed on the component preview.
     * @param {String} componentData The component data.
     * @returns The string to display.
     */
    getPreview(componentData) {
        return componentData.substring(0, 20) + "...";
    }

    /**
     * Turn the componenetData string into a JSON objects to be displayed on the
     * edit page. 
     * @param {String} componentData The component data from the table.
     * @returns The JSON data (or whatever format the data should be in.)
     */
    getEditComponentData(componentData) {
        return componentData;
    }

    /**
     * Take the data from the edit page and turn it into a string to be stored.
     * @param {*} body The body.
     * @param {*} response The response.
     * @returns The string or null if invalid.
     */
    editComponentData(req, response) {
        const text = req.body.text;
        if (text.length < 1) {
            return null;
        }
        return text;
    }

    /**
     * Take the data from the componentData (in the page table) and turn it into something to be displayed on your component partial.
     * @param {String} componentData The component data in string from.
     * @return The data in what ever from you need it to be in for your partial.
     */
    getComponentData(componentData) {
        return md.render(componentData);
    }

    /**
     * Get the upload type for mutler.
     * @param {*} upload The upload field.
     */
    getUploadtype(upload) {
        return upload.none();
    }
}

module.exports = Text;