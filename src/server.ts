import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParse from 'csv-parser';
import { Server } from 'http';

// Antigo para teste, primeira forma
const upload = multer({
  dest: './tmp',
});

const app = express();

interface Upload {
  name: string;
  description: string;
}

function loadCategories(file: Express.Multer.File): Promise<Upload[]> {
  return new Promise((resolver, reject) => {
    const stream = fs.createReadStream(file.path);

    const parseFile = csvParse();

    stream.pipe(parseFile);

    const categories: Upload[] = [];

    parseFile
      .on('data', async line => {
        // eslint-disable-next-line no-console
        console.log(line);
        const { name, description } = line;
        categories.push({ description, name });
      })
      .on('end', () => {
        resolver(categories);
      })
      .on('error', err => {
        reject(err);
      });
  });
}

app.get('/teste', async (req, res) => {
  res.json({ message: 'success!' });
});

app.post('/uploadCSV', upload.single('file'), async (request, response) => {
  const { file } = request;
  const categories = await loadCategories(file);
  response.send(categories);
});

// app.post('/uploadCSV', upload.single('file'), async (request, response) => {
// const { file } = request;
// const categories = await loadCategories(file);
// response.send(categories);
// });

app.post('/upload', upload.single('file'), async (request, response) => {
  const { file } = request;
  setTimeout(() => {
    response.send(file);
  }, 30000);
});

app.listen(3000, () => {
  console.log('🏃 Running Server');
});
