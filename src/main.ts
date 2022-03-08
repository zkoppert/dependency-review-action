import * as core from '@actions/core'
import * as dependencyGraph from './dependency-graph'
import * as github from '@actions/github'
import * as retryHelpers from './retry-helper'
import styles from 'ansi-styles'
import * as z from 'zod'

async function run(): Promise<void> {
  try {
    if (github.context.payload.pull_request === undefined) {
      core.info('This action only works on pull requests')
      return
    }

    const pull_request = z
      .object({
        number: z.number(),
        base: z.object({sha: z.string()}),
        head: z.object({sha: z.string()})
      })
      .parse(github.context.payload.pull_request)

    const retryHelper = new retryHelpers.RetryHelper(3, 1, 2)
    const compareResponse = await retryHelper.execute(async () =>
      dependencyGraph.compare({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        baseRef: pull_request.base.sha,
        headRef: pull_request.head.sha
      })
    )

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
          core.info(
            `  ↪ https://github.com/advisories/${vuln.advisory_ghsa_id}`
          )
        }
        failed = true
      }
    }

    if (failed) {
      core.setFailed(
        'This pull request introduces vulnerable packages. See details above.'
      )
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
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
