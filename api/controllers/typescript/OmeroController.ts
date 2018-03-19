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
      'projects',
      'create',
      'linkWorkspace'
    ];
    protected config: any;

    constructor() {
      super();
      this.config = {
        host: sails.config.local.workspaces.omero.host,
        serverId: sails.config.local.workspaces.omero.serverId,
        appId: sails.config.local.workspaces.omero.appId,
        provisionerUser: sails.config.local.workspaces.provisionerUser,
        recordType: sails.config.local.workspaces.recordType,
        brandingAndPortalUrl: '',
        redboxHeaders:  {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'Authorization': '',
        }
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
          sessionUuid: sessionUuid,
          memberOfGroups: login.memberOfGroups,
          groupId: login.groupId
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

    create(req, res) {
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        WorkspaceService.userInfo(userId)
        .flatMap(response => {
          sails.log.debug('userInfo');
          const appId = this.config.appId;
          const app = response.apps[appId];
          const project = req.param('creation');
          project.type = 'project';
          return OmeroService.createContainer(this.config, app, project);
        })
        .subscribe(response => {
          sails.log.debug('createProject');
          sails.log.debug(response);
          let status = true;
          if(response.bad === 'true'){
            status = false;
          }
          const data = {status: status, create: response};
          this.ajaxOk(req, res, null, data);
        }, error => {
          const errorMessage = `Failed to create project for user ${req.user.username}`;
          sails.log.error(errorMessage);
          sails.log.error(error);
          this.ajaxFail(req, res, errorMessage, error);
        });
      }
    }

    linkWorkspace(req, res) {
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        this.config.brandingAndPortalUrl = sails.getBaseUrl() + BrandingService.getBrandAndPortalPath(req);
        const userId = req.user.id;
        const username = req.user.username;
        const pro = req.param('project');
        const rdmpId = req.param('rdmpId');
        const project = {
          id: pro.id,
          title: pro.title,
          description: pro.description,
          annId: null,
          mapAnnotation: [],
          type: 'OMERO' //TODO: get from form
        };
        let app = {};
        let annotations = [];
        let rowAnnotation;
        let idAnnotation;

        WorkspaceService.userInfo(userId)
        .flatMap(response => {
          sails.log.debug('userInfo');
          const appId = this.config.appId;
          app = response.apps[appId];
          return OmeroService.annotations(this.config, app, project);
        }).flatMap(response => {
          sails.log.debug('annotations');
          annotations = (JSON.parse(response)).annotations;
          project.mapAnnotation = annotations;
          //Check whether there is a workspace created
          const ann = _.first(this.findAnnotation('stash', project.mapAnnotation));
          if(!ann) {
            rowAnnotation = undefined;
            idAnnotation = undefined;
            return this.createAnnotation(app, project, rowAnnotation, idAnnotation, annotations, username, rdmpId);
          } else return Observable.of('');
        }).subscribe(response => {
          sails.log.debug('linkWorkspace');
          const data = {status: true, response};
          this.ajaxOk(req, res, null, data);
        }, error => {
          const errorMessage = `Failed to link project for user ${req.user.username}`;
          sails.log.error(errorMessage);
          sails.log.error(error);
          this.ajaxFail(req, res, errorMessage, error);
        });
      }
    }

    createAnnotation(app, project, rowAnnotation, idAnnotation, annotations, username, rdmpId){
      sails.log.debug('createWorkspaceRecord');
      return WorkspaceService.provisionerUser(this.config.provisionerUser)
      .flatMap(response => {
        sails.log.debug('provisionerUser:createWorkspaceRecord');
        this.config.redboxHeaders['Authorization'] = 'Bearer ' + response.token;
        return WorkspaceService.createWorkspaceRecord(this.config, username, project, 'draft');
      }).flatMap(response => {
        const create = this.mapAnnotation(
          rowAnnotation,
          this.getAnnotation(idAnnotation, annotations),
          'stash',
          `${rdmpId}.${response.oid}`
        );
        project.annId = idAnnotation || null;
        project.mapAnnotation = create.values;
        return OmeroService.annotateMap(this.config, app, project);
      });
    }

    getAnnotation(id: number, annotations: any) {
      return annotations.find(an => an.id === id);
    }

    mapAnnotation(row: number, annotation: any, key, newValue: string) {
      //OMERO stores annotations as array of arrays. Each element being array[0] property and array[1] value
      if (annotation) {
      annotation.values[row.toString()][1] = newValue;
      return annotation;
    } else {
      const annotation = {
        values: [[key, newValue.toString()]]
      };
      return annotation;
    }
  }

  findAnnotation(annotation: string, annotations: string[][]) {
    //Return annotation id where string == annotation[][]
    return annotations.map((anns, index) => {
    const row = anns.values.findIndex(an => an[0] === annotation);
    return {index: index, id: anns.id, row: row != -1 ? row : null}
  }).filter((cur) => {
    return cur.row != null;
  });
}

}

}

module.exports = new Controllers.OmeroController().exports();
