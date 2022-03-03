import * as core from '@actions/core'
import * as github from '@actions/github'
import * as z from 'zod'

export const PullRequestSchema = z.object({
  number: z.number(),
  base: z.object({ref: z.string(), sha: z.string()}),
  head: z.object({ref: z.string(), sha: z.string()})
})

export const CompareResponseSchema = z.array(
  z.object({
    change_type: z.enum(['added', 'removed']),
    manifest: z.string(),
    ecosystem: z.string(),
    name: z.string(),
    version: z.string(),
    package_url: z.string(),
    license: z.string(),
    source_repository_url: z.string().nullable(), // temporary .nullable(); this is not in line with the OpenAPI spec but the API returns nil for some reason
    vulnerabilities: z
      .array(
        z.object({
          severity: z.enum(['critical', 'high', 'moderate', 'low']),
          advisory_ghsa_id: z.string(),
          advisory_summary: z.string(),
          advisory_description: z.string()
        })
      )
      .optional()
  })
)

export type PullRequest = z.infer<typeof PullRequestSchema>
export type CompareResponse = z.infer<typeof CompareResponseSchema>

const octo = github.getOctokit(core.getInput('repo-token'))

export async function compare(
  owner: string,
  repo: string,
  baseRef: string,
  headRef: string
): Promise<CompareResponse> {
  // TODO: Add backoff
  // Add an artificial 500ms delay, and fail 50% of the time.
  /*await new Promise((accept, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.2) {
        accept(null)
      } else {
        reject(new Error('oops, something went wrong'))
      }
    }, 500)
  })*/

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
