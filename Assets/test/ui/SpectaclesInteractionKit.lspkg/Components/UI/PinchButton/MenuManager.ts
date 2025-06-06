import { InteractorEvent } from "../../../Core/Interactor/InteractorEvent";
import { Interactable } from "../../Interaction/Interactable/Interactable";

@component
export class MenuManager extends BaseScriptComponent {
  @input
  questButtons: SceneObject[]; // Parents of buttons that trigger quest menus

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
    
  public activeQuest = -1;

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
  // Setup listeners for quest menu buttons (inside menus)
  this.questMenus.forEach((menuObj, index) => {
    const childButton = menuObj.children.find(child =>
      child.getComponent(Interactable.getTypeName())
    );
    if (!childButton) {
      print(`No Interactable child found in questMenu[${index}]`);
      return;
    }

    const interactable = childButton.getComponent(Interactable.getTypeName());
    if (!interactable) {
      print(`Child in questMenu[${index}] has no Interactable`);
      return;
    }

    interactable.onTriggerEnd.add((event: InteractorEvent) => {
      if (this.enabled) {
        this.setQuestActive(index);
      }
    });
  });

    this.questButtons.forEach((parentObj, index) => {
        const buttonObj = parentObj.children.find(child =>
          child.getComponent(Interactable.getTypeName())
        );
        if (!buttonObj) {
          print(`Child button missing for questButton parent at index ${index}`);
          return;
        }
    
        const interactable = buttonObj.getComponent(Interactable.getTypeName());
        if (!interactable) {
          print(`Interactable missing on child at index ${index}`);
          return;
        }
    
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
            this.setIngredientMenuActive();
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
            this.setPotionMenuActive();
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

  private setQuestActive(n: number): void {
    this.setQuestMenuActive();
    this.activeQuest = n;

    // Loop through questButtons and disable all child buttons
    this.questButtons.forEach((parent, index) => {
      const childButton = parent.children.find(child => child.getComponent(Interactable.getTypeName()));
      if (childButton) {
        childButton.enabled = index === n; // Enable only the selected one
      }
      const textComp = parent.getComponent("Component.Text");
      if (textComp) {
        textComp.textFill.color = index === n ? new vec4(0, 1, 0, 1) : new vec4(1, 1, 1, 1);
      }
    });
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

  private setPotionMenuActive(): void {
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
    const buttonMesh = button.children.find(child => child.name === 'Button Mesh');
    if (!buttonMesh) {
      print(`${button.name} doesn't have Button Mesh`);
      return;
    }

    const renderMeshVisual = buttonMesh.getComponent('RenderMeshVisual');
    if (!renderMeshVisual) {
      print(`${button.name} Button Mesh doesn't have renderMeshVisual`);
      return;
    }

    renderMeshVisual.materials = materials;
  }
}
