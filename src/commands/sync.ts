import { Mwn } from 'mwn'
import { central, getLocalBot } from '../bots.js'
import config from '../config.js'
import chalk from 'chalk'

export default async function sync(options: { wiki?: string[]; pages?: string[] }) {
  if (!options.wiki || options.wiki.length === 0) options.wiki = Object.keys(config.wiki)

  for (const wiki of options.wiki) {
    if (!config.wiki[wiki]) {
      throw new Error(`Wiki ${wiki} does not exist in the config`)
    }
  }

  const pages = config.pages.filter((page) => {
    if (options.pages === undefined) return true
    return options.pages.includes(typeof page === 'string' ? page : page.title)
  })

  console.log(
    `Syncing ${chalk.cyan(pages.length)} pages to ${chalk.cyan(options.wiki.length)} wikis: `,
  )

  for (const page of pages) {
    const pageName = typeof page === 'string' ? page : page.title
    const centralPage = await central.read(pageName, { rvprop: ['content', 'timestamp', 'ids'] })
    if (!centralPage.revisions) throw new Error(`Page ${pageName} not found on central wiki`)
    const content = centralPage.revisions[0].content
    if (content === undefined) throw new Error(`Page ${pageName} has no content`)

    process.stdout.write(`Syncing page ${chalk.blue(pageName)} `)

    for (const wiki of options.wiki) {
      const localBot = await getLocalBot(wiki)

      try {
        await localBot.edit(pageName, (rev) => {
          if (!centralPage.revisions) throw new Error(`Page ${pageName} not found on central wiki`)
          if (rev.content !== content) {
            return {
              text: content,
              summary: `Symphony: sync from central wiki (rev #${centralPage.revisions[0].revid})`,
            }
          }
        })
      } catch (e) {
        if (e instanceof Mwn.Error.MissingPage) {
          await localBot.create(
            pageName,
            content,
            `Symphony: sync from central wiki (rev #${centralPage.revisions[0].revid})`,
          )
        }
      }

      process.stdout.write(chalk.green(wiki) + ' ')
    }
    process.stdout.write('\n')
  }
}
