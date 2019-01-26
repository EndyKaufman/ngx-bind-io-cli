import { color } from '@oclif/color';
import { Command, flags } from '@oclif/command';
import { Bar, Presets } from 'cli-progress';
import { readFileSync } from 'fs';
import * as recursiveReadDir from 'recursive-readdir';
import Project from 'ts-simple-ast';
import { countUsed, getAngularComponents, IAngularComponent } from './angular-parser';

class NgxBindIoCli extends Command {
  static description = 'Tools for check Angular7+ components for use ngx-bind-io directives';

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    info: flags.boolean({ char: 'i', description: 'Show inputs and outputs used in components', default: false }),
    verbose: flags.boolean({ char: 'V', description: 'Show all detail informations for inputs and outputs used in components', default: false }),
    fix: flags.boolean({ char: 'f', description: 'Auto initialized all not initialized inputs', default: false }),
    ignores: flags.string({
      multiple: true, description: 'Ignored files and paths'
    }),
    maxInputs: flags.integer({ description: 'Max count of inputs for detect need use NgxBindIO directives', default: 3 }),
    maxOutputs: flags.integer({ description: 'Max count of outputs for detect need use NgxBindIO directives', default: 3 }),
    tsconfig: flags.string({ char: 'c', description: 'Please set if you use tspaths for correct scan base components' }),
  };

  static args = [{ name: 'path' }];

  async run() {
    const { args, flags } = this.parse(NgxBindIoCli);
    if (!args.path) {
      console.log(color.red('Please set path with sources for scan, example: npm ngx-bind-io ./src'));
    }
    if (args.path) {
      const maxCountOfInputs = flags.maxInputs === undefined ? 3 : flags.maxInputs;
      const maxCountOfOutputs = flags.maxOutputs === undefined ? 3 : flags.maxOutputs;
      const info = flags.info;
      const verbose = flags.verbose;
      const fix = flags.fix;
      const path = args.path;
      const tsconfig = flags.tsconfig || '';
      const ignores = flags.ignores || [
        'node_modules',
        'dist',
        '*.spec.*',
        '.git'
      ];
      this.showInfo(path, tsconfig, ignores, fix, info, verbose, maxCountOfInputs, maxCountOfOutputs);
      const files = await this.scanFiles(path, ignores);
      const sources = this.loadSources(files);
      const components: IAngularComponent[] = this.parseComponentsFromFiles(path, tsconfig, files, fix);
      const useds = this.countUsages(components, files, sources);
      this.showResults(useds, maxCountOfInputs, maxCountOfOutputs, info, verbose);
    }
  }

  private showResults(useds: IAngularComponent[], maxCountOfInputs: number, maxCountOfOutputs: number, info: boolean, verbose: boolean) {
    let readyForBindIOCount = 0;
    let notReadyForBindIOCount = 0;
    useds.forEach(used => {
      if (used.usedCount !== undefined &&
        used.usedCount > 0) {
        const noInitializedInputs = used.inputs.filter(input => !input.initialized);
        const noInitializedOutputs = used.outputs.filter(output => !output.initialized);
        const noInitializedIO = noInitializedInputs.length > maxCountOfInputs ||
          noInitializedOutputs.length > maxCountOfOutputs;
        const autoInitializedIO = used.autoInitializedInputs.filter(input => !input.initialized).length > 0;
        const groupName = (noInitializedIO ?
          color.yellow('<' + used.selector + '>') :
          color.green('<' + used.selector + '>')) +
          ': ';
        if (noInitializedIO || autoInitializedIO || info) {
          if (verbose) {
            console.log(groupName +
              `Class: ${color.blueBright(used.className)}`);
            console.log(groupName +
              `File: ${color.blueBright(used.file)}`);
            if (used.usedCount > 0) {
              console.log(groupName +
                `Used in ${color.blueBright(String(used.usedCount))} places (all)`);
            }
            if (used.withBindIOCount && used.withBindIOCount > 0) {
              console.log(groupName +
                `Used with "bindIO" directive in ${color.greenBright(String(used.withBindIOCount))} places`);
            }
            if (used.withBindInputsCount && used.withBindInputsCount > 0) {
              console.log(groupName +
                `Used with "bindInputs" directive in ${color.greenBright(String(used.withBindInputsCount))} places`);
            }
            if (used.withBindOutputsCount && used.withBindOutputsCount > 0) {
              console.log(groupName +
                `Used with "bindOutputs" directive in ${color.greenBright(String(used.withBindOutputsCount))} places`);
            }
          }
          if (info && used.inputs.length > 0) {
            console.log(groupName +
              `Inputs: ${used.inputs.map(input => color.blueBright(input.name)).join(', ')}`);
          }
          if (used.autoInitializedInputs.length > 0) {
            console.log(groupName +
              `Auto initialized inputs: ${used.autoInitializedInputs.map(input => color.yellowBright(input.name)).join(', ')}`);
          }
          if (info && used.outputs.length > 0) {
            console.log(groupName +
              `Outputs: ${used.outputs.map(output => color.blueBright(output.name)).join(', ')}`);
          }
          if (noInitializedInputs.length > maxCountOfInputs) {
            console.log(groupName +
              color.red(`Not initialized inputs: ${noInitializedInputs.map(input => color.redBright(input.name)).join(', ')}`));
          }
          if (noInitializedOutputs.length > maxCountOfOutputs) {
            console.log(groupName +
              color.red(`Not initialized outputs: ${noInitializedOutputs.map(output => output.name).join(', ')}`));
          }
          if (noInitializedIO) {
            notReadyForBindIOCount++;
          } else {
            readyForBindIOCount++;
          }
        }
      }
    });
    if (readyForBindIOCount > 0) {
      console.log(color.green(`Ready for migrate to NgxBindIO: ${readyForBindIOCount} components`));
    }
    if (notReadyForBindIOCount > 0) {
      console.log(color.red(`Not ready for migrate to NgxBindIO: ${notReadyForBindIOCount} components`));
    }
    if (readyForBindIOCount === 0 && notReadyForBindIOCount === 0) {
      console.log(color.blue(`Not need migrate to NgxBindIO`));
    }
  }

  private countUsages(components: IAngularComponent[], files: string[], sources: string[]) {
    const bar4 = new Bar({
      format: color.yellow('(4/4)') + ' Count usages [{bar}] {percentage}% | {value}/{total}'
    }, Presets.shades_classic);
    bar4.start(components.length, 1);
    const useds = components.map((component, index) => {
      files.map((file, index) => {
        const counts = countUsed(sources[index], component);
        component.usedCount = (component.usedCount || 0) + counts.allCount;
        component.withBindIOCount = (component.withBindIOCount || 0) + counts.withBindIOCount;
        component.withBindInputsCount = (component.withBindInputsCount || 0) + counts.withBindInputsCount;
        component.withBindOutputsCount = (component.withBindOutputsCount || 0) + counts.withBindOutputsCount;
      });
      bar4.update(index + 1);
      return component;
    });
    bar4.stop();
    return useds;
  }
  private parseComponentsFromFiles(path: string, tsconfig: string, files: string[], fix: boolean) {
    let components: IAngularComponent[] = [];
    const tsFiles = files.filter(file => file.indexOf('.ts') === file.length - 3);
    const bar3 = new Bar({
      format: color.yellow('(3/4)') + ' Parse components [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
    }, Presets.shades_classic);
    bar3.start(tsFiles.length, 1);
    const project = tsconfig ? new Project({
      tsConfigFilePath: tsconfig
    }) : new Project();
    project.addExistingSourceFiles(tsFiles);
    project.getSourceFiles().forEach((sourceFile, index) => {
      const componentsInFile = sourceFile ? getAngularComponents(project, sourceFile, fix) : [];
      components = [
        ...components,
        ...componentsInFile
      ];
      bar3.update(index + 1);
    });
    bar3.stop();
    return components;
  }

  private loadSources(files: string[]) {
    const bar2 = new Bar({
      format: color.yellow('(2/4)') + ' Load sources [{bar}] {percentage}% | {value}/{total}'
    }, Presets.shades_classic);
    bar2.start(files.length, 1);
    const sources = files.map((file, index) => {
      const content = readFileSync(file).toString();
      bar2.update(index + 1);
      return content;
    });
    bar2.stop();
    return sources;
  }

  private async scanFiles(path: string, ignores: string[]) {
    const bar1 = new Bar({
      format: color.yellow('(1/4)') + ' Scan files [{bar}] {percentage}% | {value}/{total}'
    }, Presets.shades_classic);
    bar1.start(100, 10);
    const files = await recursiveReadDir(path, ignores);
    bar1.update(100);
    bar1.stop();
    return files;
  }

  private showInfo(path: string, tsconfig: string, ignores: string[], fix: boolean, info: boolean, verbose: boolean, maxCountOfInputs: number, maxCountOfOutputs: number) {
    console.log('Path: ' + color.blue(path));
    console.log('Ignores: ' + color.blue(ignores.join(', ')));
    if (tsconfig) {
      console.log('Typescript config: ' + color.blue(tsconfig));
    }
    if (fix) {
      console.log('Auto initialize: ' + color.blue('true'));
    }
    if (info) {
      console.log('Info: ' + color.blue('true'));
    }
    if (verbose) {
      console.log('Verbose: ' + color.blue('true'));
    }
    if (maxCountOfInputs !== undefined && maxCountOfInputs !== 3) {
      console.log('Max inputs count: ' + color.blue(String(maxCountOfInputs)));
    }
    if (maxCountOfOutputs !== undefined && maxCountOfOutputs !== 3) {
      console.log('Max outputs count: ' + color.blue(String(maxCountOfOutputs)));
    }
  }
}

export = NgxBindIoCli;
