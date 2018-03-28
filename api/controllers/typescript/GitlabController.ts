declare var module;
declare var sails, Model;
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
const url = require('url');

declare var GitlabService, BrandingService, WorkspaceService;
/**
* Package that contains all Controllers.
*/
import controller = require('../../../typescript/controllers/CoreController.js');

export module Controllers {

  /**
  * Workspace related features....
  *
  *
  */
  export class GitlabController extends controller.Controllers.Core.Controller {
    /**
    * Exported methods, accessible from internet.
    */
    protected _exportedMethods: any = [
      'token',
      'user',
      'projectsRelatedRecord'
    ]
    protected config: Config;

    constructor(){
      super();
      this.config = new Config();
      const gitlabConfig = sails.config.local.workspaces.gitlab;
      const workspaceConfig = sails.config.local.workspaces;
      this.config = {
        host: gitlabConfig.host,
        recordType: gitlabConfig.recordType,
        formName: gitlabConfig.formName,
        appName: gitlabConfig.appName,
        parentRecord: workspaceConfig.parentRecord,
        provisionerUser: workspaceConfig.provisionerUser,
        //TODO: get the brand url with config service
        brandingAndPortalUrl: '',
        redboxHeaders:  {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'Authorization': '',
        }
      }
    }

    public token(req, res) {
      sails.log.debug('get token:');

      //TODO: do we need another form of security?
      const username = req.param('username');
      const password = req.param('password');

      let accessToken = {};
      let user = {};
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        return WorkspaceService.infoFormUserId(userId)
        .flatMap(response => {
          sails.log.debug('infoFormUserId');
          sails.log.debug(response);
          user = response;
          return GitlabService.token(this.config, username, password)
        })
        .flatMap(response => {
          sails.log.debug('token');
          accessToken = response;
          sails.log.debug(accessToken);
          return GitlabService.user(this.config, accessToken.access_token);
        }).flatMap(response => {
          sails.log.debug('gitlab user');
          sails.log.debug(response);
          const gitlabUser = {
            username: response.username,
            id: response.id
          };
          return WorkspaceService.createWorkspaceInfo(userId, this.config.appName, {user: gitlabUser, accessToken: accessToken});
        })
        .subscribe(response => {
          sails.log.debug('createWorkspaceInfo');
          sails.log.debug(response);
          this.ajaxOk(req, res, null, {status: true});
        }, error => {
          sails.log.error(error);
          const errorMessage = `Failed to get token for user: ${username}`;
          sails.log.error(errorMessage);
          this.ajaxFail(req, res, errorMessage, error);
        });
      }
    }

    public user(req, res) {
      sails.log.debug('get user:');
      let gitlab = {};
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
        .flatMap(response => {
          if(!response){
            return Observable.throw('no workspace app found');
          }
          gitlab = response.info;
          return GitlabService.user(this.config, gitlab.accessToken.access_token)
        }).subscribe(response => {
          response.status = true;
          this.ajaxOk(req, res, null, {status: true});
        }, error => {
          sails.log.error(error);
          const errorMessage = `Failed to get user workspace info of userId: ${userId}`;
          sails.log.error(errorMessage);
          this.ajaxFail(req, res, null, error);
        });
      }
    }

    public projectsRelatedRecord(req, res) {
      sails.log.debug('get related projects');

      let currentProjects = [];
      let projectsWithInfo = [];
      let gitlab = {};
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
        .flatMap(response => {
          gitlab = response.info;
          return GitlabService.projects(this.config, gitlab.accessToken.access_token)
        })
        .flatMap(response => {
          let obs = [];
          currentProjects = response.slice(0);
          for (let r of currentProjects) {
            obs.push(GitlabService.readFileFromRepo(this.config, gitlab.accessToken.access_token, r.path_with_namespace, 'stash.workspace'));
          }
          return Observable.merge(...obs);
        })
        .subscribe(response => {
          const parsedResponse = this.parseResponseFromRepo(response);
          projectsWithInfo.push({
            path: parsedResponse.path,
            info: parsedResponse.content ? this.workspaceInfoFromRepo(parsedResponse.content) : {}
          });
        }, error => {
          const errorMessage = `Failed to get projectsRelatedRecord for token: ${gitlab.accessToken.access_token}`;
          sails.log.debug(errorMessage);
          this.ajaxFail(req, res, errorMessage, error);
        }, () => {
          sails.log.debug('complete');
          currentProjects.map(p => {
            p.rdmp = projectsWithInfo.find(pwi => pwi.path === p.path_with_namespace);
          });
          this.ajaxOk(req, res, null, currentProjects);
        });
      }
    }

    workspaceInfoFromRepo(content: string) {
      const workspaceLink = Buffer.from(content, 'base64').toString('ascii');
      if(workspaceLink) {
        const workspaceInfo = workspaceLink.split('.');
        return {rdmp: _.first(workspaceInfo), workspace: _.last(workspaceInfo)};
      } else{
        return {rdmp: null, workspace: null};
      }
    }

    parseResponseFromRepo(response) {
      const result = {content: null, path:''};
      if(response.body && response.body.content) {
        result.content = response.body.content;
        var url_parts = url.parse(response.request.uri.href, true);
        var query = url_parts.query;
        result.path = query.namespace;
      } else {
        result.content = null;
        result.path = response.path;
      }
      return result;
    }


  }

  class Config {
    host: string;
    recordType: string;
    formName: string;
    appName: string;
    parentRecord: string;
    provisionerUser: string;
    brandingAndPortalUrl: string;
    redboxHeaders: any;
  }

}

module.exports = new Controllers.GitlabController().exports();
