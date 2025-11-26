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
          return delay;
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
          return;
        }
        

        const binaryString = atob(message);
        if (binaryString.length === 0) {
          return;
        }
        
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        Y.applyUpdate(this.doc, uint8Array);
      } catch (error) {
      }
    });


    this.connection.on('LoadPersistedState', (message: string) => {
      try {
        const binaryString = atob(message);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        


        Y.applyUpdate(this.doc, uint8Array, this);
      } catch (error) {
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


    this.connection.on('UserJoined', () => {
      if (this.connected && this.doc.store.clients.size > 0) {
        try {

          const fullState = Y.encodeStateAsUpdate(this.doc);
          if (fullState && fullState.length > 0) {
            this.broadcastUpdate(fullState);
          }
        } catch (error) {
        }
      }
    });


    this.connection.on('UserLeft', () => {
    });


    this.connection.onreconnecting(() => {
      this.connected = false;
    });


    this.connection.onreconnected(async () => {
      try {

        await this.connection.invoke('JoinRoom', this.roomName);
        this.connected = true;
        

        this.requestSync();
      } catch (error) {
      }
    });


    this.connection.onclose(() => {
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
      await this.connection.start();
      

      await this.connection.invoke('JoinRoom', this.roomName);
      this.connected = true;
      


      this.requestSync();
    } catch (error: any) {
      setTimeout(() => this.connect(), 5000);
    }
  }

  private requestSync() {
    if (!this.connected) return;

    if (this.doc.store.clients.size > 0) {
      try {
        const update = Y.encodeStateAsUpdate(this.doc);
        if (update.length > 0) {
          this.broadcastUpdate(update);
        }
      } catch (error) {
      }
    }


    try {
      const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        Array.from(this.awareness.getStates().keys())
      );
      this.broadcastAwareness(awarenessUpdate);
    } catch (error) {
    }
  }

  private async broadcastUpdate(update: Uint8Array) {
    if (!this.connected) return;
    

    if (!update || update.length === 0) {
      return;
    }

    try {

      const base64 = btoa(String.fromCharCode(...update));
      if (!base64 || base64.length === 0) {
        return;
      }
      
      await this.connection.invoke('SyncMessage', this.roomName, base64);
    } catch (error) {
    }
  }

  private async broadcastAwareness(update: Uint8Array) {
    if (!this.connected) return;

    try {

      const data = JSON.stringify(Array.from(update));
      await this.connection.invoke('AwarenessUpdate', this.roomName, data);
    } catch (error) {
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
