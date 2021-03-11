// Copyright (c) 2017 Queensland Cyber Infrastructure Foundation (http://www.qcif.edu.au/)
//
// GNU GENERAL PUBLIC LICENSE
//    Version 2, June 1991
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

import { Observable } from 'rxjs/Rx';
import services = require('../core/CoreService.js');
import { Sails, Model } from "sails";
import 'rxjs/add/operator/toPromise';
import * as request from "request-promise";
import * as ejs from 'ejs';
import * as fs from 'graceful-fs';
import fse = require('fs-extra');
import path = require('path');
import ocfl = require('ocfl');


import { Index, jsonld } from 'calcyte';
import DatastreamService from "../core/DatastreamService";

const rb2rocrate = require('redbox-ro-crate').rb2rocrate;

const rocrate = require('ro-crate');

declare var sails: Sails;
declare var RecordsService, UsersService, BrandingService, RedboxJavaStorageService;
declare var _;

const URL_PLACEHOLDER = '{ID_WILL_BE_HERE}'; // config
const DEFAULT_IDENTIFIER_NAMESPACE = 'redbox';

export module Services {
	/**
	 *
	 * a Service to extract a DataPub and put it in a RO-Crate with the
	 * metadata crosswalked into the right JSON-LD
	 *
	 * @author <a target='_' href='https://github.com/spikelynch'>Mike Lynch</a>
	 *
	 */
	export class DataPublication extends services.Services.Core.Service {

		protected _exportedMethods: any = [
			'exportDataset'
		];

		datastreamService: DatastreamService = null;

		constructor() {
			super();
			this.logHeader = "PublicationService::";
			let that = this;
			sails.on('ready', function () {
				that.getDatastreamService();
			});
		}

		getDatastreamService() {
			if (_.isEmpty(sails.config.record) || _.isEmpty(sails.config.record.datastreamService)) {
				this.datastreamService = RedboxJavaStorageService;
			} else {
				this.datastreamService = sails.services[sails.config.storage.serviceName];
			}
		}

		// exportDataset is the main point of entry. It returns an Observable
		// which writes out the record's attachments, creates a RO-Crate for
		// them and imports them into the required repository (staging or
		// public)

		// in the current version, if the target directory has not yet been
		// initialised, it initalised an ocfl repository there. A future
		// release should leave this to boostrap or deployment.

		// the 'user' in the args is whoever triggered the export by clicking the
		// publication submit button

		public exportDataset(oid, record, options, user): Observable<any> {
			if( this.metTriggerCondition(oid, record, options) === "true") {

				const site = sails.config.datapubs.sites[options['site']];
				if( ! site ) {
					sails.log.error("Unknown publication site " + options['site']);
					return Observable.of(null);
				}

				const md = record['metadata'];

				const drec = md['dataRecord'];
				const drid = drec ? drec['oid'] : undefined;

				if( ! drid ) {
					sails.log.error("Couldn't find dataRecord or id for data pub " + oid);
					return Observable.of(null)
				}

				// start an Observable to get/initialise the repository, then call createNewObjectContent
				// content on it with a callback which will actually write out the attachments and
				// make a RO-Crate. Once that's done, updates the URL in the data record.

				// the interplay between Promises and Observables here is too convoluted and needs
				// refactoring.

				//sails.log.debug("Bailing out before actually writing data pub");
				//return Observable.of(null);

				if( ! user || ! user['email'] ) {
					user = { 'email': '' };
					sails.log.error("Empty user or no email found");
				}

				const datasetUrl = site['url'] + '/' + oid + '/';
				md['citation_url'] = datasetUrl;
				md['citation_doi'] = md['citation_doi'].replace(URL_PLACEHOLDER, datasetUrl);

				return Observable.fromPromise(this.getRepository(options['site']))
					.flatMap((repository) => {
						return UsersService.getUserWithUsername(record['metaMetadata']['createdBy'])
							.flatMap((creator) => {
								return Observable.fromPromise(repository.createNewObjectContent(oid, async (dir) => {
									await this.writeDataset(creator, user, oid, drid, md, dir);
								}))
							})
					}).flatMap(() => {
						// updateMeta to save the citation_url and citation_doi back to the
						// data publication record
						return RecordsService.updateMeta(sails.config.auth.defaultBrand, oid, record, null, true, false);
					}).catch(err => {
						sails.log.error(`Error publishing dataset ${oid} to ocfl repo st ${options['site']}`);
						sails.log.error(err.name);
						sails.log.error(err.message);
						sails.log.error(err.stack);
						return this.recordPublicationError(oid, record, err);
					});

			} else {
				sails.log.debug(`Not publishing: ${oid}, condition not met: ${_.get(options, "triggerCondition", "")}`);
				return Observable.of(null);
			}
		}


		// this initialises the repository if it can't load it, which
		// is a bit rough and ready. FIXME - this should be done in
		// deployment or at least bootstrapping the server

		private async getRepository(site): Promise<any> {
			if(! sails.config.datapubs.sites[site] ) {
				sails.log.error(`unknown site ${site}`);
				throw(new Error("unknown repository site " + site));
			} else {
				const dir = sails.config.datapubs.sites[site].dir;
				const repository = new ocfl.Repository();
				try {
					await repository.load(dir);
					return repository;
				} catch(e) {
					try {
						const newrepo = new ocfl.Repository();
						await fse.ensureDir(dir);
						await newrepo.create(dir);
						sails.log.info(`New ofcl repository created at ${dir}`);
						return newrepo;
					} catch(e) {
						sails.log.error("Could neither load nor initialise repo at " + dir);
						sails.log.debug(`repo = ${JSON.stringify(repository)}`);
						throw(e);
					}
				}
			}
		}

		// async function which takes a data publication and destination directory
		// and writes out the attachments and RO-Crate files to it

		// based on the original exportDataset - takes the existing Observable chain
		// and converts it to a promise so that it can work with the ocfl library

		private async writeDataset(creator: Object, approver: Object, oid: string, drid: string, metadata: Object, dir: string): Promise<any> {

			const mdOnly = metadata['accessRightsToggle'];

			const attachments = metadata['dataLocations'].filter(
				(a) => ( !mdOnly && a['type'] === 'attachment' && a['selected'] )
			);

			// make sure attachments have a unique filepath

			attachments.map((a) => {
				a['path'] = path.join(a['fileId'], a['name']);
			});

			const obs = attachments.map((a) => {
				return this.datastreamService.getDatastream(drid, a['fileId']).
				flatMap(response => {
					const filedir = path.join(dir, a['fileId']);
					let dataFile;
					if (response.readstream) {
						dataFile = response.readstream
						return Observable.fromPromise(this.writeDatastream(dataFile, filedir, a['name']));
					} else {
						dataFile = Buffer.from(response.body);
						return Observable.fromPromise(this.writeAttachment(dataFile, filedir, a['name']));
					}
				});
			});

			obs.unshift(Observable.fromPromise(this.makeROCrate(creator, approver, oid, dir, metadata)));
			return Observable.concat(...obs).toPromise();
		}


		// writeDatastream works for new redbox-storage -- using sails-hook-redbox-storage-mongo.

		private async writeDatastream(stream: any, dir: string, fn: string): Promise<boolean> {
			return new Promise<boolean>( (resolve, reject) => {
				try {
					fse.ensureDir(dir, direrr => {
						if (direrr) throw(direrr);
						var wstream = fs.createWriteStream(path.join(dir, fn));
						sails.log.debug("start writeDatastream " + fn);
						stream.pipe(wstream);
						stream.end();
						wstream.on('close', () => {
							sails.log.debug("finished writeDatastream " + fn);
							resolve(true);
						});
						wstream.on('error', (e) => {
							sails.log.error(e.name);
							sails.log.error(e.message);
							throw(e);
						});
					});
				} catch (e) {
					reject(new Error(e));
				}
			});
		}

		// writeAttachment works for java storage version, it will put the whole of
		// the buffer in RAM.

		private async writeAttachment(buffer: Buffer, dir: string, fn: string): Promise<boolean> {
			return new Promise<boolean>( ( resolve, reject ) => {
				try {
					fse.ensureDir(dir, err => {
						if( ! err ) {
							fs.writeFile(path.join(dir, fn), buffer, (werr) => {
								if (werr) throw werr;
								resolve(true)
							});
						} else {
							throw(err);
						}
					});
				} catch(e) {
					sails.log.error("attachment write error");
					sails.log.error(e.name);
					sails.log.error(e.message);
					reject(new Error(e));
				}
			});
		}




		// Writes an RO-crate preview HTML page

		private async makeROCrate(creator: Object, approver: Object, oid: string, dir: string, metadata: Object): Promise<any> {

			const index = new Index();

			const jsonld_raw = await rb2rocrate.rb2rocrate({
				'id': oid,
				'datapub': metadata,
				'organisation': sails.config.datapubs.metadata.organization,
				'owner': creator['email'],
				'approver': approver['email']
			});



			const jsonld_file = path.join(dir, sails.config.datapubs.metadata.jsonld_filename);
			const html_file = path.join(dir, sails.config.datapubs.metadata.html_filename);
			const namespace = sails.config.datapubs.metadata.identifier_namespace || DEFAULT_IDENTIFIER_NAMESPACE;

			const roc = new rocrate.ROCrate(jsonld_raw);

			roc.index();
			roc.addIdentifier({identifier: oid, name: namespace})

			const jsonld = roc.json_ld;

			await fs.writeFile(jsonld_file, JSON.stringify(jsonld, null, 2));

			const preview = new rocrate.Preview(roc);

			const preview_html = await preview.render(null, sails.config.datapubs.metadata.render_script);
			await fse.writeFile(html_file, preview_html);
		}

		private recordPublicationError(oid: string, record: Object, err: Error): Observable<any> {
			const branding = sails.config.auth.defaultBrand;
			// turn off postsave triggers
			sails.log.info(`recording publication error in record metadata`);
			record['metadata']['publication_error'] = "Data publication failed with error: " + err.name + " " + err.message;
			return RecordsService.updateMeta(branding, oid, record, null, true, false);
		}

	}

}

module.exports = new Services.DataPublication().exports();