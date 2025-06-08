import { IsIngredient } from "./IsIngredient";
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";

@component
export class CauldronController extends BaseScriptComponent {
    @input() 
    cauldronCollider: ColliderComponent;

    @input() 
    acceptedIngredientNames: string[] = [];

    @input()
    ingredient1Counter: Text;

    @input()
    ingredient2Counter: Text;

    @input()
    ingredient3Counter: Text;

    // sync kit
    sessionController: SessionController = SessionController.getInstance();
    syncEntity: SyncEntity;

    hasInitAsOwner: boolean = false;

    private ingredient1Prop = StorageProperty.manualInt("ingredient1", 0);
    private ingredient2Prop = StorageProperty.manualInt("ingredient2", 0);
    private ingredient3Prop = StorageProperty.manualInt("ingredient3", 0);


    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        this.sessionController.notifyOnReady(() => this.onSessionReady());
    }

    onSessionReady() {
        print("CauldronController: Session ready");
        this.syncEntity = SyncEntity.getSyncEntityOnSceneObject(this.getSceneObject());
        this.syncEntity.addStorageProperty(this.ingredient1Prop);
        this.syncEntity.addStorageProperty(this.ingredient2Prop);
        this.syncEntity.addStorageProperty(this.ingredient3Prop);

        // update text ui when ingredient count changes
        this.ingredient1Prop.onAnyChange.add((newVal: number, oldVal: number) => this.setIngredient1Counter(newVal, oldVal));
        this.ingredient2Prop.onAnyChange.add((newVal: number, oldVal: number) => this.setIngredient2Counter(newVal, oldVal));
        this.ingredient3Prop.onAnyChange.add((newVal: number, oldVal: number) => this.setIngredient3Counter(newVal, oldVal));

        this.syncEntity.notifyOnReady(() => this.onSyncEntityReady());
        this.syncEntity.onOwnerUpdated.add(() => this.onOwnershipUpdated());
    }

    onSyncEntityReady() {
        print("CauldronController: Sync entity ready");

        this.syncEntity.tryClaimOwnership();
        this.syncEntity.onEventReceived.add('incrementIngredient', (messageInfo) => this.incrementIngredient(messageInfo));

        this.cauldronCollider.onOverlapEnter.add((e) => this.onCauldronOverlap(e));
        this.refreshUI();
    }

    onOwnershipUpdated() {
        if (!this.syncEntity.isStoreOwned()) {
            print("CauldronController is not owned, trying to claim");
            this.syncEntity.tryClaimOwnership();
        }
        this.refreshUI();
    }

    isHost() {
        return this.syncEntity.isSetupFinished && this.syncEntity.doIOwnStore();
    }

    refreshUI() {
        print(`CauldronController: Refresh UI. Ingredient1: ${this.ingredient1Prop.currentValue}, Ingredient2: ${this.ingredient2Prop.currentValue}, Ingredient3: ${this.ingredient3Prop.currentValue}`);
        this.setIngredient1Counter(this.ingredient1Prop.currentValue, 0);
        this.setIngredient2Counter(this.ingredient2Prop.currentValue, 0);
        this.setIngredient3Counter(this.ingredient3Prop.currentValue, 0);
    }

    onCauldronOverlap(e) {
        const overlap = e.overlap;
        const otherObject = overlap.collider.getSceneObject();
        const ingredientScript = otherObject.getComponent(IsIngredient.getTypeName());
        if (ingredientScript) {
            const itemName = ingredientScript.getName();
            if (this.acceptedIngredientNames.includes(itemName)) {
                print(`CauldronController: ACCEPTED ${itemName}`);

                const ingredientData = {
                    ingredientName: itemName,
                    ingredientIdx: this.acceptedIngredientNames.indexOf(itemName)
                }

                this.syncEntity.sendEvent('incrementIngredient', ingredientData);

                // print(`CauldronController: ACCEPTED ${itemName}. New valid ingredient count: ${this.ingredient1Prop.currentOrPendingValue + 1}`);
                // this.ingredient1Prop.setPendingValue(this.ingredient1Prop.currentOrPendingValue + 1);
            }
            else {
                print(`CauldronController: REJECTED ${itemName}`);
            }
        }
    }

    incrementIngredient(messageInfo) {
        const ingredientData = messageInfo.data;
        const ingredientIdx = ingredientData.ingredientIdx;
        const ingredientName = ingredientData.ingredientName;

        // this.ingredient1Prop.setPendingValue(this.ingredient1Prop.currentOrPendingValue + 1);

        switch (ingredientIdx) {
            case 0:
                this.ingredient1Prop.setPendingValue(this.ingredient1Prop.currentOrPendingValue + 1);
                break;
            case 1:
                this.ingredient2Prop.setPendingValue(this.ingredient2Prop.currentOrPendingValue + 1);
                break;
            case 2:
                this.ingredient3Prop.setPendingValue(this.ingredient3Prop.currentOrPendingValue + 1);
                break;
        }
    }

    setIngredient1Counter(newVal: number, oldVal: number) {
        const ingredientName = this.acceptedIngredientNames[0];
        this.ingredient1Counter.text = `${ingredientName}: ${newVal}`;
    }

    setIngredient2Counter(newVal: number, oldVal: number) {
        const ingredientName = this.acceptedIngredientNames[1];
        this.ingredient2Counter.text = `${ingredientName}: ${newVal}`;
    }

    setIngredient3Counter(newVal: number, oldVal: number) {
        const ingredientName = this.acceptedIngredientNames[2];
        this.ingredient3Counter.text = `${ingredientName}: ${newVal}`;
    }


    // onAwake() {
    //     if (!this.cauldronCollider) {
    //         print("CauldronController: ERROR - Cauldron Collider is not assigned in the Inspector!");
    //         return;
    //     }

    //     if (this.acceptedIngredientNames.length === 0) {
    //         print("CauldronController: WARNING - No accepted ingredient names defined in the Inspector. The cauldron won't accept any ingredients.");
    //     }

    //     print(`CauldronController: Initialized. Accepting: [${this.acceptedIngredientNames.join(", ") || "None"}]. Current valid ingredient count: ${this.validIngredientsCount}`);

    //     this.cauldronCollider.onOverlapEnter.add((eventArgs) => {
    //         const otherCollider = eventArgs.overlap.collider;
    //         const otherObject = otherCollider.getSceneObject();

    //         // Try to get the IsIngredient script component from the object that entered
    //         const ingredientScript = otherObject.getComponent(IsIngredient.getTypeName());

    //         if (ingredientScript) {
    //             // The object has an IsIngredient script attached
    //             const itemName = ingredientScript.getName();

    //             if (typeof itemName === 'string' && itemName.trim() !== "") {
    //                 if (this.acceptedIngredientNames.includes(itemName)) {
    //                     this.validIngredientsCount++;
    //                     this.cauldronText.text = "Cakes: " + this.validIngredientsCount;
    //                     print(`CauldronController: ACCEPTED '${itemName}'. New valid ingredient count: ${this.validIngredientsCount}`);
    //                     // TODO: add more logic here, e.g., play a sound, visual effect
    //                 } else {
    //                     print(`CauldronController: REJECTED '${itemName}'. It is not in the accepted list.`);
    //                 }
    //             } else {
    //                 print(`CauldronController: Object '${otherObject.name}' has IsIngredient script, but its ingredientName is empty or invalid.`);
    //             }
    //         }
    //     });
    // }
} 