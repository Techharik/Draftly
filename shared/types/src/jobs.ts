export interface EmailFetchJob {
  emailId: string;
}

export interface AIDraftJob {
  threadId: string;
}

export interface EmailSendJob {
  draftId: string;
}
