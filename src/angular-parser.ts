import Project, { ClassDeclaration, Decorator, ParameterDeclarationStructure, SourceFile } from 'ts-simple-ast';
import { getBetween } from './get-between';

export interface IAngularComponentInput {
    name: string;
    initialized: boolean;
}
export interface IAngularComponentOutput {
    name: string;
    initialized: boolean;
}
export interface IAngularComponent {
    file: string;
    className: string;
    selector: string;
    inputs: IAngularComponentInput[];
    outputs: IAngularComponentOutput[];
    autoInitializedInputs: IAngularComponentInput[];
    usedCount?: number;
    withBindIOCount?: number;
    withBindInputsCount?: number;
    withBindOutputsCount?: number;
}

export function countUsed(source: string, component: IAngularComponent) {
    const localSource = source.toString().replace(/(?:\r\n|\r|\n)/g, ' ');
    const items = [
        ...getBetween(localSource, `<${component.selector} `, `</${component.selector}>`),
        ...getBetween(localSource, `<${component.selector}>`, `</${component.selector}>`)
    ];
    return {
        allCount: items.length,
        withBindIOCount: items.filter(item => item.indexOf('bindIO') !== -1).length,
        withBindInputsCount: items.filter(item => item.indexOf('bindInputs') !== -1).length,
        withBindOutputsCount: items.filter(item => item.indexOf('bindOutputs') !== -1).length
    };
}
export function parseArguments(dec: Decorator) {
    let selector = '';
    let args: string[] = [];
    args = dec.getStructure().arguments as string[];
    const parseds: string[] = args && args.length > 0 ? args[0].replace(new RegExp('\n', 'g'), '').
        replace(new RegExp(' ', 'g'), '').
        replace(new RegExp('{', 'g'), '').split(`'`) : [];
    parseds.forEach((parsed, index) => {
        if (index > 0 && parseds[index - 1].indexOf('selector:') !== -1) {
            selector = parsed;
        }
    });
    return {
        selector,
        arguments: args
    };
}
export function getAngularComponents(project: Project, sourceFile: SourceFile, autoInitialize: boolean) {
    const components: IAngularComponent[] = [];
    const classes = sourceFile.getClasses();
    classes.forEach(foundedClass => {
        foundedClass.getDecorators().map(classDecorator => {
            if (classDecorator.getName() === 'Component') {
                const args = parseArguments(classDecorator);
                const component: IAngularComponent = {
                    file: sourceFile.getBaseName(),
                    className: foundedClass.getName() || '',
                    selector: args.selector,
                    autoInitializedInputs: [],
                    inputs: [],
                    outputs: []
                };
                const baseClasses: ClassDeclaration[] = [];
                let eachClass: ClassDeclaration | undefined = foundedClass;
                while (eachClass) {
                    baseClasses.push(eachClass);
                    eachClass = eachClass.getBaseClass();
                }
                baseClasses.forEach(derivedClasse =>
                    derivedClasse.getInstanceProperties().forEach(prop => {
                        const propName = prop.getName() || '';
                        const propDeclaration = derivedClasse.getProperty(propName);
                        prop.getDecorators().filter(dec => {
                            const propDecName = dec.getName() || '';
                            if (
                                propDecName === 'Input'
                            ) {
                                let initialized = (prop.getStructure() as ParameterDeclarationStructure)
                                    .initializer !== undefined;
                                if (propDeclaration && !initialized && autoInitialize) {
                                    propDeclaration.setInitializer('undefined');
                                    initialized = true;
                                    propDeclaration.getSourceFile().saveSync();
                                    component.autoInitializedInputs.push({
                                        name: propName,
                                        initialized: initialized
                                    });
                                }
                                component.inputs.push({
                                    name: propName,
                                    initialized: initialized
                                });
                            }
                            if (
                                propDecName === 'Output'
                            ) {
                                component.outputs.push({
                                    name: propName,
                                    initialized:
                                        (prop.getStructure() as ParameterDeclarationStructure)
                                            .initializer !== undefined
                                });
                            }
                        });
                    })
                );
                components.push(component);
            }
        });
    });
    return components;
}
