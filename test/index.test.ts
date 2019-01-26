import { expect, test } from '@oclif/test';
import { readFileSync, writeFileSync } from 'fs';

import cmd = require('../src');

describe('ngx-bind-io-cli', () => {
  beforeEach(done => {
    writeFileSync(
      'test/fixtures/sources/base-base-inner.component.ts',
      readFileSync('test/fixtures/original/base-base-inner.component.ts').toString()
    );
    done();
  });
  afterEach(done => {
    writeFileSync(
      'test/fixtures/sources/base-base-inner.component.ts',
      readFileSync('test/fixtures/original/base-base-inner.component.ts').toString()
    );
    done();
  });
  test
    .stdout()
    .do(() => cmd.run([]))
    .it('empty', ctx => {
      expect(ctx.stdout).to.contain(`Please set path with sources for scan, example: npm ngx-bind-io ./src`);
    });
  test
    .stdout()
    .do(() => cmd.run(['test/fixtures/sources']))
    .it('test/fixtures/sources', ctx => {
      expect(ctx.stdout).to.contain(`Not need migrate to NgxBindIO`);
    });
  test
    .stdout()
    .do(() => cmd.run(['test/fixtures/sources', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Not initialized inputs: isLoading`);
      expect(ctx.stdout).to.contain(`Not ready for migrate to NgxBindIO: 1 components`);
    });
  test
    .stdout()
    .do(() => cmd.run(['test/fixtures/sources', '--info', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--info', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Outputs: start`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Not initialized inputs: isLoading`);
      expect(ctx.stdout).to.contain(`Not ready for migrate to NgxBindIO: 1 components`);
    });
  test
    .stdout()
    .do(() => cmd.run(['test/fixtures/sources', '--info', '--verbose', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--info', '--verbose', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Class: InnerComponent`);
      expect(ctx.stdout).to.contain(`<basic-inner-cmp>: Used with "bindIO" directive in 2 places`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Class: InnerComponent`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Used with "bindIO" directive in 1 places`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Outputs: start`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Not initialized inputs: isLoading`);
      expect(ctx.stdout).to.contain(`Not ready for migrate to NgxBindIO: 1 components`);
    });
  test
    .stdout()
    .do(() => cmd.run(['test/fixtures/sources', '--info', '--fix', '--maxInputs=0', '--maxOutputs=0']))
    .it(['test/fixtures/sources', '--info', '--fix', '--maxInputs=0', '--maxOutputs=0'].join(' '), ctx => {
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Inputs: isLoading, propA, propB`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Outputs: start`);
      expect(ctx.stdout).to.contain(`<inherits-inner-cmp>: Auto initialized inputs: isLoading`);
      expect(ctx.stdout).to.contain(`Ready for migrate to NgxBindIO: 2 components`);
    });
});
