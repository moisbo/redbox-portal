import { Input, Component, OnInit, Inject, Injector} from '@angular/core';
import { SimpleComponent } from '../../shared/form/field-simple.component';
import { FieldBase } from '../../shared/form/field-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash-lib";

import { GitlabService } from '../gitlab.service';

/**
 * Contributor Model
 *
 *
 * @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
 *
 */
export class ListWorkspaceDataField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  relatedObjects: object[];
  accessDeniedObjects: object[];
  failedObjects: object[];
  hasInit: boolean;
  columns: object[];
  rdmpLinkLabel: string;
  syncLabel: string;
  workspaces: any[];
  user: any;
  gitlabService: GitlabService;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.gitlabService = this.getFromInjector(GitlabService);
    this.relatedObjects = [];
    this.accessDeniedObjects = [];
    this.failedObjects = [];
    this.columns = options['columns'] || [];
    this.rdmpLinkLabel = options['rdmpLinkLabel'] || 'Plan';
    this.syncLabel = options['syncLabel'] || 'Sync';

    var relatedObjects = this.relatedObjects;
    this.value = options['value'] || this.setEmptyValue();

    this.relatedObjects = [];
    this.failedObjects = [];
    this.accessDeniedObjects = [];

  }

  registerEvents() {
    this.fieldMap['LoginWorkspaceApp'].field['listWorkspaces'].subscribe(this.listWorkspaces.bind(this));
    //let that = this;
    //this.fieldMap._rootComp['loginMessage'].subscribe(that.displayLoginMessage);
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

  listWorkspaces(user: any) {
    //TODO: How to handle metadata here
    this.gitlabService.user()
    .then(response => {
      if (response && response.status) {
        this.user = response.user;
        this.getWorkspacesRelated();
      } else {
        // show login page because it cannot login via workspace apps
        // this.notLoggedIn = true;
        // this.setLoading(false);
      }
    });
  }

  getWorkspacesRelated() {
    this.workspaces = [];
    this.gitlabService.projectsRelatedRecord()
    .then(response => {
      this.workspaces = response;
      //this.setLoading(false);
      //this.notLoggedIn = false;
    });
  }

}

declare var aotMode
// Setting the template url to a constant rather than directly in the component as the latter breaks document generation
let wsListWorkspaceDataTemplate = './field-listworkspaces.html';
if(typeof aotMode == 'undefined') {
  wsListWorkspaceDataTemplate = '../angular/gitlab/components/field-listworkspaces.html';
}

/**
* Component to display information from related objects within ReDBox
*/
@Component({
  selector: 'ws-listworkspaces',
  templateUrl: wsListWorkspaceDataTemplate
})
export class ListWorkspaceDataComponent extends SimpleComponent {
  field: ListWorkspaceDataField;

  ngOnInit() {
    this.field.registerEvents();
  }

}
