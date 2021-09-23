# express-passportjs-explanation

Clarifying passportjs, express sessions and authentication

### Middleware

Express middleware is like layers on a cake or in a burger. The order in which we add the middleware is important. Going off the burger example, I like my burger's layers to be: top bun, lettuce, tomato, patty and finally the botton bun. So in my express application I would layer my middleware as follows

```
app.use((req, res, next) => {
    req.burger = [];
    req.burger.push('Top Bun');
    next();
});
app.use((req, res, next) => {
    req.burger.push('Lettuce');
    next();
});
app.use((req, res, next) => {
    req.burger.push('Tomato');
    next();
});
app.use((req, res, next) => {
    req.burger.push('Patty');
    next();
});
app.use((req, res, next) => {
    req.burger.push('Bottom Bun');
    next();
});

app.get('/', (req, res) => {
    res.send('Hello! This is your burger: ' + req.burger);
});
```

<!-- TODO: add middleware diagram/cake -->

When the request-response cycle has ended because of `res.send()` ( `res.send()` calls `res.setHeaders()`,`res.write()` and `res.end()` ), we will have our desired layered burger. If the middleware does not end the request-response cycle, the request will be left hanging.

It is therefore important to verify the order in which the application is adding middleware. For example, if you add a cors middleware at the very end of your application, then cross-origin requests might not properly work.

[Express middleware documentation](https://expressjs.com/en/guide/using-middleware.html)

### Authentication with Passport and Express sessions

Authentication on a website can be mostly achieved using two main middlewares, passport and express sessions. Passport allows us to define multiple authentication strategies, such as OAuth, JWT or local. Sessions will allow us to keep track of the user.

#### What are sessions?

A session is defined by Oxford Languages as "a period devoted to a particular activity." In our case, we have a period devoted to the user's activities, like checking account status.

Sessions will be managed by the middleware express-session. After using this middleware, all requests to the server will have a sessions object, which contains information about the client's cookie and other details we want to add.

When the client logins in, they receive in their browser a cookie with only the session's id. No other details are stored client side, which reduces chances of information breaches. On the server side, we will store the session's details like cookie length and user details.

There is only one session managed by express.

By default, all sessions will be stored in store but this can be changed with the `saveUninitialized` option. It is important to use static paths before using the express-sessions middleware, otherwise you may end up with a lot of useless session in your store.

### Authentication flow

First time login

1. User navigates to our website and attempts to login.
2. User's credentials are sent to our server's POST route.
3. Passport uses our defined strategy to check if the provided credentials match the database's.
    - If they do not match, then user is notified of the error.
    - **HASH YOUR PASSWORDS AND ADD SOME SALT.**
4. Upon success, passport will call `req.login()` which will call `serializeUser()` and will add to `req` a `passport` object to `req.session` that will contain the object in the `serializeUser()` callback. For example, we can have a `user:{id:1}`. We can choose what properties to add. `req.user` is an alias for `req.session.passport.user`.
5. This session will be stored in the database, and the user will receive a cookie that contains the session's unique id.
6. User is logged in and has access.

Subsequent requests

1. User attempts to access a page requiring authentication.
2. Server receives request to the GET route with the user's cookie that contains the session's id.
3. Express-sessions check the store for this session and verifies if it is not expired or does not exist.
    - If the session is expired or does not exist, then user is redirected to login process.
4. Session exists. Then, passport checks if the session contains `passport.user`.
    - If the property is undefined, then user is redirected to login process.
5. Details exist. `deserializeUser()` is called to populate `req.session.passport.user` with more details on the user, like email address or last logged in time. Note that `deserializeUser()` is called on every subsequent request.
6. User is directed to the page.

`isAuthenticated()` checks if the session has the `passport.user.id` field.

Passport's documentation is not the best and unclear at some parts. Hopefully this will have helped you understand the authentication flow and sessions.
