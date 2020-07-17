/**
 * 
 * This file is meant the handle the accounts from the environment.json file.
 * 
 */

const fs = require('fs');
const md5 = require('md5');

var json = JSON.parse(fs.readFileSync("./environment.json", 'utf-8'));


class Account {
    constructor(username, passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.sessionID = null;
        this.time = null;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.passwordHash;
    }

    hasSessionID() {
        return this.sessionID != null;
    }

    setSessionID(sessionID) {
        this.sessionID = sessionID;
    }

    getSessionID() {
        return this.sessionID;
    }

    setTimeStamp() {
        this.time = new Date().getTime();
    }

    getTimeStamp() {
        return this.time;
    }
}

let accounts = [];
accounts.push(new Account(json.admin.username,
    json['security-settings']['password-in-md5'] ? json.admin.password : md5(json.admin.password)));

for (let acc of json['other-accounts']) {
    accounts.push(new Account(acc.username,
        json['security-settings']['password-in-md5'] ? acc.password : md5(acc.password)));
}

/**
 * Check to see if a session is valid.
 * @param {string} username The username to check
 * @param {string} sessionID The sessionID
 * @returns {boolean} If the session is valid.
 */
function isSessionValid(username, sessionID) {
    if (username == null) return false;
    if (sessionID == null) return false;
    for (let acc of accounts) {
        if (acc.getUsername() !== username) continue;
        if (acc.getSessionID() == null) continue;
        if (acc.getSessionID() !== sessionID) continue;
        if (acc.getTimeStamp() == null) continue;
        if (acc.getTimeStamp() + 3.6e+6 < new Date().getTime()) continue;
        return true;
    }
    return false;
}

/**
 * Get an account based upon the username
 * @param {string} username 
 * @returns {Account} The account.
 */
function getAccount(username) {
    for (let acc of accounts) {
        if (acc.getUsername() === username)
            return acc;
    }
    return null;
}

module.exports = {
    Account: Account,
    accounts: accounts,
    isSessionValid: isSessionValid,
    getAccount: getAccount
};