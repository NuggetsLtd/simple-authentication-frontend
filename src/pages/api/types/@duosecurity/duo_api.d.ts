class DuoAPIClient {
  constructor(ikey: string, skey: string, host: string);

  readonly jsonApiCall: Function;
}

declare module '@duosecurity/duo_api' {
  export = {
    Client: DuoAPIClient
  };
}
