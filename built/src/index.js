"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const session_file_store_1 = __importDefault(require("session-file-store"));
const parseurl_1 = __importDefault(require("parseurl"));
const passport_1 = __importDefault(require("passport"));
require("./passport-auth");
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
// declare module 'express' {
//     export interface Request {
//         // user: {
//         //     id: string;
//         // };
//     }
// }
const app = (0, express_1.default)();
app.set('views', './views');
app.set('view engine', 'pug');
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const fileStore = (0, session_file_store_1.default)(express_session_1.default);
const fileStoreOptions = {
    path: './sessions'
};
const sessionOptions = {
    name: 'sid',
    // eslint-disable-next-line new-cap
    store: new fileStore(fileStoreOptions),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: false
    }
};
app.use((0, express_session_1.default)(sessionOptions));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((req, resp, next) => {
    var _a, _b;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.views)) {
        req.session.views = {};
    }
    const pathname = (_b = (0, parseurl_1.default)(req)) === null || _b === void 0 ? void 0 : _b.pathname;
    if (typeof pathname === 'string') {
        req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;
    }
    next();
});
app.get('/', (req, resp) => {
    var _a;
    let views;
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.views) {
        views = 'You viewed this page ' + req.session.views['/'] + ' times.';
    }
    console.log(req.session);
    console.log(req.session.id);
    console.log(req === null || req === void 0 ? void 0 : req.user);
    resp.render('index', {
        title: 'Homepage',
        message: 'Welcome!',
        nofviews: views
    });
});
app.get('/account', (req, resp) => {
    if (req.isAuthenticated()) {
        resp.render('account', {
            user: req.user.id,
            username: req.user.username,
            nickname: req.user.nickname
        });
    }
    else {
        resp.redirect('/login');
    }
});
app.get('/login', (req, resp) => {
    console.log(req.session);
    console.log(req.session.id);
    resp.render('login');
});
app.post('/login', (req, resp, next) => {
    console.log('in login post method');
    passport_1.default.authenticate('login', (err, user, info) => {
        console.log('in login post method, passport');
        if (err) {
            return next(err);
        }
        if (!user) {
            return resp.status(401).render('login', { errMssg: info.message });
        }
        else {
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                resp.status(200);
                return resp.redirect('/account');
            });
        }
    })(req, resp, next);
});
app.post('/logout', (req, resp, next) => {
    console.log('in logout post method');
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        resp.status(200);
        return resp.redirect('/');
    });
});
app.listen(4000, () => {
    console.log('live');
});
