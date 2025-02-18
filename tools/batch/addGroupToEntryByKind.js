#!/bin/env node
/* eslint-disable no-console */

'use strict';

/*
    This script allows to add group(s) to entries matching a list of kinds
 */

const { program } = require('commander');

program
  .option('-c --config <path>', 'Path to custom config file')
  .option('-d, --db <database>', 'Database name')
  .option('-k, --kind <kind>', 'Comma-separated list of kinds')
  .option('-s, --suffix <suffix>', 'Comma-separated list of suffixes')
  .parse(process.argv);

const options = program.opts();

if (typeof options.db !== 'string') program.missingArgument('db');
if (typeof options.kind !== 'string') program.missingArgument('kind');
if (typeof options.suffix !== 'string') program.missingArgument('suffix');

const kinds = new Set(options.kind.split(','));
const suffixes = options.suffix.split(',');

const Couch = require('../..');

const couch = Couch.get(options.db);

(async function openIIFE() {
  await couch.open();
  const db = couch._db;
  for (const kind of kinds) {
    console.log(`treating kind ${kind}`);
    const owners = suffixes.map((suffix) => kind + suffix);
    const body = { group: owners };
    const docs = await db.queryView('entryByKind', { key: kind });
    console.log(`${docs.length} documents match`);
    for (const { id } of docs) {
      await db.updateWithHandler('addGroupToEntry', id, body);
    }
  }
})()
  .catch(console.error)
  .then(function close() {
    couch.close();
  });
