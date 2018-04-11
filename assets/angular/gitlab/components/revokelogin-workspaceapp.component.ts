import { Input, Component, OnInit, Inject, Injector} from '@angular/core';
import { SimpleComponent } from '../../shared/form/field-simple.component';
import { FieldBase } from '../../shared/form/field-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash-lib";

import { GitlabService } from '../gitlab.service';

// STEST-22
declare var jQuery: any;

/**
* Contributor Model
*
* @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
*
*/
export class RevokeLoginWorkspaceAppField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;
  revokeLabel: string;

  gitlabService: GitlabService;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.gitlabService = this.getFromInjector(GitlabService);
    this.revokeLabel = options['revokeLabel'] || 'Revoke Login Consent';
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

  revokeModal() {
    jQuery('#revokeModal').modal('show');
  }

  revoke() {
    this.gitlabService.revokeToken()
    .then(response => {
      // this.notLoggedIn = true;
      // this.workspaces = [];
      //TODO: if OK remove workspaces
      jQuery('#revokeModal').modal('hide');
    })
    .catch(error => {
      console.log(error);
    });
  }

}

/**
* Component that RevokeLogin to a workspace app
*
*
*/
@Component({
  selector: 'ws-revokelogin',
  template: `
  <div class='padding-bottom-10'>
    <div class="row">
      <button type="button" class="btn btn-danger" (click)="field.revokeModal()">{{ field.revokeLabel }}</button>
    </div>
  </div>
  <div id="revokeModal" class="modal fade">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">{{ field.permissionRevokeTitle }}</h4>
        </div>
        <div class="modal-body">
          <p>{{ field.permissionRevoke }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" (click)="revoke()">{{field.revokeLabel}}</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">{{field.closeLabel}}</button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class RevokeLoginWorkspaceAppComponent extends SimpleComponent {
  field: RevokeLoginWorkspaceAppField;

}
