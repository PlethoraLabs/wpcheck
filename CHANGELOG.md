### v0.2.0 (2016-06-30)

* Core: Multiple mocha tests
* Core: URI autocomplete for CLI commands (`ma.tt → http://ma.tt`)
* Core: Extended functionality for CLI arguments handling
* Core: Shortcuts for CLI options (`-s` → `--silent` & `-r` → `--rules-dir`)
* Travis: Remove `node_js` versions <= 4
* ESLint: Add `mocha: true` to `env` arguments
* Codeclimate: Add `test` folder to `exclude_paths`


### v0.1.2 (2016-06-27)

* Readme: Reorganize text blocks
* Readme: Add badges ;)
* ESLint: Embed path to `.eslintrc`
* Codeclimate: Set `mass_threshold` to `50`


### v0.1.1 (2016-06-27)

* Readme: Add more example snippets
* Readme: Add description for custom rules
* ESLint: Check all JS files
* ESLint: Add `sourceType: module` property
* Examples: Add example file for custom rules
* Core: Replace `var` with `const` when it's necessary
* Core: Add `silent` state to `message.(success|notice)` calls
* Core: Better error handling for rules loading


### v0.1.0 (2016-06-26)

* Core functionality
* Option: Silent mode
* Option: Load additional rules from a custom directory
* Rule: System files exists