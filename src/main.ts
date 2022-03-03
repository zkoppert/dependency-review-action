import * as core from '@actions/core'
import * as dependencyGraph from './dependency-graph'
import * as github from '@actions/github'
import * as retryHelpers from './retry-helper'
import * as z from 'zod'
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
    const compareResponse = await retryHelper.execute(() =>
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
            `${vuln.advisory_ghsa_id} (${styles.color.red.open}${vuln.severity}${styles.color.red.close}) -- ${vuln.advisory_summary}`
          )
          core.info(vuln.advisory_description)
          core.info(`https://github.com/advisories/${vuln.advisory_ghsa_id}`)
          core.endGroup()
        }
        failed = true
      }
    }

    if (failed) {
      core.setFailed('this pr introduces vulnerabilities')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
