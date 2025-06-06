import { HandSynchronizationInput } from "../HighFiveControls/HandSynchronization/HandSynchronizationInput";
import { HandSynchronization } from "../HighFiveControls/HandSynchronization/HandSynchronization";
import { HeadSynchronizationInput } from "../HighFiveControls/HeadSynchronization/HeadSynchronizationInput";
import { HeadSynchronization } from "../HighFiveControls/HeadSynchronization/HeadSynchronization";
import { DataSynchronizationController } from "../HighFiveControls/SyncControls/DataSynchronizationController";
import { HighFiveControllerInput } from "../HighFiveControls/HighFiveController/HighFiveControllerInput";
import { HighFiveController } from "../HighFiveControls/HighFiveController/HighFiveController";
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";
import { AppStateSync } from "../HighFiveControls/AppStateSync/AppStateSync";
import { AppStateSyncInput } from "../HighFiveControls/AppStateSync/AppStateSyncInput";

// The EntryPointMain class serves as the main entry point for
// initializing and start the synchronization and interaction processes

@component
export class EntryPointMain extends BaseScriptComponent {
  // Input for hand/head synchronization class
  @input
  readonly handSynchronizationInput: HandSynchronizationInput;
  @input
  readonly headSynchronizationInput: HeadSynchronizationInput;

  @input appStateSyncInput: AppStateSyncInput

  // Input for app state sync class
  //   @input appStateSyncInput: AppStateSyncInput

  // Input for high-five controller class
  @input
  readonly highFiveControllerInput: HighFiveControllerInput;

  @input questHint: Text;
  @input friendEffect: SceneObject;

  // Instance of HandSynchronization/HeadSynchronization, responsible for handling hand/head synchronization logic
  private handSynchronization: HandSynchronization;
  private headSynchronization: HeadSynchronization;

  //   Instance of AppStaetSync, keeping track of what is attached on the other user's head
  private appState: AppStateSync;

  // Instance of HighFiveController, responsible for handling high-five interactions
  public highFiveController: HighFiveController;

  // Instance of DataSynchronizationController, responsible for managing data synchronization between users
  private dataSynchronizationController: DataSynchronizationController;

  private updateEvent = this.createEvent("UpdateEvent");

  // Lifecycle method called when the component is initialized
  onAwake() {
    // Initialize instances with the provided input
    this.handSynchronization = new HandSynchronization(
      this.handSynchronizationInput
    );
    this.headSynchronization = new HeadSynchronization(
      this.headSynchronizationInput
    );

    this.appState = new AppStateSync(this.appStateSyncInput);
    
    this.highFiveController = new HighFiveController(
      this.highFiveControllerInput,
      this.questHint,
      this.friendEffect,
      this.appState.updateQuestMsg.bind(this.appState)
    );

    

    this.dataSynchronizationController = new DataSynchronizationController(
      this.handSynchronization,
      this.headSynchronization,
      this.highFiveController,
      this.appState
    );

    // Setup a callback for when the session starts in a mapped environment
    SessionController.getInstance().notifyOnStartColocated(() => {
      this.onStart();
    });

    
    // this.updateEvent.enabled = false
  }

  // Private method to start hands and data synchronization and high-five interactions
  private onStart() {
    this.handSynchronization.start();
    this.headSynchronization.start();
    this.highFiveController.start();
    this.appState.start();
    this.dataSynchronizationController.start();
    // this.updateEvent.bind(this.update);
  }

  private update() {
    // print('update')
    // print(this.appState.lastUpdatedData);
    //   const lastUpdatedData = this.appState.lastUpdatedData;
    //   const newMsg = this.highFiveController.quests.questMsg;
    //   if (lastUpdatedData.questText !== newMsg) {
    //     this.appState.updateAppState(newMsg, lastUpdatedData.showEffect);
    //   }
  }
}
