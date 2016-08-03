import lint from '../lint';
import findScriptFiles from '../findScriptFiles';

export const name = 'lint';
export const desc = 'Lint script files';

export function exec(tradie) {
  const {config} = tradie;

  return findScriptFiles(config)
    .then(files => lint(files, config)
      .then(result => {

        //return an error exit code
        if (result.errors !== 0) {
          throw null;
        }

      })
    )
  ;

}
