/**
 * =============[Portfolio CMS]=============
 * This file handles the environment.json file.
 * 
 * Used by:
 * - index.js
 * =============[Portfolio CMS]=============
 */
const fs = require('fs');

var json = JSON.parse(fs.readFileSync("./environment.json", 'utf-8'));

module.exports = {
    web_logo: "/content/" + json['website-settings']['web-site-logo'],
    favicon: "/content/" + json['website-settings']['web-site-favicon'],
    security_settings: json['security-settings'],
    production: json['production']
};