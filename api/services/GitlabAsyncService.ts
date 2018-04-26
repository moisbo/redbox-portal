import { Observable } from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import { Sails, Model } from "sails";
import * as request from "request-promise";
const moment = require('moment');

declare var WorkspaceService, GitlabService, WorkspaceAsyncService;
declare var sails: Sails;
declare var _this;
declare var Institution, User: Model;

export module Services {

  export class GitlabAsyncService extends services.Services.Core.Service {

    recordType: string;
    formName: string;
    brandingAndPortalUrl: string;
    parentRecord: string;
    bearer: string;
    redboxHeaders: {};

    protected _exportedMethods: any = [
      'project'
    ]

    public project({asyncId, asyncStatus, config, userId, pathWithNamespace}) {
      return WorkspaceService.infoFormUserId(userId)
      .flatMap(gitlab => {
        return GitlabService.project({
          host: config.host, token: gitlab.accessToken.access_token,
          pathWithNamespace: pathWithNamespace
        })
      })
      .flatMap(response => {
        if(response['import_status'] !== 'none' && response['import_error'] != null){
          return WorkspaceAsyncService.update(asyncId, {
            status: asyncStatus, workspaceStatus: {
              check: true,
              checkAt: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            message: { createdAt: response['created_at']}
          })
        } else {
          return Observable.of('');
        }
      })
    }

    public link({
      asyncId, asyncStatus, config,
      userId, username, project, recordMap, branch, rdmpId, workspaceId
    }) {
      let gitlab;
      return WorkspaceService.provisionerUser(config.provisionerUser)
      .flatMap(response => {
        config.redboxHeaders['Authorization'] = 'Bearer ' + response.token;
        return WorkspaceService.workspaceAppFromUserId(userId, config.appName);
      }).flatMap(response => {
        gitlab = response.info;
        let record = WorkspaceService.mapToRecord(project, recordMap);
        record = _.merge(record, {type: config.recordType});
        return WorkspaceService.createWorkspaceRecord(config, username, record, config.recordType, config.workflowStage);
      }).flatMap(response => {
        workspaceId = response.oid;
        sails.log.debug('addWorkspaceInfo');
        return GitlabService.addWorkspaceInfo(config, gitlab.accessToken.access_token, branch, project, rdmpId + '.' + workspaceId, 'stash.workspace');
      })
      .flatMap(response => {
        sails.log.debug('addParentRecordLink');
        return WorkspaceService.getRecordMeta(config, rdmpId);
      })
      .flatMap(recordMetadata => {
        sails.log.debug('recordMetadata');
        if(recordMetadata && recordMetadata.workspaces) {
          const wss = recordMetadata.workspaces.find(id => workspaceId === id);
          if(!wss) {
            recordMetadata.workspaces.push({id: workspaceId});
          }
        }
        return WorkspaceService.updateRecordMeta(config, recordMetadata, rdmpId);
      });
    }

  }

  module.exports = new Services.GitlabAsyncService().exports();
