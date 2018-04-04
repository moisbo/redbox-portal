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
        name: 'title',
        value: 'GitLab',
        type: 'h2'
      }
    },
    {
      class: 'Container',
      compClass: 'TextBlockComponent',
      viewOnly: false,
      definition: {
        name: 'subtitle',
        value: 'Workspaces',
        type: 'h3'
      }
    },
    {
      class: 'ListWorkspaceDataField',
      showHeader: true,
      definition: {
        name: 'ListWorkspaces',
        columns: [
          {'label': 'Name', 'property': 'Name'},
          {'label': 'Description', 'property': 'Description'},
          {'label': 'Location', 'property': 'web_url'}
        ],
        rdmpLinkLabel: 'Plan',
        syncLabel: 'Sync'
      }
    },
    {
      class: 'CreateWorkspaceField',
      showHeader: true,
      definition: {
        name: 'CreateWorkspace',
        createLabel: 'Create'
      }
    },
    {
      class: 'LoginWorkspaceAppField',
      showHeader: true,
      definition: {
        name: 'LoginWorkspaceApp',
        permissionStep: 'The provisioner requires permission to create a workspace on your behalf',
        usernameLabel: 'username',
        passwordLabel: 'password',
        loginLabel: 'Login'
      }
    },
    {
      class: 'RevokeLoginWorkspaceAppField',
      showHeader: true,
      definition: {
        name: 'RevokeLogin',
        revokeLabel: 'Revoke Login Consent'
      }
    },
    {
      class: 'LoginModalWorkspaceField',
      showHeader: true,
      definition: {
        name: 'modalLogin',
        permissionStep: 'Stash is requesting from Omero the following permissions:',
        permissionList: [
          'Create Repositories',
          'Write information into your repositories'
        ]
      }
    }
  ]
}
