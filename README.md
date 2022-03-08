# Dependency Review Action

This actions checks the dependencies you introduce in pull requests
and warns you about security vulnerabilities:

## Usage

1. Create a new [Personal Access Token
(PAT)](https://github.com/settings/tokens) with the `repo`
permissions. Copy this somewhere.

2. Create a new Actions Secret in your repo by visiting:
https://github.com/<owner>/<repo>/settings/secrets/actions. Name it
`REPO_TOKEN` and set its value to the previously generated PAT.

3. Add a new YAML workflow to your `.github/workflows` folder:

```yaml
name: 'Dependency Review'
on: [pull_request]

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v3
      - name: Dependency Review
        uses: dsp-testing/dependency-review-action@main
        with:
          repo_token: ${{ secrets.REPO_TOKEN }}

```

*Note*: We are using the `@main` release since this is still under
active development. Once we're ready to ship to production we'll
change this to a proper version number.

## Bugs and Suggestions

Please file a new issue if you encounter a bug, or if this is behaving
in an unexpected way. You can also find us in Slack in the
#dependency-graph channel.

## Local Development

This will get you running the Action locally for stubbed development:

```sh
$ GITHUB_TOKEN=<token> ./scripts/dev <owner>/<repo>
```

## Releases

Don't forget to package your code when doing a new release!

```
$ npm run build && npm run package
```
