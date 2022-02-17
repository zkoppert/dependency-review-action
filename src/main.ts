import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  var payload = {};
  const context = github.context
  
  if (!context.payload.pull_request) {
    core.info('This action only works on pull requests')
    return
  }
  
  try {
    core.info(`Repository\t\t ${context.repo.repo}`)
    core.info(`Repo Owner\t\t ${context.repo.owner}`)
    core.info(`Pull Request\t\t ${context.payload.pull_request.number}`)
    core.info(`Base Branch\t\t ${context.payload.pull_request.base.ref}`)
    core.info(`Head Branch\t\t ${context.payload.pull_request.head.ref}`)
    core.info(`Base SHA\t\t ${context.payload.pull_request.base.sha}`)
    core.info(`Head SHA\t\t ${context.payload.pull_request.head.sha}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
