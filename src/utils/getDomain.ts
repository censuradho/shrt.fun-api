export const getDomain = (url: string) =>
  url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]