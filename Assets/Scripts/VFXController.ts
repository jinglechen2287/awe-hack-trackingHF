@component
export class VFXController extends BaseScriptComponent {

    /**
     * Plays a VFX component for a specified duration.
     */

    @input()
    vfx: VFXComponent

    @input()
    duration: number

    public playEffect(): void {

        if (!this.vfx) {
            print("VFXController: No VFX component provided to play.");
            return;
        }

        // Start the VFX playback
        
        // this.vfx.start();
        print(`VFXController: Playing effect for ${this.duration} seconds.`);

        // Create a one-time event to stop the VFX after the duration
        const stopEvent = this.createEvent("DelayedCallbackEvent");
        stopEvent.bind(() => {
            
            // this.vfx.stop();
            print(`VFXController: Effect stopped.`);
        });
        
        // Schedule the stop event
        stopEvent.reset(this.duration);
    }
}