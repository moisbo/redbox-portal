import { Observable } from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import { Sails, Model } from "sails";
import * as request from "request-promise";

declare var RecordsService, BrandingService;
declare var sails: Sails;
declare var _this;
declare var Institution, User: Model, WorkspaceApp: Model, Form: Model;

export module Services {

  export class WorkspaceService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'createWorkspaceRecord',
      'getRecordMeta',
      'updateRecordMeta',
      'registerUserApp',
      'userInfo',
      'provisionerUser',
      'getCookies',
      'getCookieValue',
      'cookieJar',
      'infoFormUserId',
      'createWorkspaceInfo',
      'workspaceAppFromUserId',
      'removeAppFromUserId'
    ];

    config: any;
    recordType: string;
    formName: string;
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

    createWorkspaceRecord(config: any, username: string, project: any, workflowStage: string) {
      // TODO: how to get the workflowStage??
      // TODO: Get the project metadata from the form, move this logic to the controller
      sails.log.debug(config);
      const post = request({
        uri: config.brandingAndPortalUrl + `/api/records/metadata/${config.recordType}`,
        method: 'POST',
        body: {
          authorization: {
            edit: [username],
            view: [username],
            editPending:[],
            viewPending:[]
          },
          metadata: {
            title: project.title,
            description: project.description,
            type: project.type
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
      // TODO: Add ability to update user apps
      var data = {apps: {}}
      data.apps[appId] = info;
      sails.log.debug('registerUserApp');
      return super.getObservable(
        User.update({id: userId}, data)
      );
    }

    userInfo(userId: string) {
      return super.getObservable(
        User.findOne({ id: userId })
      )
    }

    provisionerUser(username: string) {
      return super.getObservable(
        User.findOne({username: username})
      )
    }

    infoFormUserId(userId) {
      return this.getObservable(
        User.findOne({ id: userId }).populate('workspaceApps')
      );
    }

    createWorkspaceInfo(userId, appName, info) {
      return this.getObservable(
        WorkspaceApp.create({app: appName, user: userId, info: info})
      );
    }

    workspaceAppFromUserId(userId, appName){
      return this.getObservable(
        WorkspaceApp.findOne({app: appName, user: userId})
      );
    }

    removeAppFromUserId(userId, id){
      return this.getObservable(
        WorkspaceApp.destroy({id: id, user: userId})
      );
    }


  }

}
module.exports = new Services.WorkspaceService().exports();
