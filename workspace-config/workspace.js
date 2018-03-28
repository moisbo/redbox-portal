/**
* Workspace related configuration
*/
module.exports.workspace = {
  routes: {
    'get /:branding/:portal/ws/gitlab/user': 'typescript/GitlabController.user',
    'post /:branding/:portal/ws/gitlab/token': 'typescript/GitlabController.token',
    'get /:branding/:portal/ws/gitlab/revokeToken': 'typescript/GitlabController.revokeToken',    
    'get /:branding/:portal/ws/gitlab/projects': 'typescript/GitlabController.projects',
    'get /:branding/:portal/ws/gitlab/projectsRelatedRecord': 'typescript/GitlabController.projectsRelatedRecord',
    'post /:branding/:portal/ws/gitlab/link': 'typescript/GitlabController.link',
    'post /:branding/:portal/ws/gitlab/checkRepo': 'typescript/GitlabController.checkRepo',
    'post /:branding/:portal/ws/gitlab/create': 'typescript/GitlabController.create',
    'post /:branding/:portal/ws/gitlab/createWithTemplate': 'typescript/GitlabController.createWithTemplate',
    'post /:branding/:portal/ws/gitlab/project': 'typescript/GitlabController.project',
    'post /:branding/:portal/ws/gitlab/updateProject': 'typescript/GitlabController.updateProject',
    'get /:branding/:portal/ws/gitlab/groups': 'typescript/GitlabController.groups',
    'get /:branding/:portal/ws/gitlab/templates': 'typescript/GitlabController.templates',
  }

}
