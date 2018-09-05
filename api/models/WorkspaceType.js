/**
* WorkspaceType.js
*
* @description :: Captures the workspaces types available for redbox-portal
* @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
*/

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    //TODO: Is this needed?
    // A Workspace needs to belong to a Brand, 1 to 1
    branding: {
      model: 'brandingconfig',
      required: true
    },
    logo: {
      type: 'string'
    },
    subtitle: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    action: {
      type: 'json'
    }
  }
}
