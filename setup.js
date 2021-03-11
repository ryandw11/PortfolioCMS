/**
 * =============[Portfolio CMS]=============
 *   Automatically Setups dependencies
 *   
 *   The goal of this script is to automatically handle the dependencies
 *   that PortfolioCMS requires, like bootstrap. In the future this
 *   script will be used to install and update the ENTIRE website instead
 *   of just the dependencies.
 * 
 *   Usage: node setup.js [optional arguments]
 * 
 *   Arguments:
 *   -rmvDep : Remove dependency files from the public folder. (This should be done before contributing).
 * =============[Portfolio CMS]=============
 */
// Debug setting. If you experience an error please set debug to true for more precise error messages.
const debug = false;

//=========================
const fs = require('fs');
const readline = require('readline');
const exec = require('child_process').exec;
const args = process.argv;
let fse;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Console color codes.
const purple = "\u001b[35m";
const red = "\u001b[31m";
const green = "\u001b[32m";
const yellow = "\u001b[33m";
const end = "\u001b[39m";
const reset = "\u001b[0m";

// Default setup operation
if (args.length < 3) {
    console.log(`${purple}[PortfolioCMS]${end} Starting the setup of the of Portfolio CMS`);

    console.log(`${purple}[PortfolioCMS]${end} Installing Dependencies... (This may take several minutes)`);
    exec("npm install", (error, stdout, stderr) => {
        if (error != null) {
            console.error(`${red}[PortfolioCMS]${end} An internal error has occured!`);
            console.error(error);
            rl.close();
            return;
        }
        console.log(stdout);
        if (debug) {
            console.log(`${yellow}[PortfolioCMS]${end} Debug Info:`);
            console.warn(stderr);
        }
        console.log(`${purple}[PortfolioCMS]${end} Finished Installing Dependencies.`);
        fse = require("fs-extra");
        checkdepends();
    });
}
// Remove dependencies
else if (args.length >= 3 && args[2] == '-rmvDep') {
    console.log(`${purple}[PortfolioCMS]${end} Removing Dependencies...`);
    fse = require('fs-extra');
    deleteDepends();
    console.log(`${purple}[PortfolioCMS]${end} ${green}Successfully removed dependencies... ${reset}`);
    rl.close();
} else {
    console.log(`${purple}[PortfolioCMS]${end} Invalid arguments.`);
    rl.close();
}

/**
 * Handles the automatic deletion before updating dependencies.
 */
function checkdepends() {
    if (!fs.existsSync('./node_modules/')) {
        console.log(`${red}[PortfolioCMS]${end} ${yellow}Error: Cannot find node dependencies! Try running 'npm install' before running setup.js. ${reset}`);
        rl.close();
        return;
    }
    if (fs.existsSync("./public/bootstrap.min.css")) {
        rl.question(`${purple}[PortfolioCMS]${end} ${yellow}Existing dependencies have been found. Would you like to replace the existing dependencies? [Y/N]${end}`, (ans) => {
            if (ans == 'N' || ans == 'n') {
                console.log(`${purple}[PortfolioCMS]${end} PortfolioCMS setup will now exit.`);
                rl.close();
            } else {
                deleteDepends();
                updateDepends();
                finishSetup();
                return;
            }
        });
    } else {
        updateDepends();
        finishSetup();
        return;
    }
}

/**
 * Delete existing dependencies.
 */
function deleteDepends() {
    if (fs.existsSync('./public/bootstrap.bundle.min.js')) {
        console.log(`${purple}[PortfolioCMS]${end} Deleting bootstrap javascript.`);
        fs.unlinkSync('./public/bootstrap.bundle.min.js');
    }
    if (fs.existsSync('./public/bootstrap.bundle.min.js.map')) {
        console.log(`${purple}[PortfolioCMS]${end} Deleting bootstrap javascript map.`);
        fs.unlinkSync('./public/bootstrap.bundle.min.js.map');
    }
    if (fs.existsSync('./public/bootstrap.min.css')) {
        console.log(`${purple}[PortfolioCMS]${end} Deleting bootstrap css.`);
        fs.unlinkSync('./public/bootstrap.min.css');
    }
    if (fs.existsSync('./public/bootstrap.min.css.map')) {
        console.log(`${purple}[PortfolioCMS]${end} Deleting bootstrap css map.`);
        fs.unlinkSync('./public/bootstrap.min.css.map');
    }
    if (fs.existsSync('./public/bootstrap.min.js.map')) {
        console.log(`${purple}[PortfolioCMS]${end} Deleting bootstrap min javascript map.`);
        fs.unlinkSync('./public/bootstrap.min.js.map');
    }
    if (fs.existsSync('./public/symbols')) {
        console.log(`${purple}[PortfolioCMS]${end} Deleting Feather-Icons.`);
        fse.removeSync('./public/symbols/');
    }
    if (fs.existsSync('./public/monaco-editor')) {
        console.log(`${purple}[PortfolioCMS]${end} Deleting monaco-editor.`);
        fse.removeSync('./public/monaco-editor/');
    }
}

/**
 * Move over the finished dependencies to the public folder.
 */
function updateDepends() {
    console.log(`${purple}[PortfolioCMS]${end} Setting up dependencies...`);
    try {
        fs.copyFileSync('./node_modules/bootstrap/dist/css/bootstrap.min.css', './public/bootstrap.min.css');
        fs.copyFileSync('./node_modules/bootstrap/dist/css/bootstrap.min.css.map', './public/bootstrap.min.css.map');
        fs.copyFileSync('./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', './public/bootstrap.bundle.min.js');
        fs.copyFileSync('./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map', './public/bootstrap.bundle.min.js.map');
        fs.mkdirSync('./public/symbols');
        fs.copyFileSync('./node_modules/feather-icons/dist/feather.min.js', './public/symbols/feather.min.js');
        fs.copyFileSync('./node_modules/feather-icons/dist/feather.min.js.map', './public/symbols/feather.min.js.map');
        fse.copySync('./node_modules/monaco-editor', './public/monaco-editor');
    } catch (ex) {
        console.error(`${red}[PortfolioCMS]${end} An internal error has occured when trying to setup dependencies. ${reset}`);
        if (debug) {
            console.error(ex);
        }
    }
    console.log(`${purple}[PortfolioCMS]${end} All dependencies have been setup!`);
}

/**
 * Finish the setup by setting up the environment.json file if needed.
 */
function finishSetup() {
    if (!fs.existsSync('./environment.json')) {
        console.log(`${purple}[PortfolioCMS]${end} Setting up environment.json file...`);
        fs.copyFileSync('./environment.json.default', './environment.json');
        console.log(`${purple}[PortfolioCMS]${end} Finished setting up environment.json file. Please configure the 'environment.json' file before starting up PortfolioCMS.`);
    }
    console.log(`${purple}[PortfolioCMS]${end} ${green}Successfuly finsihed setting up PortfolioCMS. Start PortfolioCMS by running 'node index.js' ${reset}`);
    rl.close();
    process.exit(0);
}

/**
 * Kill the program when it is done.
 */
rl.on("close", () => process.exit(0));