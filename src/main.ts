import * as core from '@actions/core'
import * as dependencyGraph from './dependency-graph'
import * as github from '@actions/github'
import styles from 'ansi-styles'
import * as z from 'zod'
import {RequestError} from '@octokit/request-error'

async function run(): Promise<void> {
  try {
    if (github.context.eventName !== 'pull_request') {
      throw new Error(
        `This run was triggered by the "${github.context.eventName}" event, which is unsupported. Please ensure you are using the "pull_request" event for this workflow.`
      )
    }

    const pull_request = z
      .object({
        number: z.number(),
        base: z.object({sha: z.string()}),
        head: z.object({sha: z.string()})
      })
      .parse(github.context.payload.pull_request)

    const compareResponse = await dependencyGraph.compare({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      baseRef: pull_request.base.sha,
      headRef: pull_request.head.sha
    })

    let failed = false
    for (const change of compareResponse) {
      if (
        change.change_type === 'added' &&
        change.vulnerabilities !== undefined &&
        change.vulnerabilities.length > 0
      ) {
        for (const vuln of change.vulnerabilities) {
          core.info(
            `${styles.bold.open}${change.manifest} » ${change.name}@${
              change.version
            }${styles.bold.close} – ${vuln.advisory_summary} ${renderSeverity(
              vuln.severity
            )}`
          )
          core.info(`  ↪ ${vuln.advisory_url}`)
        }
        failed = true
      }
    }

    if (failed) {
      throw new Error('This pull request introduces vulnerable packages.')
    } else {
      core.info('This pull request does not introduce any vulnerable packages.')
    }
  } catch (error) {
    if (error instanceof RequestError && error.status === 404) {
      core.setFailed(
        `Dependency review is not supported on this repository. Please ensure that Dependency graph is enabled, see https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/settings/security_analysis.`
      )
    } else if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

function renderSeverity(
  severity: 'critical' | 'high' | 'moderate' | 'low'
): string {
  const color = (
    {
      critical: 'red',
      high: 'red',
      moderate: 'yellow',
      low: 'grey'
    } as const
  )[severity]
  return `${styles.color[color].open}(${severity} severity)${styles.color[color].close}`
}

run()
