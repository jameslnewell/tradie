import {CLIEngine} from 'eslint';

export default function(files, config) {
  const {eslint, script: {extensions}} = config;

  const engine = new CLIEngine({
    baseConfig: eslint,
    useEslintrc: false,
    extensions
  });

  const report = engine.executeOnFiles(files);

  if (report.errorCount + report.warningCount > 0) {
    const formatter = CLIEngine.getFormatter('stylish');
    console.log(formatter(report.results));
  }

  return Promise.resolve({
    errors: report.errorCount,
    warnings: report.warningCount
  });
}
