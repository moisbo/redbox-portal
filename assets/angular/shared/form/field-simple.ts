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

import { FieldBase } from './field-base';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import * as _ from "lodash-lib";
import moment from 'moment-es6';
/**
 * Text Field Model
 *
 * Author: <a href='https://github.com/shilob' target='_blank'>Shilo Banihit</a>

 */
export class TextField extends FieldBase<string> {
  type: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.type = options['type'] || '';
    this.controlType = 'textbox';
    this.cssClasses = _.isEmpty(this.cssClasses) ? 'form-control' : this.cssClasses;
  }

  postInit(value:any) {
    if (_.isEmpty(value)) {
      this.value = this.defaultValue ? this.defaultValue : '';
    } else {
      this.value = value;
    }
  }
}

export class TextArea extends FieldBase<string> {
  rows: number;
  cols: number;

  lines: string[];

  constructor(options: any, injector: any) {
    super(options, injector);
    this.rows = options['rows'] || 5;
    this.cols = options['cols'] || null;
    this.controlType = 'textarea';
  }

  formatValueForDisplay() {
    this.lines = this.value ? this.value.split("\n") : [];
  }
}

export class SelectionField extends FieldBase<any>  {
  options: {key: string, value: string}[] = [];

  constructor(options: any, injector: any) {
    super(options, injector);
    this.options = options['options'] || [];
    this.options = _.map(options['options'] || [], (option)=> {
      option.label = this.getTranslated(option.label, option.label);
      option.value = this.getTranslated(option.value, option.value);
      return option;
    });

  }

  createFormModel() {
    if (this.controlType == 'checkbox') {
      const fgDef = [];

      _.map(this.options, (opt)=>{
        const hasValue = _.find(this.value, (val) => {
          return val == opt.value;
        });
        if (hasValue) {
          fgDef.push(new FormControl(opt.value));
        }
      });
      // const fg = new FormArray(fgDef);
      // return fg;
      return new FormArray(fgDef);
    } else {
      // const model = super.createFormModel();
      // console.log(`Created form model:`);
      // console.log(model);
      // return model;
      return super.createFormModel();
    }
  }
}

export class Container extends FieldBase<any> {
  content: string;
  fields: FieldBase<any>[];
  active: boolean;
  type: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.controlType = 'div';
    this.content = options['content'] || '';
    this.active = options['active'] || false;
    this.type = options['type'] || '';
    this.hasControl = _.isUndefined(this.groupName);
  }

  public getGroup(group: any, fieldMap: any) : any {
    this.fieldMap = fieldMap;
    let retval = null;
    fieldMap[this.name] = {field:this};
    if (this.hasGroup && this.groupName) {
      // when this has a FormControl associated, build the FormGroup...
      group[this.groupName] = new FormGroup({});
      _.each(this.fields, (field) => {
        field.getGroup(group, fieldMap);
      });
      retval = group[this.groupName];
    }
    return retval;
  }
}

export class TabOrAccordionContainer extends Container {
  tabNavContainerClass: any;
  tabNavClass: any;
  tabContentContainerClass: any;
  tabContentClass: any;
  accContainerClass: any;
  accClass: any;

  constructor(options: any, injector: any) {
    super(options, injector);
    // defaults to nav-pills, nav-stacked, nav size col-md-2, tab content col-md-10
    this.tabNavContainerClass = options['tabNavContainerClass'] || 'col-md-2';
    this.tabNavClass = options['tabNavClass'] || 'nav nav-pills nav-stacked';
    this.tabContentContainerClass = options['tabContentContainerClass'] || 'col-md-10';
    this.tabContentClass = options['tabContentClass'] || 'tab-content';
    this.accContainerClass = options['accContainerClass'] || 'col-md-12';
    this.accClass = options['accClass'] || 'panel panel-default';
  }
}

export class ButtonBarContainer extends Container {

  constructor(options: any, injector: any) {
    super(options, injector);
  }
}


export class DateTime extends FieldBase<any> {
  datePickerOpts: any;
  timePickerOpts: any;
  hasClearButton: boolean;
  valueFormat: string;
  displayFormat: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.datePickerOpts = options['datePickerOpts'] || false;
    this.timePickerOpts = options['timePickerOpts'] || false;
    this.hasClearButton = options['hasClearButton'] || false;
    this.valueFormat = options['valueFormat'] || 'YYYY-MM-DD';
    this.displayFormat = options['displayFormat'] || 'YYYY-MM-DD';
    this.controlType = 'datetime';
    this.value = this.value ? this.parseToDate(this.value) : this.value;
  }

  formatValue(value: any) {
    // assume local date
    console.log(`Formatting value: ${value}`)
    return value ? moment(value).local().format(this.valueFormat) : value;
  }

  parseToDate(value: any) {
    return moment(value, this.valueFormat).local().toDate();
  }

  formatValueForDisplay() {
    const locale = window.navigator.language; // commented out, no support for below IE 11: window.navigator.userLanguage || window.navigator.language;
    return this.value ? moment(this.value).locale(locale).format(this.displayFormat) : '';
  }

  public reactEvent(eventName: string, eventData: any, origData: any) {
    const thisDate = moment(eventData);
    const prevStartDate = moment(this.formModel.value);
    if (!prevStartDate.isValid() || thisDate.isAfter(prevStartDate)) {
      this.formModel.setValue(eventData);
    }
    const newOpts = _.cloneDeep(this.datePickerOpts);
    newOpts.startDate = eventData;
    this.datePickerOpts = newOpts;
  }
}


export class SaveButton extends FieldBase<string> {
  label: string;
  redirectLocation: string;
  closeOnSave: boolean;
  buttonClass: string;


  constructor(options: any, injector: any) {
    super(options, injector);
    this.label = options['label'];
    this.closeOnSave = options['closeOnSave'] || false;
    this.redirectLocation = options['redirectLocation'] || false;
    this.cssClasses = options['cssClasses'] || "btn-primary";
  }
}

export class CancelButton extends FieldBase<string> {
  label: string;
  constructor(options: any, injector: any) {
    super(options, injector);
    this.label = options['label'];
  }
}

export class AnchorOrButton extends FieldBase<string> {
  onClick_RootFn: any;
  type: string;
  isDisabledFn: any;
  showPencil: boolean;
  imageURI: string;
  imageALT: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.onClick_RootFn = options['onClick_RootFn'] || null;
    this.isDisabledFn = options['isDisabledFn'] || null;
    this.type = options['type'] || 'button';
    this.controlType = options['controlType'] || 'button';
    this.hasControl = false;
    this.showPencil = options['showPencil'] || false;
    this.imageURI = options['imageURI'] || '';
    this.imageALT = options['imageALT'] || '';
  }
}

export class HiddenValue extends FieldBase<string> {
  constructor(options: any, injector: any) {
    super(options, injector);
    this.controlType = 'hidden';
  }
}

export class LinkValue extends FieldBase<string> {
  target: string;
  constructor(options: any, injector: any) {
    super(options, injector);
    this.controlType = 'link';
    this.target = options.target || '_blank';
  }
}
