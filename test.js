const net = require('net');
const { EventEmitter } = require('events');
const { Address4 } = require('ip-address');

function connect(i, port) {
  const address4 = new Address4('192.168.94.201');
  const parsedAddress = address4.parsedAddress;
  const address = `${parsedAddress[0]}.${parsedAddress[1]}.${parsedAddress[2]}.${i}`;

  const promise = new Promise((resolve) => {
    const client =  new net.Socket();
    client.setTimeout(300);

    client.connect({
      host: address,
      port,
    }, async () => {
      resolve({ success: true, address, port });
    });

    client.on('timeout', async () => {
      resolve({ success: false, status: 'timeout'});
    });

    client.on('error', async (error) => {
      resolve({ success: false, status: 'error' });
    });
  });

  return promise;
}

async function run() {
  const port = 8080;

  for (let i = 0; i <= 255; i++) {
    const result = await connect(i, port);
    console.log(result, 'result');
  }
}

run();
