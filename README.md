# Dependency Review Action

This Action scans for vulnerable versions of dependencies introduced by package version changes in Pull Requests, and warns you about the associated security vulnerabilities.

## Usage

1. Create a new [Personal Access Token
   (PAT)](https://github.com/settings/tokens) with the `repo` permissions. Copy this for use in step 2
2. Create a new Actions Secret on your repo at `https://github.com/<OWNER>/<REPO>/settings/secrets/actions`
3. Name it `REPO_TOKEN` and set its value to the previously generated PAT from step 1
4. Add a new YAML workflow to your `.github/workflows` folder:

```yaml
name: 'Dependency Review'
on: [pull_request]

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v3
      - name: 'Dependency Review'
        uses: dsp-testing/dependency-review-action@main
        with:
          repo-token: ${{ secrets.REPO_TOKEN }}
```

## Rough Edges

The DR workflow will execute when ever a Pull Request on the target repo receives a push. Upon install, the Action will not execute automatically on existing in-flight PRs until they receive a push.

Once installed, any changes to DR-eligible manifest files in a PR that _do not address existing vulnerable dependencies declared there_ will cause this Action to fail CI. This is slated to be addressed during the staff ship, and should not effect your ability to merge such PRs.

If you encounter undue friction and need assistance, contact the DR maintainers using the methods outlined in the staff ship annoucement, or in Slack at `#dependency-graph`.

_Note_: We are using the `@main` release since this is still under
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
