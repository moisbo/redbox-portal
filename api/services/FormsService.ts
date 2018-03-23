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

import { Observable } from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import { Sails, Model } from "sails";

declare var sails: Sails;
declare var Form: Model;
declare var RecordType: Model;
declare var WorkflowStep: Model;
declare var _this;

export module Services {
  /**
   * Forms related functions...
   *
   * @author <a target='_' href='https://github.com/shilob'>Shilo Banihit</a>
   *
   */
  export class Forms extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'bootstrap',
      'getForm',
      'flattenFields',
      'getFormByName'
    ];

    public bootstrap = (workflowSteps): Observable<any> => {
      if (!workflowSteps || workflowSteps.length == 0 || workflowSteps[0] == null) {
        return Observable.of(null);
      } else {
        return super.getObservable(Form.find({ workflowStep: workflowSteps[0].name })).flatMap(form => {
          if (!form || form.length == 0) {
            sails.log.verbose("Bootstrapping form definitions... ");
            const formDefs = [];
            _.forOwn(sails.config.form.forms, (formDef, formName) => {
              formDefs.push(formName);
            });
            return Observable.from(formDefs);
          } else {

            return Observable.of(null);
          }
        })
          .flatMap(formName => {

            if (formName) {

              _.each(workflowSteps, function(workflowStep) {

                if (workflowStep.config.form == formName) {
                  const formObj = {
                    name: formName,
                    fields: sails.config.form.forms[formName].fields,
                    workflowStep: workflowStep.name,
                    customAngularApp: sails.config.form.forms[formName].customAngularApp || null,
                    type: sails.config.form.forms[formName].type,
                    messages: sails.config.form.forms[formName].messages,
                    viewCssClasses: sails.config.form.forms[formName].viewCssClasses,
                    editCssClasses: sails.config.form.forms[formName].editCssClasses,
                    skipValidationOnSave: sails.config.form.forms[formName].skipValidationOnSave
                  };

                  var q = Form.create(formObj);
                  var obs = Observable.bindCallback(q["exec"].bind(q))();
                  obs.subscribe(result => {
                    sails.log.verbose("Created form record: ");
                    sails.log.verbose(result);
                  });
                  return Observable.of(null);
                }
              });
            }
            return Observable.of(null);
          })
          .last();
      }
    }

    public getFormByName = (formName, editMode): Observable<any> => {
      return super.getObservable(Form.findOne({ name: formName })).flatMap(form => {
        if (form) {
          this.setFormEditMode(form.fields, editMode);
          return Observable.of(form);
        }
        return Observable.of(null);
      });
    }

    public getForm = (branding, recordType, editMode): Observable<any> => {

      return super.getObservable(RecordType.findOne({ key: branding + "_" + recordType }))
        .flatMap(recordType => {

          return super.getObservable(WorkflowStep.findOne({ recordType: recordType.key }));
        }).flatMap(workflowStep => {

          if (workflowStep.starting == true) {

            return super.getObservable(Form.findOne({ name: workflowStep.config.form }));
          }

          return Observable.of(null);
        }).flatMap(form => {

          if (form) {
            this.setFormEditMode(form.fields, editMode);
            return Observable.of(form);
          }
          return Observable.of(null);
        }).filter(result => result !== null).last();
    }

    protected setFormEditMode(fields, editMode) {
      _.remove(fields, field => {
        if (editMode) {
          return field.viewOnly == true;
        } else {
          return field.editOnly == true;
        }
      });
      _.forEach(fields, field => {
        field.definition.editMode = editMode;
        if (!_.isEmpty(field.definition.fields)) {
          this.setFormEditMode(field.definition.fields, editMode);
        }
      });
    }

    public flattenFields(fields, fieldArr) {
      _.map(fields, (f) => {
        fieldArr.push(f);
        if (f.fields) {
          this.flattenFields(f.fields, fieldArr);
        }
      });
    }
  }
}
module.exports = new Services.Forms().exports();
