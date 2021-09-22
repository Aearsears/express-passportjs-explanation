import passport from 'passport';
import passportlocal from 'passport-local';
import cred from '../auth/cred.json';
const LocalStrategy = passportlocal.Strategy;

passport.use(
    'login',
    new LocalStrategy(
        {
            passReqToCallback: true
        },
        (req, username, password, done) => {
            if (
                username === cred.account.username &&
                password === cred.account.password
            ) {
                const user = {
                    id: cred.account.id,
                    username: cred.account.username,
                    nickname: cred.account.displayName
                };
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Incorrect username or password.'
                });
            }
        }
    )
);

passport.serializeUser<any, any>((req, user, done) => {
    // could use process.nexttick to make asynchronous
    // attaching the entire user object to req.sessions
    console.log(
        'Passport serialize user called, user object attached to session.'
    );
    done(null, user);
});

// on subsequent requests to authorization needed pages, passport will call deserializeuser to obtain more information from the store and then populate req.session with that information
passport.deserializeUser((id, done) => {
    // if need more information on the user will assign to req.user here. in prod you would search store for user's details
    console.log(
        'Passport deserialize user called, user object attached to session with more details.'
    );
    const user = {
        id: cred.account.id,
        username: cred.account.username,
        nickname: cred.account.displayName
    };
    done(undefined, user);
});
