import { Input, Component, OnInit, Inject, Injector, ElementRef, ViewChild } from '@angular/core';
import { SimpleComponent } from '../../shared/form/field-simple.component';
import { FieldBase } from '../../shared/form/field-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash-lib";

import { GitlabService } from '../gitlab.service';
import { Creation, Template, Checks, CurrentWorkspace, Group, WsUser } from './shared';

// STEST-22
declare var jQuery: any;

/**
* Contributor Model
*
* @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
*
*/
export class CreateWorkspaceField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;
  createLabel: string;
  cancelLabel: string;
  createWorkspaceLabel: string;
  workspaceDetailsLabel: string;
  selectSpace: string;
  nameWorkspace: string;
  addDescriprion: string;
  selectTemplate: string;

  checks: Checks;
  creation: Creation;
  currentWorkspace: CurrentWorkspace;
  wsUser: WsUser;
  groups: Group[];
  templates: Template[];

  gitlabService: GitlabService;
  rdmp: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.gitlabService = this.getFromInjector(GitlabService);
    this.checks = new Checks();
    this.creation = new Creation();
    this.currentWorkspace = new CurrentWorkspace();
    this.wsUser = new WsUser();
    this.createLabel = options['createLabel'] || '';
    this.cancelLabel = options['cancelLabel'] || '';
    this.createWorkspaceLabel = options['createWorkspaceLabel'] || '';
    this.workspaceDetailsLabel = options['workspaceDetailsLabel'] || '';
    this.selectSpace = options['selectSpace'] || '';
    this.nameWorkspace = options['nameWorkspace'] || '';
    this.addDescriprion = options['addDescriprion'] || '';
    this.selectTemplate = options['selectTemplate'] || '';
  }

  registerEvents() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }

  createFormModel(valueElem: any = undefined): any {
    if (valueElem) {
      this.value = valueElem;
    }

    this.formModel = new FormControl(this.value || []);

    if (this.value) {
      this.setValue(this.value);
    }

    return this.formModel;
  }

  setValue(value:any) {
    this.formModel.patchValue(value, {emitEvent: false });
    this.formModel.markAsTouched();
  }

  setEmptyValue() {
    this.value = [];
    return this.value;
  }

  loadCreateWorkspaceModal() {
    //To populate dropdown with first space and template
    //this.loadingModal = true;
    this.creation.name = '';
    this.creation.description = '';
    jQuery('#createModal').modal('show');
    let group = new Group();
    group.id = this.wsUser.id; group.path = this.wsUser.username; group.isUser = true;
    this.groups = [group];
    this.creation.group = this.groups[0];
    this.templates = [{pathWithNamespace: undefined}];
    this.creation.template = this.templates[0];
    this.gitlabService.groups()
    .then(response => {
      this.groups = this.groups.concat(response);
      return this.gitlabService.templates();
    }).then(response => {
      this.templates = this.templates.concat(response);
      //this.loadingModal = false;
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

  createWorkspace() {
    this.gitlabService.createWorkspace(this.creation)
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
    this.gitlabService.createWithTemplate(this.creation)
    .then(response => {
      return this.gitlabService.updateProject(this.creation);
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
    return this.gitlabService.project(pathWithNamespace);
  }

  checkName(){
    //TODO: check workspace name if it is available
  }

  createLink(project: any) {
    return this.gitlabService.link(this.rdmp, project);
  }


}

declare var aotMode;
// Setting the template url to a constant rather than directly in the component as the latter breaks document generation
let createModalWorkspaceTemplate = './field-createworkspace.html';
if(typeof aotMode == 'undefined') {
  createModalWorkspaceTemplate = '../angular/gitlab/components/field-createworkspace.html';
}

/**
* Component that CreateModal to a workspace app
*/
@Component({
  selector: 'ws-createworkspace',
  templateUrl: createModalWorkspaceTemplate
})
export class CreateWorkspaceComponent extends SimpleComponent {

  field: CreateWorkspaceField;

  ngOnInit() {
    this.field.registerEvents();
  }
}
