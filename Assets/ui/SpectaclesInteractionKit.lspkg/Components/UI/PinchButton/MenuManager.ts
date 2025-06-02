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

  @input idleButtonMaterials: Material[];
  @input activeButtonMaterials: Material[];

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
            this.setIngredientMenuActive()
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
            this.setPosionMenuActive()
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
            this.setQuestMenuActive();
          }
        });
      });
    }

    // Show quest menu by default
    this.setQuestMenuActive();
  }

  private setQuestMenuActive(): void {
    this.showOnlyMenu(this.questMenu);
    this.setButtonMaterial(this.ingredientButton, this.idleButtonMaterials);
    this.setButtonMaterial(this.questButton, this.activeButtonMaterials);
    this.setButtonMaterial(this.potionButton, this.idleButtonMaterials);
  }

  private setIngredientMenuActive(): void {
    this.showOnlyMenu(this.ingredientMenu);
    this.setButtonMaterial(this.ingredientButton, this.activeButtonMaterials);
    this.setButtonMaterial(this.questButton, this.idleButtonMaterials);
    this.setButtonMaterial(this.potionButton, this.idleButtonMaterials);
  }

  private setPosionMenuActive(): void {
    this.showOnlyMenu(this.potionMenu);
    this.setButtonMaterial(this.ingredientButton, this.idleButtonMaterials);
    this.setButtonMaterial(this.questButton, this.idleButtonMaterials);
    this.setButtonMaterial(this.potionButton, this.activeButtonMaterials);
  }

  private showOnlyMenu(menuToShow: SceneObject): void {
    this.questMenus.forEach(m => m.enabled = false);
    if (this.ingredientMenu) this.ingredientMenu.enabled = false;
    if (this.potionMenu) this.potionMenu.enabled = false;
    if (this.questMenu) this.questMenu.enabled = false;

    if (menuToShow) menuToShow.enabled = true;
  }

  private setButtonMaterial(button: SceneObject, materials: Material[]): void {
    const buttonMesh = button.children.find((child) => child.name === 'Button Mesh')
    if (!buttonMesh) {
        print(`${button.name} doesn't have Button Mesh`)
    }
    const renderMeshVisual = buttonMesh.getComponent('RenderMeshVisual')
    if (!renderMeshVisual) {
        print(`${button.name} Button Mesh doesn't have renderMeshVisual`)
    }
    renderMeshVisual.materials = materials
  }
}
