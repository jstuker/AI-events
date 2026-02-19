// Shared CORS origin helpers for Vercel serverless functions.

export function getAllowedOrigins(): readonly string[] {
  const origins: string[] = ["https://ai-weeks.ch"];

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) origins.push(`https://${vercelUrl}`);

  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL;
  if (vercelBranchUrl) origins.push(`https://${vercelBranchUrl}`);

  const vercelDeployUrl = process.env.VERCEL_URL;
  if (vercelDeployUrl) origins.push(`https://${vercelDeployUrl}`);

  return origins;
}

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return getAllowedOrigins().some((allowed) => origin === allowed);
}
