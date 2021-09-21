"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import express = require('express');
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get('/', (req, resp) => {
    resp.status(200);
    resp.send('Were live!');
});
app.listen(4000, () => {
    console.log('live');
});
