import { Observable } from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import { Sails, Model } from "sails";
import * as request from "request-promise";
const util = require('util');
const moment = require('moment');

declare var RecordsService, BrandingService;
declare var sails: Sails;
declare var _this;
declare var User: Model, WorkspaceApp: Model, WorkspaceAsync: Model;

export module Services {

  export class WorkspaceAsyncService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'start',
      'update',
      'pending',
      'loop'
    ];

    /*
    sails.services.workspaceasyncservice.start(
      {
        name:'test', recordType: 'gitlab',
        username: 'admin',
        service: 'gitlabcontroller',
        method: 'checkrepo',
        args: ['fieldToCheck:https://git-test.research.uts.edu.au/135553/my-project-06']
      }
    ).subscribe(response=>{console.log('started')})
    */
    public start({name, recordType, username, service: service, method, args}) {
      return super.getObservable(
        WorkspaceAsync.create(
          {name: name, started_by: username, recordType: recordType,
            method: method, args: args, status: 'started'}
        )
      );
    }

    public update(id, obj) {
      if(obj.status === 'finished'){
        obj.date_completed = moment().format('YYYY-MM-DD HH:mm:ss');
      }
      return super.getObservable(
        WorkspaceAsync.update({id: id}, obj)
      );
    }

    public pending() {
      return super.getObservable(
        WorkspaceAsync.find({status: 'pending'})
      );
    }

    loop() {
      sails.log.debug('::::LOOP PENDING STATE::::::');
      //console.log(util.inspect(sails.services, {showHidden: false, depth: null}))
      this.pending().subscribe(pending => {
        _.forEach(pending, wa => {
          const args = wa.args || null;
          sails.services[wa.service][wa.method]({args}).subscribe(message => {
            this.update(wa.id, {status: 'finished', message: message}).subscribe();
          }, error => {
            this.update(wa.id, {status: 'error', message: error}).subscribe();
          });
        });
      }, error => {
        sails.log.error(error);
      });
    }

  }

}
module.exports = new Services.WorkspaceAsyncService().exports();
