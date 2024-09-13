import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import AppServerModule from './src/main.server';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { ROUTES } from '@angular/router';
import { ngExpressEngine } from '@nguniversal/express-engine';
const app = express();

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
}));

app.set('view engine', 'html');
app.set('views', join(process.cwd(), 'dist/browser'));

app.get('*.*', express.static(join(process.cwd(), 'dist/browser'), {
  maxAge: '1y'
}));

app.get('*', (req, res) => {
  res.render('index', { req });
});

app.listen(4000, () => {
  console.log(`Listening on http://localhost:4000`);
});