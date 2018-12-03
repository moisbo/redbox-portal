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

declare var sails: Sails;
declare var _;

export module Services {
    /**
     *
     *
     * @author <a target='_' href='https://github.com/thomcuddihy'>Thom Cuddihy</a>
     *
     */
    export class Email extends services.Services.Core.Service {

        protected _exportedMethods: any = [
            'sendMessage',
            'buildFromTemplate',
            'sendTemplate',
            'sendRecordNotification'
        ];

      /**
        * Simple API service to POST a message queue to Redbox.
        *
        * Base email sending method.
        * Return: code, msg
        */
        public sendMessage(msgTo, msgBody: string,
            msgSubject: string = sails.config.emailnotification.defaults.subject,
            msgFrom: string = sails.config.emailnotification.defaults.from,
            msgFormat: string = sails.config.emailnotification.defaults.format): Observable<any> {
            if (!sails.config.emailnotification.settings.enabled) {
                sails.log.verbose("Received email notification request, but is disabled. Ignoring.");
                return Observable.of({'code': '200', 'msg': 'Email services disabled.'});
            }
            sails.log.verbose('Received email notification request. Processing.');

            var url = `${sails.config.record.baseUrl.redbox}${sails.config.emailnotification.api.send.url}`;

            var body = {
                "to": msgTo,
                "subject": msgSubject,
                "body": msgBody,
                "from": msgFrom,
                "format": msgFormat
            };
            sails.log.verbose("Body: ");
            sails.log.verbose(body);
            var options = { url: url, json: true, body: body, headers: { 'Authorization': `Bearer ${sails.config.redbox.apiKey}`, 'Content-Type': 'application/json; charset=utf-8' } };

            var response = Observable.fromPromise(request[sails.config.emailnotification.api.send.method](options)).catch(error => Observable.of(`Error: ${error}`));

            return response.map(result => {
                if (result['code'] != '200') {
                    sails.log.error(`Unable to post message to message queue: ${result}`);
                    result['msg'] = 'Email unable to be submitted';
                } else {
                    sails.log.verbose('Message submitted to message queue successfully');
                    result['msg'] = 'Email sent!';
                }
                return result;
            });
        }

      /**
       * Build Email Body from Template
       *
       * Templates are defined in sails config
       *
       * Return: status, body, exc
       */

      public buildFromTemplate(template: string, data: any = {}): Observable<any> {

        let readFileAsObservable = Observable.bindNodeCallback((
            path: string,
            encoding: string,
            callback: (error: Error, buffer: Buffer) => void
        ) => fs.readFile(path, encoding, callback));

        let res = {};
        let readTemplate = readFileAsObservable(sails.config.emailnotification.settings.templateDir + template + '.ejs', 'utf8');

        return readTemplate.map(
        buffer => {
            try {
                var renderedTemplate = ejs.render((buffer || "").toString(), data, {cache: true, filename: template});
            } catch (e) {
                sails.log.error(`Unable to render template ${template} with data: ${data}`);
                res['status'] = 500;
                res['body'] = 'Templating error.';
                res['ex'] = e;
                return res;
                //throw e;
            }

            res['status'] = 200;
            res['body'] = renderedTemplate;
            return res;
        },
        error => {
            sails.log.error(`Unable to read template file for ${template}`);
            res['status'] = 500;
            res['body'] = 'Template read error.';
            res['ex'] = error;
            return res;
            //throw error;
        }
        );
      }

      /**
       * Send Email from Template
       *
       * Templates are defined in sails config
       *
       * Return: status, body, exc
       */
      public sendTemplate(to, subject, template, data) {
        sails.log.verbose("Inside Send Template");
        var buildResponse = this.buildFromTemplate(template, data);
        sails.log.verbose("buildResponse");
        buildResponse.subscribe(buildResult => {
            if (buildResult['status'] != 200) {
                return buildResult;
            }
            else {
                var sendResponse = this.sendMessage(to, buildResult['body'], subject);

                sendResponse.subscribe(sendResult => {
                  return sendResult;
                });
            }
        });
      }

      protected runTemplate(template:string, variables) {
        if (template && template.indexOf('<%') != -1) {
          return _.template(template, variables)();
        }
        return template;
      }

      public sendRecordNotification(oid, record, options) {
        if(this.metTriggerCondition(oid, record, options) == "true") {
          const variables = {imports: {
            record: record,
            oid: oid
          }};
          sails.log.verbose(`Sending record notification for oid: ${oid}`);
          sails.log.verbose(options);
          // send record notification
          const to = this.runTemplate(_.get(options, "to", null), variables);
          if (!to) {
            sails.log.error(`Error sending notification for oid: ${oid}, invalid 'To' address: ${to}. Please check your configuration 'to' option: ${_.get(options, 'to')}`);
            return Observable.of(null);
          }
          const subject = this.runTemplate(_.get(options, "subject", null), variables);
          const templateName = _.get(options, "template", "");
          const data = {};
          data['record'] = record;
          data['oid'] = oid;
          return this.buildFromTemplate(templateName, data)
          .flatMap(buildResult => {
            if (buildResult['status'] != 200) {
              sails.log.error(`Failed to build email result:`);
              sails.log.error(buildResult);
              return Observable.throw(new Error('Failed to build email body.'));
            }
            return this.sendMessage(to, buildResult['body'], subject);
          })
          .flatMap(sendResult => {
            if (sendResult['code'] == '200') {
              // perform additional processing on success...
              const postSendHooks = _.get(options, "onNotifySuccess", null);
              if (postSendHooks) {
                _.each(postSendHooks, (postSendHook) => {
                  const postSendHookFnName = _.get(postSendHook, 'function', null);
                  if (postSendHookFnName) {
                    const postSendHookFn = eval(postSendHookFnName);
                    const postSendHookOpts = _.get(postSendHook, 'options', null);
                    postSendHookFn(oid, record, postSendHookOpts).subscribe(postSendRes => {
                      sails.log.verbose(`Post notification sending hook completed: ${postSendHookFnName}`);
                    });
                  }
                });
              }
            }
            return Observable.of(sendResult);
          });
        } else {
          sails.log.verbose(`Not sending notification log for: ${oid}, condition not met: ${_.get(options, "triggerCondition", "")}`)
          sails.log.verbose(JSON.stringify(record));
        }
        return Observable.of(null);
      }
    }



}

module.exports = new Services.Email().exports();
