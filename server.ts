import express from 'express';
import { join } from 'node:path';
import { ngExpressEngine } from '@nguniversal/express-engine';
import AppServerModule from './src/main.server';


// Initialize the express app
const app = express();

// Setup the Angular Express Engine
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
}));

app.set('view engine', 'html');
app.set('views', join(process.cwd(), 'dist/msvc-client/browser'));

// Serve static files
app.get('*.*', express.static(join(process.cwd(), 'dist/msvc-client/browser'), {
  maxAge: '1y',
}));


// Handle other routes (including serving Angular static files)
app.get('*', (_req, res) => {
  res.sendFile(join(process.cwd(), 'dist/msvc-client/browser', 'index.csr.html'));
});

// Start the server
app.listen(4000, () => {
  console.log(`Listening on http://localhost:4000`);
});
