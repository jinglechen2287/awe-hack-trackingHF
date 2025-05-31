export type Status = "idle" | "active" | "complete";

class Quest {
  private readonly _name: string;
  private readonly _goal: number;
  private readonly _reward: string; // Might need a reward object in the future
  private _approvals: string[];
  private _status: Status;

  constructor(name: string, numOfApproval: number, reward?: string) {
    this._name = name;
    this._goal = numOfApproval;
    this._approvals = [];
    this._status = "idle";
    this._reward = reward ?? 'none';
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

export class Quests {
  private quests: Quest[];
  private questHint: Text;

  constructor(questHint: Text) {
    this.quests = [];

    // Adding a quest for debugging
    let debugQuest = new Quest("Debug Quest", 3);
    this.addQuest(debugQuest);

    this.questHint = questHint;
    this.updateQuestHint();
  }

  updateQuestHint(): void {
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
    // this.questHint.text = newText;
    if(hasActiveQuest) {
        this.questHint.text = `${this.activeQuest.name} (${this.activeQuest.numOfApproval} / ${this.activeQuest.goal})`
    } else {
        // this.questHint.enabled = false;
        this.questHint.text = 'All quest completed'
    }
  }

  addQuest(quest: Quest): void {
    if (!this.activeQuest) {
      quest.status = "active";
    }
    this.quests.push(quest);
  }

  removeQuest(name: string): boolean {
    const index = this.quests.findIndex((q) => q.name === name);
    if (index !== -1) {
      this.quests.splice(index, 1);
      return true;
    }
    return false;
  }

  getQuest(name: string): Quest | undefined {
    return this.quests.find((q) => q.name === name);
  }

  get allQuests(): Quest[] {
    return this.quests;
  }

  get activeQuest(): Quest {
    return this.quests.filter((q) => q.status === "active")[0];
  }

  get firstIdleQuest(): Quest {
    return this.quests.filter((q) => q.status === "idle")[0];
  }

  get completedQuests(): Quest[] {
    return this.quests.filter((q) => q.status === "complete");
  }
}
