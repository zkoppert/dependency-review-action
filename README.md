# dependency-review-action

This action speaks with the Dependency Review API.

## Local Development

This can help you get the Action running all the time in your computer
for stubbed development:

In one shell run:
```
npm install nodemon --save-dev
npm run build -- --watch
```

Then in another terminal:
```
env INPUT_REPO-TOKEN=hello GITHUB_REPOSITORY=some/repo GITHUB_EVENT_PATH=./event.json ./node_modules/.bin/nodemon -r lib/main.js 
```

Check
[event.json.sample](https://github.com/github/dependency-review-action/blob/main/event.json.sample)
for a sample `event.json` you can use for testing.

## Release

Don't forget to package your code!

```
$ npm run build && npm run package
```
