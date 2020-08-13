/**
 * =============[Portfolio CMS]=============
 * This is the router file for the main admin pages.
 * The following pages are controlled by this script:
 * /admin
 * /admin/login
 * /admin/content
 * =============[Portfolio CMS]=============
 */

const express = require('express');
const { render } = require('sass');
const router = express.Router();

/**
 * 
 * @param {*} version The version.js script.
 * @param {*} accounts The accounts.js script.
 * @param {*} settings The settings.js script.
 * @param {*} pages The pages database.
 * @param {*} md5 The md5 implementation.
 * @param {v4} uuid The uuid implementation
 */
module.exports = (version, accounts, settings, pages, md5, uuid) => {
    /**
     * This serves as the get route for /admin
     */
    router.get('/', (req, res) => {
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
                    version: version.getVersionString(),
                    favicon: settings.favicon
                });
            });
        });
    });

    /**
     * This is triggered when a page is added to the navigation or
     * when the navigation is re-ordered.
     */
    router.post('/', (req, res) => {
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

    /**
     * This serves as a way to delete nave bar items.
     */
    router.get('/nav/:uuid/delete', (req, res) => {
        if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
            res.redirect('/admin/login');
            return;
        }
        const pagePID = req.params.uuid;
        removeNavItem(pagePID);
        res.redirect('/admin');
    });

    /**
     * Handles the admin/login page.
     */
    router.get('/login', (req, res) => {
        if (accounts.isSessionValid(req.session.username, req.session.sessionID)) {
            res.redirect('/admin');
            return;
        }
        res.render('admin_login', { nav: {}, favicon: settings.favicon });
    });

    /**
     * Handles the actual logging in process.
     */
    router.post('/login', (req, res) => {
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

    /**
     * Temporarly delivers the content page.
     * 
     * TODO This is to be moved to a seperate route.
     */
    router.get('/content', (req, res) => {
        if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
            res.redirect('/admin/login');
            return;
        }
        res.render('admin_content', { content: 'active', logo: settings.web_logo, favicon: settings.favicon });
    });

    router.post('/content', (req, res) => {
        if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
            res.redirect('/admin/login');
            return;
        }
        res.redirect('/admin/content');
    });

    return router;
}