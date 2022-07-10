
## Getting started

First install the pacakge globally to allow for usage in any of your repos

```
npm i -g @dtdot/cypress-mindmap
```

## CLI Usage

This CLI is for extracting test structure + test cases from a set of test files and exporting in json format or visualising through the UI.

NOTE: The spec path provided must be in quotes otherwise the glob pattern gets expanded too early

### JSON Format

To run the cli against your test suite and extrat test files into JSON format, run the CLI with an output file specified

```
cypress-mindmap --spec "test/folder/**/*.cy.ts" --out structure.json
```

### UI

To run the cli against your test suite and start up a UI to visualise them, run the CLI with the `ui` flag set

```
cypress-mindmap --spec "test/folder/**/*.cy.ts" --ui
```