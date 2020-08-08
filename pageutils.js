/**
 * =============[Portfolio CMS]=============
 * This script handles page information.
 * 
 * Used By:
 * - index.js
 * =============[Portfolio CMS]=============
 */

/**
 * Represents a web page.
 */
class Page {
    constructor(uuid, name, title, subtitle, link, comp) {
        this.uuid = uuid;
        this.name = name;
        this.title = title;
        this.subtitle = subtitle;
        this.link = link;
        this.comp = comp;
    }
}

async function dataConverter(data, db) {
    let pages = [];
    for (let page of data) {
        let data = await db.all(`SELECT COUNT(id) FROM '${page.uuid}'`);

        pages.push(new Page(page.uuid, page.name, page.title, page.subtitle, page.link, data[0]));
    }
    return pages;
}

module.exports = {
    dataConverter: dataConverter
}