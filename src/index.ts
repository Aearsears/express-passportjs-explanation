import express from 'express';

const app = express();

app.get('/', (req, resp) => {
    resp.status(200);
    resp.send('Were live!');
});

app.listen(4000, () => {
    console.log('live');
});
