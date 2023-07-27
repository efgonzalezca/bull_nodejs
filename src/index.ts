import express, { Application, NextFunction, Request, Response, json } from 'express';
import Bull, { Queue, Job} from 'bull';

const app: Application = express();
const port = 4100;

const queue: Queue<{id: number}> = new Bull('processes', 'redis://127.0.0.1:6379');
let currentValue = 0;

queue.process((job: Job<{id: number}>) => {
  console.log('entro a procesar', job.data.id);
  return Promise.resolve(job.data);
})

app.post('/', json(), (req: Request, res: Response, _next: NextFunction) => {
  //TODO: add to queue
  const data = req.body;
  console.log('llega el cliente con id', data.id, 'llego', currentValue)
  currentValue++;
  const randomValue = Math.floor(Math.random() * (14951)) + 50;
  setTimeout(() => {
    console.log('agrego el proceso al cliente', data.id)
    queue.add(data);
  }, randomValue)
  return res.json({ok: true})
})

queue.on('completed', (job: Job<{id: number}>, result: unknown) => {
  console.log('se termino el proceso', job.data.id)
  console.log('se termino el proceso con resultado', result)
})

queue.on('failed', (job: Job<{id: number}>, err: unknown) => {
  console.log('se termino el proceso fallo', job.data.id)
  console.log('error', err)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})