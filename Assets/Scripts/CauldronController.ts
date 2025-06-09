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

    @input()
    ingredient1Max: number = 3;

    @input()
    ingredient2Max: number = 3;

    @input()
    ingredient3Max: number = 3;

    // sync kit
    sessionController: SessionController = SessionController.getInstance();
    syncEntity: SyncEntity;

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
        this.refreshUI();
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
        // const ingredientName = this.acceptedIngredientNames[0];
        if (newVal >= this.ingredient1Max) {
            this.ingredient1Counter.text = `Complete!`
        }
        else {
            this.ingredient1Counter.text = `${newVal}/${this.ingredient1Max}`;
        }
    }

    setIngredient2Counter(newVal: number, oldVal: number) {
        // const ingredientName = this.acceptedIngredientNames[1];
        if (newVal >= this.ingredient2Max) {
            this.ingredient2Counter.text = `Complete!`
        }
        else {
            this.ingredient2Counter.text = `${newVal}/${this.ingredient2Max}`;
        }
    }

    setIngredient3Counter(newVal: number, oldVal: number) {
        // const ingredientName = this.acceptedIngredientNames[2];
        if (newVal >= this.ingredient3Max) {
            this.ingredient3Counter.text = `Complete!`
        }
        else {
            this.ingredient3Counter.text = `${newVal}/${this.ingredient3Max}`;
        }
    }
} 