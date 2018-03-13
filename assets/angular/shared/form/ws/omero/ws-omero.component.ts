import {Input, Component, OnInit, Inject, Injector} from '@angular/core';
import {SimpleComponent} from '../../field-simple.component';
import {FieldBase} from '../../field-base';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import * as _ from "lodash-lib";
import {OmeroService} from './ws-omero.service';
import {UserSimpleService} from '../../../user.service-simple';
import {Role, User, LoginResult, SaveResult} from '../../../../shared/user-models';

declare var jQuery: any;
/**
* WorkspaceFieldComponent Model
*
*
*/
export class OmeroField extends FieldBase<any> {

  omeroService: OmeroService;

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;

  workspaces: object[];
  columns: object[];
  permissionList: object;
  permissionStep1: string;
  permissionStep2: string;
  permissionRevoke: string;
  backToRDMP: string;
  revokeMessage: string;

  rdmp: string;
  rdmpLocation: string;
  name: string;

  hasSession: boolean;

  loginMessageForm: any;
  loading: boolean;

  creation: Creation;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.omeroService = this.getFromInjector(OmeroService);

    this.name = options['name'] || '';
    this.columns = options['columns'] || [];
    this.permissionList = options['permissionList'] || {};
    this.permissionStep1 = options['permissionStep1'] || '';
    this.permissionStep2 = options['permissionStep2'] || '';
    this.permissionRevoke = options['permissionRevoke'] || '';
    this.backToRDMP = options['backToRDMP'] || 'go back';
    this.revokeMessage = options['revokeMessage'] || '';

    this.setRDMPLocation();
    this.projects();
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

  setValue(value: any) {
    this.formModel.patchValue(value, {emitEvent: false});
    this.formModel.markAsTouched();
  }

  setEmptyValue() {
    this.value = [];
    return this.value;
  }

  setRDMPLocation() {
    const params = (new URL(document.location)).searchParams; //How compatible is this with browsers?
    this.rdmp = params.get('rdmp');
    this.rdmpLocation = this.omeroService.recordURL + '/' + this.rdmp + '#workspaces';
  }

  sendToRDMP() {
    console.log('send location back');
    document.location = this.rdmpLocation;
  }

  projects(){
    this.loading = true;
    this.workspaces = [];
    this.omeroService.projects()
    .then(response => {
      if(response.projects){
        this.workspaces = response.projects.data;
        this.loading = false;
        this.hasSession = true;
      }
    }).catch(response => {
      this.loading = false;
      this.hasSession = false;
    })
  }

  login(value: any) {
    this.loading = true;
    if(value.username && value.password) {
      this.omeroService.login(value.username, value.password)
      .then(response => {
        if(response.status && response.login){
        this.projects();
      }else {
        throw new Error();
      }
      })
      .catch(error => {
        this.loading = false;
        this.loginMessageForm.message = 'Error Login in; Please provide username and password';
        this.loginMessageForm.class = 'danger';
        console.log(error);
      })
    }else {
      this.loading = false;
      this.loginMessageForm.message = 'Please include username and password';
      this.loginMessageForm.class = 'danger';
    }
  }

  loadCreateWorkspaceModal() {
    this.creation = new Creation();
    jQuery('#createModal').modal('show');
  }

  create(value: any) {
    console.log(value)
    if(value.name && value.description) {
      this.loading = true;
      this.creation.name = value.name;
      this.creation.description = value.description;
      this.omeroService.create(this.creation)
      .then(response => {
        console.log(response)
        this.loading = false;
      })
      .catch(error => {
        console.table(error)
        this.loading = false;
      });
    }else{
      this.loading = false;
      this.creation.message = 'Please include name and description';
      this.creation.alert = 'danger';
    }
  }

}

declare var aotMode;
// Setting the template url to a constant rather than directly in the component as the latter breaks document generation
let rbOmeroTemplate = './ws/ws-omero.template.html';
if(typeof aotMode == 'undefined') {
  rbOmeroTemplate = '../../angular/shared/form/ws/omero/ws-omero.template.html';
}
/**
* Component to display information from related objects within ReDBox
*
*
*/
@Component({
  selector: 'ws-field',
  templateUrl: rbOmeroTemplate
})
export class OmeroComponent extends SimpleComponent {
  field: OmeroField;

}

class Creation {
  name: string;
  description: string;
  message: string;
  alert: string;
}
