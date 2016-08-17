
import lint from '../lint';
import findScriptFiles from '../findScriptFiles';
import isScriptFile from '../isScriptFile';
import bundleScripts from '../bundle';

export default options => {

  let lintExitCode = 0;

  return Promise.resolve()

    //lint the scripts
    .then(() => findScriptFiles(options)
      .then(files => lint(files, options)
        .then(result => {

          //return an error exit code
          if (result.errors !== 0) {
            lintExitCode = 1;
          }

        })
      )
    )

    //build the bundles
    .then(() => bundleScripts({
      ...options,
      onChange: (addedModules, changedModules) => lint([].concat(addedModules, changedModules).filter(file => isScriptFile(file, options)), options)
    }))

    //return a single exit code
    .then(() => {

      //return an error exit code if the linting failed
      if (lintExitCode !== 0) {
        throw null;
      }

    })

  ;

};
