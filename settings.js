const fs = require('fs');

var json = JSON.parse(fs.readFileSync("./environment.json", 'utf-8'));

module.exports = {
    web_logo: json['website-settings']['web-site-logo']
};