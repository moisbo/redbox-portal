import {Observable, Scheduler} from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import {Sails, Model} from "sails";
import * as request from "request-promise";
import * as tough from "tough-cookie";

declare var RecordsService, BrandingService, WorkspaceService;
declare var sails: Sails;
declare var _this;
declare var Institution, User: Model;

export module Services {

  export class OmeroService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'csrf',
      'login',
      'projects'
    ];

    constructor() {
      super();
    }

    csrf(config: any) {
      const get = request({
        uri: `${config.host}/api/v0/token/`
      });
      return Observable.fromPromise(get);
    }

    login(config: any, csrf: string, user: any) {
      let jar = request.jar();
      jar = WorkspaceService.cookieJar(jar, config, 'csrftoken', csrf);
      const post = request({
        uri: `${config.host}/api/v0/login/`,
        method: 'POST',
        formData: {
          username: user.username,
          password: user.password,
          server: config.serverId
        },
        resolveWithFullResponse: true,
        jar: jar,
        headers: {
          'X-CSRFToken': csrf
        }
      });
      return Observable.fromPromise(post);
    }

    projects(config: any, csrf: string, sessionid: string, sessionUuid: string) {
      let jar = request.jar();
      jar = WorkspaceService.cookieJar(jar, config, 'csrftoken', csrf);
      jar = WorkspaceService.cookieJar(jar, config, 'sessionid', sessionid);
      const get = request({
        uri: `${config.host}/api/v0/m/projects/`,
        jar: jar,
        headers: {
          'X-CSRFToken': csrf,
          'sessionUuid': sessionUuid
        }
      });
      return Observable.fromPromise(get);
    }

  }
}
module.exports = new Services.OmeroService().exports();
