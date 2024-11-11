import 'dotenv/config'
import sync from './commands/sync.js'

import { program } from 'commander'

const start = performance.now()

function commaSeparatedList(value: string) {
  return value.split(',')
}

program
  .command('sync')
  .option('-w, --wiki <wiki>', 'The wiki to sync to', commaSeparatedList)
  .option('-p, --pages <pages>', 'The pages to sync', commaSeparatedList)
  .action(sync)

await program.parseAsync()

const end = performance.now()

console.log(`Done in ${(end - start).toFixed(1)}ms`)
