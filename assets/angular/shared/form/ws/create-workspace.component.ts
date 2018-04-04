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
import { Input, Component, OnInit, Inject, Injector} from '@angular/core';
import { SimpleComponent } from '../field-simple.component';
import { FieldBase } from '../field-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash-lib";

/**
* Contributor Model
*
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

  constructor(options: any, injector: any) {
    super(options, injector);
    this.createLabel = options['createLabel'] || 'Create';
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
* Component that log's in to a workspace app
*
*
*
*
*/
@Component({
  selector: 'ws-createworkspace',
  template: `
  <div class='padding-bottom-10'>
    <div class="row">
      <button type="button" class="btn btn-success" (click)="field.loadCreateWorkspaceModal()"><i class="fa fa-plus-square"></i>&nbsp;{{ field.createLabel }}</button>
    </div>
  </div>
  `
})
export class CreateWorkspaceComponent extends SimpleComponent {
  field: CreateWorkspaceField;

}
