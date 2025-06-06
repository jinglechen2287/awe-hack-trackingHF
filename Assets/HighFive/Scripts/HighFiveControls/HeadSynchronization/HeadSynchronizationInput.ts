// The HeadSynchronizationInput class serves as a component that provides
// input parameters for the HeadSynchronization class
@component
export class HeadSynchronizationInput extends BaseScriptComponent {

  // Input property representing the scene object to be synchronized with the hand
  @input
  readonly headBox: SceneObject
}