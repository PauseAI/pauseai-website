// How long the browser keeps a signup's record id for a resume (signupResume.ts).
// The server's continuation token outlives it slightly, so a resume near the end
// of this window still carries a token the server accepts.
export const SIGNUP_MAX_AGE_MS = 24 * 60 * 60 * 1000
