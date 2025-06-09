@component
export class MoveAxisY extends BaseScriptComponent {
    @input()
    sceneObject: SceneObject;

    @input()
    minY: number = -10;

    @input()
    maxY: number = 10;

    @input()
    duration: number = 2.0;

    // Private properties for animation state
    private startTime: number;
    private initialY: number;
    private isMovingUp: boolean;

    public onAwake(): void {
        // Initialize private properties
        this.startTime = 0;
        this.initialY = 0;
        this.isMovingUp = true;
    }

    // public onStart(): void {
    //     print("MoveYAxis: onStart");
    //     // Store the initial position
    //     this.startTime = getTime();
    //     this.initialY = this.sceneObject ? this.sceneObject.getTransform().getLocalPosition().y : this.getSceneObject().getTransform().getLocalPosition().y;
    // }

    // public onUpdate(): void {
    //     print("MoveYAxis: onUpdate");
    //     const currentTime = getTime();
    //     const elapsedTime = (currentTime - this.startTime) % this.duration;
    //     const progress = elapsedTime / this.duration;

    //     // Calculate the target Y position based on direction
    //     const targetY = this.isMovingUp ? this.maxY : this.minY;
    //     const startY = this.isMovingUp ? this.minY : this.maxY;

    //     // Lerp the Y position
    //     const newY = this.lerp(startY, targetY, progress);

    //     // Get current position
    //     const transform = this.sceneObject ? this.sceneObject.getTransform() : this.getSceneObject().getTransform();
    //     const currentPos = transform.getLocalPosition();

    //     // Update only the Y position
    //     transform.setLocalPosition(new vec3(currentPos.x, newY, currentPos.z));

    //     // Check if we need to switch direction
    //     if (progress >= 1.0) {
    //         this.isMovingUp = !this.isMovingUp;
    //         this.startTime = currentTime;
    //     }
    // }

    // private lerp(start: number, end: number, t: number): number {
    //     print("MoveYAxis: lerp");
    //     // Ensure t is between 0 and 1
    //     t = Math.max(0, Math.min(1, t));
    //     return start + (end - start) * t;
    // }
}