import { HeadSynchronizationInput } from "./HeadSynchronizationInput"
import {RealtimeStoreKeys} from "../SyncControls/RealtimeStoreKeys"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";

// The HeadSynchronization class synchronizes the position of a virtual questHint with the user's head/camera movements in real time.
// It tracks the head's movements, updates the questHint's position accordingly within the scene,
// and handles events triggered by changes in head positioning.
export class HeadSynchronization {

  // Array to store callbacks that handle head position changes
  private readonly onUserChangedHeadPosition: ((value: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA) => void) [] = []

  // Reference to the head/camera (using SIK or similar API)
  private readonly head: WorldCameraFinderProvider

  // The questHint object in the scene that follows the head
  private readonly questHint: SceneObject

  // Transform component for the questHint, used to dynamically update its position based on the head's movement
  private readonly questHintTransform: Transform

  // Stores the last updated head position data
  private _lastUpdatedData: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA

  constructor(private readonly input: HeadSynchronizationInput) {
    // Initialize the head using SIK framework (assuming getHead() or similar exists)
    this.head = WorldCameraFinderProvider.getInstance()

    // Create a copy of the questHint hierarchy for manipulation
    this.questHint = this.input.questHint.getParent().copyWholeHierarchy(this.input.questHint)

    // Store the questHint's transform component for position manipulation
    this.questHintTransform = this.questHint.getTransform()

    // TODO: Double Check this
    // Initially disable the questHint as the head is not yet tracked
    // this.questHint.enabled = false
  }

  // Starts the synchronization by initializing data and binding update events
  start() {
    this._lastUpdatedData = this.defaultData()
    this.putquestHintOnHead()
  }

  // Allows external subscriptions to head position changes
  subscribeOnChanges(onUserChangedValue: (value: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA) => void) {
    this.onUserChangedHeadPosition.push(onUserChangedValue)
  }

  // Getter for the last updated head position data
  get lastUpdatedData(): RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA {
    return this._lastUpdatedData
  }

  // Binds an event to update the questHint's position, aligning it with the center of the head
  private putquestHintOnHead() {
    const updateEvent = this.input.createEvent("UpdateEvent")
    updateEvent.bind(() => {
        // TODO: Double check if the if statement is necessary
      if (!this.head) {
        this.questHint.enabled = false
        return
      }
      this.questHint.enabled = true
      const pos = this.head.getWorldPosition()
      this.questHintTransform.setWorldPosition(pos)
      this.updateHeadDataWithDelay()
    })
  }

  // Initializes and returns default head position data
  private defaultData(): RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA {
    const data: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA = {
      connectionID: SessionController.getInstance().getLocalUserInfo().connectionId,
      x: 0,
      y: 0,
      z: 0,
    }
    return data
  }

  // Delays the update of head position data to prevent rapid changes
  private updateHeadDataWithDelay() {
    const delay = this.input.createEvent("DelayedCallbackEvent")
    delay.bind(() => {
      this.updateHeadPositionData(this.questHintTransform.getLocalPosition())
    })
    delay.reset(0.05)
  }

  // Updates the head position data and notifies subscribed callbacks
  private updateHeadPositionData(pos: vec3) {
    const data: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA = {
      connectionID: SessionController.getInstance().getLocalUserInfo().connectionId,
      x: pos.x,
      y: pos.y,
      z: pos.z,
    }
    this._lastUpdatedData = data
    this.onUserChangedHeadPosition.forEach(value => value(data))
  }

}
