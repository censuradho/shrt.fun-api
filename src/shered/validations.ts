export function slugValidation (slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function urlValidation (url: string): boolean {
  try {
    new URL(url)
    return true
  } catch  {
    return false
  }
}