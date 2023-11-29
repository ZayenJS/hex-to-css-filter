import { Command } from 'commander';
import { Color } from './models/Color';

const program = new Command();

program.version('0.0.1').description('An application that converts a HEX color to CSS filter() values.');

program
  .command('convert <color>')
  .alias('c')
  .description('Convert HEX color to CSS filter() values')
  .option('-p, --precision <precision>', 'Precision of the output (where 0.0 is the most precise)', '0.5')
  .option('-i, --iterations <iterations>', 'Number of max iterations to run the solver', '1000')
  .action(Color.convert);

program.parse(process.argv);
