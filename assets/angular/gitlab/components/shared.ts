
export class LoginMessageForm {
  message: string;
  class: string;
}

export class Checks {
  link: any = undefined;
  rdmp: boolean = false;
  linkCreated: boolean = false;
  linkWithOther: boolean = false;
  master: boolean = false;
  comparing: boolean = false;
}

export class Group {
  name: string;
  id: string;
  path: string;
  isUser: boolean;
}

export class Template {
  pathWithNamespace: string;
}

export class Creation {
  created: boolean = false;
  name: string;
  namespace: string;
  creationAlert: string = '';
  blank: boolean = true;
  template: any;
  description: string;
  group: any;
  message: string;
  validateMessage: string;
}

export class CurrentWorkspace {
  path_with_namespace: string = '';
  web_url: string = ''
}

export class WsUser {
  username: string;
  id: string;
}
