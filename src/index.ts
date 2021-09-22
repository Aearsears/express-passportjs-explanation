import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import FileStore from 'session-file-store';
import parseurl from 'parseurl';
import passport from 'passport';
import * as passportConfig from './passport-auth';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';

declare module 'express-session' {
    export interface SessionData {
        views: { [key: string]: any };
    }
}

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const fileStore = FileStore(session);

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
        sameSite: 'lax' as 'lax',
        secure: false
    }
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

app.use((req: Request, resp: Response, next: NextFunction) => {
    if (!req.session?.views) {
        req.session.views = {};
    }
    const pathname = parseurl(req)?.pathname;
    if (typeof pathname === 'string') {
        req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;
    }

    next();
});

app.get('/', (req: Request, resp: Response) => {
    let views;
    if (req.session?.views) {
        views = 'You viewed this page ' + req.session.views['/'] + ' times.';
    }
    console.log(req.session);
    console.log(req.session.id);
    resp.render('index', {
        title: 'Homepage',
        message: 'Welcome!',
        nofviews: views
    });
});
app.get('/account', (req: Request, resp: Response) => {
    if (req.isAuthenticated()) {
        resp.render('account', {
            user: req.user
        });
    } else {
        resp.redirect('/login');
    }
});
app.get('/login', (req: Request, resp: Response) => {
    console.log(req.session);
    console.log(req.session.id);
    resp.render('login');
});

app.post('/login', (req: Request, resp: Response, next: NextFunction) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            resp.status(401).send(info.message);
        } else {
            resp.status(200);
            return resp.redirect('/');
        }
    });
});

app.listen(4000, () => {
    console.log('live');
});
