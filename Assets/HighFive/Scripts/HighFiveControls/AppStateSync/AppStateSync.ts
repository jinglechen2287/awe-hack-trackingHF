import { RealtimeStoreKeys } from "../SyncControls/RealtimeStoreKeys";
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";
import { AppStateSyncInput } from "./AppStateSyncInput";
import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

//The AppStateSync class synchronizes the app state between users in real time.
// It tracks the app state,
// and handles events triggered by changes.
export class AppStateSync {
  // Array to store callbacks that handle hand position changes
  private readonly onUserChangedAppState: ((
    value: RealtimeStoreKeys.APP_STATE_DATA
  ) => void)[] = [];

  // Stores the last updated hand position data
  private _lastUpdatedData: RealtimeStoreKeys.APP_STATE_DATA;

  constructor(private input: AppStateSyncInput) {}

  // Starts the synchronization by initializing data and binding update events
  start() {
    this._lastUpdatedData = this.defaultData();

    const interactable = this.input.effectButton.getComponent(
      Interactable.getTypeName()
    );
    if (!interactable) {
      print(`EffectButton(Potion Apply Button) has no Interactable`);
      return;
    }

    interactable.onTriggerEnd.add(() => {
      this.showEffect();
    });
  }

  // Allows external subscriptions to hand position changes
  subscribeOnChanges(
    onUserChangedValue: (value: RealtimeStoreKeys.APP_STATE_DATA) => void
  ) {
    this.onUserChangedAppState.push(onUserChangedValue);
  }

  // Getter for the last updated hand position data
  get lastUpdatedData(): RealtimeStoreKeys.APP_STATE_DATA {
    return this._lastUpdatedData;
  }

  // Initializes and returns default hand position data
  private defaultData(): RealtimeStoreKeys.APP_STATE_DATA {
    const data: RealtimeStoreKeys.APP_STATE_DATA = {
      connectionID:
        SessionController.getInstance().getLocalUserInfo().connectionId,
      questText: "No Quest Active",
      showEffect: false,
      hasActiveQuest: false,
    };
    return data;
  }

  updateAppState(text: string, showing: boolean, hasActiveQuest: boolean) {
    const data: RealtimeStoreKeys.APP_STATE_DATA = {
      connectionID:
        SessionController.getInstance().getLocalUserInfo().connectionId,
      questText: text,
      showEffect: showing,
      hasActiveQuest: hasActiveQuest,
    };
    this._lastUpdatedData = data;
  }

  updateQuestMsg(text: string) {
    if (this._lastUpdatedData) {
      const hasActiveQuest = text === "No Quest Active" ? false : true;
      const data: RealtimeStoreKeys.APP_STATE_DATA = {
        connectionID:
          SessionController.getInstance().getLocalUserInfo().connectionId,
        questText: text,
        showEffect: this._lastUpdatedData.showEffect,
        hasActiveQuest: hasActiveQuest,
      };
      this._lastUpdatedData = data;
      this.onUserChangedAppState.forEach((value) => value(data));
    }
  }

  showEffect() {
    if (this._lastUpdatedData) {
      const data: RealtimeStoreKeys.APP_STATE_DATA = {
        connectionID:
          SessionController.getInstance().getLocalUserInfo().connectionId,
        questText: this._lastUpdatedData.questText,
        showEffect: true,
        hasActiveQuest: this._lastUpdatedData.hasActiveQuest,
      };
      this._lastUpdatedData = data;
      this.onUserChangedAppState.forEach((value) => value(data));
    }
  }
}
