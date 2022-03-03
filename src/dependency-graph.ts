import * as z from 'zod'
import * as github from '@actions/github'
import * as core from '@actions/core'

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
      owner: owner,
      repo: repo,
      basehead: `${baseRef}...${headRef}`
    }
  )
  return CompareResponseSchema.parse(response.data)
}

function getVulnerableChanges(response: CompareResponse): CompareResponse {
  return response.filter(change => {
    return change.vulnerabilities !== undefined
  })
}

const SAMPLE_RESPONSE: CompareResponse = [
  {
    change_type: 'removed',
    manifest: 'path/to/package-lock.json',
    ecosystem: 'npm',
    name: '@actions/core',
    version: '1.1.0',
    package_url: 'pkg:/npm/%40actions/core@1.1.0',
    license: 'MIT',
    source_repository_url: 'https://github.com/owner/sourcerepo'
  },
  {
    change_type: 'added',
    manifest: 'path/to/package-lock.json',
    ecosystem: 'npm',
    name: '@actions/core',
    version: '1.2.2',
    package_url: 'pkg:/npm/%40actions/core@1.2.2',
    license: 'MIT',
    source_repository_url: 'https://github.com/owner/sourcerepo',
    vulnerabilities: [
      {
        severity: 'critical',
        advisory_ghsa_id: 'GHSA-rf4j-j272-fj86',
        advisory_summary: 'lorem ipsum hackum',
        advisory_description:
          'tall dark and felonious; enjoys advanced persistent walks through your infra'
      }
    ]
  }
]
