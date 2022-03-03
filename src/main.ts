import * as core from '@actions/core'
import * as dependencyGraph from './dependency-graph'
import * as github from '@actions/github'
import * as retryHelpers from './retry-helper'
import styles from 'ansi-styles'

async function run(): Promise<void> {
  try {
    if (github.context.payload.pull_request === undefined) {
      core.info('This action only works on pull requests')
      return
    }

    const pull_request = dependencyGraph.PullRequestSchema.parse(
      github.context.payload.pull_request
    )

    const retryHelper = new retryHelpers.RetryHelper(3, 1, 2)
    const compareResponse = await retryHelper.execute(async () =>
      dependencyGraph.compare(
        github.context.repo.owner,
        github.context.repo.repo,
        pull_request.base.ref,
        pull_request.head.ref
      )
    )

    let failed = false
    for (const change of compareResponse) {
      if (
        change.change_type === 'added' &&
        change.vulnerabilities !== undefined &&
        change.vulnerabilities.length > 0
      ) {
        for (const vuln of change.vulnerabilities) {
          core.startGroup(
            `${vuln.advisory_summary} (${renderSeverity(
              vuln.severity
            )}) – https://github.com/advisories/${vuln.advisory_ghsa_id}`
          )
          core.endGroup()
        }
        failed = true
      }
    }

    if (failed) {
      core.setFailed(
        "Yo, I'm sorry but you are introduced some vulnerabilities here."
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
  return `${styles.color[color].open}${severity} severity${styles.color[color].close}`
}

run()
