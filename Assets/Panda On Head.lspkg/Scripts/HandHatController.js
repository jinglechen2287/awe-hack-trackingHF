// @input Component.AnimationPlayer animPlayer
// @input string foundAnimName
// @input string lostAnimName
// @input Component.ObjectTracking handTracking


function playAnimation(animationComponent, animNamePlay, animNamePause, loops) {
    if (animationComponent) {
        if (animationComponent.getClip(animNamePause)) {
            animationComponent.getClip(animNamePause).weight = 0.0;
        }
        if (animationComponent.getClip(animNamePlay)) {
            animationComponent.getClip(animNamePlay).weight = 1.0;
        }
        animationComponent.playClipAt(animNamePlay, 0);
    }
}

if (!script.handTracking) {
    print("HandTrackingController, ERROR: Please assign Hand Tracking Object under the advanced checkbox.");
} else {
    script.handTracking.onObjectFound = function() {
        playAnimation(script.animPlayer, script.foundAnimName, script.lostAnimName, 1);
    }

    script.handTracking.onObjectLost = function() {
        playAnimation(script.animPlayer, script.lostAnimName, script.foundAnimName, -1);
    }
}
