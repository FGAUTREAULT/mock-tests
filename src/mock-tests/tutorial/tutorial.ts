import {
    Rule, SchematicContext, Tree, chain,
    externalSchematic
} from '@angular-devkit/schematics';

const _licenceTag = '@license';
const licenseText = `
/**
 * ${_licenceTag}
 * Copyright FGA Test. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license.
 */
`;


// Schematic really has 5 parts/files.
// - collection.json — The Schematic’s definition
// - index.ts — The actual Schematic code
// - schema.json — The Schematic variable definition
// - schema.d.ts — The Schematic variables
// - files/ — The template files to replicate

// npm install -g @angular-devkit/schematics-cli
// npm run build -- -w : external terminal watch build
// Run : ng generate schematics-project-name:schematicsName --optionParameterName=value
// schematics-project-name : The name you defined with : 'schematics blank --name=schematics-project-name' 
// schematicsName : The name defined in collection.json
// In collection.json => "factory": "./path-to-file/file#function-to-execute"
// optionParameterName : If you need options

// Later link your schematics to the project you want it to be applied to : npm link $PATH_TO_SCHEMATIC_PROJECT

// Create a simple file with name in parameter optional (elese hello) and add world inside
// Run : ng generate mock-tests:helloWorld --name=test 
export function helloWorld(_options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        tree.create(_options.name || 'hello', 'world');
        return tree;
    };
}

// Create a component from external angular cli schematics and add a licence to all *.ts files
// Run : ng generate mock-tests:myComponent --name=test --sourceDir=src
export function myComponent(options: any): Rule {

    console.debug('Options passed as parameters: ', options);

    // Chain multiple rules together, easier to compose schematics
    return chain([
        // Run an external schematics (npm i @schematics/angular)
        externalSchematic('@schematics/angular', 'component', options),
        (tree: Tree, _context: SchematicContext) => {
            tree.getDir(options.sourceDir)
                .visit(filePath => {
                    if (!filePath.endsWith('.ts')) {
                        return;
                    }
                    const content = tree.read(filePath);
                    if (!content) {
                        return;
                    }

                    // Prevent from writing license to files that already have one.
                    if (content.indexOf(_licenceTag) == -1) {
                        tree.overwrite(filePath, licenseText + content);
                    }
                });
            return tree;
        },
    ]);
}