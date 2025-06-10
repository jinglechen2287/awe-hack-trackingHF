export type Status = "idle" | "active" | "complete";

export class Quest {
  private readonly _name: string;
  private readonly _goal: number;
  private readonly _reward: string; // Might need a reward object?
  private readonly _description: string;
  private _approvals: string[];
  private _status: Status;

  constructor(name: string, numOfApproval: number, description: string, reward?: string) {
    this._name = name;
    this._goal = numOfApproval;
    this._approvals = [];
    this._status = "idle";
    this._reward = reward ?? 'none';
    this._description = description;
  }

  get name(): string {
    return this._name;
  }

  get goal(): number {
    return this._goal;
  }

  get numOfApproval(): number {
    return this._approvals.length;
  }

  get approvals(): string[] {
    return this._approvals;
  }

  get status(): string {
    return this._status;
  }

  get reward(): string {
    return this._reward;
  }

  get description(): string {
    return this._description;
  }

  set status(newStatus: Status) {
    this._status = newStatus;
  }

  addApprovals(player: string): [boolean, string?] {
    if (this._approvals.includes(player)){
        print('include')
        return [false, 'prevent adding the same person twice']
    }
    if (this.numOfApproval <= this._goal) {
      this._approvals.push(player);
      if (this.numOfApproval === this._goal) {
        this.status = "complete";
      }
      return [true, undefined];
    }
    return [false, 'something went wrong'];
  }
}

export class QuestSystem {
  private acceptedQuests: Quest[];
//   private _questMsg: string;
private updateAppStateMsg: (text: string) => void

  constructor(updateAppStateMsg: (text: string) => void) {
    this.updateAppStateMsg = updateAppStateMsg
    this.acceptedQuests = [];
    this.updateQuestMsg();
  }

  updateQuestMsg(): void {
    if (this.activeQuest) {
      this.updateText(true);
    } else {
      if (this.firstIdleQuest) {
        this.firstIdleQuest.status = "active";
        this.updateText(true);
      } else {
        this.updateText(false);
      }
    }
  }

  updateText(hasActiveQuest: boolean): void {
    if(hasActiveQuest) {
        this.updateAppStateMsg(`${this.activeQuest.description} (${this.activeQuest.numOfApproval} / ${this.activeQuest.goal})`)
    } else {
        // this.questHint.enabled = false;
        this.updateAppStateMsg('')
    }
  }

  addQuest(quest: Quest): void {
    print('add quest')
    if (!this.activeQuest) {
      quest.status = "active";
    }
    this.acceptedQuests.push(quest);
    this.updateQuestMsg();
  }

  removeQuest(name: string): boolean {
    const index = this.acceptedQuests.findIndex((q) => q.name === name);
    if (index !== -1) {
      this.acceptedQuests.splice(index, 1);
      return true;
    }
    return false;
  }

  getQuest(name: string): Quest | undefined {
    return this.acceptedQuests.find((q) => q.name === name);
  }

  get allQuests(): Quest[] {
    return this.acceptedQuests;
  }

  get activeQuest(): Quest {
    return this.acceptedQuests.filter((q) => q.status === "active")[0];
  }

  get firstIdleQuest(): Quest {
    return this.acceptedQuests.filter((q) => q.status === "idle")[0];
  }

  get completedQuests(): Quest[] {
    return this.acceptedQuests.filter((q) => q.status === "complete");
  }

//   get questMsg(): string {
//     return this._questMsg
//   }
}
