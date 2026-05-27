import { createServer } from "node:net";

export async function findAvailablePort(startPort, attempts = 20) {
  if (Number(startPort) === 0) return await probePort(0);
  const firstPort = Number(startPort) || 3000;
  for (let offset = 0; offset < attempts; offset += 1) {
    const port = firstPort + offset;
    if (await canListen(port)) return port;
  }
  throw new Error(`No available port found from ${firstPort} to ${firstPort + attempts - 1}.`);
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port);
  });
}

function probePort(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.once("listening", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
    server.listen(port);
  });
}
