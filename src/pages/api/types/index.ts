export interface DIDCommMsg {
  readonly thid: string;
  readonly type: string;
  readonly from: string;
  readonly body: {
    readonly authenticationOutcome?: {
      readonly userData?: {
        readonly identityVCProof?: {
          readonly type: string;
          readonly credentialSubject: {
            readonly givenName?: string;
            readonly familyName?: string;
          }
        };
      };
    };
  };
}

export interface Request {
  // readonly status: number;
  readonly headers?: {
    readonly authorization?: string;
  };
  readonly query?: {
    readonly reason?: string;
  };
  readonly body: {
    readonly msg: DIDCommMsg;
    readonly ref: string;
  };
}

export interface Response {
  readonly status: Function;
}

export interface CachedSession {
  readonly status: string;
  readonly VCProofNonce?: string;
  readonly VCProof?: object;
  readonly verified?: boolean;
}

export interface AdUser {
  readonly dn: string;
  readonly distinguishedName: string;
  readonly userPrincipalName: string;
  readonly sAMAccountName: string;
  readonly mail: string;
  readonly whenCreated: string;
  readonly pwdLastSet: string;
  readonly userAccountControl: string;
  readonly sn: string;
  readonly givenName: string;
  readonly cn: string;
  readonly displayName: string;
}

export interface DuoUserResponse {
  readonly response: Array<{
    readonly user_id: string;
  }>;
}

export interface DuoBypassCodesResponse {
  readonly response: Array<number>;
}
