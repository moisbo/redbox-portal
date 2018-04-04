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
export class LoginWorkspaceAppField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;
  columns: object[];
  usernameLabel: string;
  passwordLabel: string;
  loginLabel: string;
  permissionStep: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.columns = options['columns'] || [];
    this.permissionStep = options['permissionStep'] || '';
    this.usernameLabel = options['usernameLabel'] || 'username';
    this.passwordLabel = options['passwordLabel'] || 'password';
    this.loginLabel = options['loginLabel'] || 'login';
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

declare var aotMode
// Setting the template url to a constant rather than directly in the component as the latter breaks document generation
let wsLoginWorkspaceAppTemplate = './field-loginworkspaceapp.html';
if(typeof aotMode == 'undefined') {
  wsLoginWorkspaceAppTemplate = '../angular/shared/form/ws/field-loginworkspaceapp.html';
}

/**
* Component that log's in to a workspace app
*
*
*
*
*/
@Component({
  selector: 'ws-listworkspacedata',
  templateUrl: wsLoginWorkspaceAppTemplate
})
export class LoginWorkspaceAppComponent extends SimpleComponent {
  field: LoginWorkspaceAppField;

}
