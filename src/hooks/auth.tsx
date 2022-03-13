import React, { 
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import * as AuthSession from 'expo-auth-session'
import * as AppleAuthentication from 'expo-apple-authentication'
import { ASYNC_STORAGE_KEYS } from "../utils/asyncStorageKeys";
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthProviderProps {
  children: ReactNode
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContextData {
  user: User;
  userStorageLoading: boolean;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  },
  type: string;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User)
  const [userStorageLoading, setUserStorageLoading] = useState(true)

  async function signInWithGoogle() {
    try {
      const { CLIENT_ID, REDIRECT_URI } = process.env
      const RESPONSE_TYPE = 'token'
      const SCOPE = encodeURI('profile email')

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`

      const { type, params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse
      
      if (type === 'success') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`)
        const userInfo = await response.json();
        const user = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.given_name,
          photo: userInfo.picture
        }
        
        setUser(user)
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER, JSON.stringify(user))
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      })

      if (credential) {
        const userLogged = {
          id: String(credential.user),
          email: credential.email,
          name: credential.fullName.givenName,
          photo: `https://ui-avatars.com/api/?name=${credential.fullName.givenName}&length=1`
        }

        setUser(userLogged)
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER, JSON.stringify(userLogged))
      }
    } catch(error) {
      throw new Error(error)
    }
  }

  async function signOut() {
    setUser({} as User)
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.USER)
  }

  useEffect(() => {
    async function loadUserStorageDate() {
      const data = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.USER)

      if (data) {
        const userLogged = JSON.parse(data) as User;
        setUser(userLogged)
      }
      setUserStorageLoading(false)
    }

    loadUserStorageDate()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      signInWithGoogle,
      signInWithApple,
      signOut,
      userStorageLoading
    }}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  return context;
}

export { AuthProvider, useAuth }