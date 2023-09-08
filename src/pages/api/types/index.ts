export interface DIDCommMsg {
  readonly thid: string;
  readonly type: string;
  readonly from: string;
  readonly body: {
    readonly authenticationOutcome?: {
      readonly userData?: {
        readonly identityVCProof?: string;
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
