// Pages under /embed/ are iframed by other organisations' sites (e.g. a chapter's join form).
// Takes a route id or a pathname without a locale prefix.
export const isEmbedPath = (path: string | null | undefined) => path?.startsWith('/embed/') ?? false
