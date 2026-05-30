import { DraftRepository } from "@draftly/db/src/repositories/index.js";

export interface CreateDraftDTO {
  emailId: string;

  content: string;
}

export class DraftService {
  private draftRepository;

  constructor() {
    this.draftRepository = new DraftRepository();
  }

  public async createDraft(input: CreateDraftDTO) {
    const draft = await this.draftRepository.create({
      emailId: input.emailId,

      content: input.content,

      status: "generated",
    });

    return draft;
  }

  public async approveDraft(draftId: string) {
    return this.draftRepository.updateStatus(draftId, "approved");
  }
}
