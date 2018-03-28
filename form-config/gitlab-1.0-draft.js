/**
* Gitlab form
*/
module.exports = {
  name: 'gitlab-1.0-draft',
  type: 'gitlab',
  customAngularApp: {
    appName: 'gitlab',
    appSelector: 'gitlab-form'
  },
  skipValidationOnSave: true,
  editCssClasses: 'row col-md-12',
  viewCssClasses: 'row col-md-offset-1 col-md-10',
  messages: {
    "saving": ["@dmpt-form-saving"],
    "validationFail": ["@dmpt-form-validation-fail-prefix", "@dmpt-form-validation-fail-suffix"],
    "saveSuccess": ["@dmpt-form-save-success"],
    "saveError": ["@dmpt-form-save-error"]
  },
  fields: [
    {
      class: 'Container',
      compClass: 'TextBlockComponent',
      viewOnly: false,
      definition: {
        value: 'Workspaces',
        type: 'h2'
      }
    },
    {
      class: 'Container',
      showHeader: true,
      definition: {
        name: 'perissions',
        permissionStep1: 'The provisioner requires permission to create a workspace on your behalf',
        permissionStep2: 'Stash is requesting from GitLab the following permissions:',
        permissionRevoke: 'The permissions for this service will be removed. You will require to grant permissions to GitLab again.',
        permissionList: [
          'Create Repositories',
          'Write information into your repositories'
        ],
        revokeMessage: 'Revoke Login Consent',
        backToRDMP: 'Back to your Plan',
        columns: [
          {'label': 'Name', 'property': 'Name'},
          {'label': 'Description', 'property': 'Description'},
          {'label': 'Location', 'property': 'url:project'}
        ]
      }
    },
    {
      class: 'Container',
      showHeader: true,
      definition: {
        name: 'projectList',
        columns: [
          {'label': 'Name', 'property': 'Name'},
          {'label': 'Description', 'property': 'Description'},
          {'label': 'Location', 'property': 'url:project'}
        ]
      }
    }
  ]
}
