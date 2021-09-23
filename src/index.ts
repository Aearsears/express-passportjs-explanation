import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import FileStore from 'session-file-store';
import parseurl from 'parseurl';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';
import './passport-auth';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fs from 'fs';

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
    let views: string;
    let dbfiles: string[];
    if (req.session?.views) {
        views =
            'You viewed this page ' +
            req.session.views[req.originalUrl] +
            ' times.';
    }
    const info = req.session;
    const id = req.session.id;
    fs.readdir(
        path.join(__dirname, '/../../', 'sessions'),
        (err: any, data: string[]) => {
            if (err) {
                console.log(err);
            }
            dbfiles = data.slice();
            resp.render('index', {
                message: 'Welcome!',
                nofviews: views,
                sessioninfo: info,
                sessionid: id,
                files: dbfiles
            });
        }
    );
});
app.get('/account', (req: Request, resp: Response) => {
    if (req.isAuthenticated()) {
        let views: string;
        let dbfiles: string[];
        if (req.session?.views) {
            views =
                'You viewed this page ' +
                req.session.views[req.originalUrl] +
                ' times.';
        }
        const info = req.session;
        const id = req.session.id;
        fs.readdir(
            path.join(__dirname, '/../../', 'sessions'),
            (err: any, data: string[]) => {
                if (err) {
                    console.log(err);
                }
                dbfiles = data.slice();
                resp.render('account', {
                    nofviews: views,
                    sessioninfo: info,
                    sessionid: id,
                    files: dbfiles,
                    user: req.user.id,
                    username: req.user.username,
                    nickname: req.user.nickname
                });
            }
        );
    } else {
        resp.redirect('/login');
    }
});
app.get('/login', (req: Request, resp: Response) => {
    let views: string;
    let dbfiles: string[];
    if (req.session?.views) {
        views =
            'You viewed this page ' +
            req.session.views[req.originalUrl] +
            ' times.';
    }
    const info = req.session;
    const id = req.session.id;
    fs.readdir(
        path.join(__dirname, '/../../', 'sessions'),
        (err: any, data: string[]) => {
            if (err) {
                console.log(err);
            }
            dbfiles = data.slice();
            resp.render('login', {
                nofviews: views,
                sessioninfo: info,
                sessionid: id,
                files: dbfiles
            });
        }
    );
});

app.post('/login', (req: Request, resp: Response, next: NextFunction) => {
    console.log('in login post method');
    passport.authenticate('login', (err: Error, user, info: IVerifyOptions) => {
        console.log('in login post method, passport');
        if (err) {
            return next(err);
        }
        if (!user) {
            return resp.status(401).render('login', { errMssg: info.message });
        } else {
            req.logIn(user, (err: Error) => {
                if (err) {
                    return next(err);
                }
                resp.status(200);
                return resp.redirect('/account');
            });
        }
    })(req, resp, next);
});

app.post('/logout', (req: Request, resp: Response, next: NextFunction) => {
    console.log('in logout post method');
    req.session.destroy((err: Error) => {
        if (err) {
            return next(err);
        }
        resp.status(200);
        return resp.redirect('/');
    });
});

app.listen(4000, () => {
    console.log('Live on port 4000.');
});
