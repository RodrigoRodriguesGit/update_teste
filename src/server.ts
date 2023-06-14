/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-console */
import multer from 'multer';
import express from 'express';
import os from 'os';
import osUtils from 'os-utils';
import process from 'process';

const upload = multer({
  dest: './tmp',
});

const app = express();

interface Upload {
  name: string;
  description: string;
}

function formatBytes(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

app.get('/teste', async (req, res) => {
  res.json({ message: `Teste` });
});

app.get('/desempenho', async (req, res) => {
  const performanceData = {
    plataforma: os.platform(),
    arquitetura: os.arch(),
    cpus: os.cpus().length,
    memoriaTotal: formatBytes(os.totalmem()),
    memoriaLivre: formatBytes(os.freemem()),
  };
  res.json(performanceData);
});

app.get('/monitoramento', async (req, res) => {
  // const UsoCPU = osUtils.cpuUsage();

  const UsoCPU = osUtils.cpuUsage(function (v) {
    console.log(`CPU Usage (%): ${(v * 100).toFixed(1)}`);
  });

  const freeMemory = osUtils.freememPercentage().toFixed(1);
  const UsoMemoriaResidenteTotal = formatBytes(process.memoryUsage().rss);
  const TamanhoTotalMemoria = formatBytes(process.memoryUsage().heapTotal);
  const QtdMemoriaEmUso = formatBytes(process.memoryUsage().heapUsed);
  const QtdMemoriaAlocada = formatBytes(process.memoryUsage().external);

  const performanceData = {
    UsoCPU,
    freeMemory,
    UsoMemoriaResidenteTotal,
    TamanhoTotalMemoria,
    QtdMemoriaEmUso,
    QtdMemoriaAlocada,
  };

  res.json(performanceData);
});

app.post('/upload', upload.single('file'), async (request, response) => {
  const { file } = request;
  // eslint-disable-next-line global-require, no-console

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const cpuCount = os.cpus().length;
  const cpuModel = os.cpus()[0].model;

  console.log(`Número de CPUs: ${cpuCount}`);
  console.log(`Modelo da CPU: ${cpuModel}`);

  console.log(`Total de memória: ${formatBytes(totalMemory)}`);
  console.log(`Memória utilizada: ${formatBytes(usedMemory)}`);
  console.log(`Memória livre: ${formatBytes(freeMemory)}`);

  const memoryBefore = process.memoryUsage().heapUsed;
  const memoryAfter = process.memoryUsage().heapUsed;
  const memoryUsed = memoryAfter - memoryBefore;

  console.log(
    `Uso da memória ao iniciar o processo de upload ${formatBytes(
      memoryBefore,
    )}`,
  );
  console.log(
    `Uso da memória ao final o processo de upload ${formatBytes(memoryAfter)}`,
  );

  console.log(`Uso da memória ${formatBytes(memoryUsed)}`);

  response.json({ memoryUsed });

  // response.send(file);
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('🏃 Servidor Conectado!');
});
