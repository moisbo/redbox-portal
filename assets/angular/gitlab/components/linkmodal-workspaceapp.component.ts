import { Input, Component, OnInit, Inject, Injector} from '@angular/core';
import { SimpleComponent } from '../../shared/form/field-simple.component';
import { FieldBase } from '../../shared/form/field-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash-lib";

/**
* Contributor Model
*
* @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
*
*/
export class LinkModalWorkspaceField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;
  revokeLabel: string;

  constructor(options: any, injector: any) {
    super(options, injector);
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

}

/**
* Component that RevokeLogin to a workspace app
*
*
*/
@Component({
  selector: 'ws-linkmodal',
  template: `
  <div id="linkModal" class="modal fade">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Workspace Linking</h4>
        </div>
        <div class="modal-body">
          <h5>Workspace Details</h5>
          <p>Name: {{ creation.name }} / {{ creation.namespace }}</p>
          <p>Web Url: {{ currentWorkspace.web_url }}</p>
          <h5>Processing</h5>
          <p>Checking your master workspace link ...&nbsp;<span *ngIf="checks.master; then isDone; else isSpinning"></span></p>
          <p *ngIf="checks.comparing">Checking current links ...&nbsp;<span *ngIf="checks.link; then isDone; else isSpinning"></span></p>
          <p *ngIf="checks.link == false">No links, Linking to workspace ...&nbsp;<span *ngIf="checks.rdmp; then isDone; else isSpinning"></span></p>
          <p class="alert alert-success" *ngIf="checks.linkCreated">Your workspace was linked succesfully</p>
          <p class="alert alert-danger" *ngIf="checks.linkWithOther">Your workspace is linked with another RDMP</p>
          <ng-template #isDone>
            <i class="fa fa-check-circle"></i>
          </ng-template>
          <ng-template #isSpinning>
            <i class="fa fa-spinner fa-spin"></i>
          </ng-template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class LinkModalWorkspaceComponent extends SimpleComponent {
  field: LinkModalWorkspaceField;

}
