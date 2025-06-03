import {HandSynchronizationInput} from "../HighFiveControls/HandSynchronization/HandSynchronizationInput"
import {HandSynchronization} from "../HighFiveControls/HandSynchronization/HandSynchronization"
import { HeadSynchronization } from "../HighFiveControls/HeadSynchronization/HeadSynchronization"
import { HeadSynchronizationInput } from "../HighFiveControls/HeadSynchronization/HeadSynchronizationInput"
import {DataSynchronizationController} from "../HighFiveControls/SyncControls/DataSynchronizationController"
import {HighFiveControllerInput} from "../HighFiveControls/HighFiveController/HighFiveControllerInput"
import {HighFiveController} from "../HighFiveControls/HighFiveController/HighFiveController"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"

// The EntryPointMain class serves as the main entry point for
// initializing and start the synchronization and interaction processes

@component
export class EntryPointMain extends BaseScriptComponent {

  // Input for head synchronization class
  @input
  readonly handSynchronizationInput: HandSynchronizationInput
  @input
  readonly headSynchronizationInput: HeadSynchronizationInput

  // Input for high-five controller class
  @input
  readonly highFiveControllerInput: HighFiveControllerInput

  @input questHint: Text
  // Instance of HandSynchronization, responsible for handling hand/head synchronization logic
  private handSynchronization: HandSynchronization
  private headSynchronization: HeadSynchronization

  // Instance of HighFiveController, responsible for handling high-five interactions
  private highFiveController: HighFiveController

  // Instance of DataSynchronizationController, responsible for managing data synchronization between users
  private dataSynchronizationController: DataSynchronizationController

  // Lifecycle method called when the component is initialized
  onAwake() {

    // Initialize instances with the provided input
    this.handSynchronization = new HandSynchronization(this.handSynchronizationInput)
    this.headSynchronization = new HeadSynchronization(this.headSynchronizationInput)
    

    this.highFiveController = new HighFiveController(this.highFiveControllerInput, this.questHint)

    this.dataSynchronizationController = new DataSynchronizationController(
        this.handSynchronization,
        this.headSynchronization,
        this.highFiveController
    )

    // Setup a callback for when the session starts in a mapped environment
    SessionController.getInstance().notifyOnStartColocated(() => {
      this.onStart()
    })

  }

  // Private method to start hands and data synchronization and high-five interactions
  private onStart() {
    this.handSynchronization.start()
    this.headSynchronization.start()
    this.highFiveController.start()
    this.dataSynchronizationController.start()
  }

}
