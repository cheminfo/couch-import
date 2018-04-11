'use strict';

const Zenodo = require('zenodo');

const getZenodoDeposition = require('./getZenodoDeposition');

class RocZenodo {
  constructor(options = {}) {
    const {
      name,
      visualizationUrl,
      zenodoHost = 'sandbox.zenodo.org',
      zenodoToken
    } = options;
    if (typeof zenodoHost !== 'string') {
      throw new TypeError('zenodoHost must be a string');
    }
    if (typeof zenodoToken !== 'string') {
      throw new TypeError('zenodoToken must be a string');
    }
    if (typeof name !== 'string' || name === '') {
      throw new TypeError('name must be a string');
    }
    if (typeof visualizationUrl !== 'string') {
      throw new TypeError('visualizationUrl must be a string');
    }

    this.name = name;
    this.visualizationUrl = visualizationUrl;
    this.isSandbox = zenodoHost.includes('sandbox');
    this.zenodo = new Zenodo({ host: zenodoHost, token: zenodoToken });
  }

  getDescriptionSuffix(deposition) {
    let url = `${this.visualizationUrl}/${deposition.id}`;
    if (this.isSandbox) {
      url += '?sandbox=1';
    }
    return `
      <br />
      <br />
      <p>
        Visualize the data for this publication: <a href="${url}" target="_blank">open entry</a>
      </p>`;
  }

  getIndexMd() {
    return {
      filename: '_README.md',
      contentType: 'text/markdown',
      data: 'TODO README'
    };
  }

  getZenodoDeposition(entry) {
    return getZenodoDeposition(entry, this);
  }

  // entry is the $content.meta of the ROC entry
  async createEntry(entry) {
    if (!entry.metadata) {
      entry = this.getZenodoDeposition(entry);
    }
    const deposition = await this.zenodo.depositions.create(entry);
    return deposition.data;
  }

  updateEntry(deposition) {
    return this.zenodo.depositions.update(deposition);
  }

  deleteEntry(deposition) {
    return this.zenodo.depositions.delete(deposition);
  }

  async uploadFile(deposition, options) {
    // deposition is the object returned by createEntry
    const zFiles = this.zenodo.files;
    const result = await zFiles.upload(Object.assign({ deposition }, options));
    return result.data;
  }

  publishEntry(deposition) {
    return this.zenodo.depositions.publish(deposition);
  }

  async getFileList(deposition) {
    const result = await this.zenodo.depositions.files(deposition);
    return result.data;
  }

  sortFiles(deposition, files) {
    return this.zenodo.depositions.sort({ id: deposition.id, data: files });
  }
}

module.exports = { RocZenodo };
