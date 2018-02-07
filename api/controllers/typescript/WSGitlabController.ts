declare var module;
declare var sails;
import {Observable} from 'rxjs/Rx';

declare var WSGitlabService;
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
  export class WSGitlabController extends controller.Controllers.Core.Controller {
    /**
    * Exported methods, accessible from internet.
    */
    protected _exportedMethods: any = [
      'token',
      'user',
      'projects',
      'link'
    ];

    public token(req, res) {
      sails.log.debug('get token:');

      const username = req.param('username');
      const password = req.param('password');

      const obs = WSGitlabService.token(username, password);

      obs.subscribe(response => {
        response.status = true;
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get token for user: ${username}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public user(req, res) {
      sails.log.debug('get user:');

      const token = req.param('token');

      sails.log.error('token');
      sails.log.error(token);

      const obs = WSGitlabService.user(token);

      obs.subscribe(response => {
        response.status = true;
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get info for with token: ${token}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public projects(req, res) {
      sails.log.debug('get projects');

      const token = req.param('token');
      const id = req.param('id');

      const obs = WSGitlabService.projects(token, id);

      obs.subscribe(response => {
        response.status = true;
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get projects for token: ${token} and user: ${id}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });

    }

    public link(req, res) {
      sails.log.debug('get link');

      const token = req.param('token');
      const projectId = req.param('projectId');
      const workspace = req.param('workspace');
      const rdmpId = req.param('rdmpId');

      let workspaceId = null;

      WSGitlabService
      .create(workspace)
      .flatMap(response => {
        workspaceId = response.oid;
        return WSGitlabService.addWorkspaceInfo(token, projectId, workspaceId)
      })
      .flatMap(response => {
        return this.addParentRecordLink(rdmpId, workspaceId)
      })
      .subscribe(response => {
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to link workspace with ID: ${projectId}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    addParentRecordLink(rdmpId: string, workspaceId: string) {
      return WSGitlabService.getRecordMeta(rdmpId)
      .flatMap(
        record => {
          sails.log.debug(record.metadata);
          const wss = record.metadata.workspaces.find(id => workspaceId === id);
          if(!wss) {
            record.metadata.workspaces.push({id: workspaceId});
          }
          return WSGitlabService.updateRecordMeta(record);
        }
      )
    }

  }
}

module.exports = new Controllers.WSGitlabController().exports();
