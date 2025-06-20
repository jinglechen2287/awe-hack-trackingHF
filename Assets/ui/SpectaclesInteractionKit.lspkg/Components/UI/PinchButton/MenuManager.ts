import { InteractorEvent } from "../../../Core/Interactor/InteractorEvent";
import { Interactable } from "../../Interaction/Interactable/Interactable";
import { EntryPointMain } from "HighFive/Scripts/EntryPointMain/EntryPointMain";
import { Quest, QuestSystem } from "HighFive/Scripts/QuestTracker";

@component
export class MenuManager extends BaseScriptComponent {
  @input highFiveEntryPoint: EntryPointMain; // Access to all the high five-related components or objects

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

  @input
  warningQuestMenu: SceneObject;

  @input
  quitQuestButton: SceneObject;

  @input
  continueQuestButton: SceneObject;

  @input
  noQuestText: SceneObject;

  @input idleButtonMaterials: Material[];
  @input activeButtonMaterials: Material[];

  private allAvailableQuests: Quest[] = [
    new Quest('Spark of Curiosity', 1, "What's your must see session?", 'Gem'),
    new Quest('Wisdom Exchange', 1, "What's your must see session?", 'Gem'),
    new Quest('Quest3', 1, "What's your must see session?", 'Gem'),
    new Quest('Quest4', 1, "What's your must see session?", 'Gem'),
    new Quest('Quest5', 1, "What's your must see session?", 'Gem'),
  ];

  public activeQuest = -1;
  public questSystem: QuestSystem;

  onAwake(): void {
    this.questSystem = this.highFiveEntryPoint.highFiveController.quests
    if (!this.questSystem) {
        print('No access to quest system on MenuManager')
    }
    this.createEvent("OnStartEvent").bind(() => {
      // Setup listeners for quest menu buttons (inside menus)
      // aka. the accept buttons
      this.questMenus.forEach((menuObj, index) => {
        const childButton = menuObj.children.find((child) =>
          child.getComponent(Interactable.getTypeName())
        );
        if (!childButton) {
          print(`No Interactable child found in questMenu[${index}]`);
          return;
        }

        const interactable = childButton.getComponent(
          Interactable.getTypeName()
        );
        if (!interactable) {
          print(`Child in questMenu[${index}] has no Interactable`);
          return;
        }

        interactable.onTriggerEnd.add((event: InteractorEvent) => {
          if (this.enabled) {
            this.acceptQuest(index);
          }
        });

        const questDescription = menuObj.getComponent('Text')
        if (!questDescription) {
            print(`No text component in questMenu[${index}]`)
            return
        }
        const quest = this.allAvailableQuests[index]
        questDescription.text = `Name: ${quest.name} \n Goal: ${quest.goal} \n Reward: ${quest.reward}`
      });

      // Setup listeners for view quest buttons
      this.questButtons.forEach((parentObj, index) => {
        const buttonObj = parentObj.children.find((child) =>
          child.getComponent(Interactable.getTypeName())
        );
        if (!buttonObj) {
          print(
            `Child button missing for questButton parent at index ${index}`
          );
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

        const label = parentObj.getComponent('Text')
        if (!label) {
            print(`No text component on questButton parent at index[${index}]`)
            return
        }
        label.text = this.allAvailableQuests[index].name
      });
    });
    // Ingredient button
    const ingredientInteractable = this.ingredientButton.getComponent(
      Interactable.getTypeName()
    );
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
    const potionInteractable = this.potionButton.getComponent(
      Interactable.getTypeName()
    );
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
    const questInteractable = this.questButton.getComponent(
      Interactable.getTypeName()
    );
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

  public activateQuest(n: number){
    this.questButtons[n].enabled = true;
    this.noQuestText.enabled = false;
  }

  public deactivateQuest(n: number){
    this.questButtons[n].enabled = false;
  }

  public getCauldronQuests() {
    this.activateQuest(0);
    this.activateQuest(1);
  }

  public quitQuest(){
    this.activeQuest = -1;
    this.continueQuestButton.enabled = false;
    this.quitQuestButton.enabled = false;
    this.questButtons.forEach((parent, index) => {
      const textComp = parent.getComponent("Component.Text");
      if (textComp) {
        textComp.textFill.color = new vec4(1, 1, 1, 1);
      }
    })
    //other things to add to reset the quest
  }


  private acceptQuest(n: number): void {
    if (this.activeQuest != n && this.activeQuest != -1){
      this.setWarningMenuActive();
      return;
    }

    this.setQuestMenuActive();
    this.activeQuest = n;
    this.questSystem.addQuest(this.allAvailableQuests[n])

    this.questButtons.forEach((parent, index) => {
      const textComp = parent.getComponent("Component.Text");
      if (textComp) {
        textComp.textFill.color =
          index === n ? new vec4(0, 1, 0, 1) : new vec4(1, 1, 1, 1);
      }
    });

    this.continueQuestButton.enabled = true;
    this.quitQuestButton.enabled = true;
  }

  private setQuestMenuActive(): void {
    this.showOnlyMenu(this.questMenu);
    this.setButtonMaterial(this.ingredientButton, this.idleButtonMaterials);
    this.setButtonMaterial(this.questButton, this.activeButtonMaterials);
    this.setButtonMaterial(this.potionButton, this.idleButtonMaterials);
  }

  private setWarningMenuActive(): void {
    this.showOnlyMenu(this.warningQuestMenu);
    this.setButtonMaterial(this.ingredientButton, this.idleButtonMaterials);
    this.setButtonMaterial(this.questButton, this.idleButtonMaterials);
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
    this.questMenus.forEach((m) => (m.enabled = false));
    if (this.ingredientMenu) this.ingredientMenu.enabled = false;
    if (this.potionMenu) this.potionMenu.enabled = false;
    if (this.questMenu) this.questMenu.enabled = false;
    if (this.warningQuestMenu) this.warningQuestMenu.enabled = false;

    if (menuToShow) menuToShow.enabled = true;
  }

  private setButtonMaterial(button: SceneObject, materials: Material[]): void {
    const buttonMesh = button.children.find(
      (child) => child.name === "Button Mesh"
    );
    if (!buttonMesh) {
      print(`${button.name} doesn't have Button Mesh`);
      return;
    }

    const renderMeshVisual = buttonMesh.getComponent("RenderMeshVisual");
    if (!renderMeshVisual) {
      print(`${button.name} Button Mesh doesn't have renderMeshVisual`);
      return;
    }

    renderMeshVisual.materials = materials;
  }
}
