import {Observable, Scheduler} from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import {Sails, Model} from "sails";
import * as request from "request-promise";

declare var RecordsService, BrandingService;
declare var sails: Sails;
declare var _this;
declare var Institution, User: Model;

export module Services {

  export class WorkspaceService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'createWorkspaceRecord',
      'getRecordMeta',
      'updateRecordMeta',
      'registerUserApp',
      'getCookies',
      'getCookieValue',
      'cookieJar'
    ];

    config: any;
    recordType: string;
    formName: string;
    brandingAndPortalUrl: string;
    parentRecord: string;
    bearer: string;
    redboxHeaders: {};

    constructor() {
      super();
    }

    getCookies(cookies) {
      const cookieJar = [];
      cookies.forEach((rawcookies) => {
        var cookie = request.cookie(rawcookies);
        cookieJar.push({key: cookie.key, value: cookie.value, expires: cookie.expires});
      });
      return cookieJar;
    }

    getCookieValue(cookieJar, key) {
      const cookie = _.findWhere(cookieJar, {key: key})
      if(cookie) {
        return cookie.value;
      }else return '';
    }

    cookieJar(jar: any, config:any, key: string, value: string){
      const keyvalue = key + '=' + value;
      const cookie = request.cookie('' + keyvalue);
      jar.setCookie(cookie, config.host);
      return jar;
    }

    createWorkspaceRecord(config: any, project: any, workflowStage: string) {
      // TODO: how to get the workflowStage??
      // TODO: Get the project metadata from the form, move this logic to the controller
      const post = request({
      uri: config.brandingAndPortalUrl + `/api/records/metadata/${config.recordType}`,
      method: 'POST',
      body: {
        metadata: {
          title: project.namespace + '/' + project.name,
          description: project.description,
          type: 'GitLab'
        },
        workflowStage: workflowStage
      },
      json: true,
      headers: config.redboxHeaders
    });
    return Observable.fromPromise(post);
  }

  getRecordMeta(config: any, rdmp: string) {
    const get = request({
      uri: config.brandingAndPortalUrl + '/api/records/metadata/' + rdmp,
      json: true,
      headers: config.redboxHeaders
    });
    return Observable.fromPromise(get);
  }

  updateRecordMeta(config: any, record: any, id: string) {
    const post = request({
      uri: config.brandingAndPortalUrl + '/api/records/metadata/' + id,
      method: 'PUT',
      body: record,
      json: true,
      headers: config.redboxHeaders
    });
    return Observable.fromPromise(post);
  }

  registerUserApp(userId: any, appId: string, info: any) {
    const app = 'app.' + appId;
    var data = { '$set': {app: info}};
    return super.getObservable(
      User.update({id: userId}, data)
    );
  }

  userInfo(userId: string) {
    return super.getObservable(
      User.findOne({ id: userId })
    )
  }

}

}
module.exports = new Services.WorkspaceService().exports();
