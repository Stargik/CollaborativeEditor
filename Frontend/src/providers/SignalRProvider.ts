import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export class SignalRProvider {
  public doc: Y.Doc;
  public awareness: awarenessProtocol.Awareness;
  public connection: HubConnection;
  private roomName: string;
  private connected: boolean = false;
  constructor(serverUrl: string, roomName: string, doc: Y.Doc) {
    this.doc = doc;
    this.roomName = roomName;
    this.awareness = new awarenessProtocol.Awareness(doc);


    this.connection = new HubConnectionBuilder()
      .withUrl(serverUrl, {
        withCredentials: false,
        timeout: 30000,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {

          const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          console.log(`Reconnection attempt ${retryContext.previousRetryCount + 1}, waiting ${delay}ms...`);
          return delay;
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

    this.connection.on('ReceiveSyncMessage', (message: string) => {
      try {

        if (!message || message.length === 0) {
          console.log('Received empty sync message, skipping');
          return;
        }
        

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


    this.connection.on('LoadPersistedState', (message: string) => {
      try {
        console.log('Received persisted state from server, length:', message.length);
        

        const binaryString = atob(message);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        


        Y.applyUpdate(this.doc, uint8Array, this);
        console.log('✓ Applied persisted state, size:', uint8Array.length);
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    });


    this.connection.on('ReceiveAwarenessUpdate', (awarenessData: string) => {
      const update = JSON.parse(awarenessData);
      awarenessProtocol.applyAwarenessUpdate(
        this.awareness,
        new Uint8Array(update),
        null
      );
    });


    this.connection.on('UserJoined', (connectionId: string) => {
      console.log('User joined:', connectionId);

      if (this.connected && this.doc.store.clients.size > 0) {
        try {

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


    this.connection.on('UserLeft', (connectionId: string) => {
      console.log('User left:', connectionId);
    });


    this.connection.onreconnecting((error) => {
      console.log('⚠ Connection lost, attempting to reconnect...', error?.message || '');
      this.connected = false;
    });


    this.connection.onreconnected(async () => {
      console.log('✓ Reconnected to SignalR - rejoining room...');
      try {

        await this.connection.invoke('JoinRoom', this.roomName);
        console.log(`✓ Rejoined room: ${this.roomName}`);
        this.connected = true;
        

        this.requestSync();
      } catch (error) {
        console.error('Error rejoining room after reconnection:', error);
      }
    });


    this.connection.onclose(() => {
      console.log('Disconnected from SignalR');
      this.connected = false;

      this.awareness.setLocalState(null);
    });


    this.doc.on('update', (update: Uint8Array, origin: any) => {

      if (origin !== this) {
        this.broadcastUpdate(update);
      }
    });


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
      

      await this.connection.invoke('JoinRoom', this.roomName);
      console.log(`✓ Joined room: ${this.roomName}`);
      this.connected = true;
      


      this.requestSync();
    } catch (error: any) {
      console.error('✗ Error connecting to SignalR:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        url: error.url || 'unknown'
      });
      

      console.log('Retrying connection in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    }
  }

  private requestSync() {
    if (!this.connected) return;

    console.log('Requesting sync from other clients...');
    

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
    

    if (!update || update.length === 0) {
      console.log('Skipping empty update broadcast');
      return;
    }

    try {

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

      const data = JSON.stringify(Array.from(update));
      await this.connection.invoke('AwarenessUpdate', this.roomName, data);
    } catch (error) {
      console.error('Error broadcasting awareness:', error);
    }
  }


  public getFullState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  public async destroy() {
    if (this.connected) {

      this.awareness.setLocalState(null);
      

      await new Promise(resolve => setTimeout(resolve, 100));
      
      await this.connection.invoke('LeaveRoom', this.roomName);
      await this.connection.stop();
    }
    this.awareness.destroy();
  }

  public on(event: string, handler: (event: any) => void) {

    if (event === 'status') {
      this.connection.onreconnecting(() => handler({ status: 'connecting' }));
      this.connection.onreconnected(() => handler({ status: 'connected' }));
      this.connection.onclose(() => handler({ status: 'disconnected' }));
    }
  }
}
