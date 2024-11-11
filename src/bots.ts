import { Mwn, type MwnOptions } from 'mwn'

const defaultParams: MwnOptions = {
  OAuth2AccessToken: process.env.ACCESS_TOKEN,

  userAgent: process.env.USER_AGENT ?? 'Symphony (mwn; +https://github.com/mc-wiki/symphony)',

  defaultParams: {
    assert: 'user',
  },
}

export const central = await Mwn.init({
  ...defaultParams,
  apiUrl: process.env.CENTRAL_WIKI,
})

const localBots = new Map<string, Mwn>()
export async function getLocalBot(wiki: string) {
  const { default: config } = await import('./config.js')
  if (!localBots.has(wiki)) {
    return localBots
      .set(
        wiki,
        await Mwn.init({
          ...defaultParams,
          apiUrl: config.wiki[wiki].apiUrl,
        }),
      )
      .get(wiki)!
  } else {
    return localBots.get(wiki)!
  }
}
