import {Observable, Scheduler} from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import {Sails, Model} from "sails";
import * as request from "request-promise";
import Gitlab = require('gitlab');

declare var RecordsService, BrandingService;
declare var sails: Sails;
declare var _this;
declare var Institution, User: Model;

export module Services {

  export class WSGitlabService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'token',
      'user',
      'updateUser',
      'projects',
      'createWorkspaceRecord',
      'addWorkspaceInfo',
      'getRecordMeta',
      'updateRecordMeta',
      'readFileFromRepo',
      'revokeToken',
      'create',
      'fork',
      'project',
      'updateProject',
      'groups',
      'templates',
      'userInfo',
      'provisionerUser'
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

    //**GITLAB**//
    // TODO: Move section to a different file

    token(config: any, username: string, password: string) {
      const post = request({
        uri: config.host + '/oauth/token',
        method: 'POST',
        body: {
          grant_type: 'password', username: username, password: password
        },
        json: true
      });
      return Observable.fromPromise(post);
    }

    user(config: any, token: string) {
      const get = request({
        uri: config.host + `/api/v4/user?access_token=${token}`,
        json: true
      });
      return Observable.fromPromise(get);
    }

    projects(config: any, token: string) {
      const get = request({
        uri: config.host + `/api/v4/projects?membership=true&access_token=${token}`,
        json: true
      });
      return Observable.fromPromise(get);
    }

    fork(config: any, token: string, creation: any) {
      const origin = creation.template.id;
      let body = {};
      if(!creation.group.isUser) {
        body = {namespace: creation.group.id};
      }
      const post = request({
        uri: config.host + `/api/v4/projects/${origin}/fork?access_token=${token}`,
        method: 'POST',
        body: body,
        json: true
      });
      return Observable.fromPromise(post);
    }

    deleteForkRel(config: any, token: string, namespace: string, project: string) {
      const projectNameSpace = encodeURIComponent(namespace + '/' + project);
      const deleteRequest = request({
        uri: config.host + `/api/v4/projects/${projectNameSpace}/fork?access_token=${token}`,
        method: 'DELETE',
        json: true
      });
      return Observable.fromPromise(deleteRequest);
    }

    addWorkspaceInfo(config: any, token: string, project: any, workspaceLink: string, filePath: string) {
      const projectNameSpace = encodeURIComponent(project.namespace + '/' + project.name);
      const post = request({
        uri: config.host + `/api/v4/projects/${projectNameSpace}/repository/files/${filePath}?access_token=${token}`,
        method: 'POST',
        body: {
          branch: 'master',
          content: workspaceLink,
          author_name: 'Stash',
          commit_message: 'provisioner bot'//TODO: define message via config file or form?
        },
        json: true
      });
      return Observable.fromPromise(post);
    }

    readFileFromRepo(config: any, token: string, projectNameSpace: string, filePath: string) {
      const encodeProjectNameSpace = encodeURIComponent(projectNameSpace);
      const get = request({
        uri: config.host + `/api/v4/projects/${encodeProjectNameSpace}/repository/files/${filePath}?ref=master&access_token=${token}&namespace=${encodeProjectNameSpace}`,
        json: true,
        method: 'GET',
        resolveWithFullResponse: true
      });
      return Observable.fromPromise(get).catch(error => {
        if(error.statusCode === 404 || error.statusCode === 403) {
          return Observable.of({path: projectNameSpace, content: {}});
        } else {
          return Observable.throw(error);
        }
      });
    }

    create(config: any, token: string, creation: any) {
      const body = {
        name: creation.name,
        description: creation.description
      };
      if(creation.namespaceId) {
        body.namespace_id = creation.namespaceId
      }
      const post = request({
        uri: config.host + `/api/v4/projects?access_token=${token}`,
        method: 'POST',
        body: body,
        json: true
      });
      return Observable.fromPromise(post);
    }

    project(config: any, token: string, pathWithNamespace: string) {
      pathWithNamespace = encodeURIComponent(pathWithNamespace);
      const get = request({
        uri: config.host + `/api/v4/projects/${pathWithNamespace}?access_token=${token}`,
        json: true
      });
      return Observable.fromPromise(get);
    }

    updateProject(config: any, token: string, pathWithNamespace: string, project: any) {
      pathWithNamespace = encodeURIComponent(pathWithNamespace);
      const body = {};
      project.attributes.map(p => { body[p.name] = p.newValue; });
      const put = request({
        uri: config.host + `/api/v4/projects/${pathWithNamespace}?access_token=${token}`,
        method: 'PUT',
        body: body,
        json: true
      });
      return Observable.fromPromise(put);
    }

    groups(config: any, token: string) {
      const get = request({
        uri: config.host + `/api/v4/groups?access_token=${token}`,
        json: true
      });
      return Observable.fromPromise(get);
    }

    templates(config: any, token: string, templateTag: string) {
      const get = request({
        uri: config.host + `/api/v4/projects?access_token=${token}`,
        json: true
      });
      return get
      .then(response => {
        const templates = response.filter(o => o.tag_list.find(t => t === templateTag));
        return Observable.of(templates);
      }).catch(error => {
        return Observable.throw(error);
      });
    }

    //**REDBOX-PORTAL**//

    updateUser(userId: string, gitlab: any) {
      //TODO: Update without removing other accessTokens.
      return super.getObservable(
        User.update({id: userId},{accessToken: { gitlab: gitlab}})
      );
    }

    revokeToken(userId: string) {
      return super.getObservable(
        //TODO: Update without removing other accessTokens.
        User.update({id: userId},
        {accessToken: { gitlab: {} } })
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

    //**REDBOX-PORTAL-API**//
    // TODO: Move section to a different file

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

}

}
module.exports = new Services.WSGitlabService().exports();
