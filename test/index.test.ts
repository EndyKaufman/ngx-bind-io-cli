import { expect, test } from '@oclif/test';
import { readFileSync, writeFileSync } from 'fs';

import cmd = require('../src');

describe('ngx-bind-io-cli', () => {
  beforeEach(done => {
    writeFileSync(
      'test/fixtures/sources/base-base-inner.component.ts',
      readFileSync('test/fixtures/original/base-base-inner.component.ts').toString()
    );
    writeFileSync(
      'test/fixtures/sources/basic.ts',
      readFileSync('test/fixtures/original/basic.ts').toString()
    );
    writeFileSync(
      'test/fixtures/sources/inherits.ts',
      readFileSync('test/fixtures/original/inherits.ts').toString()
    );
    done();
  });
  afterEach(done => {
    writeFileSync(
      'test/fixtures/sources/base-base-inner.component.ts',
      readFileSync('test/fixtures/original/base-base-inner.component.ts').toString()
    );
    writeFileSync(
      'test/fixtures/sources/basic.ts',
      readFileSync('test/fixtures/original/basic.ts').toString()
    );
    writeFileSync(
      'test/fixtures/sources/inherits.ts',
      readFileSync('test/fixtures/original/inherits.ts').toString()
    );
    done();
  });
  test
    .stdout()
    .stderr()
    .do(() => cmd.run([]))
    .it('empty', ctx => {
      expect(ctx.stderr).to.contain(`Please set path with sources for scan, example: npm ngx-bind-io ./src`);
    });
  test
    .stdout()
    .stderr()
    .do(() => cmd.run(['test/fixtures/sources']))
    .it('test/fixtures/sources', ctx => {
      expect(ctx.stdout).to.contain(`Not need migrate to NgxBindIO`);
    });
  test
    .stdout()
    .stderr()
    .do(() => cmd.run(['test/fixtures/sources', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stderr).to.contain(`<inherits-inner-cmp>: Not initialized inputs: isLoading`);
      expect(ctx.stderr).to.contain(`Not ready for migrate to NgxBindIO: 1 components`);
    });
  test
    .stdout()
    .stderr()
    .do(() => cmd.run(['test/fixtures/sources', '--info', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--info', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Outputs: start`);
      expect(ctx.stderr).to.contain(`<inherits-inner-cmp>: Not initialized inputs: isLoading`);
      expect(ctx.stderr).to.contain(`Not ready for migrate to NgxBindIO: 1 components`);
    });
  test
    .stdout()
    .stderr()
    .do(() => cmd.run(['test/fixtures/sources', '--info', '--verbose', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--info', '--verbose', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Class: InnerComponent`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Used with "bindIO" directive in 2 places`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Class: InnerComponent`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Used with "bindIO" directive in 1 places`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Outputs: start`);
      expect(ctx.stderr).to.contain(`<inherits-inner-cmp>: Not initialized inputs: isLoading`);
      expect(ctx.stderr).to.contain(`Not ready for migrate to NgxBindIO: 1 components`);
    });
  test
    .stdout()
    .stderr()
    .do(() => cmd.run(['test/fixtures/sources', '--info', '--fix=used', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--info', '--fix=used', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Outputs: start`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Outputs: start`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Auto initialized inputs: isLoading`);
      expect(ctx.stdout).to.contain(`Ready for migrate to NgxBindIO: 2 components`);
    });
  test
    .stdout()
    .stderr()
    .do(() => cmd.run(['test/fixtures/sources', '--info', '--fix=all', '--verbose', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--info', '--fix=all', '--verbose', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Class: InnerComponent`);
      expect(ctx.stdout).to.contain(`test/fixtures/sources/basic.ts`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Line: 5`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Used in 3 places (all)`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Used with "bindIO" directive in 2 places`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Outputs: start`);
      expect(ctx.stdout).to.contain(`<basic-host-cmp>: Class: HostComponent`);
      expect(ctx.stdout).to.contain(`test/fixtures/sources/basic.ts`);
      expect(ctx.stdout).to.contain(`<basic-host-cmp>: Line: 37`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Class: InnerComponent`);
      expect(ctx.stdout).to.contain(`test/fixtures/sources/inherits.ts`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Line: 13`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Used in 2 places (all)`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Used with "bindIO" directive in 1 places`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Auto initialized inputs: isLoading`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Outputs: start`);
      expect(ctx.stdout).to.contain(`<inherits-host-cmp>: Class: HostComponent`);
      expect(ctx.stdout).to.contain(`test/fixtures/sources/inherits.ts`);
      expect(ctx.stdout).to.contain(`<inherits-host-cmp>: Line: 33`);
      expect(ctx.stdout).to.contain(`Ready for migrate to NgxBindIO: 4 components`);
    });
});
