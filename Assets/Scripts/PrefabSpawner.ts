@component
export class PrefabSpawner extends BaseScriptComponent {

    @input()
    ingredient1Prefab: ObjectPrefab;

    @input()
    ingredient2Prefab: ObjectPrefab;

    @input()
    ingredient3Prefab: ObjectPrefab;

    @input()
    notIngredientPrefab: ObjectPrefab;

    @input()
    ingredient1SpawnPoint: SceneObject;

    @input()
    ingredient2SpawnPoint: SceneObject;

    @input()
    ingredient3SpawnPoint: SceneObject;

    @input()
    notIngredientSpawnPoint: SceneObject;

    instantiateIngredient1() {
        let ingredient1 = this.ingredient1Prefab.instantiate(this.ingredient1SpawnPoint);
    }

    instantiateIngredient2() {
        let ingredient2 = this.ingredient2Prefab.instantiate(this.ingredient2SpawnPoint);
    }
    
    instantiateIngredient3() {
        let ingredient3 = this.ingredient3Prefab.instantiate(this.ingredient3SpawnPoint);
    }

    instantiateNotIngredient() {
        print("Instantiating not ingredient");
        let notIngredient = this.notIngredientPrefab.instantiate(this.notIngredientSpawnPoint);
    }
}
