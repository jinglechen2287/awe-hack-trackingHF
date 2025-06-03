@component
export class IngredientManager extends BaseScriptComponent {
  @input
  ingredientObjects: SceneObject[]; // Ingredient scene objects (must have Text components)

  @input
  ingredientNumbers: number[]; // Parallel array of numbers to display

  private textComponents: Text[] = [];

  onAwake(): void {
    // Cache Text components
    this.textComponents = this.ingredientObjects.map((obj, index) => {
      const text = obj.getComponent("Component.Text") as Text;
      if (!text) {
        print(`Warning: ingredientObjects[${index}] has no Text component`);
      }
      return text;
    });

    this.updateAllTexts();
  }

  updateAllTexts(): void {
    for (let i = 0; i < this.textComponents.length; i++) {
      const textComp = this.textComponents[i];
      const value = this.ingredientNumbers[i];

      if (textComp) {
        textComp.text = value.toString();
      }
    }
  }

  setIngredientNumber(index: number, value: number): void {
    if (index < 0 || index >= this.ingredientNumbers.length) {
      print("Invalid ingredient index.");
      return;
    }

    this.ingredientNumbers[index] = value;

    const textComp = this.textComponents[index];
    if (textComp) {
      textComp.text = value.toString();
    }
  }
}
