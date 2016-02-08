
export default function(program) {
  const args = {};
  args.debug = typeof program.production === 'undefined' ? process.env.NODE_ENV !== 'production' : !program.production;
  args.watch = program.watch || false;
  args.verbose = program.verbose || false;
  return args;
}