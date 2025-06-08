@component
export class PrefabSpawner extends BaseScriptComponent {

    @input()
    ingredientPrefab: ObjectPrefab;

    @input()
    notIngredientPrefab: ObjectPrefab;

    @input()
    ingredientSpawnPoint: SceneObject;

    @input()
    notIngredientSpawnPoint: SceneObject;

    instantiateIngredient() {
        print("Instantiating ingredient");
        let ingredient = this.ingredientPrefab.instantiate(this.ingredientSpawnPoint);
    }

    instantiateNotIngredient() {
        print("Instantiating not ingredient");
        let notIngredient = this.notIngredientPrefab.instantiate(this.notIngredientSpawnPoint);
    }
}
