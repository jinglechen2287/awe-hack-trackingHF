import { RealtimeStoreKeys } from "./RealtimeStoreKeys";
import { HandSynchronization } from "../HandSynchronization/HandSynchronization";
import { HeadSynchronization } from "../HeadSynchronization/HeadSynchronization";
import { HighFiveController } from "../HighFiveController/HighFiveController";
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";
import { AppStateSync } from "../AppStateSync/AppStateSync";

// The DataSynchronizationController class is designed to manage the synchronization of
// hand position data across multiple users in a collaborative environment
export class DataSynchronizationController {
  // Identifier for the real-time data store used for synchronization
  private readonly STORE_ID: string = "HighFive";

  // Reference to the real-time data store
  private realtimeStore: GeneralDataStore;

  // Flag to check if a new store was created
  private isNewStoreCreated: boolean = false;

  constructor(
    private readonly handSynchronization: HandSynchronization,
    private readonly headSynchronization: HeadSynchronization,
    private readonly highFiveController: HighFiveController,
    private readonly appState: AppStateSync
  ) {}

  // Method to start the synchronization process
  start() {
    // Create or find the real-time store and initialize synchronization
    this.createRealtimeStore(() => {
      if (!this.isNewStoreCreated) {
        // Load existing hand/head position data for active users
        SessionController.getInstance()
          .getSession()
          .activeUsersInfo.forEach((value) => {
            const handKey = RealtimeStoreKeys.getHandPositionKey(value);
            if (this.realtimeStore.has(handKey)) {
              const data: RealtimeStoreKeys.HAND_LOCAL_POSITION_DATA =
                JSON.parse(
                  this.realtimeStore.getString(handKey)
                ) as RealtimeStoreKeys.HAND_LOCAL_POSITION_DATA;
              this.highFiveController.friendsHandInfoUpdated(data);
            }
            const headKey = RealtimeStoreKeys.getHeadPositionKey(value);
            if (this.realtimeStore.has(headKey)) {
              const data: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA =
                JSON.parse(
                  this.realtimeStore.getString(headKey)
                ) as RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA;
              this.highFiveController.friendsHeadInfoUpdated(data);
            }

            const stateKey = RealtimeStoreKeys.getAppStateKey(value);
            if (this.realtimeStore.has(headKey)) {
              const data: RealtimeStoreKeys.APP_STATE_DATA = JSON.parse(
                this.realtimeStore.getString(stateKey)
              ) as RealtimeStoreKeys.APP_STATE_DATA;
              this.highFiveController.friendAppStateHandler(data);
            }
          });
      }

      // Store current user's hand/head position data
      this.realtimeStore.putString(
        RealtimeStoreKeys.getCurrentUserHandPositionKey(),
        JSON.stringify(this.handSynchronization.lastUpdatedData)
      );
      this.realtimeStore.putString(
        RealtimeStoreKeys.getCurrentUserHeadPositionKey(),
        JSON.stringify(this.headSynchronization.lastUpdatedData)
      );

      // Store current user's app state data
      this.realtimeStore.putString(
        RealtimeStoreKeys.getCurrentUserAppStateKey(),
        JSON.stringify(this.appState.lastUpdatedData)
      );

      // Update high-five controller with current user's hand/head position
      this.highFiveController.currentUserHandInfoUpdated(
        this.handSynchronization.lastUpdatedData
      );

      // Subscribe to updates from the real-time store
      SessionController.getInstance().onRealtimeStoreUpdated.add(
        this.onRealtimeStoreUpdated
      );

      // Handle changes in hand/head position
      this.handSynchronization.subscribeOnChanges(
        (data: RealtimeStoreKeys.HAND_LOCAL_POSITION_DATA) => {
          this.highFiveController.currentUserHandInfoUpdated(data);
          this.realtimeStore.putString(
            RealtimeStoreKeys.getCurrentUserHandPositionKey(),
            JSON.stringify(data)
          );
        }
      );
      this.headSynchronization.subscribeOnChanges(
        (data: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA) => {
          this.realtimeStore.putString(
            RealtimeStoreKeys.getCurrentUserHeadPositionKey(),
            JSON.stringify(data)
          );
        }
      );
      // Handle changes in app state
      this.appState.subscribeOnChanges(
        (data: RealtimeStoreKeys.APP_STATE_DATA) => {
            print('appstate change')
          this.realtimeStore.putString(
            RealtimeStoreKeys.getCurrentUserAppStateKey(),
            JSON.stringify(data)
          );
        }
      );

      // Handle user disconnections
      SessionController.getInstance().onUserLeftSession.add(
        (session, userInfo) => {
          this.highFiveController.onFriendDisconnected(userInfo.connectionId);
        }
      );
    });
  }

  // Method to create or find an existing real-time data store
  private createRealtimeStore(onStoreCreated: () => void) {
    this.realtimeStore = this.findRealtimeStore();
    if (!this.realtimeStore) {
      this.isNewStoreCreated = true;
      var storeOpts = RealtimeStoreCreateOptions.create();
      storeOpts.persistence = RealtimeStoreCreateOptions.Persistence.Persist;
      storeOpts.ownership = RealtimeStoreCreateOptions.Ownership.Unowned;
      storeOpts.allowOwnershipTakeOver = false;
      storeOpts.storeId = this.STORE_ID;
      SessionController.getInstance()
        .getSession()
        .createRealtimeStore(
          storeOpts,
          (store) => {
            this.realtimeStore = store;
            onStoreCreated();
          },
          () => {}
        );
    } else {
      onStoreCreated();
    }
  }

  // Method to find an existing real-time data store with the specified store ID
  private findRealtimeStore(): GeneralDataStore | null {
    for (const store of SessionController.getInstance().getSession()
      .allRealtimeStores) {
      if (
        SessionController.getInstance().getSession().getRealtimeStoreInfo(store)
          .storeId === this.STORE_ID
      ) {
        return store;
      }
    }
    return null;
  }

  // Method to handle updates to the real-time store
  private onRealtimeStoreUpdated = (
    session: MultiplayerSession,
    store: GeneralDataStore,
    key: string,
    updateInfo: ConnectedLensModule.RealtimeStoreUpdateInfo
  ) => {
    // Skip updates from the current user
    if (
      updateInfo.updaterInfo.connectionId ===
      SessionController.getInstance().getLocalUserInfo().connectionId
    ) {
      return;
    }

    if (key.includes("HEAD")) {
      // Retrieve and process updated data
      const updatedData = this.realtimeStore.getString(key);
      if (updatedData.length === 0) {
        return;
      }
      const data: RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA = JSON.parse(
        updatedData
      ) as RealtimeStoreKeys.HEAD_LOCAL_POSITION_DATA;
      this.highFiveController.friendsHeadInfoUpdated(data);
    } else if (key.includes("HAND")) {
      // Retrieve and process updated data
      const updatedData = this.realtimeStore.getString(key);
      if (updatedData.length === 0) {
        return;
      }
      const data: RealtimeStoreKeys.HAND_LOCAL_POSITION_DATA = JSON.parse(
        updatedData
      ) as RealtimeStoreKeys.HAND_LOCAL_POSITION_DATA;
      this.highFiveController.friendsHandInfoUpdated(data);
    } else {
        print(key)
      const updatedData = this.realtimeStore.getString(key);
      if (updatedData.length === 0) {
        return;
      }
      const data: RealtimeStoreKeys.APP_STATE_DATA = JSON.parse(
        updatedData
      ) as RealtimeStoreKeys.APP_STATE_DATA;
      this.highFiveController.friendAppStateHandler(data);
    }
  };
}
