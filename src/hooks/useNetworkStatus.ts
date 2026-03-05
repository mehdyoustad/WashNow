import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState(false);
  const prevConnected = useRef<boolean>(true);

  useEffect(() => {
    // Vérification initiale
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
    });

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      if (!prevConnected.current && connected) {
        // Vient de se reconnecter
        setWasOffline(true);
        setTimeout(() => setWasOffline(false), 3000);
      }
      prevConnected.current = connected;
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  return { isConnected, wasOffline };
}
