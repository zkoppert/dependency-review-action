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

  try {
    const repo = context.repo

    const pull_request = z
      .object({
        number: z.number(),
        base: z.object({ref: z.string(), sha: z.string()}),
        head: z.object({ref: z.string(), sha: z.string()})
      })
      .parse(context.payload.pull_request)

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

    const octo = github.getOctokit(core.getInput('repo-token'))
    const response = await octo.request(
      'GET /repos/{owner}/{repo}/dependency-graph/{basehead}/diff',
      {
        owner: repo.owner,
        repo: repo.repo,
        basehead: `${pull_request.base.sha}...${pull_request.head.sha}`
      }
    )

    core.info(
      JSON.stringify(
        {
          owner: repo.owner,
          repo: repo.repo,
          basehead: `${pull_request.base.sha}...${pull_request.head.sha}`
        },
        null,
        2
      )
    )

    core.info(JSON.stringify(response, null, 2))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
