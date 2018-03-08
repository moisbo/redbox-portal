declare var module;
declare var sails, Model;
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
const url = require('url');

declare var BrandingService, WorkspaceService, OmeroService;
/**
* Package that contains all Controllers.
*/
import controller = require('../../../typescript/controllers/CoreController.js');

export module Controllers {

  /**
  * Omero related features....
  *
  */
  export class OmeroController extends controller.Controllers.Core.Controller {

    protected _exportedMethods: any = [
      'login',
      'projects'
    ];
    protected config: any;

    constructor() {
      super();
      this.config = {
        host: sails.config.local.workspaces.omero.host,
        serverId: sails.config.local.workspaces.omero.serverId,
        appId: sails.config.local.workspaces.omero.appId
      }
    }

    login(req, res) {
      const user = {
        username: req.param('username') || '',
        password: req.param('password') || ''
      };
      let csrf: any = {};

      OmeroService.csrf(this.config)
      .flatMap(response => {
        sails.log.debug('csrf');
        csrf = JSON.parse(response);
        sails.log.debug(csrf.data);
        return OmeroService.login(this.config, csrf.data, user);
      })
      .flatMap(response => {
        sails.log.debug('login');
        sails.log.debug('csrf: ' + csrf.data);

        const cookies = response.headers['set-cookie']

        const body = JSON.parse(response.body);
        const login = body.eventContext;
        const sessionUuid = login.sessionUuid;
        const cookieJar = WorkspaceService.getCookies(cookies);
        const info = {
          csrf: csrf.data,
          sessionid: WorkspaceService.getCookieValue(cookieJar, 'sessionid'),
          sessionUuid: sessionUuid
        };
        const userId = req.user.id;
        return WorkspaceService.registerUserApp(userId, this.config.appId, info);
      })
      .subscribe(response => {
        sails.log.debug('login');
        sails.log.debug(response);
        const data = {status: true, login: true};
        this.ajaxOk(req, res, null, data);
      }, error => {
        const errorMessage = `Failed to get projects for user ${user.username}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage, error);
      });
    }

    projects(req, res) {
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        WorkspaceService.userInfo(userId)
        .flatMap(response => {
          sails.log.debug('userInfo');
          const appId = this.config.appId;
          const app = response.apps[appId];
          return OmeroService.projects(this.config, app.csrf, app.sessionid, app.sessionUuid);
        })
        .subscribe(response => {
          sails.log.debug('projects');
          const data = {status: true, projects: JSON.parse(response)};
          this.ajaxOk(req, res, null, data);
        }, error => {
          const errorMessage = `Failed to get projects for user ${req.user.username}`;
          sails.log.error(errorMessage);
          this.ajaxFail(req, res, errorMessage, error);
        });
      }
    }

    linkWorkspace(req, res) {
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        const projectId = req.param('projectId');
        const rdmpId = req.param('rdmpId');
        const project = {
          id: req.param('project')
        };
        let app = {};
        WorkspaceService.userInfo(userId)
        .flatMap(response => {
          sails.log.debug('userInfo');
          const appId = this.config.appId;
          app = response.apps[appId];
          return WorkspaceService.createWorkspaceRecord(this.config, project, 'draft');
        }).flatMap(response => {
          const meta = {
            key: 'stash',
            value: rdmpId + '.' + response.workspaceId
          };
        return OmeroService.updateProjectMeta(this.config, app, project, meta);
        })
        .subscribe(response => {
          sails.log.debug('linkWorkspace');
          const data = {status: true, projects: JSON.parse(response)};
          this.ajaxOk(req, res, null, data);
        }, error => {
          const errorMessage = `Failed to link project for user ${req.user.username}`;
          sails.log.error(errorMessage);
          this.ajaxFail(req, res, errorMessage, error);
        });
    }

  }

}

module.exports = new Controllers.OmeroController().exports();
