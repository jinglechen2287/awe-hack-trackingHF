import {InteractorEvent} from "../../../Core/Interactor/InteractorEvent"
import Event from "../../../Utils/Event"
import {createCallback} from "../../../Utils/InspectorCallbacks"
import NativeLogger from "../../../Utils/NativeLogger"
import {Interactable} from "../../Interaction/Interactable/Interactable"


@component
export class IngredientManager extends BaseScriptComponent {
  @input
  textObject: SceneObject; // The slide or text object

  @input
  buttonObject: SceneObject; // The pinch button

  IngredientCount: number = 1;

  private textComponent: Text | null = null;
  private buttonInteractable: Interactable | null = null;

  onAwake(): void {
    // Get and validate the text component
    this.textComponent = this.textObject?.getComponent("Component.Text");
    if (!this.textComponent) {
      print("Error: textObject has no Text component.");
      return;
    }

    // Get and validate the interactable
    this.buttonInteractable = this.buttonObject?.getComponent(Interactable.getTypeName());
    if (!this.buttonInteractable) {
      print("Error: buttonObject is missing an Interactable component.");
      return;
    }

    // Initial update
    this.updateText();

    // Set up trigger event
    this.createEvent("OnStartEvent").bind(() => {
      this.buttonInteractable?.onTriggerEnd.add((event: InteractorEvent) => {
        if (this.enabled) {
          this.IngredientCount++;
          this.updateText();
        }
      });
    });
  }

  private updateText(): void {
    this.textComponent!.text = this.IngredientCount.toString();
  }
}