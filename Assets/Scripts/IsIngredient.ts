@component
export class IsIngredient extends BaseScriptComponent {
    @input() 
    private ingredientName: string = "DefaultIngredientName"; 

    onAwake() {
        if (this.ingredientName === "DefaultIngredientName" || this.ingredientName.trim() === "") {
            print(`IsIngredient: WARNING - Ingredient on SceneObject '${this.getSceneObject().name}' has a default or empty ingredientName. Please set it in the Inspector.`);
        }
    }

    public getName(): string {
        return this.ingredientName;
    }
} 