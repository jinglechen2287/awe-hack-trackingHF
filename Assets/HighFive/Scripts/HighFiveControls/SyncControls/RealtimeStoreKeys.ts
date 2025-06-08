import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";

//The RealtimeStoreKeys namespace defines constants and utility functions for
// managing and accessing hand position data in a real-time collaborative environment

export namespace RealtimeStoreKeys {
  // Constant string used as a prefix for hand/head position keys
  export const HAND_POSITION: string = "HAND_POSITION";
  export const HEAD_POSITION: string = "HEAD_POSITION";

  //   Constant string used as a prefix for app state
  export const APP_State: string = "APP_STATE";

  // Generates a key for the current user's hand position data
  export const getCurrentUserHandPositionKey = (): string => {
    return getHandPositionKey(
      SessionController.getInstance().getLocalUserInfo()
    );
  };

  export const getCurrentUserHeadPositionKey = (): string => {
    return getHeadPositionKey(
      SessionController.getInstance().getLocalUserInfo()
    );
  };

  // Generates a key for the current user's app state data
  export const getCurrentUserAppStateKey = (): string => {
    return getAppStateKey(SessionController.getInstance().getLocalUserInfo());
  };

  // Generates a key for a specific user's hand/head position data using their connection ID
  export const getHandPositionKey = (
    user: ConnectedLensModule.UserInfo
  ): string => {
    return HAND_POSITION + user.connectionId;
  };

  export const getHeadPositionKey = (
    user: ConnectedLensModule.UserInfo
  ): string => {
    return HEAD_POSITION + user.connectionId;
  };

  // Generates a key for a specific user's app state data using their connection ID
  export const getAppStateKey = (
    user: ConnectedLensModule.UserInfo
  ): string => {
    return APP_State + user.connectionId;
  };

  // Interface defining the structure of hand/head position data
  export interface HAND_LOCAL_POSITION_DATA {
    connectionID: string; // Unique connection ID of the user
    isActive: boolean; // Indicates if the hand is currently active
    x: number; // X-coordinate of the hand position
    y: number; // Y-coordinate of the hand position
    z: number; // Z-coordinate of the hand position
  }

  export interface HEAD_LOCAL_POSITION_DATA {
    connectionID: string;
    x: number;
    y: number;
    z: number;
    xRot: number;
    yRot: number;
    zRot: number;
  }

  export interface APP_STATE_DATA {
    connectionID: string;
    questText: string;
    showEffect: boolean;
    hasActiveQuest: boolean;
  }
}
