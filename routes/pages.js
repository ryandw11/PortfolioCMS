/**
 * =============[Portfolio CMS]=============
 * This is the router file for the main admin/pages pages.
 * 
 * This script controls the creation, editing, and deleting of pages.
 * This script also controls the creation, editing, and deleting of componenets.
 * The following pages are controlled by this script:
 * /admin/pages
 * /admin/pages/{uuid}
 * =============[Portfolio CMS]=============
 */
const express = require('express');
const router = express.Router();

/**
 * 
 * @param {*} accounts The accounts.js file.
 * @param {*} settings The settings.js file.
 * @param {*} pages The pages database.
 * @param {*} uuid The uuid generation method.
 * @param {*} pageUtils The pageutils.js file.
 * @param {*} sqlString The sqlstring dependency.
 * @param {*} ComponentManager The component manager. (components/componentmanager.js)
 */
module.exports = (accounts, settings, pages, uuid, pageUtils, sqlString, ComponentManager) => {
    /**
     * The listing of the pages.
     * (/admin/pages)
     */
    router.get('/', (req, res) => {
        if (!accounts.isSessionValid(req.session.username, req.session.sessionID)) {
            res.redirect('/admin/login');
            return;
        }

        pages.all('SELECT * FROM pages', async (err, data) => {
            let pageData = await pageUtils.dataConverter(data, pages);
            res.render('admin_page', {
                page: 'active', logo: settings.web_logo, favicon: settings.favicon, pages: pageData, helpers: {
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

    /**
     * Handle the creation of pages.
     */
    router.post('/', (req, res) => {
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
     * Handle deleting pages.
     */
    router.post('/delete', (req, res) => {
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

    /**
     * Handles the editing of a page. (Components Section)
     */
    router.get('/:uuid/', (req, res) => {
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
                    componentList: ComponentManager.getListOfComponets(),
                    favicon: settings.favicon
                });
            });
        });

    });

    /**
     * Handle adding components to a page.
     * This also handles re-arranging components.
     */
    router.post('/:uuid/', (req, res) => {
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
    router.get('/:uuid/:component/create', (req, res) => {
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
            res.render("admin_add_component", { page: 'active', component: "add_component/" + component, logo: settings.web_logo, favicon: settings.favicon });
        });
    });

    /**
     * Handles the server side to creating a component after submission.
     */
    router.post('/:uuid/:component/create', (req, res) => {
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

    /**
     * Handles editing components. (Client Side)
     */
    router.get('/:uuid/:component/edit', (req, res) => {
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
                res.render("admin_edit_component", {
                    page: 'active', component: "edit_component/" + comp.getTechName(), logo: settings.web_logo,
                    componentData: comp.getEditComponentData(data.componentData),
                    favicon: settings.favicon
                });
            });
        });
    });

    /**
     * Handles editing components (Server side.)
     */
    router.post('/:uuid/:component/edit', (req, res) => {
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

    /**
     * Handles deleting a component from a page.
     */
    router.get('/:uuid/:component/delete', (req, res) => {
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
     * A utility method to remove a page from the nav bar.
     * @param {*} pid The uuid of the page to remove.
     */
    function removeNavItem(pid) {
        pages.get(`SELECT uuid FROM navigation WHERE uuid='${pid}'`, (err, data) => {
            if (data == null) return;
            pages.run(`DELETE FROM navigation WHERE uuid='${pid}'`);
        });
    }

    return router;
}