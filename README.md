ngx-bind-io-cli
===============

Tools for check Angular7+ components for use [ngx-bind-io](https://github.com/EndyKaufman/ngx-bind-io) directives

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ngx-bind-io-cli.svg)](https://npmjs.org/package/ngx-bind-io-cli)
[![CircleCI](https://circleci.com/gh/EndyKaufman/ngx-bind-io-cli/tree/master.svg?style=shield)](https://circleci.com/gh/EndyKaufman/ngx-bind-io-cli/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/EndyKaufman/ngx-bind-io-cli?branch=master&svg=true)](https://ci.appveyor.com/project/EndyKaufman/ngx-bind-io-cli/branch/master)
[![Codecov](https://codecov.io/gh/EndyKaufman/ngx-bind-io-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/EndyKaufman/ngx-bind-io-cli)
[![Downloads/week](https://img.shields.io/npm/dw/ngx-bind-io-cli.svg)](https://npmjs.org/package/ngx-bind-io-cli)
[![License](https://img.shields.io/npm/l/ngx-bind-io-cli.svg)](https://github.com/EndyKaufman/ngx-bind-io-cli/blob/master/package.json)

## Example use [ngx-bind-io](https://github.com/EndyKaufman/ngx-bind-io) directives

Without auto binding inputs and outputs
```html
<component-name
    (start)="onStart()"
    [isLoading]="isLoading$ | async"
    [propA]="propA"
    [propB]="propB">
</component-name>
```

With auto binding inputs and outputs
```html
<component-name
    [bindIO]>
</component-name>
```

## Usage
<!-- ussage -->
Simple
```sh-session
$ npx ngx-bind-io-cli ./src
```
With detect all component and ignore count of inputs or outputs
```sh-session
$ npx ngx-bind-io-cli ./src --maxInputs=0 --maxOutputs=0
```
With correct work with tspaths
```sh-session
$ npx ngx-bind-io-cli ./src --maxInputs=0 --maxOutputs=0 --tsconfig=./src/tsconfig.app.json
```
<!-- ussagestop -->


## Commands
<!-- commands -->

### `ngx-bind-io-cli [PATH]`

```
USAGE
  $ ngx-bind-io-cli [PATH]

OPTIONS
  -c, --tsconfig=tsconfig  Please set if you use tspaths for correct scan
                           base components

  -f, --fix=(used|all)     Auto initialized all not initialized inputs

  -h, --help               show CLI help

  -i, --info               Show inputs and outputs used in components

  -q, --quoteDouble        Double quote type used for string literals

  -v, --version            show CLI version

  --ignores=ignores        Ignored files and paths

  --maxInputs=maxInputs    [default: 3] Max count of inputs for detect need
                           use NgxBindIO directives

  --maxOutputs=maxOutputs  [default: 3] Max count of outputs for detect need
                           use NgxBindIO directives

  --verbose                Show all detail informations for inputs and
                           outputs used in components
```
<!-- commandsstop -->