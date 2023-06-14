/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-console */
import multer from 'multer';
import express from 'express';
import os from 'os';
import osUtils from 'os-utils';
import piusage from 'pidusage';

const upload = multer({
  dest: './tmp',
});

const app = express();

interface Upload {
  name: string;
  description: string;
}

let cpuUsage = 0;

const updateCpuUsage = () => {
  const pidusage = require('pidusage');
  pidusage(process.pid, (err: any, stats: { cpu: number }) => {
    if (err) {
      console.error(`Erro ao obter o uso da CPU: ${err}`);
      return;
    }
    cpuUsage = stats.cpu;
  });
};

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

  const freeMemory = formatBytes(osUtils.freememPercentage());

  const performanceData = {
    UsoCPU,
    freeMemory,
  };

  res.json(performanceData);
});

app.post('/upload', upload.single('file'), async (request, response) => {
  const { file } = request;
  // eslint-disable-next-line global-require, no-console

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  // Obter informações sobre a CPU
  const cpuCount = os.cpus().length;
  const cpuModel = os.cpus()[0].model;

  console.log(`Número de CPUs: ${cpuCount}`);
  console.log(`Modelo da CPU: ${cpuModel}`);

  console.log(`Total de memória: ${formatBytes(totalMemory)}`);
  console.log(`Memória utilizada: ${formatBytes(usedMemory)}`);
  console.log(`Memória livre: ${formatBytes(freeMemory)}`);

  response.send(file);
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('🏃 Servidor Conectado!');
});
