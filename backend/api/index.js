// Vercel Serverless Entry Point
// This file imports the compiled NestJS application

const main = require('../dist/src/main');

module.exports = main.default || main;

