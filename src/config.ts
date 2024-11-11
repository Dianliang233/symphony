import 'dotenv/config'
import { central } from './bots.js'
import { z } from 'zod'
import chalk from 'chalk'

export const configSchema = z.object({
  wiki: z.record(
    z.string(),
    z.object({
      apiUrl: z.string().url(),
    }),
  ),
  pages: z.array(
    z.union([
      z.object({
        title: z.string(),
      }),
      z.string(),
    ]),
  ),
})

const configPage = await central.read('MediaWiki:Symphony-config.json')

if (!configPage.revisions) throw new Error('Config page not found')

let parseResult
try {
  parseResult = configSchema.safeParse(JSON.parse(configPage.revisions[0].content!))
} catch (e) {
  throw new Error(`Config page is not valid JSON: ${(e as Error).message}`)
}

if (!parseResult.success) {
  throw new Error(`Config page is invalid: ${parseResult.error.message}`)
}

console.log(`Read configuration data on central wiki
${chalk.gray('-')} ${chalk.cyan(parseResult.data.pages.length)} pages available to sync
${chalk.gray('-')} ${chalk.cyan(Object.keys(parseResult.data.wiki).length)} wikis available to sync to`)

export default parseResult.data
