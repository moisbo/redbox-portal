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
  public recordURL: string = this.brandingAndPortalUrl + '/record/view';

  constructor(@Inject(Http) http: Http, @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
  }

  login(username: string, password: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/login';
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

  projects() {
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/projects';
    return this.http.get(
      wsUrl,
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

  create(creation) {
    console.log(creation)
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/create';
    return this.http.post(
      wsUrl,
      {creation: creation},
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
