"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const cred_json_1 = __importDefault(require("../auth/cred.json"));
const LocalStrategy = passport_local_1.default.Strategy;
passport_1.default.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    if (username === cred_json_1.default.account.username &&
        password === cred_json_1.default.account.password) {
        const user = {
            id: cred_json_1.default.account.id,
            username: cred_json_1.default.account.username,
            nickname: cred_json_1.default.account.displayName
        };
        return done(null, user);
    }
    else {
        return done(null, false, {
            message: 'Incorrect username or password.'
        });
    }
}));
passport_1.default.serializeUser((req, user, done) => {
    // could use process.nexttick to make asynchronous
    // attaching the entire user object to req.sessions
    done(null, user);
});
// on subsequent requests to authorization needed pages, passport will call deserializeuser to obtain more information from the store and then populate req.session with that information
passport_1.default.deserializeUser((id, done) => {
    // if need more information on the user will assign to req.user here. in prod you would search store for user's details
    const user = {
        id: cred_json_1.default.account.id,
        username: cred_json_1.default.account.username,
        nickname: cred_json_1.default.account.displayName
    };
    done(undefined, user);
});
