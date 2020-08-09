/**
 * ==============================[Portfolio CMS]==============================
 * This is the primary file for PortfolioCMS.
 * 
 * PotfolioCMS Project layout:
 * 
 * PortfolioCMS                 | The main folder for the code.
 *   ├ components/              | Stores component javascript files.
 *   ├ public/                  | Stores content for the website.
 *   │  ├ css/                  | Stores the css for the website.
 *   │  ├ images/               | Stores images for the website. (Logo goes here.)
 *   │  ├ javascript/           | Stores client javascript for the website.
 *   │  ┕ theme.css             | The file that defines the color theme for the website.
 *   ├ routes/                  | Contains specific page routes (Ex. admin and pages.)
 *   ┕ views/                   | Contains the handlebar files.
 *      ┕ partials/             | Portions of a web page.
 *         ├ add_component/     | HBS files for adding a component.
 *         ├ components/        | HBS files for viewing components.
 *         ┕ edit_component/    | HBS files for editing a component.
 * 
 *   
 * Version: 1.0.0-BETA-RC2
 * 
 * ==============================[Portfolio CMS]==============================
 */

/**
* ===================================================================================
* 
*                                      Components
*
*                           Register custom components here.
*             Please ensure that you have creation, editing, and viewing hbs
*     files in the ./views/partials/add_component, ./views/partials/edit_component,
*     and ./views/partials/components directories. (The name of the file must match
*                  the components offical name [Not display name!])
*
* ===================================================================================
*/
const compManager = require('./components/componentmanager.js');
const ComponentManager = new compManager();

const Text = require('./components/text.js');
ComponentManager.addComponent(new Text());

const Carousel = require('./components/carousel.js');
ComponentManager.addComponent(new Carousel());

const Gallery = require('./components/gallery.js');
ComponentManager.addComponent(new Gallery());

/**
 * ====================================================================================
 * 
 *             End of Components
 * 
 * ====================================================================================
 */


const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
const fs = require('fs');
const md5 = require('md5');
const { v4: uuid } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const sqlString = require('sqlstring');
const compression = require('compression');
const helmet = require('helmet');

// Grab the version information.
const version = require('./version.js');


/**
* 
* Account Settings
* 
*/
const accounts = require('./accounts.js');

const settings = require('./settings.js');

// Console color codes.
const purple = "\u001b[35m";
const red = "\u001b[31m";
const green = "\u001b[32m";
const yellow = "\u001b[33m";
const end = "\u001b[39m";
const reset = "\u001b[0m";

console.log(`${purple}[PortfolioCMS]${end} Starting up PortfolioCMS v${version.getVersionString()}`);


const app = express();

/*
    Setup the server using http or https.
*/
if (settings.security_settings.protocol == "http") {
    const http = require('http');
    var httpServer = http.createServer(app);
    httpServer.listen(settings.security_settings.port, () => {
        console.log(`${purple}[PortfolioCMS]${end} ${yellow}WARNING: Please use the https protocol on a production server.`);
        console.log(`${purple}[PortfolioCMS]${end} ${green}PortfolioCMS is online running off of port ${settings.security_settings.port}.`);
    });
}
else if (settings.security_settings.protocol == "https") {
    const https = require('https');
    let privateKey;
    let certificate;
    try {
        privateKey = fs.readFileSync(settings.security_settings["private-certificate"], 'utf8');
        certificate = fs.readFileSync(settings.security_settings["public-certificate"], 'utf8');
    } catch (ex) {
        console.log(`${red}[PortfolioCMS]${end} ${yellow}ERROR: Cannot read/find private/public key. Does PortfolioCMS have permission to read those files?`);
        process.exit(1);
    }

    var credentials = { key: privateKey, cert: certificate };
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(settings.security_settings.port, () => {
        console.log(`${purple}[PortfolioCMS]${end} ${green}PortfolioCMS is online running off of port ${settings.security_settings.port}.`);
    });
} else {
    console.log(`${red}[PortfolioCMS]${end} ${yellow}ERROR: Invalid protocol in the environment.json file.`);
    process.exit(1);
}

/*
    Add the public directory.
    TODO: change '/' to '/content' or something similar.
*/

app.use('/', express.static(__dirname + '/public'));

const hbs = require('express-handlebars')({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        static(path) {
            return path;
        },
        escapeJSString(str) {
            if (!str) {
                return null;
            }
            return jsesc(str, {
                escapeEverything: true,
                wrap: true
            });
        },
        ifEq(a, b, opts) {
            if (a == b)
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        rmvNum(a) {
            return a.replace(/[^\w]/g, '').replace(/[0-9]/g, '');
        }
    }
});

app.use(helmet());

app.engine('hbs', hbs);
app.set('view engine', 'hbs');

/*
    If in production mode, then enable the view cache.
*/
if (settings.production) {
    app.enable('view cache');
    app.use(compression());
    console.log(`${purple}[PortfolioCMS]${end} Production mode detected. Enabling page cache.`);
}

app.use(session({
    secret: 'a^3J75H8v-6Jfjsc&3+mca**fj4$$mcsjiog#4$',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * 
 * Database Creation.
 * 
 */
const pageUtils = require('./pageutils.js')

var pagesExists = fs.existsSync('pages.db');
const pages = new sqlite3.Database('pages.db');

/**
 * If the data base does not exist, then create it.
 */
if (!pagesExists) {
    console.log(`${purple}[PortfolioCMS]${end} No database detected. Creating default database.`);
    pages.serialize(() => {
        /*
            Setup the database version table.
        */
        pages.run(`CREATE TABLE IF NOT EXISTS sysver (
            id INTEGER PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            data VARCHAR(50) NOT NULL
        )`);
        pages.run(`INSERT INTO sysver (name, data) VALUES ($name, $data)`, {
            $name: "major",
            $data: version.major
        });
        pages.run(`INSERT INTO sysver (name, data) VALUES ($name, $data)`, {
            $name: "minor",
            $data: version.minor
        });
        pages.run(`INSERT INTO sysver (name, data) VALUES ($name, $data)`, {
            $name: "bug",
            $data: version.bug
        });
        pages.run(`INSERT INTO sysver (name, data) VALUES ($name, $data)`, {
            $name: "suffix",
            $data: version.suffix
        });
        /*
            Setup the versions table.
        */
        pages.run(`CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY,
            uuid TEXT NOT NULL,
            name VARCHAR(50) NOT NULL,
            title VARCHAR(50) NOT NULL,
            subtitle VARCHAR(50) NOT NULL,
            link VARCHAR(100) NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        pages.run(`INSERT INTO pages (uuid, name, title, subtitle, link) VALUES ($uuid, $name, $title, $subtitle, $link)`, {
            $uuid: "index0",
            $name: "Home Page",
            $title: "PortfolioCMS",
            $subtitle: "PortfolioCMS",
            $link: "/"
        });
        pages.run(`CREATE TABLE IF NOT EXISTS index0 (
            id INTEGER PRIMARY KEY,
            uuid TEXT NOT NULL,
            compOrder INTEGER NOT NULL,
            componentType VARCHAR(50) NOT NULL,
            componentData TEXT NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        pages.run(`CREATE TABLE IF NOT EXISTS navigation (
            id INTEGER PRIMARY KEY,
            uuid TEXT NOT NULL,
            compOrder INTEGER NOT NULL,
            name VARCHAR(50) NOT NULL,
            title VARCHAR(50) NOT NULL,
            subtitle VARCHAR(50) NOT NULL,
            link VARCHAR(100) NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        pages.run(`INSERT INTO navigation (uuid, compOrder, name, title, subtitle, link) VALUES ($uuid, $compOrder, $name, $title, $subtitle, $link)`, {
            $uuid: "index0",
            $compOrder: 0,
            $name: "Home Page",
            $title: "PortfolioCMS",
            $subtitle: "PortfolioCMS",
            $link: "/"
        }, () => {
            console.log(`${purple}[PortfolioCMS]${end} Successfully created default database.`);
        });
    });
}

// The admin route.
const admin = require('./routes/admin.js');
app.use('/admin', admin(version, accounts, settings, pages, md5, uuid));

// The page route.
const pagesRoute = require("./routes/pages.js");
app.use('/admin/pages', pagesRoute(accounts, settings, pages, uuid, pageUtils, sqlString, ComponentManager));

/**
 * ========================================
 * Display the final pages
 * ========================================
 */
app.get('*', (req, res) => {
    const page = req.path;
    pages.get(`SELECT * FROM pages WHERE link='${page}'`, (err, data) => {
        if (data == null) {
            if (page.includes(".")) {
                res.status(404);
                res.send("Error 404: Cannot find requested file.");
            } else {
                pages.all(`SELECT * FROM navigation`, (err, nav) => {
                    res.render('404', {
                        nav: nav.sort((a, b) => a.compOrder - b.compOrder),
                        logo: settings.web_logo
                    });
                });
            }
            return;
        }
        const uuid = data.uuid;
        pages.all(`SELECT * FROM '${uuid}'`, (err, content) => {
            content.forEach((co) => {
                co.componentData = ComponentManager.getComponentFromName(co.componentType).getComponentData(co.componentData);
                co.componentType = "components/" + co.componentType;
            });
            pages.all(`SELECT * FROM navigation`, (err, nav) => {
                res.render('page', {
                    content: content.sort((a, b) => a.compOrder - b.compOrder), logo: settings.web_logo, data: data,
                    nav: nav.sort((a, b) => a.compOrder - b.compOrder)
                });
            });
        });
        return;
    });
});