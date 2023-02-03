/**Resources:
 * https://stackoverflow.com/questions/56090851/winston-logging-object
 */
import { createLogger, format, transports } from "winston";
import { fileURLToPath } from "url";
import { dirname, basename } from "path";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

function timezoned() {
  const date = new Date(); // Or the date you'd like converted.
  const isoDateTime = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  )
    .toISOString()
    .slice(0, -1); // Get rid of Z(ulu) timezone
  return isoDateTime;
}

const consoleLogPrintter = format.printf(
  (info) => `[${info.timestamp} ${info.level} ${info.label}] ${info.message}`
);

const LOG_FORMAT = format.combine(
  format.timestamp({ format: timezoned }),
  format.label({ label: basename(_filename) }),
  format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }) // Format the metadata object
);

const logger = createLogger({ format: LOG_FORMAT, exitOnError: false });

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.align(),
        consoleLogPrintter
      ),
    })
  );
} else {
  logger.add(
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: format.json(),
    })
  );
  logger.add(
    new transports.File({
      filename: "logs/combined.log",
      format: format.json(),
    })
  );
}

logger.error("Some error occurred", { action: "error action" });
logger.warn("Some warning", { action: "warning action" });
logger.info("Some info about the program", { action: "info action" });
