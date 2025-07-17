class AsyncQueue {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next task
    }
  }

  async drain() {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  get size() {
    return this.queue.length;
  }

  get pending() {
    return this.running;
  }
}

// Background tasks queue
const backgroundQueue = new AsyncQueue(3);

// Email queue for notifications
const emailQueue = new AsyncQueue(2);

// File processing queue
const fileQueue = new AsyncQueue(1);

module.exports = {
  AsyncQueue,
  backgroundQueue,
  emailQueue,
  fileQueue
};
