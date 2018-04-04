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

import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule} from "@angular/forms";
import { HttpModule } from '@angular/http';
import { GitlabFormComponent } from './gitlab-form.component';
import { GitlabService } from './gitlab.service';
import { SharedModule } from '../shared/shared.module';
import { WSFieldComponent } from '../shared/form/ws/ws-field.component';
import { ListWorkspaceDataComponent } from '../shared/form/ws/list-workspaces.component';
import { LoginWorkspaceAppComponent } from '../shared/form/ws/login-workspaceapp.component';
import { CreateWorkspaceComponent } from '../shared/form/ws/create-workspace.component';
import { RevokeLoginWorkspaceAppComponent } from '../shared/form/ws/revokelogin-workspaceapp.component';
import { LoginModalWorkspaceComponent } from '../shared/form/ws/loginmodal-workspaceapp.component';

@NgModule({
  imports:      [ BrowserModule, HttpModule, ReactiveFormsModule, SharedModule, FormsModule ],
  exports:      [ WSFieldComponent ],
  declarations: [ GitlabFormComponent, WSFieldComponent, ListWorkspaceDataComponent, LoginWorkspaceAppComponent, CreateWorkspaceComponent, RevokeLoginWorkspaceAppComponent, LoginModalWorkspaceComponent ],
  providers:    [ GitlabService ],
  bootstrap:    [ GitlabFormComponent ],
  entryComponents: [ WSFieldComponent, ListWorkspaceDataComponent, LoginWorkspaceAppComponent, CreateWorkspaceComponent, RevokeLoginWorkspaceAppComponent, LoginModalWorkspaceComponent ]
})
export class GitlabModule { }
