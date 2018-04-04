/**
* Gitlab form
*/
module.exports = {
  name: 'omero-1.0-draft',
  type: 'omero',
  customAngularApp: {
    appName: 'omero',
    appSelector: 'omero-form'
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
    }
  ]
}