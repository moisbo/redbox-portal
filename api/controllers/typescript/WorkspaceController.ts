declare var module;
declare var sails, Model;
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
const url = require('url');

declare var BrandingService;
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
  export class WorkspaceController extends controller.Controllers.Core.Controller {

    protected _exportedMethods: any = [];
  }
}

module.exports = new Controllers.WorkspaceController().exports();
