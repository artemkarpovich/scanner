const net = require('net');
const { EventEmitter } = require('events');
const { Address4 } = require('ip-address');

const statuses = {
  Runnning: 'running',
};

class Scan extends EventEmitter {
  constructor(options) {
    super(options);

    this.options = options;
    this.state = {
      results: [],
      status: statuses.Running,
      stack: new WeakMap(),
      stackLength: 0,
      defaultTimeout: 300,
      i: 0,
    };
  }

  isStackAvailable() {
    return this.state.stackLength < (this.options.workers - 1);
  }

  connect(i, port) {
    const address4 = new Address4(this.options.address);
    const parsedAddress = address4.parsedAddress;
    const address = `${parsedAddress[0]}.${parsedAddress[1]}.${parsedAddress[2]}.${i}`;

    const promise = new Promise((resolve) => {
      const client =  new net.Socket();
      client.setTimeout(this.options.defaultTimeout);

      client.connect({
        host: address,
        port,
      }, async () => {
        resolve({ success: true });
        delete this.state.stack[promise];
        this.emit('promise_resolved');
      });

      client.on('timeout', async () => {
        resolve({ success: false, status: 'timeout'});
        delete this.state.stack[promise];
        this.emit('promise_resolved');
      });

      client.on('error', async (error) => {
        resolve({ success: false, status: 'error' });
        delete this.state.stack[promise];
        this.emit('promise_resolved');
      });
    });

    this.state.stack[promise] = promise;
    this.state.stackLength = this.state.stackLength + 1;

    return promise;
  }

  async addWorker(i) {
    for (let j = 0; j <= 255; j++) {
      const result = await this.connect(i, this.options.port);
      console.log(result, 'result');
    }
  }

  async run() {
    this.emit('start', { message: 'hello' });

    this.addWorker(this.state.i);

    this.on('promise_resolved', () => {
      this.state.stackLength = this.state.stackLength - 1;
      console.log(this.state.stackLength, 'stackLength');
    });
  }
}

const scan = new Scan({
  address: '192.168.94.201',
  ports: [1337],
  port: 8080,
  deep: 1, // default 1
  forceStop: false, // default false,
  workers: 10,
  defaultTimeout: 300,
});

scan.run();

module.exports = Scan;
