/* ===========================================================================
   DATABASE_URL CLEAN-UP

   Hosting dashboards make it easy to paste a connection string that is nearly
   right: a leftover "DATABASE_URL =" in front, quotes, a stray space or line
   break, Supabase's "[YOUR-PASSWORD]" brackets still around the password, or
   a password containing / # @ ? which must be percent-encoded. Any of these
   makes postgres.js fail with a bare "Invalid URL" and the value is masked in
   the logs, so the cause is invisible.

   normalizeDatabaseUrl() repairs those cases. If the result still is not a
   valid URL it throws an error that says what is wrong WITHOUT printing the
   password.
   =========================================================================== */

const SHAPE = /^(postgres(?:ql)?:\/\/)([^:@/?#]+):(.*)@([^@/?#]+)(\/[^?#]*)?(\?[^#]*)?$/i;

export function normalizeDatabaseUrl(raw: string): string {
  let url = raw.replace(/[\r\n\t]/g, "").trim();
  url = url.replace(/^DATABASE_URL\s*=\s*/i, "").trim();
  url = url.replace(/^["'`]+|["'`]+$/g, "").trim();

  const m = SHAPE.exec(url);
  if (m) {
    const [, scheme, user, rawPassword, host, path = "/postgres", query = ""] = m;
    let password = rawPassword.trim();
    if (password.startsWith("[") && password.endsWith("]")) password = password.slice(1, -1);
    let decoded = password;
    try {
      decoded = decodeURIComponent(password);
    } catch {
      // Not valid percent-encoding: treat it as a raw password.
    }
    url = `${scheme}${user.trim()}:${encodeURIComponent(decoded)}@${host.trim()}${path}${query}`;
  }

  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(`DATABASE_URL is not a valid connection string. ${describe(url)}`);
  }
}

/* A secret-free description of what the value looks like, for error logs. */
function describe(url: string): string {
  const notes: string[] = [];
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    // Never echo any of the value: it may be just the password on its own.
    notes.push('It should start with "postgresql://" - paste the whole connection string, not only the password.');
  }
  if (!url.includes("@")) notes.push('It has no "@" between the password and the host.');
  if (!/:\d+\//.test(url)) notes.push('It has no ":port/" (expected ":6543/postgres" for the Supabase pooler).');
  notes.push(`Length ${url.length} characters.`);
  return notes.join(" ");
}
