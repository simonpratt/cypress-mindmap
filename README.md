
## CLI Usage

This CLI is for extracting test structure + test cases from a set of test files and saving into a json format.

To run the cli against your test suite, install the package globaly and use the following command. This will scan your test directory for test cases and start up a UI to visualise them.

```
npm i -g @dtdot/cypress-mindmap
cypress-mindmap --spec "test/folder/**/*.cy.ts" --ui
```