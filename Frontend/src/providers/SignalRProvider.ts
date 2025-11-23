import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

/**
 * SignalR provider for Yjs
 * Connects to .NET SignalR hub instead of WebSocket
 */
export class SignalRProvider {
  public doc: Y.Doc;
  public awareness: awarenessProtocol.Awareness;
  private connection: HubConnection;
  private roomName: string;
  private connected: boolean = false;
  constructor(serverUrl: string, roomName: string, doc: Y.Doc) {
    this.doc = doc;
    this.roomName = roomName;
    this.awareness = new awarenessProtocol.Awareness(doc);

    // Build SignalR connection with retry policy
    this.connection = new HubConnectionBuilder()
      .withUrl(serverUrl, {
        withCredentials: false,
        timeout: 30000,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2, 10, 30 seconds
          if (retryContext.elapsedMilliseconds < 60000) {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          } else {
            // Stop retrying after 1 minute
            return null;
          }
        }
      })
      .configureLogging({
        log: (logLevel, message) => {
          console.log(`[SignalR ${logLevel}]:`, message);
        }
      })
      .build();

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers() {
    // Handle incoming Yjs sync messages from other clients
    this.connection.on('ReceiveSyncMessage', (message: string) => {
      try {
        // Validate message before processing
        if (!message || message.length === 0) {
          console.log('Received empty sync message, skipping');
          return;
        }
        
        // Decode base64 string to Uint8Array
        const binaryString = atob(message);
        if (binaryString.length === 0) {
          console.log('Decoded empty message, skipping');
          return;
        }
        
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        Y.applyUpdate(this.doc, uint8Array);
        console.log('Applied sync update, size:', uint8Array.length);
      } catch (error) {
        console.error('Error processing sync message:', error, 'Message length:', message?.length);
      }
    });

    // Handle awareness updates (cursors, user info, etc.)
    this.connection.on('ReceiveAwarenessUpdate', (awarenessData: string) => {
      const update = JSON.parse(awarenessData);
      awarenessProtocol.applyAwarenessUpdate(
        this.awareness,
        new Uint8Array(update),
        null
      );
    });

    // Handle user joined - send them our current state
    this.connection.on('UserJoined', (connectionId: string) => {
      console.log('User joined:', connectionId);
      // Send our full document state to the new user only if we have data
      if (this.connected && this.doc.store.clients.size > 0) {
        try {
          // Encode the entire document state
          const fullState = Y.encodeStateAsUpdate(this.doc);
          if (fullState && fullState.length > 0) {
            console.log('Sending full state to new user, size:', fullState.length);
            this.broadcastUpdate(fullState);
          } else {
            console.log('No state to send to new user');
          }
        } catch (error) {
          console.error('Error encoding state for new user:', error);
        }
      } else {
        console.log('Empty document, nothing to send to new user');
      }
    });

    // Handle user left
    this.connection.on('UserLeft', (connectionId: string) => {
      console.log('User left:', connectionId);
    });

    // Handle reconnection
    this.connection.onreconnected(() => {
      console.log('Reconnected to SignalR');
      this.requestSync();
    });

    // Handle disconnection
    this.connection.onclose(() => {
      console.log('Disconnected from SignalR');
      this.connected = false;
      // Clear local awareness state on disconnect
      this.awareness.setLocalState(null);
    });

    // Listen to local document changes and broadcast
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      // Don't broadcast updates that came from the network
      if (origin !== this) {
        this.broadcastUpdate(update);
      }
    });

    // Listen to local awareness changes and broadcast
    this.awareness.on('update', ({ added, updated, removed }: any) => {
      const changedClients = added.concat(updated, removed);
      const update = awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients);
      this.broadcastAwareness(update);
    });
  }

  private async connect() {
    try {
      console.log('Attempting to connect to SignalR...');
      await this.connection.start();
      console.log('✓ Connected to SignalR successfully');
      
      // Join the room
      await this.connection.invoke('JoinRoom', this.roomName);
      console.log(`✓ Joined room: ${this.roomName}`);
      this.connected = true;
      
      // Request sync from existing clients by sending our state vector
      // This implements Yjs sync protocol - clients will respond with missing data
      this.requestSync();
    } catch (error: any) {
      console.error('✗ Error connecting to SignalR:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        url: error.url || 'unknown'
      });
      
      // Retry after 5 seconds
      console.log('Retrying connection in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    }
  }

  private requestSync() {
    if (!this.connected) return;

    console.log('Requesting sync from other clients...');
    
    // Only send our state if we have any data
    if (this.doc.store.clients.size > 0) {
      try {
        const update = Y.encodeStateAsUpdate(this.doc);
        if (update.length > 0) {
          console.log('Broadcasting our state, size:', update.length);
          this.broadcastUpdate(update);
        }
      } catch (error) {
        console.error('Error encoding state for sync:', error);
      }
    } else {
      console.log('Empty document, waiting for updates from others');
    }

    // Send awareness so others see we joined
    try {
      const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        Array.from(this.awareness.getStates().keys())
      );
      this.broadcastAwareness(awarenessUpdate);
    } catch (error) {
      console.error('Error broadcasting awareness:', error);
    }
  }

  private async broadcastUpdate(update: Uint8Array) {
    if (!this.connected) return;
    
    // Don't broadcast empty updates
    if (!update || update.length === 0) {
      console.log('Skipping empty update broadcast');
      return;
    }

    try {
      // Convert Uint8Array to base64 string for SignalR JSON protocol
      const base64 = btoa(String.fromCharCode(...update));
      if (!base64 || base64.length === 0) {
        console.warn('Encoded empty base64, skipping broadcast');
        return;
      }
      
      await this.connection.invoke('SyncMessage', this.roomName, base64);
    } catch (error) {
      console.error('Error broadcasting update:', error);
    }
  }

  private async broadcastAwareness(update: Uint8Array) {
    if (!this.connected) return;

    try {
      // Convert to JSON string for SignalR
      const data = JSON.stringify(Array.from(update));
      await this.connection.invoke('AwarenessUpdate', this.roomName, data);
    } catch (error) {
      console.error('Error broadcasting awareness:', error);
    }
  }

  public async destroy() {
    if (this.connected) {
      // Clear local awareness state before disconnecting
      this.awareness.setLocalState(null);
      
      // Wait a moment for the awareness update to be sent
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await this.connection.invoke('LeaveRoom', this.roomName);
      await this.connection.stop();
    }
    this.awareness.destroy();
  }

  public on(event: string, handler: (event: any) => void) {
    // Wrapper for event handling
    if (event === 'status') {
      this.connection.onreconnecting(() => handler({ status: 'connecting' }));
      this.connection.onreconnected(() => handler({ status: 'connected' }));
      this.connection.onclose(() => handler({ status: 'disconnected' }));
    }
  }
}
