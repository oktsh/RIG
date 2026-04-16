import chalk from 'chalk';
import logSymbols from 'log-symbols';

export const Logger = {
  success(msg: string) { console.log(`${logSymbols.success} ${chalk.green(msg)}`); },
  warn(msg: string) { console.log(`${logSymbols.warning} ${chalk.yellow(msg)}`); },
  error(msg: string) { console.error(`${logSymbols.error} ${chalk.red(msg)}`); },
  info(msg: string) { console.log(`${logSymbols.info} ${chalk.blue(msg)}`); },
  dim(msg: string) { console.log(chalk.dim(msg)); },
  summary(lines: string[]) { lines.forEach(l => console.log(`  ${l}`)); },
};
