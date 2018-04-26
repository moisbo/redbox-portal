/**
 * WorkspaceAsync.js
 *
 * @description :: Tracks Asynchrounous workspace methods
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var moment = require('moment');

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    recordType: {
      type: 'string',
      required: true
    },
    date_started: {
      type: 'datetime',
      defaultsTo: function() {
        return moment().format('YYYY-MM-DDTHH:mm:ss');
      }
    },
    date_completed: {
      type: 'datetime'
    },
    started_by: {
      type: 'string',
      required: true
    },
    service: {
      type: 'string',
      required: true
    },
    method:{
      type: 'string',
      required: true
    },
    args: {
      type: 'json',
      required: true
    },
    status: {
      type: 'string'
    },
    workspaceStatus: {
      type: 'json'
    },
    message: {
      type: 'json'
    }
  }
};
