import {Input, Component, OnInit, Inject, Injector} from '@angular/core';
import {SimpleComponent} from '../../field-simple.component';
import {FieldBase} from '../../field-base';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import * as _ from "lodash-lib";

declare var jQuery: any;
/**
* WorkspaceFieldComponent Model
*
*
*/
export class GitlabField extends FieldBase<any> {
  constructor(options: any, injector: any) {
    super(options, injector);
    console.log(this);
  }

}

@Component({
  selector: 'ws-field',
  templateUrl: './gitlab.template.html'
})
export class GitlabApp extends SimpleComponent {
  field: GitlabField;

}
