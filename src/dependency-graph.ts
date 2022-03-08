import * as core from '@actions/core'
import * as github from '@actions/github'
import * as githubUtils from '@actions/github/lib/utils'
import * as retry from '@octokit/plugin-retry'
import * as z from 'zod'

export const CompareResponseSchema = z.array(
  z.object({
    change_type: z.enum(['added', 'removed']),
    manifest: z.string(),
    ecosystem: z.string(),
    name: z.string(),
    version: z.string(),
    package_url: z.string(),
    license: z.string().nullable(),
    source_repository_url: z.string().nullable(),
    vulnerabilities: z
      .array(
        z.object({
          severity: z.enum(['critical', 'high', 'moderate', 'low']),
          advisory_ghsa_id: z.string(),
          advisory_summary: z.string(),
          advisory_url: z.string()
        })
      )
      .optional()
  })
)

export type CompareResponse = z.infer<typeof CompareResponseSchema>

const retryingOctokit = githubUtils.GitHub.plugin(retry.retry)

const octo = new retryingOctokit(
  githubUtils.getOctokitOptions(core.getInput('repo-token'))
)

export async function compare({
  owner,
  repo,
  baseRef,
  headRef
}: {
  owner: string
  repo: string
  baseRef: string
  headRef: string
}): Promise<CompareResponse> {
  const response = await octo.request(
    'GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}',
    {
      owner,
      repo,
      basehead: `${baseRef}...${headRef}`
    }
  )
  return CompareResponseSchema.parse(response.data)
}
