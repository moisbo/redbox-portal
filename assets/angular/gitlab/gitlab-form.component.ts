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

import { Component, Inject, Input, ElementRef } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { RecordsService } from '../shared/form/records.service';
import { GitlabService } from './gitlab.service';
import { LoadableComponent } from '../shared/loadable.component';
import { FieldControlService } from '../shared/form/field-control.service';
import { Observable } from 'rxjs/Observable';
import * as _ from "lodash-lib";
import { TranslationService } from '../shared/translation-service';

import { ListWorkspaceDataField, ListWorkspaceDataComponent } from '../shared/form/ws/list-workspaces.component';
import { LoginWorkspaceAppField, LoginWorkspaceAppComponent } from '../shared/form/ws/login-workspaceapp.component';
import { CreateWorkspaceField, CreateWorkspaceComponent } from '../shared/form/ws/create-workspace.component';
import { RevokeLoginWorkspaceAppField, RevokeLoginWorkspaceAppComponent } from '../shared/form/ws/revokelogin-workspaceapp.component';
import { LoginModalWorkspaceField, LoginModalWorkspaceComponent } from '../shared/form/ws/loginmodal-workspaceapp.component';
// STEST-22
declare var jQuery: any;

/**
* Main Gitlab Edit component
*
* @author <a target='_' href='https://github.com/moisbo'>Moises Sacal</a>
*
*/
@Component({
  moduleId: module.id,
  selector: 'gitlab-form',
  templateUrl: './gitlab-form.html',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class GitlabFormComponent extends LoadableComponent {
  /**
  * The OID for this Form.
  *
  */
  @Input() oid: string;
  /**
  * Edit mode
  *
  */
  @Input() editMode: boolean;
  /**
  * The Record type
  *
  */
  @Input() recordType: string;
  /**
  * Fields for the form
  */
  fields: any[] = [];
  /**
  * Form group
  */
  form: FormGroup;
  /**
  * Initialization subscription
  */
  initSubs: any;
  /**
  * Field map
  */
  fieldMap: any;
  /**
  * Form JSON string
  */
  payLoad: any;
  /**
  * Form status
  */
  status: any;
  /**
  * Critical error message
  */
  criticalError: any;
  /**
  * Form definition
  */
  formDef: any;
  /**
  * CSS classes for this form
  */
  cssClasses: any;
  /**
  * Flag when form needs saving.
  *
  */
  needsSave: boolean;
  /**
  * Links to tabs
  */
  failedValidationLinks: any[];
  /**
  * Expects a number of DI'ed elements.
  */

  myComponents: any[] = [
    //{'LoginField': {'meta': LoginField, 'comp': LoginComponent}}
  ];

  login: any;
  loading: boolean = false;
  workspaces: any[] = [];
  loginMessageForm: LoginMessageForm;
  notLoggedIn: any;
  checks: Checks;
  creation: Creation;
  currentWorkspace: CurrentWorkspace;
  columns: any[] = [
    {'label': 'Name', 'property': 'name'},
    {'label': 'Description', 'property': 'description'},
    {'label': 'Location', 'property': 'web_url'}
  ];
  rdmp: string;
  groups: Group[];
  templates: Template[];
  wsUser: WsUser;

  constructor(
    elm: ElementRef,
    @Inject(RecordsService) protected RecordsService: RecordsService,
    @Inject(FieldControlService) protected fcs: FieldControlService,
    @Inject(Location) protected LocationService: Location,
    @Inject(GitlabService) protected GitlabService: GitlabService,
    protected translationService: TranslationService
  ) {
    super();
    this.checks = new Checks();
    this.creation = new Creation();
    this.wsUser = new WsUser();
    this.currentWorkspace = new CurrentWorkspace();
    this.oid = elm.nativeElement.getAttribute('oid');
    this.editMode = elm.nativeElement.getAttribute('editMode') == "true";
    this.recordType = elm.nativeElement.getAttribute('recordType');

    //TODO: Find out what is this next line!
    this.fieldMap = {_rootComp: this};

    this.initSubs = GitlabService.waitForInit((initStat:boolean) => {
      this.initSubs.unsubscribe();
      this.rdmp = elm.nativeElement.getAttribute('rdmp');
      //this.userInfo();
      this.loadForm();
    });
  }

  loadForm() {
    this.fcs.addComponentClasses({
      'ListWorkspaceDataField': { 'meta': ListWorkspaceDataField, 'comp': ListWorkspaceDataComponent },
      'LoginWorkspaceAppField': { 'meta': LoginWorkspaceAppField, 'comp': LoginWorkspaceAppComponent },
      'CreateWorkspaceField': { 'meta': CreateWorkspaceField, 'comp': CreateWorkspaceComponent },
      'RevokeLoginWorkspaceAppField': { 'meta': RevokeLoginWorkspaceAppField, 'comp': RevokeLoginWorkspaceAppComponent },
      'LoginModalWorkspaceField': { 'meta': LoginModalWorkspaceField, 'comp': LoginModalWorkspaceComponent }
    });

    this.RecordsService.getForm(this.oid, this.recordType, this.editMode).then((obs:any) => {
      obs.subscribe((form:any) => {
        this.formDef = form;
        if (this.editMode) {
          this.cssClasses = this.formDef.editCssClasses;
        } else {
          this.cssClasses = this.formDef.viewCssClasses;
        }
        this.needsSave = false;
        if (form.fieldsMeta) {
          this.fields = form.fieldsMeta;
          this.rebuildForm();
          this.watchForChanges();
        }
      });
    }).catch((err:any) => {
      console.log("Error loading form...");
      console.log(err);
      if (err.status == false) {
        this.criticalError = err.message;
      }
      this.setLoading(false);
    });
  }

  onLogin(value: any) {
    this.login = value;
    //TODO: Do validations
    jQuery('#loginPermissionModal').modal('show');
  }

  allow() {
    jQuery('#loginPermissionModal').modal('hide');
    this.GitlabService.token(this.login)
    .then((user: any) => {
      this.login = {};
      if(user){
        this.userInfo();
      } else {
        this.loginMessage('Cannot login', 'danger');
      }
    })
    .catch(e => {
      this.login = {};
      console.log(e);
    });
  }

  userInfo() {
    this.GitlabService.user()
    .then(response => {
      if (response && response.status) {
        this.wsUser = response.user;
        this.getWorkspacesRelated();
      } else {
        // show login page because it cannot login via workspace apps
        this.notLoggedIn = true;
        this.setLoading(false);
      }
    })
    .catch(e => {
      this.notLoggedIn = true;
      this.setLoading(false);
      console.log(e)
    });
  }

  getWorkspacesRelated() {
    this.workspaces = [];
    this.GitlabService.projectsRelatedRecord()
    .then(response => {
      this.workspaces = response;
      this.setLoading(false);
      this.notLoggedIn = false;
    })
    .catch(e => {
      this.setLoading(false);
      console.log(e);
    });
  }

  loadCreateWorkspaceModal() {
    //To populate dropdown with first space and template
    this.loadingModal = true;
    this.creation.name = '';
    this.creation.description = '';
    jQuery('#gitlabCreateModal').modal('show');
    let group = new Group();
    group.id = this.wsUser.id; group.path = this.wsUser.username; group.isUser = true;
    this.groups = [group];
    this.creation.group = this.groups[0];
    this.templates = [{pathWithNamespace: undefined}];
    this.creation.template = this.templates[0];
    this.GitlabService.groups()
    .then(response => {
      this.groups = this.groups.concat(response);
      return this.GitlabService.templates();
    }).then(response => {
      this.templates = this.templates.concat(response);
      this.loadingModal = false;
    })
    .catch(error => {
      this.creation.message = error;
    });
  }

  create() {
    if(this.validateWorkspace()){
      this.creation.message = 'Creating workspace';
      this.creation.creationAlert = 'info';
      if(this.creation.template.pathWithNamespace){
        this.createWithTemplate();
      }else {
        this.createWorkspace();
      }
    }else {
      this.creation.message = this.creation.validateMessage;
      this.creation.creationAlert = 'danger';
    }
  }

  validateWorkspace() {
    if(!this.creation.name) {
      this.creation.validateMessage = 'Name of the workspace is required';
      this.creation.creationAlert = 'danger';
      return false;
    }
    if(!this.creation.description) {
      this.creation.validateMessage = 'Description of the workspace is required';
      this.creation.creationAlert = 'danger';
      return false;
    }
    this.creation.message = undefined;
    this.creation.creationAlert = undefined;
    return true;
  }

  loginMessage(message, cssClass) {
    this.loginMessageForm.message = message;
    this.loginMessageForm.class = cssClass;
  }

  createWorkspace() {
    this.GitlabService.createWorkspace(this.creation)
    .then(response => {
      if(response.status == false){
        //TODO: improve this assignment in case of error.
        const name = response.message.error.error.message.name || '';
        throw new Error('Name ' + _.first(name));
      } else {
        return this.checkCreation();
      }
    }).then(response => {
      if(response.status == false){
        //TODO: improve this assignment in case of error.
        const name = response.message.error.error.message.name || '';
        throw new Error(_.first(name));
      }else {
        this.creation.message = 'Linking workspace';
        this.creation.creationAlert = 'warning';
        this.creation.namespace = this.creation.group.path;
        return this.createLink(this.creation)
        .then(response => {
          if(response.status == false){
            throw new Error(response.message.description);
          }
          this.creation.message = 'Workspace created and linked';
          this.creation.creationAlert = 'success';
        });
      }
    })
    .catch(error => {
      this.creation.creationAlert = 'danger';
      this.creation.message = error;
    });
  }

  createWithTemplate() {
    this.GitlabService.createWithTemplate(this.creation)
    .then(response => {
      return this.GitlabService.updateProject(this.creation);
    })
    .then(response => {
      if(response.status == false){
        //TODO: improve this assignment in case of error.
        const name = response.message.error.error.message.name || '';
        throw new Error(_.first(name));
      }else {
        this.creation.message = 'Linking workspace';
        this.creation.creationAlert = 'warning';
        this.creation.namespace = this.creation.group.path;
        return this.createLink(this.creation)
        .then(response => {
          if(response.status == false){
            throw new Error(response.message.description);
          }
          this.creation.message = 'Workspace created and linked';
          this.creation.creationAlert = 'success';
        });
      }
    })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      this.creation.creationAlert = 'danger';
      this.creation.message = error;
    });
  }

  checkCreation() {
    let pathWithNamespace = '';
    pathWithNamespace = this.creation.group.path + '/' + this.creation.name;
    return this.GitlabService.project(pathWithNamespace);
  }

  checkName(){
    //TODO: check workspace name if it is available
  }

  createLink(project: any) {
    return this.GitlabService.link(this.rdmp, project);
  }

  revokeModal() {
    jQuery('#gitlabRevokeModal').modal('show');
  }

  revoke() {
    this.GitlabService.revokeToken()
    .then(response => {
      this.notLoggedIn = true;
      this.workspaces = [];
      jQuery('#gitlabRevokeModal').modal('hide');
    })
    .catch(error => {
      console.log(error);
    });
  }


  /**
  * Main submit method.
  *
  * @param  {boolean    =             false} nextStep
  * @param  {string     =             null}  targetStep
  * @param  {boolean=false} forceValidate
  * @return {[type]}
  */
  onSubmit(nextStep:boolean = false, targetStep:string = null, forceValidate:boolean=false) {
    if (!this.isValid(forceValidate)) {
      return Observable.of(false);
    }
    this.setSaving(this.getMessage(this.formDef.messages.saving));
    const values = this.formatValues(this.form.value);
    this.payLoad = JSON.stringify(values);
    console.log("Saving the following values:");
    console.log(this.payLoad);
    this.needsSave = false;
    if (_.isEmpty(this.oid)) {
      return this.RecordsService.create(this.payLoad, this.recordType).flatMap((res:any)=>{
        this.clearSaving();
        console.log("Create Response:");
        console.log(res);
        if (res.success) {
          this.oid = res.oid;
          this.LocationService.go(`record/edit/${this.oid}`);
          this.setSuccess(this.getMessage(this.formDef.messages.saveSuccess));
          if (nextStep) {
            this.stepTo(targetStep);
          }
          return Observable.of(true);
        } else {
          this.setError(`${this.getMessage(this.formDef.messages.saveError)} ${res.message}`);
          return Observable.of(false);
        }
      }).catch((err:any)=>{
        this.setError(`${this.getMessage(this.formDef.messages.saveError)} ${err.message}`);
        return Observable.of(false);
      });
    } else {
      return this.RecordsService.update(this.oid, this.payLoad).flatMap((res:any)=>{
        this.clearSaving();
        console.log("Update Response:");
        console.log(res);
        if (res.success) {
          this.setSuccess(this.getMessage(this.formDef.messages.saveSuccess));
          return Observable.of(true);
        } else {
          this.setError(`${this.getMessage(this.formDef.messages.saveError)} ${res.message}`);
          return Observable.of(false);
        }
      }).catch((err:any)=>{
        this.setError(`${this.getMessage(this.formDef.messages.saveError)} ${err}`);
        return Observable.of(false);
      });
    }
  }

  /**
  * Sets the form message status.
  *
  * @param  {string} stat  Bootstrap contextual status: https://getbootstrap.com/docs/3.3/css/#helper-classes
  * @param  {string} msg Message
  * @return {[type]}
  */
  setStatus(stat:string, msg:string) {
    _.forOwn(this.status, (stat:string, key:string) => {
      this.status[key] = null;
    });
    this.status[stat] = {msg: msg};
  }

  /**
  * Clears status
  *
  * @param  {string} stat - Clears the status
  * @return {[type]}
  */
  clearStatus(stat:string) {
    this.status[stat] = null;
  }

  /**
  * Convenience wrapper to set saving status.
  *
  * @param  {string = 'Saving...'} msg
  * @return {[type]}
  */
  setSaving(msg:string = 'Saving...') {
    this.clearError();
    this.clearSuccess();
    this.setStatus('saving', msg);
  }
  /**
  * Convenience wrapper to clear saving status.
  *
  * @return {[type]}
  */
  clearSaving() {
    this.clearStatus('saving');
  }
  /**
  * Set a 'error' message.
  *
  * @param  {string} msg
  * @return {[type]}
  */
  setError(msg: string) {
    this.clearSaving();
    this.needsSave = true;
    this.setStatus('error', msg);
  }

  /**
  * Clear the error message.
  *
  * @return {[type]}
  */
  clearError() {
    this.clearStatus('error');
  }

  /**
  * Set a 'success' message.
  * @param  {string} msg
  * @return {[type]}
  */
  setSuccess(msg: string) {
    this.clearSaving();
    this.setStatus('success', msg);
  }
  /**
  * Clear the 'success' message.
  * @return {[type]}
  */
  clearSuccess() {
    this.clearStatus('success');
  }
  /**
  * Rebuild the form message.
  *
  * @return {[type]}
  */
  rebuildForm() {
    this.form = this.fcs.toFormGroup(this.fields, this.fieldMap);
  }
  /**
  * Enable form change monitor.
  *
  * @return {[type]}
  */
  watchForChanges() {
    this.setLoading(false);
    if (this.editMode) {
      this.form.valueChanges.subscribe((data:any) => {
        this.needsSave = true;
      });
    }
  }
  /**
  * Trigger form validation
  *
  * @return {[type]}
  */
  triggerValidation() {
    this.failedValidationLinks = [];
    _.forOwn(this.fieldMap, (fieldEntry:any, fieldName:string) => {
      if (!_.isEmpty(fieldName) && !_.startsWith(fieldName, '_')) {
        fieldEntry.field.triggerValidation();
      }
    });
  }
  /**
  * Checks form validity.
  *
  * @param  {boolean=false} forceValidate
  * @return {[type]}
  */
  isValid(forceValidate:boolean=false) {
    if (this.formDef.skipValidationOnSave  && (_.isUndefined(forceValidate) || _.isNull(forceValidate) || !forceValidate)) {
      return true;
    }
    this.triggerValidation();
    if (!this.form.valid) {
      // STEST-22
      this.setError(this.getMessage(this.formDef.messages.validationFail));
      this.generateFailedValidationLinks();
      return false;
    }
    return true;
  }

  // STEST-22
  generateFailedValidationLinks() {
  let label = null;
  _.forOwn(this.form.controls, (ctrl, ctrlName) => {
    if (ctrl.invalid) {
      label = this.failedValidationLinks.length > 0 ? `, ${this.fieldMap[ctrlName].field.label}` : this.fieldMap[ctrlName].field.label;
      this.failedValidationLinks.push({
        label: label,
        parentId: this.fieldMap[ctrlName].instance.parentId
      });

    }
  });
}

gotoTab(tabId) {
  jQuery(`[href=#${tabId}]`).tab('show');
}

getMessage(messageKeyArr: any):string {
  let message: string = '';
  _.each(messageKeyArr, (msgKey) => {
    if (_.startsWith(msgKey, '@')) {
      message = `${message}${this.translationService.t(msgKey)}`;
    }
  });
  return message;
}
/**
* Submit the form towards a target step.
*
* @param  {string} targetStep
* @return {[type]}
*/
stepTo(targetStep: string) {
  console.log(this.form.value);
  if (!this.isValid(true)) {
    return;
  }
  this.needsSave = false;
  if (_.isEmpty(this.oid)) {
    this.onSubmit(true, targetStep, true);
  } else {
    this.setSaving(this.getMessage(this.formDef.messages.saving));
    const values = this.formatValues(this.form.value);
    this.payLoad = JSON.stringify(values);
    console.log(this.payLoad);
    this.RecordsService.stepTo(this.oid, this.payLoad, targetStep).then((res:any) => {
      this.clearSaving();
      console.log("Update Response:");
      console.log(res);
      if (res.success) {
        this.setSuccess(this.getMessage(this.formDef.messages.saveSuccess));
        this.gotoDashboard();
      } else {
        this.setError(`${this.getMessage(this.formDef.messages.saveError)} ${res.message}`);
      }
    }).catch((err:any)=>{
      this.setError(`${this.getMessage(this.formDef.messages.saveError)} ${err}`);
    });
  }
}
/**
* Trigger form elements to format their values.
*
* @param  {any}    data
* @return {[type]}
*/
formatValues(data:any) {
  const formVals = _.cloneDeep(data);
  _.forOwn(formVals, (val:any, key:string) => {
    if (_.isFunction(this.fieldMap[key].instance.formatValue)) {
      const newVal = this.fieldMap[key].instance.formatValue(formVals[key]);
      formVals[key] = newVal;
    }
  });
  return formVals;
}
/**
* Returns the saving status of the form.
*
* @return {[type]}
*/
isSaving() {
  return this.status.saving;
}
/**
* Redirect to dashboard.
*
* @author <a target='_' href='https://github.com/moisbo'>Moises Sacal</a>
* @return {[type]}
*/
gotoDashboard() {
  window.location.href = this.RecordsService.getDashboardUrl();
}
/**
* Form cancellation handler.
*
* @return {[type]}
*/
onCancel() {
  this.gotoDashboard();
}
}

class LoginMessageForm {
  message: string;
  class: string;
}

class Checks {
  link: any = undefined;
  rdmp: boolean = false;
  linkCreated: boolean = false;
  linkWithOther: boolean = false;
  master: boolean = false;
  comparing: boolean = false;
}

class Group {
  name: string;
  id: string;
  path: string;
  isUser: boolean;
}

class Template {
  pathWithNamespace: string;
}

class Creation {
  created: boolean = false;
  name: string;
  namespace: string;
  creationAlert: string = '';
  blank: boolean = true;
  template: any;
  description: string;
  group: any;
  message: string;
  validateMessage: string;
}

class CurrentWorkspace {
  path_with_namespace: string = '';
  web_url: string = ''
}

class WsUser {
  username: string;
  id: string;
}