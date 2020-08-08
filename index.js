/**
 * =============[Portfolio CMS]=============
 * This is the primary file for PortfolioCMS.
 * Right now this contains all server-side express
 * code for the site.
 * 
 * TODO Split off sections of the code into their own script files (ex: pages, admin, content, etc.)
 * 
 * Version: 1.0.0-BETA-RC1
 * 
 * =============[Portfolio CMS]=============
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

const multer = require('multer');
const upload = multer({ dest: './content/' });

// Grab the version information.
const version = require('./version.js');

/**
 * ==========================================
 * 
 *                  Components
 * 
 * ==========================================
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
 * ==========================================
 *             End of Components
 * ==========================================
 */

// Console color codes.
const purple = "\u001b[35m";
const red = "\u001b[31m";
const green = "\u001b[32m";
const yellow = "\u001b[33m";
const end = "\u001b[39m";
const reset = "\u001b[0m";

console.log(`${purple}[PortfolioCMS]${end} Starting up PortfolioCMS v${version.getVersionString()}`);


const app = express();

app.listen(8080, () => console.log(`${purple}[PortfolioCMS]${end} ${green}PortfolioCMS is online running off of port 8080.`));

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

// app.enable('view cache');
// app.use(compression());

app.use(session({
    secret: 'a^3J75H8v-6Jfjsc&3+mca**fj4$$mcsjiog#4$',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * 
 * Account Settings
 * 
 */
const accounts = require('./accounts.js');

const settings = require('./settings.js');

/**
 *
 * Admin Pages
 *
 */

app.get('/admin', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    pages.all('SELECT * FROM navigation', (err, data) => {
        pages.all('SELECT * FROM pages', (err, pagez) => {
            res.render('admin', {
                home: 'active',
                logo: settings.web_logo,
                pages: data.sort((a, b) => a.compOrder - b.compOrder),
                pageList: pagez.filter((a) => data.filter((b) => a.uuid == b.uuid).length < 1),
                version: version.getVersionString()
            });
        });
    });
});

/**
 * This is triggered when a page is added to the navigation or
 * when the navigation is re-ordered.
 */
app.post('/admin', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    let type = req.body.type;
    if (type == null) {
        res.redirect('/admin?err=1');
        return;
    }
    if (type == "add-nav") {
        let pagePID = req.body.addPage;
        if (pagePID == null || pagePID == "") {
            res.redirect('/admin?err=2');
            return;
        }

        pages.get(`SELECT * FROM pages WHERE uuid='${pagePID}'`, (err, page) => {
            if (page == null) {
                res.redirect('/admin?err=1');
                return;
            }
            pages.get(`SELECT compOrder FROM navigation ORDER BY compOrder DESC LIMIT 1`, (err, data) => {
                if (data == null) {
                    pages.run(`INSERT INTO navigation (uuid, compOrder, name, title, subtitle, link) VALUES ($uuid, $compOrder, $name, $title, $subtitle, $link)`, {
                        $uuid: page.uuid,
                        $compOrder: 0,
                        $name: page.name,
                        $title: page.title,
                        $subtitle: page.subtitle,
                        $link: page.link
                    });
                }
                else {
                    pages.run(`INSERT INTO navigation (uuid, compOrder, name, title, subtitle, link) VALUES ($uuid, $compOrder, $name, $title, $subtitle, $link)`, {
                        $uuid: page.uuid,
                        $compOrder: data.compOrder + 1,
                        $name: page.name,
                        $title: page.title,
                        $subtitle: page.subtitle,
                        $link: page.link
                    });
                }
                res.redirect('/admin');
            });
        });
        return;
    } else if (type == "update-nav") {
        const uuids = JSON.parse(req.body.order);
        if (uuids == null) {
            res.redirect(`/admin/?err=1`);
            return;
        }
        if (uuids.length == null) {
            res.redirect(`/admin/?err=1`);
            return;
        }
        if (uuids.length < 1) {
            res.redirect(`/admin/?success=1`);
            return;
        }
        // Make a copy of the uuids list so that way uuids that don't exist can be removed.
        let newData = uuids.slice();
        pages.serialize(() => {
            for (var comp of uuids) {
                pages.get(`SELECT uuid FROM navigation WHERE uuid='${comp}'`, (err, data) => {
                    if (data == null) {
                        // Uuids that don't exist are removed from the newData list.
                        newData.splice(newData.indexOf(comp), 1);
                        res.redirect("/admin");
                        return;
                    }
                });
            }
            // This stupid thing is needed since Sqlite3 is async only and better-sqlite does not work :( 
            for (var comp of newData) {
                pages.run(`UPDATE navigation SET compOrder=${newData.indexOf(comp)} WHERE uuid='${comp}'`, () => {
                });
            }
        });
        res.redirect(`/admin/?success=1`);
        return;
    }
    res.redirect('/admin');
});

/**
 * Remove a nav item from the UUID.
 * @param {String} pid The uuid
 */
function removeNavItem(pid) {
    pages.get(`SELECT uuid FROM navigation WHERE uuid='${pid}'`, (err, data) => {
        if (data == null) return;
        pages.run(`DELETE FROM navigation WHERE uuid='${pid}'`);
    });
}

app.get('/admin/nav/:uuid/delete', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pagePID = req.params.uuid;
    removeNavItem(pagePID);
    res.redirect('/admin');
});

app.get('/admin/login', (req, res) => {
    if (accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin');
        return;
    }
    res.render('admin_login', { nav: {} });
});

app.post('/admin/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username == null || password == null) {
        res.render('admin_login', { error: true });
        return;
    }
    let account = accounts.getAccount(username);
    if (account == null) {
        res.render('admin_login', { error: true });
        return;
    }
    if (account.getUsername() == username && account.getPassword() == md5(password)) {
        let curuuid = uuid();
        account.setSessionID(curuuid);
        account.setTimeStamp();
        req.session.sessionID = curuuid;
        req.session.username = username;
        res.redirect('/admin');
    } else {
        res.render('admin_login', { error: true });
    }
});

app.get('/admin/content', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    res.render('admin_content', { content: 'active', logo: settings.web_logo });
});

/**
 * ===================================
 * Pages
 * ===================================
 */
const pageUtils = require('./pageutils.js')

var pagesExists = fs.existsSync('pages.db');
const pages = new sqlite3.Database('pages.db');
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

app.get('/admin/pages', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }

    pages.all('SELECT * FROM pages', async (err, data) => {
        let pageData = await pageUtils.dataConverter(data, pages);
        res.render('admin_page', {
            page: 'active', logo: settings.web_logo, pages: pageData, helpers: {
                ifDelete: (pid, options) => {
                    if (pid == 'index0') {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                }
            }
        });
    });
});

app.post('/admin/pages', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const name = req.body.name;
    const link = req.body.link;

    if (name.length < 1) {
        res.redirect("/admin/pages?err=2");
        return;
    }

    if (!/^(\/\w*)*[^\/|\s|.]$/.test(link)) {
        res.redirect("/admin/pages?err=3");
        return;
    }
    let pid = uuid();
    pages.all(`SELECT uuid FROM pages WHERE link='${link}'`, (err, data) => {
        if (data.length > 0) {
            res.redirect("/admin/pages?err=1");
            return;
        }
        pages.serialize(() => {
            pages.run(`INSERT INTO pages (uuid, name, title, subtitle, link) VALUES ($uuid, $name, $title, $subtitle, $link)`, {
                $uuid: pid,
                $name: name,
                $title: name,
                $subtitle: "PortfolioCMS",
                $link: link
            });
            pages.run(`CREATE TABLE IF NOT EXISTS '${pid}' (
                id INTEGER PRIMARY KEY,
                uuid TEXT NOT NULL,
                compOrder INTEGER NOT NULL,
                componentType VARCHAR(50) NOT NULL,
                componentData TEXT NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, () => res.redirect('/admin/pages'));
        });
    })
});

/**
 * When the delete button is pressed for a page.
 */
app.post('/admin/pages/delete', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = req.body.delete;
    if (pid == null) {
        res.redirect('/admin/pages?err=4');
        return;
    }
    if (pid.length < 10) {
        res.redirect('/admin/pages?err=4');
        return;
    }
    if (pid == "index0") {
        res.redirect('/admin/pages?err=5');
        return;
    }
    pages.serialize(() => {
        pages.run(`DELETE FROM pages WHERE uuid='${pid}'`);
        pages.run(`DROP TABLE IF EXISTS '${pid}'`);
        removeNavItem(pid);
    });
    res.redirect('/admin/pages');
});

app.get('/admin/pages/:uuid/', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = sqlString.escape(req.params.uuid);
    let allowed = true;
    pages.serialize(() => {
        pages.all(`SELECT uuid FROM pages WHERE uuid=${pid}`, (err, data) => {
            if (data.length < 1) {
                res.redirect('/admin/pages');
                allowed = false;
                return;
            }
        });
        pages.all(`SELECT * FROM ${pid}`, (err, data) => {
            if (!allowed)
                return;
            let components = [];
            for (let comp of data) {
                let component = ComponentManager.getComponentFromName(comp.componentType);
                components.push({
                    id: comp.id,
                    uuid: comp.uuid,
                    compOrder: comp.compOrder,
                    componentType: comp.componentType,
                    componentData: comp.componentData,
                    componentPreview: component.getPreview(comp.componentData),
                    name: component.getName(),
                    pagePID: req.params.uuid
                });
            }
            res.render('admin_page_edit', {
                page: 'active',
                logo: settings.web_logo,
                comp: components.sort((a, b) => a.compOrder - b.compOrder),
                componentList: ComponentManager.getListOfComponets()
            });
        });
    });

});

app.post('/admin/pages/:uuid/', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = req.params.uuid;
    const type = req.body.type;
    if (type == null) {
        res.redirect("/admin/pages/" + pid);
        return;
    }

    if (type === "add-component") {
        const component = req.body.component;
        if (component == null) {
            res.redirect("/admin/pages/" + pid);
            return;
        }
        res.redirect(`/admin/pages/${pid}/${component}/create`);
        return;
    } else if (type === "update") {
        const uuids = JSON.parse(req.body.order);
        if (uuids == null) {
            res.redirect(`/admin/pages/${pid}/?err=1`);
            return;
        }
        if (uuids.length == null) {
            res.redirect(`/admin/pages/${pid}/?err=1`);
            return;
        }
        if (uuids.length < 1) {
            res.redirect(`/admin/pages/${pid}/?success=1`);
            return;
        }
        // Make a copy of the uuids list so that way uuids that don't exist can be removed.
        let newData = uuids.slice();
        pages.serialize(() => {
            for (var comp of uuids) {
                pages.get(`SELECT uuid FROM '${pid}' WHERE uuid='${comp}'`, (err, data) => {
                    if (data == null) {
                        // Uuids that don't exist are removed from the newData list.
                        newData.splice(newData.indexOf(comp), 1);
                        res.redirect("/admin");
                        return;
                    }
                });
            }
            // This stupid thing is needed since Sqlite3 is async only and better-sqlite does not work :( 
            for (var comp of newData) {
                pages.run(`UPDATE '${pid}' SET compOrder=${newData.indexOf(comp)} WHERE uuid='${comp}'`, () => {
                });
            }
        });
        res.redirect(`/admin/pages/${pid}?success=1`);
        return;
    }
    res.redirect('/admin');
    return;
});

/**
 * The page to create a component
 * The submission of this page will go to:
 * /admin/pages/:uuid/:component/create
 */
app.get('/admin/pages/:uuid/:component/create', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = req.params.uuid;
    const component = req.params.component;
    pages.all(`SELECT uuid FROM pages WHERE uuid='${pid}'`, (err, data) => {
        if (data.length < 1) {
            res.redirect("/admin");
            return;
        }
        res.render("admin_add_component", { page: 'active', component: "add_component/" + component, logo: settings.web_logo });
    });
});

app.post('/admin/pages/:uuid/:component/create', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = req.params.uuid;
    const component = req.params.component;
    if (component != req.body.type) {
        res.redirect(`/admin/pages/${pid}`);
        return;
    }
    pages.all(`SELECT uuid FROM pages WHERE uuid='${pid}'`, (err, data) => {
        if (data.length < 1) {
            res.redirect("/admin/pages");
            return;
        }
        let comp = ComponentManager.getComponentFromName(component);
        if (comp == null) {
            res.redirect("/admin/pages");
            return;
        }
        let compData = comp.createComponent(req, res);
        if (compData == null) {
            return;
        }

        const compUUID = uuid();
        pages.get(`SELECT compOrder FROM '${pid}' ORDER BY compOrder DESC LIMIT 1`, (err, data) => {
            if (data == null) {
                pages.run(`INSERT INTO '${pid}' (uuid, compOrder, componentType, componentData) VALUES ($uuid, $order, $type, $data)`, {
                    $uuid: compUUID,
                    $type: comp.getTechName(),
                    $data: compData,
                    $order: 0
                });
            }
            else {
                pages.run(`INSERT INTO '${pid}' (uuid, compOrder, componentType, componentData) VALUES ($uuid, $order, $type, $data)`, {
                    $uuid: compUUID,
                    $type: comp.getTechName(),
                    $data: compData,
                    $order: data.compOrder + 1
                });
            }
        });
        res.redirect("/admin/pages/" + pid);
    });
});

// Edit a component
app.get('/admin/pages/:uuid/:component/edit', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = req.params.uuid;
    const component = req.params.component;
    pages.all(`SELECT uuid FROM pages WHERE uuid='${pid}'`, (err, data) => {
        if (data.length < 1) {
            res.redirect("/admin");
            return;
        }
        pages.get(`SELECT * FROM '${pid}' WHERE uuid='${component}'`, (err, data) => {
            if (data == null) {
                res.render("admin_edit_component", { component: "", logo: settings.web_logo });
                return;
            }
            const comp = ComponentManager.getComponentFromName(data.componentType);
            res.render("admin_edit_component", { page: 'active', component: "edit_component/" + comp.getTechName(), logo: settings.web_logo, componentData: comp.getEditComponentData(data.componentData) });
        });
    });
});

app.post('/admin/pages/:uuid/:component/edit', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = req.params.uuid;
    const componentPID = req.params.component;
    pages.all(`SELECT uuid FROM pages WHERE uuid='${pid}'`, (err, data) => {
        if (data.length < 1) {
            res.redirect("/admin/pages");
            return;
        }

        pages.get(`SELECT uuid, componentType FROM '${pid}' WHERE uuid='${componentPID}'`, (err, data) => {
            if (data == null) {
                res.redirect("/admin/pages");
                return;
            }
            let comp = ComponentManager.getComponentFromName(data.componentType);
            let compData = comp.editComponentData(req, res);
            if (compData == null) {
                res.redirect("/admin/pages/" + pid);
                return;
            }
            pages.run(`UPDATE '${pid}' SET componentData='${compData}' WHERE uuid='${componentPID}'`, () => {
            });
            res.redirect("/admin/pages/" + pid);
        });
    });
});

// Delete a component from a page.
app.get('/admin/pages/:uuid/:component/delete', (req, res) => {
    if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
        res.redirect('/admin/login');
        return;
    }
    const pid = req.params.uuid;
    const componentPID = req.params.component;
    pages.all(`SELECT uuid FROM pages WHERE uuid='${pid}'`, (err, data) => {
        if (data.length < 1) {
            res.redirect("/admin/pages");
            return;
        }

        pages.get(`SELECT uuid, componentType FROM '${pid}' WHERE uuid='${componentPID}'`, (err, data) => {
            if (data == null) {
                res.redirect("/admin/pages");
                return;
            }
            pages.run(`DELETE FROM '${pid}' WHERE uuid='${componentPID}'`);
            res.redirect("/admin/pages/" + pid);
        });
    });
});

/**
 * ========================================
 * Display the final pages
 * ========================================
 */

app.get('*', (req, res) => {
    const page = req.path;
    pages.get(`SELECT * FROM pages WHERE link='${page}'`, (err, data) => {
        if (data == null) {
            res.status(404);
            res.send("ERROR 404: PAGE NOT FOUND!");
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

/**
 *
 * I am currently working on the edit page for the components.
 *
 */