import {Injectable, Inject} from '@angular/core';
import {BaseService} from "../../../base-service";
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/delay';
import {Observable} from 'rxjs/Observable';
import {ConfigService} from "../../../config-service";

@Injectable()
export class OmeroService extends BaseService {

  protected baseUrl: any;
  public recordURL: string = this.brandingAndPortalUrl + '/record/edit';

  constructor(@Inject(Http) http: Http, @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
  }

  projects(username: string, password: string) {
    //build wsUrl here with server client
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/projects';
    return this.http.post(
      wsUrl,
      {username: username, password: password},
      this.options
    )
    .toPromise()
    .then((res: any) => {
      return this.extractData(res);
    })
    .catch((res: any) => {
      return this.extractData(res);
    });
  }


}
