declare var module;
declare var sails;

declare var BrandingService;
declare var RolesService;
declare var  DashboardService;
declare var  UsersService;
declare var  User;
/**
 * Package that contains all Controllers.
 */
import controller = require('../../../typescript/controllers/CoreController.js');
export module Controllers {
  /**
   * Workspace Controller
   *
   * @author <a target='_' href='https://github.com/moisbo'>Moises Sacal</a>
   */
  export class WorkspaceController extends controller.Controllers.Core.Controller {

    /**
     * Methods required for workspace dashboard.
     */
    protected _exportedMethods: any = [
        'listWorkspaceApps'
    ];


  }
}
