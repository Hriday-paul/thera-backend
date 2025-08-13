import { createServer, Server } from 'http';
import app from '.';
import config from './config';
import initializeSocketIO from './socket';

let server: Server;
export const io = initializeSocketIO(createServer(app));
// export const io = initializeSocketIO(createServer(app));

const port = config.port || 3000;

async function main() {
  try {
    
    server = app.listen(port, () => {
      console.log(`[server]: Server is running at ${config.ip + ":" + port}`);
    });

    io.listen(Number(config.socket_port));

    console.log(
      `Socket is listening on port ${config.ip}:${config.socket_port}`,
    );

    //@ts-ignore
    global.socketio = io;
  } catch (err) {
    console.error(err);
  }
}
main();

process.on('unhandledRejection', err => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
