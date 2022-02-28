import * as core from '@actions/core'
import * as dependencyGraph from './dependency-graph'
import * as github from '@actions/github'
import * as z from 'zod'

async function run(): Promise<void> {
  const context = github.context

  if (!context.payload.pull_request) {
    core.info('This action only works on pull requests')
    return
  }

  const repo = context.repo

  const pull_request = z
    .object({
      number: z.number(),
      base: z.object({ref: z.string(), sha: z.string()}),
      head: z.object({ref: z.string(), sha: z.string()})
    })
    .parse(context.payload.pull_request)

  try {
    core.info(`Repository\t\t ${repo.repo}`)
    core.info(`Repo Owner\t\t ${repo.owner}`)
    core.info(`Pull Request\t\t ${pull_request.number}`)
    core.info(`Base Branch\t\t ${pull_request.base.ref}`)
    core.info(`Head Branch\t\t ${pull_request.head.ref}`)
    core.info(`Base SHA\t\t ${pull_request.base.sha}`)
    core.info(`Head SHA\t\t ${pull_request.head.sha}`)

    const diff = await dependencyGraph.compare(
      pull_request.base.ref,
      pull_request.head.ref
    )

    core.info(JSON.stringify(diff, null, 2))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
