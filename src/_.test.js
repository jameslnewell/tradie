import 'source-map-support/register';
import chai, {expect} from 'chai';
import chaiFiles from 'chai-files';

chai.use(chaiFiles);

global.expect = expect;
global.file = chaiFiles.file;
global.dir = chaiFiles.dir;
