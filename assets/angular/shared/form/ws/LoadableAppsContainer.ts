import { Input, Component, ViewChild, ViewContainerRef, OnInit, Injector, NgModule} from '@angular/core';
import { Container } from '../field-simple';
import { SimpleComponent } from '../field-simple.component';

import { DateTime, AnchorOrButton, SaveButton, CancelButton, TextArea, TextField } from '../field-simple';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import * as _ from "lodash-lib";
import moment from 'moment-es6';
declare var jQuery: any;

import { GitlabApp } from './gitlab/ws-gitlab';

var providers:any = [];
providers.push({ provide: "1", useClass: GitlabApp });

@NgModule({
    providers: [providers]
})
export class LoadableAppsContainer extends Container{

  apps: object[];
  workspace: any;
  public injector: Injector;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.apps = options['apps'] || [];
    console.log(this.apps[0])
    this.workspace = this.injector.get(this.apps[0].provider);
    console.log(this.workspace);
  }
}

@Component({
  selector: 'loadable-app',
  template: `
  <div *ngIf="field.editMode">
    <div class="row alert">
      No App Selected
    </div>
  </div>
  `,
})
export class LoadableAppComponent extends SimpleComponent {
  field: LoadableAppsContainer;
}
