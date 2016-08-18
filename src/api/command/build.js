
import lint from '../lint';
import findScriptFiles from '../findScriptFiles';
import isScriptFile from '../isScriptFile';
import bundleScripts from '../bundle';

export default options => {

  let lintErrors = false;

  return Promise.resolve()

    //lint the scripts
    .then(() => findScriptFiles(options)
      .then(files => lint(files, options)
        .then(result => {

          //return an error exit code
          if (result.errors !== 0) {
            lintErrors = true;
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

      //return an error exit code
      if (lintErrors) {
        return Promise.reject();
      }

    })

  ;

};
