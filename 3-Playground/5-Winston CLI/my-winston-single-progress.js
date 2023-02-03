import winston from "winston";
import cliProgress from "cli-progress";

/**
 * Read: https://github.com/npkgz/cli-progress/issues/111
 * Read: https://gist.github.com/Darkproduct/b12edf0b95db9f5554cff18e0f1d9581
 **/

// Create logger instance
const logger = winston.createLogger({
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.colorize(),
        winston.format.simple()
      ),
      colorize: true,
      level: "silly",
    }),
  ],
});

class LoggerWrap {
  /**
   * A wrapper for any logger with a `log` method to work with cli-progress
   * Compatible to:
   *  - `console`
   *  - `watson.Logger`
   * @param {watson.Logger|console} logger the logger instance
   */
  constructor(logger) {
    this.logger = logger;
    this.logArgs = new Array();
  }

  getCallback() {
    return () => {
      // For `cliProgress.MultiBar` you have to do only `process.stderr.clearLine(1);` in the callback as well
      process.stderr.cursorTo(0, null);
      process.stderr.clearLine(1);

      while (this.logArgs.length > 0) {
        const msg = this.logArgs.shift();
        this.logger.log(...msg);
      }
    };
  }

  // logger overrides
  log(...args) {
    // copy all values, to log them later and still log the current state
    this.logArgs.push(JSON.parse(JSON.stringify(args)));
  }

  // winston overrides
  error(msg, ...meta) {
    this.log("error", msg, ...meta);
  }
  warn(msg, ...meta) {
    this.log("warn", msg, ...meta);
  }
  info(msg, ...meta) {
    this.log("info", msg, ...meta);
  }
  http(msg, ...meta) {
    this.log("http", msg, ...meta);
  }
  verbose(msg, ...meta) {
    this.log("verbose", msg, ...meta);
  }
  debug(msg, ...meta) {
    this.log("debug", msg, ...meta);
  }
  silly(msg, ...meta) {
    this.log("silly", msg, ...meta);
  }
}

// Testing from here till the eof:
logger.info("Start");

// Create wlogger, wconsole & bar including event handler for 'redraw-pre'
const wlogger = new LoggerWrap(logger);
const wconsole = new LoggerWrap(console);

const bar = new cliProgress.SingleBar({
  clearOnComplete: false, // this would be true in production
  forceRedraw: true, // without this the bar is flickering
  hideCursor: false,
}); // For `cliProgress.MultiBar` you have to do only `process.stderr.clearLine(1);` in the callback as well

bar.on("redraw-pre", wlogger.getCallback());
bar.on("redraw-pre", wconsole.getCallback());
bar.start(6, 0);

// create/simulate concurrent queue of tasks
const request = (task) =>
  new Promise((res, rej) => {
    wlogger.info("requesting %s", task);
    wconsole.log("console message 1");
    setTimeout(() => {
      if (Math.random() < 0.5) {
        wlogger.info("resolving %s", task);
        wconsole.log("console message 2");
        res(task);
      } else {
        wlogger.warn("rejecting %s", task);
        wconsole.log("console message 3");
        rej(task);
      }
    }, 500);
  });

// Task list
const tasks = [1, 2, 3, 4, 5, 6];

// List of callables
const makeRequests = tasks.map((task) => () => request(task));
const recurse = () => {
  const makeRequest = makeRequests.shift();
  return !makeRequest
    ? null
    : Promise.allSettled([makeRequest()]).then(() => {
        bar.increment();
        return recurse();
      });
};

const limit = 2;
await Promise.all(Array.from({ length: limit }, recurse)).then(() => {
  // The bar has to be stopped manually if not all of them finish
  bar.stop();
  // Handle logging que
  logger.debug("Print backlog:");
  wlogger.getCallback()();
  logger.info("Finished");
});

// End Test
logger.info("End");
