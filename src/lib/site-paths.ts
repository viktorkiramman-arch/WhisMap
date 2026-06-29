export const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? ''

export const withBasePath = (path: `/${string}`): string => `${siteBasePath}${path}`

