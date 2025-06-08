import { HeadSynchronizationInput } from "./HeadSynchronizationInput";
import {RealtimeStoreKeys} from "../SyncControls/RealtimeStoreKeys"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";

// The HeadSynchronization class synchronizes the position of a virtual headBox with the user's head/camera movements in real time.
// It tracks the head's movements, updates the headBox's position accordingly within the scene,
// and handles events triggered by changes in head positioning.
export class HeadSynchronization {

  // Array to store callbacks that handle head position changes
  private readonly onUserChangedHeadPosition: ((value: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA) => void) [] = []

  // Reference to the head/camera
  private readonly head: WorldCameraFinderProvider

  // The headBox object in the scene that follows the head
  private readonly headBox: SceneObject

  // Transform component for the headBox, used to dynamically update its position based on the head's movement
  private readonly headBoxTransform: Transform

  // Stores the last updated head position data
  private _lastUpdatedData: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA

  constructor(private readonly input: HeadSynchronizationInput) {
    // Initialize the head using SIK framework
    this.head = WorldCameraFinderProvider.getInstance()

    // Create a copy of the headBox hierarchy for manipulation
    this.headBox = this.input.headBox

    // Store the headBox's transform component for position manipulation
    this.headBoxTransform = this.headBox.getTransform()

    // TODO: Double Check this
    // Initially disable the headBox as the head is not yet tracked
    this.headBox.enabled = false
  }

  // Starts the synchronization by initializing data and binding update events
  start() {
    this._lastUpdatedData = this.defaultData()
    this.putheadBoxOnHead()
    print('Tracking head start')
  }

  // Allows external subscriptions to head position changes
  subscribeOnChanges(onUserChangedValue: (value: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA) => void) {
    this.onUserChangedHeadPosition.push(onUserChangedValue)
  }

  // Getter for the last updated head position data
  get lastUpdatedData(): RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA {
    return this._lastUpdatedData
  }

  // Binds an event to update the headBox's position, aligning it with the center of the head
  private putheadBoxOnHead() {
    const updateEvent = this.input.createEvent("UpdateEvent")
    updateEvent.bind(() => {
      if (!this.head) {
        print('no world cam')
        this.headBox.enabled = false
        return
      }
      this.headBox.enabled = true
      let pos = this.head.getWorldPosition()
      this.headBoxTransform.setWorldPosition(pos)
      let rot = this.head.getWorldTransform().extractEulerAngles()
      this.headBoxTransform.setWorldRotation(quat.fromEulerVec(rot))
      this.updateHeadPositionData(this.headBoxTransform.getLocalPosition(), this.headBoxTransform.getLocalRotation().toEulerAngles())
    })
  }

  // Initializes and returns default head position data
  private defaultData(): RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA {
    const data: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA = {
      connectionID: SessionController.getInstance().getLocalUserInfo().connectionId,
      x: 0,
      y: 0,
      z: 0,
      xRot: 0,
      yRot: 0,
      zRot: 0
    }
    return data
  }

  // Delays the update of head position data to prevent rapid changes
//   private updateHeadDataWithDelay() {
//     const delay = this.input.createEvent("DelayedCallbackEvent")
//     delay.bind(() => {
//       this.updateHeadPositionData(this.headBoxTransform.getLocalPosition(), this.headBoxTransform.getLocalRotation().toEulerAngles())
//     })
//     delay.reset(0.05)
//   }

  // Updates the head position data and notifies subscribed callbacks
  private updateHeadPositionData(pos: vec3, rot: vec3) {
    const data: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA = {
      connectionID: SessionController.getInstance().getLocalUserInfo().connectionId,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      xRot: rot.x,
      yRot: rot.y,
      zRot: rot.z,
    }
    this._lastUpdatedData = data
    this.onUserChangedHeadPosition.forEach(value => value(data))
  }

}