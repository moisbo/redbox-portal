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

import { Input, Component, ViewChild, ViewContainerRef, OnInit, Injector} from '@angular/core';
import { FieldBase } from './field-base';
import { DateTime, AnchorOrButton, SaveButton, CancelButton, TextArea, TextField } from './field-simple';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import * as _ from "lodash-lib";
import moment from 'moment-es6';
declare var jQuery: any;
/**
 * A component base class
 *
 * Author: <a href='https://github.com/shilob' target='_blank'>Shilo Banihit</a>
 */
export class SimpleComponent {
  /**
   * Field model
   */
  @Input() public field: FieldBase<any>;
  /**
   * The form group
   */
  @Input() public form: FormGroup;
  /**
   * The field mapping
   */
  @Input() public fieldMap: any;
  /**
   * The index of this field
   */
  @Input() public index: any;
  /**
   * The name of this field
   */
  @Input() public name: any;
  /**
   * The NG2 root injector
   */
  public injector: Injector;
  /**
   * Toggles help display
   */
  helpShow: boolean;

  /**
   * Optional parentId of this component
   */
  parentId: string;
  /**
   * Return the NG2 FormControl or subclass thereof
   * @param  {string = null} name
   * @return {FormControl}
   */
  public getFormControl(name: string = null):FormControl {
    if (_.isEmpty(name)) {
      name = this.field.name;
    }
    if (this.fieldMap && this.field) {
      return this.fieldMap[name].control;
    }
    return null;
  }
  /**
   * Returns the CSS class
   * @param  {string=null} fldName
   * @return {string}
   */
  public getGroupClass(fldName:string=null): string {
    return `form-group ${this.hasRequiredError() ? 'has-error' : '' }`;
  }
  /**
   * If this field has a 'required' error.
   * Author: <a href='https://github.com/shilob' target='_blank'>Shilo Banihit</a>
   * @return {[type]}
   */
  public hasRequiredError():boolean {
    return this.field.formModel.touched && this.field.formModel.hasError('required');
  }
  /**
   * Convenience method to toggle help mode.
   * @return {[type]}
   */
  public toggleHelp() {
    this.helpShow = !this.helpShow;
  }
  /**
   * Returns label
   * @return {string}
   */
  getRequiredLabelStr():string {
    return this.field.required ? '(*)' : '';
  }
  /**
   * Returns the NG2 root injector
   * @param  {any} token
   * @return {any}
   */
  getFromInjector(token:any): any {
    return this.injector.get(token);
  }
}

/**
 * Component
 * Author: <a href='https://github.com/shilob' target='_blank'>Shilo Banihit</a>
 */
@Component({
  selector: 'text-area',
  template: `
  <div *ngIf="field.editMode" [formGroup]='form' class="form-group">
    <label [attr.for]="field.name">
      {{field.label}} {{ getRequiredLabelStr()}}
      <button type="button" class="btn btn-default" *ngIf="field.help" (click)="toggleHelp()"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span></button>
    </label><br/>
    <span id="{{ 'helpBlock_' + field.name }}" class="help-block" *ngIf="this.helpShow" [innerHtml]="field.help"></span>
    <textarea [formControl]="getFormControl()"  [attr.rows]="field.rows" [attr.cols]="field.cols" [id]="field.name" class="form-control">{{field.value}}</textarea>
    <div class="text-danger" *ngIf="getFormControl().hasError('required') && getFormControl().touched && !field.validationMessages?.required">{{field.label}} is required</div>
    <div class="text-danger" *ngIf="getFormControl().hasError('required') && getFormControl().touched && field.validationMessages?.required">{{field.validationMessages.required}}</div>
  </div>
  <li *ngIf="!field.editMode" class="key-value-pair">
    <span class="key" *ngIf="field.label">{{field.label}}</span>
    <span *ngFor="let line of field.lines">
      {{line}}
      <br/>
    </span>
    <br/>
  </li>
  `
})
export class TextAreaComponent extends SimpleComponent implements OnInit {
  field: TextArea;

  ngOnInit() {
    if (!this.field.editMode) {
      this.field.formatValueForDisplay();
    }
  }
}

export class SelectionComponent extends SimpleComponent {

  getLabel(val: any): string {
    const opt = _.find(this.field.options, (opt)=> {
      return opt.value == val;
    });
    if (opt) {
      return opt.label;
    } else {
      return '';
    }
  }
}

@Component({
  selector: 'dropdownfield',
  template: `
  <div [formGroup]='form' *ngIf="field.editMode" class="form-group">
     <label [attr.for]="field.name">
      {{field.label}} {{ getRequiredLabelStr()}}
      <button type="button" class="btn btn-default" *ngIf="field.help" (click)="toggleHelp()"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span></button>
     </label><br/>
     <span id="{{ 'helpBlock_' + field.name }}" class="help-block" *ngIf="this.helpShow" [innerHtml]="field.help"></span>
     <select [formControl]="getFormControl()"  [id]="field.name" class="form-control">
        <option *ngFor="let opt of field.options" [value]="opt.value">{{opt.label}}</option>
     </select>
     <div class="text-danger" *ngIf="getFormControl().hasError('required') && getFormControl().touched && !field.validationMessages?.required">{{field.label}} is required</div>
     <div class="text-danger" *ngIf="getFormControl().hasError('required') && getFormControl().touched && field.validationMessages?.required">{{field.validationMessages.required}}</div>
  </div>
  <div *ngIf="!field.editMode" class="key-value-pair">
    <span class="key" *ngIf="field.label">{{field.label}}</span>
    <span class="value">{{getLabel(field.value)}}</span>
  </div>
  `,
})
export class DropdownFieldComponent extends SelectionComponent {
}

@Component({
  selector: 'selectionfield',
  template: `
  <div [formGroup]='form' *ngIf="field.editMode" class="form-group">
     <label [attr.for]="field.name">
      {{field.label}} {{ getRequiredLabelStr()}}
      <button type="button" class="btn btn-default" *ngIf="field.help" (click)="toggleHelp()"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span></button>
     </label><br/>
     <span id="{{ 'helpBlock_' + field.name }}" class="help-block" *ngIf="this.helpShow" [innerHtml]="field.help"></span>
     <span *ngFor="let opt of field.options">
      <!-- radio type hard-coded otherwise accessor directive will not work! -->
      <input *ngIf="isRadio()" type="radio" name="{{field.name}}" [id]="field.name + '_' + opt.value" [formControl]="getFormControl()" [value]="opt.value">
      <input *ngIf="!isRadio()" type="{{field.controlType}}" name="{{field.name}}" [id]="field.name + '_' + opt.value" [value]="opt.value" (change)="onChange(opt, $event)" [attr.selected]="getControlFromOption(opt)" [attr.checked]="getControlFromOption(opt)">
      <label for="{{field.name + '_' + opt.value}}" class="radio-label">{{ opt.label }}</label>
      <br/>
     </span>
     <div class="text-danger" *ngIf="getFormControl().hasError('required') && getFormControl().touched && !field.validationMessages?.required">{{field.label}} is required</div>
     <div class="text-danger" *ngIf="getFormControl().hasError('required') && getFormControl().touched && field.validationMessages?.required">{{field.validationMessages.required}}</div>
  </div>
  <div *ngIf="!field.editMode" class="key-value-pair">
    <ng-container *ngIf="isRadio()">
      <span *ngIf="field.label" class="key">{{field.label}}</span>
      <span class="value">{{getLabel(field.value)}}</span>
    </ng-container>
    <ng-container *ngIf="!isRadio()">
      <span *ngIf="field.label" class="key">{{field.label}}</span>
      <span class="value" *ngFor="let value of field.value">{{getLabel(value)}}<br/></span>
    </ng-container>
  </div>
  `,
})
export class SelectionFieldComponent extends SelectionComponent {

  isRadio() {
    return this.field.controlType == 'radio';
  }

  getControlFromOption(opt: any) {
    const control = _.find(this.getFormControl().controls, (ctrl) => {
      return opt.value == ctrl.value;
    });
    return control;
  }

  onChange(opt:any, event:any) {
    if (event.target.checked) {
      this.getFormControl().push(new FormControl(opt.value));
    } else {
      let idx = null;
      _.forEach(this.getFormControl().controls, (ctrl, i) => {
        if (ctrl.value == opt.value) {
          idx = i;
          return false;
        }
      });
      this.getFormControl().removeAt(idx);
    }
  }
}


/****************************************************************************
Container components
*****************************************************************************/
@Component({
  selector: 'tabcontainer',
  template: `
  <div *ngIf="field.editMode" class="row" style="min-height:300px;">
    <div [ngClass]="field.cssClasses">
      <div [ngClass]="field.tabNavContainerClass">
        <ul [ngClass]="field.tabNavClass">
          <li *ngFor="let tab of field.fields" [ngClass]="{'active': tab.active}"><a href="#{{tab.id}}" data-toggle="tab" role="tab">{{tab.label}}</a></li>
        </ul>
      </div>
      <div [ngClass]="field.tabContentContainerClass">
        <div [ngClass]="field.tabContentClass">
      <!--
      Inlined the tab definition instead of creating it's own component otherwise Bootstrap refuses to toggle the panes
      Likely because of the extra DOM node (component selector) that it doesn't know what to do.
      TODO: remove inlining, or perhaps consider a 3rd-party NG2 tab component
      -->
          <div *ngFor="let tab of field.fields" [ngClass]="{'tab-pane': true, 'fade': true, 'active': tab.active==true, 'in': tab.active==true}" id="{{tab.id}}">
            <dmp-field *ngFor="let field of tab.fields" [field]="field" [form]="form" class="form-row" [fieldMap]="fieldMap" [parentId]="tab.id"></dmp-field>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div *ngIf="!field.editMode" [ngClass]="field.accContainerClass">
    <div class="panel-group">
      <div *ngFor="let tab of field.fields" [ngClass]="field.accClass">
        <div class="panel-heading">
          <h4 class="panel-title">
            <a data-toggle="collapse" href="#{{tab.id}}">{{tab.label}}</a>
          </h4>
        </div>
        <div id="{{tab.id}}" class="panel-collapse collapse">
          <div class="panel-body">
            <ul class="key-value-list">
              <dmp-field *ngFor="let field of tab.fields" [field]="field" [form]="form" class="form-row" [fieldMap]="fieldMap"></dmp-field>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class TabOrAccordionContainerComponent extends SimpleComponent {

}

@Component({
  selector: 'buttonbarcontainer',
  template: `
    <div *ngIf="field.editMode" class="form-row">
      <div class="pull-right col-md-10">
      <dmp-field *ngFor="let field1 of field.fields" [field]="field1" [form]="form" class="form-row" [fieldMap]="fieldMap"></dmp-field>
    </div>
  `
})
export class ButtonBarContainerComponent extends SimpleComponent {

}

// Break in case of an emergency....
@Component({
  selector: 'htmlraw',
  template: `
  <ng-content></ng-content>
  `,
})
export class HtmlRawComponent extends SimpleComponent {

}
// For creating text blocks with help sections?
@Component({
  selector: 'text-block',
  template: `
  <div [ngSwitch]="field.type">
    <h1 *ngSwitchCase="'h1'" [ngClass]="field.cssClasses">{{field.value}}</h1>
    <h2 *ngSwitchCase="'h2'" [ngClass]="field.cssClasses">{{field.value}}</h2>
    <h3 *ngSwitchCase="'h3'" [ngClass]="field.cssClasses">{{field.value}}</h3>
    <h4 *ngSwitchCase="'h4'" [ngClass]="field.cssClasses">{{field.value}}</h4>
    <h5 *ngSwitchCase="'h5'" [ngClass]="field.cssClasses">{{field.value}}</h5>
    <hr *ngSwitchCase="'hr'" [ngClass]="field.cssClasses">
    <span *ngSwitchCase="'span'" [ngClass]="field.cssClasses">{{field.value}}</span>
    <p *ngSwitchDefault [ngClass]="field.cssClasses">{{field.value}}</p>
  </div>
  `,
})
export class TextBlockComponent extends SimpleComponent {
  field: TextField;
}

/**
Wrapped: https://github.com/nkalinov/ng2-datetime
Based on: https://bootstrap-datepicker.readthedocs.io/en/stable/
*/
@Component({
  selector: 'date-time',
  template: `
  <div *ngIf="field.editMode" [formGroup]='form' class="form-group">
    <label [attr.for]="field.name">
      {{field.label}} {{ getRequiredLabelStr()}}
      <button type="button" class="btn btn-default" *ngIf="field.help" (click)="toggleHelp()"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span></button>
    </label><br/>
    <span id="{{ 'helpBlock_' + field.name }}" class="help-block" *ngIf="this.helpShow" [innerHtml]="field.help"></span>
    <datetime #dateTime [formControl]="getFormControl()" [timepicker]="field.timePickerOpts" [datepicker]="field.datePickerOpts" [hasClearButton]="field.hasClearButton"></datetime>
  </div>
  <li *ngIf="!field.editMode" class="key-value-pair">
    <span class="key" *ngIf="field.label">{{field.label}}</span>
    <span class="value">{{field.formatValueForDisplay()}}</span>
  </li>
  `
})
export class DateTimeComponent extends SimpleComponent {
  /**
   * The field model
   */
  public field: DateTime;
  /**
   * Component method that formats the value, delegates to field.
   */
  formatValue() {
    return this.field.formatValue(this.getFormControl().value);
  }

}
/**
* #### Save Button Component.
*
* Calls the form framework's save function to create or update the record.
*
* #### Usage
* ```
*     {
*          class: "SaveButton",
*          definition: {
*            label: 'Save & Close',
*            closeOnSave: true,
*            redirectLocation: '/@branding/@portal/dashboard'
*          }
*        }
* ```
*
*| Property Name    | Description                                                    | Required | Default |
*|------------------|----------------------------------------------------------------|----------|---------|
*| label            | The text to display on the button                              | Yes      |         |
*| closeOnSave      | Flag to leave the page on successful save                      | No       | false   |
*| redirectLocation | The location to redirect to if closeOnSave flag is set to true | No       |         |
*/
@Component({
  selector: 'save-button',
  template: `
    <button type="button" (click)="onClick($event)" class="btn" [ngClass]="field.cssClasses" [disabled]="!fieldMap._rootComp.needsSave || fieldMap._rootComp.isSaving()">{{field.label}}</button>
  `,
})
export class SaveButtonComponent extends SimpleComponent {
  public field: SaveButton;

  public onClick(event: any) {
    if(this.field.closeOnSave == true) {
      var successObs = this.fieldMap._rootComp.onSubmit();

      successObs.subscribe( successful =>  {
        if(successful) {
           window.location.href= this.field.redirectLocation;
        }
      });
    } else {
      this.fieldMap._rootComp.onSubmit().subscribe();
    }
  }

}

/**
* # Cancel Button Component
*
* #### Button designed to
*  @param  {CancelButton} cancelButton
*   @return {FormControl}
*/
@Component({
  selector: 'cancel-button',
  template: `
    <button type="button" class="btn btn-warning" [disabled]="fieldMap._rootComp.isSaving()" (click)="fieldMap._rootComp.onCancel()">{{field.label}}</button>
  `,
})
export class CancelButtonComponent extends SimpleComponent {
  public field: CancelButton;

}


@Component({
  selector: 'anchor-button',
  template: `
  <button *ngIf="field.controlType=='button'" type="{{field.type}}" [ngClass]="field.cssClasses" (click)="onClick($event)" [disabled]="isDisabled()">{{field.label}}</button>
  <a *ngIf="field.controlType=='anchor'" href='{{field.value}}' [ngClass]="field.cssClasses" ><span *ngIf="field.showPencil" class="glyphicon glyphicon-pencil">&nbsp;</span>{{field.label}}</a>
  <a *ngIf="field.controlType=='anchorWithImage'" href='{{field.value}}' [ngClass]="field.cssClasses"><img src="{{field.imageURI}}" alt="{{field.imageALT}}"/></a>
  `,
})
export class AnchorOrButtonComponent extends SimpleComponent {
  public field: AnchorOrButton;

  public onClick(event: any) {
    this.fieldMap._rootComp[this.field.onClick_RootFn]();
  }

  public isDisabled() {
    if (this.field.isDisabledFn) {
      return this.fieldMap._rootComp[this.field.isDisabledFn]();
    }
    return false;
  }
}

@Component({
  selector: 'link-value',
  template: `
  <li *ngIf="!field.editMode && isVisible()" class="key-value-pair padding-bottom-10">
    <span class="key" *ngIf="field.label">{{field.label}}</span>
    <span class="value"><a href='{{field.value}}' target="field.target">{{field.value}}</a></span>
  </li>
  `,
})
export class LinkValueComponent extends SimpleComponent {
  isVisible() {
    return !_.isEmpty(this.field.value);
  }
}

@Component({
  selector: 'hidden-field',
  template: `
  <div [formGroup]='form'>
    <input type="hidden" [formControl]="getFormControl()" />
  </div>
  `,
})
export class HiddenValueComponent extends SimpleComponent {

  handleChange(value: any, source: string) {
    console.log(`Hidden Value change: ${source}`);
    console.log(value);
    let targetVal = null;
    if (_.isArray(value)) {
      targetVal = [];
      _.forEach(value, (v:any)=> {
        let tVal = '';
        _.forEach(this.field.onChange.control.subFields, (subField:string) => {
          tVal = `${_.isEmpty(tVal) ? tVal : `${tVal}${this.field.onChange.control.delim}`}${v[subField]}`;
        });
        targetVal.push(tVal);
      });
    }
    this.getFormControl().setValue(targetVal, this.field.onChange.updateConf);
    console.log(`Form now has value:`);
    console.log(this.form.value);
  }


}

@Component({
  selector: 'generic-group-field',
  template: `
  <div *ngIf="field.editMode" [formGroup]='form' class="form-inline">
    <label [attr.for]="field.name" *ngIf="field.label">
      {{field.label}}
    </label><br/>
    <dmp-field *ngFor="let field of field.fields" [field]="field" [form]="form" [fieldMap]="fieldMap"></dmp-field>
  </div>
  `,
})
export class GenericGroupComponent extends SimpleComponent {
}
