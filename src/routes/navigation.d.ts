import { BottomTabParamList } from './routes'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends BottomTabParamList {}
  }
}