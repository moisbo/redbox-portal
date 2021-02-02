// Copyright (c) 2017 Queensland Cyber Infrastructure Foundation (http://www.qcif.edu.au/)
//
// GNU GENERAL PUBLIC LICENSE
//    Version 2, June 1991
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

//<reference path='./../../typings/loader.d.ts'/>
declare var module;
declare var sails;

declare var BrandingService;
declare var RolesService;
declare var DashboardService;
declare var UsersService;
declare var User;
declare var _;
/**
 * Package that contains all Controllers.
 */
import controller = require('../../core/CoreController.js');
import {
  APIErrorResponse
} from '../../core/model/APIErrorResponse.js';
import {
  APIObjectActionResponse
} from '../../core/model/APIObjectActionResponse.js';
import {
  ListAPIResponse,
  ListAPISummary
} from '../../core/model/ListAPIResponse.js';

declare var FormsService;

export module Controllers {
  /**
   * Responsible for all things related to the Dashboard
   *
   * @author <a target='_' href='https://github.com/andrewbrazzatti'>Andrew Brazzatti</a>
   */
  export class FormManagement extends controller.Controllers.Core.Controller {



    /**
     * Exported methods, accessible from internet.
     */
    protected _exportedMethods: any = [
      'getForm',
      'listForms'
    ];

    /**
     **************************************************************************************************
     **************************************** Add custom methods **************************************
     **************************************************************************************************
     */

    public bootstrap() {

    }

    public async getForm(req, res) {
      try {
        let name = req.param('name');
        let editable = req.param('editable');
        if (editable == null) {
          editable = true;
        }
        let form = await FormsService.getFormByName(name, editable).toPromise();

        return this.apiRespond(req, res, form, 200)
      } catch (error) {
        this.apiFail(req, res, 500, new APIErrorResponse(error.message));
      }
    }

    public async listForms(req, res) {
      try {
        let forms = await FormsService.listForms().toPromise();
        let response: ListAPIResponse < any > = new ListAPIResponse();
        let summary: ListAPISummary = new ListAPISummary();
        summary.numFound = forms.length;
        response.summary = summary;
        response.records = forms;
        this.apiRespond(req, res, response);
      } catch (error) {
        this.apiFail(req, res, 500, new APIErrorResponse(error.message));
      }
    }


    /**
     **************************************************************************************************
     **************************************** Override magic methods **********************************
     **************************************************************************************************
     */
  }
}

module.exports = new Controllers.FormManagement().exports();