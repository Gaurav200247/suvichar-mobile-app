import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ErrorResponse } from 'src/utils/responses';

const isVercel = !!process.env.VERCEL;

@Injectable()
export class CustomLogger extends ConsoleLogger {
  log(message: string) {
    if (isVercel) {
      // Plain console.log for Vercel (no ANSI colors)
      console.log(`[${this.context || 'LOG'}] ${message}`);
    } else {
      super.log(message);
    }
  }

  error(err: ErrorResponse | string | Error) {
    if (isVercel) {
      // Plain console.error for Vercel
      if (typeof err === 'string') {
        console.error(`[${this.context || 'ERROR'}] ${err}`);
      } else if (err instanceof Error) {
        console.error(`[${this.context || 'ERROR'}] ${err.message}`, err.stack);
      } else {
        console.error(`[${this.context || 'ERROR'}]`, JSON.stringify(err, null, 2));
      }
    } else {
      if (typeof err === 'string') {
        super.error(err);
      } else {
        super.error(JSON.stringify(err, null, 2));
      }
    }
  }

  warn(message: string) {
    if (isVercel) {
      console.warn(`[${this.context || 'WARN'}] ${message}`);
    } else {
      super.warn(message);
    }
  }

  debug(message: string) {
    if (isVercel) {
      console.debug(`[${this.context || 'DEBUG'}] ${message}`);
    } else {
      super.debug(message);
    }
  }

  verbose(message: string) {
    if (isVercel) {
      console.log(`[${this.context || 'VERBOSE'}] ${message}`);
    } else {
      super.verbose(message);
    }
  }
}
