import { InteractorEvent } from "../../../Core/Interactor/InteractorEvent";
import { Interactable } from "../../Interaction/Interactable/Interactable";

// Jingle's NOTE: this component is not needed for showing effects
// I'm handling showing effect in AppStateSync.ts 
// (hard-coded and ugly but works)

@component
export class PotionManager extends BaseScriptComponent {
  @input
  potionObjects: SceneObject[]; // Array of potion objects

  // Internal array to track activation states
  private potionStates: boolean[] = [];

  onAwake(): void {
    // Initialize potionStates with the current active state of each potion
    this.potionStates = this.potionObjects.map((obj) => obj.enabled);
    this.setPotionState(0, true);
  }

  togglePotion(index: number): void {
    if (index < 0 || index >= this.potionObjects.length) {
      print("Invalid potion index.");
      return;
    }

    // Flip the boolean state
    this.potionStates[index] = !this.potionStates[index];

    // Enable/disable the corresponding GameObject
    this.potionObjects[index].enabled = this.potionStates[index];
  }

  setPotionState(index: number, state: boolean): void {
    if (index < 0 || index >= this.potionObjects.length) {
      print("Invalid potion index.");
      return;
    }

    this.potionStates[index] = state;
    this.potionObjects[index].enabled = state;
  }

  getPotionState(index: number): boolean {
    if (index < 0 || index >= this.potionStates.length) {
      return false;
    }
    return this.potionStates[index];
  }
}
