import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
  const sortedArray = data.sort((a, b) => a - b);
  parentPort.postMessage(sortedArray);
});
