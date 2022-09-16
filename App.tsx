import React, {useState, PropsWithChildren, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Auth0, {Credentials, UserInfo} from 'react-native-auth0';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth0 = new Auth0({
  domain: 'bachvq95.auth0.com',
  clientId: '6Z6PjQHFBIR6gl5sPrKDIMwVBX5hFwXR',
});

async function saveData(credentials: Credentials) {
  try {
    await AsyncStorage.setItem('CREDENTIAL', JSON.stringify(credentials));
  } catch (e) {
    // saving error
  }
}

async function restoreData(): Promise<Credentials | undefined> {
  const result = await AsyncStorage.getItem('CREDENTIAL');
  const credential: Credentials | undefined = JSON.parse(result ?? '');
  return credential;
}

const App: React.FunctionComponent<PropsWithChildren<{}>> = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [isReadyForStart, setIsReadyForStart] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | undefined>(
    undefined,
  );
  const [authStatus, setAuthStatus] = useState<'authorized' | 'unauthorized'>(
    'unauthorized',
  );

  useEffect(() => {
    async function _syncData() {
      try {
        const credentialsCache = await restoreData();
        if (credentialsCache) {
          setAuthStatus('authorized');
          setCredentials(credentials);
          const userInfoResult = await auth0.auth.userInfo({
            token: credentialsCache.accessToken,
          });
          setUserInfo(userInfoResult);
        }
      } catch (err) {}
      setIsReadyForStart(true);
    }
    _syncData();
  }, []);

  const _onLogin = async () => {
    try {
      const result = await auth0.webAuth.authorize({});
      saveData(result);
      setCredentials(result);
      setAuthStatus('authorized');
      const userInfoResult = await auth0.auth.userInfo({
        token: result.accessToken,
      });
      setUserInfo(userInfoResult);
    } catch (err) {
      console.log(err);
    }
  };

  const _onLogout = async () => {
    try {
      await auth0.webAuth.clearSession({});
      setAuthStatus('unauthorized');
      setCredentials(undefined);
      setUserInfo(undefined);
      await AsyncStorage.removeItem('CREDENTIAL');
    } catch (err) {
      console.log(err);
    }
  };

  const _userInfo = useMemo(() => {
    const user = userInfo;
    return (
      user && (
        <View style={styles.infoContainer}>
          <Text>{user.email}</Text>
          <Text>{user.familyName + user.givenName + user.name}</Text>
          <Text>{user.nickname}</Text>
          <Text>{user.picture}</Text>
          <Text>{user.email}</Text>
        </View>
      )
    );
  }, [userInfo]);

  return isReadyForStart ? (
    <View style={styles.container}>
      {_userInfo}
      <Pressable
        style={styles.button}
        onPress={() =>
          authStatus === 'unauthorized' ? _onLogin() : _onLogout()
        }>
        <Text style={styles.buttonTitle}>
          {authStatus == 'authorized' ? 'Logout' : 'Login'}
        </Text>
      </Pressable>
    </View>
  ) : (
    <View style={styles.container}>
      <ActivityIndicator animating />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'column',
  },
  infoTitle: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    flexShrink: 1,
  },
  button: {
    backgroundColor: 'blue',
    padding: 4,
    width: 120,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    color: 'white',
    fontWeight: '600',
  },
});

export default App;
function useCallBack(arg0: () => Promise<void>, arg1: never[]) {
  throw new Error('Function not implemented.');
}
