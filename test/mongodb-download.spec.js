const os = require('os');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const expect = require('chai').expect;

const { MongoDBDownload } = require('../built/mongodb-download.js');

const { coroutine } = Promise;

  describe('mongodb-download', () => {
    const DOWNLOAD_DIR = os.tmpdir();

    let mongodbDownload;

    beforeEach(() => {
      mongodbDownload = new MongoDBDownload({
        downloadDir: DOWNLOAD_DIR,
      });
    });

    context('when file is not already downloaded', () => {
      let downloadLocationAccessible = false;

      beforeEach(coroutine(function* beforeEachHandler() {
        this.timeout(120 * 1000); // download takes time

        const exists = yield mongodbDownload.isDownloadPresent();
        if (exists) {
          const downloadLocation = yield mongodbDownload.getDownloadLocation();
          fs.unlinkAsync(downloadLocation);
        }

        const downloadLocation = yield mongodbDownload.download();

        return fs.accessAsync(downloadLocation, fs.constants.R_OK)
          .then(() => downloadLocationAccessible = true)
          .catch(() => downloadLocationAccessible = false);
      }));

      it('should download mongodb', () => {
        expect(downloadLocationAccessible).to.equal(true);
      });
    });
  });
