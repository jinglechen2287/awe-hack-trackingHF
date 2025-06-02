import { InteractorEvent } from "../../../Core/Interactor/InteractorEvent";
import { Interactable } from "../../Interaction/Interactable/Interactable";

@component
export class MenuManager extends BaseScriptComponent {
  @input
  questButtons: SceneObject[]; // Buttons that trigger quest menus

  @input
  questMenus: SceneObject[]; // Corresponding quest menu objects

  @input
  ingredientButton: SceneObject;
  @input
  ingredientMenu: SceneObject;

  @input
  potionButton: SceneObject;
  @input
  potionMenu: SceneObject;
    
  @input
  questButton: SceneObject;
  @input
  questMenu: SceneObject;

  onAwake(): void {
    // Attach quest button listeners
    this.questButtons.forEach((buttonObj, index) => {
      const interactable = buttonObj.getComponent(Interactable.getTypeName());
      if (!interactable) {
        print(`Quest button ${index} missing Interactable.`);
        return;
      }

      this.createEvent("OnStartEvent").bind(() => {
        interactable.onTriggerEnd.add((event: InteractorEvent) => {
          if (this.enabled) {
            this.showOnlyMenu(this.questMenus[index]);
          }
        });
      });
    });

    // Ingredient button
    const ingredientInteractable = this.ingredientButton.getComponent(Interactable.getTypeName());
    if (ingredientInteractable) {
      this.createEvent("OnStartEvent").bind(() => {
        ingredientInteractable.onTriggerEnd.add((event: InteractorEvent) => {
          if (this.enabled) {
            this.showOnlyMenu(this.ingredientMenu);
          }
        });
      });
    }

    // Potion button
    const potionInteractable = this.potionButton.getComponent(Interactable.getTypeName());
    if (potionInteractable) {
      this.createEvent("OnStartEvent").bind(() => {
        potionInteractable.onTriggerEnd.add((event: InteractorEvent) => {
          if (this.enabled) {
            this.showOnlyMenu(this.potionMenu);
          }
        });
      });
    }
        
    // Quest menu button
    const questInteractable = this.questButton.getComponent(Interactable.getTypeName());
    if (questInteractable) {
      this.createEvent("OnStartEvent").bind(() => {
        questInteractable.onTriggerEnd.add((event: InteractorEvent) => {
          if (this.enabled) {
            this.showOnlyMenu(this.questMenu);
          }
        });
      });
    }
  }

  private showOnlyMenu(menuToShow: SceneObject): void {
    this.questMenus.forEach(m => m.enabled = false);
    if (this.ingredientMenu) this.ingredientMenu.enabled = false;
    if (this.potionMenu) this.potionMenu.enabled = false;
    if (this.questMenu) this.questMenu.enabled = false;

    if (menuToShow) menuToShow.enabled = true;
  }
}
