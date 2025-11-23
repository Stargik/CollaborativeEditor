import { useEffect, useRef, useState, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'

interface UseWebSocketOptions {
  onMessage: (data: any) => void
  username: string
}

export const useWebSocket = ({ onMessage, username }: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false)
  const [userId] = useState(() => 'user_' + Math.random().toString(36).substr(2, 9))
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  const connect = useCallback(async () => {
    const hubUrl = `http://localhost:5000/diagramHub`

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    connectionRef.current = connection

    connection.on('ReceiveMessage', (data) => {
      console.log('Received message:', data)
      // Don't process our own messages
      if (data.userId !== userId) {
        onMessage(data)
      }
    })

    connection.on('UserLeft', (data) => {
      console.log('User left:', data)
      if (data.userId !== userId) {
        onMessage(data)
      }
    })

    connection.onclose((error) => {
      console.log('SignalR disconnected', error)
      setIsConnected(false)
    })

    connection.onreconnecting((error) => {
      console.log('SignalR reconnecting', error)
      setIsConnected(false)
    })

    connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected', connectionId)
      setIsConnected(true)
      // Re-send user update after reconnection
      connection.invoke('UserUpdate', {
        userId,
        username,
        timestamp: Date.now(),
      })
    })

    try {
      await connection.start()
      console.log('SignalR connected')
      setIsConnected(true)
      
      // Send user update on connection
      await connection.invoke('UserUpdate', {
        userId,
        username,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('SignalR connection error:', error)
      setIsConnected(false)
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        connect()
      }, 3000)
    }
  }, [onMessage, userId, username])

  useEffect(() => {
    connect()

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop()
      }
    }
  }, [connect])

  const sendMessage = useCallback(async (message: any) => {
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        switch (message.action) {
          case 'add':
            await connectionRef.current.invoke('AddShape', message)
            break
          case 'update':
            await connectionRef.current.invoke('UpdateShape', message)
            break
          case 'delete':
            await connectionRef.current.invoke('DeleteShape', message)
            break
          case 'clear':
            await connectionRef.current.invoke('ClearAll', message)
            break
          case 'user_update':
            await connectionRef.current.invoke('UserUpdate', message)
            break
        }
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }, [])

  return {
    isConnected,
    sendMessage,
    userId,
  }
}
