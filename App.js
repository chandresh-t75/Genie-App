// import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TextInput, StatusBar } from 'react-native';
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import GlobalNavigation from './App/navigation/appNavigation';
import './global.css';
import { Provider, useDispatch } from 'react-redux';
import store from './App/redux/store';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import navigationService from './App/navigation/navigationService';
import { notificationListeners } from './App/notification/notificationServices';
import { setUniqueToken } from './App/redux/reducers/userDataSlice';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from "expo-camera";
import * as Location from "expo-location";






export default function App() {

  let [fontsLoaded] = useFonts(
    {
      'Poppins-Regular': require('./App/assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Medium': require('./App/assets/fonts/Poppins-Medium.ttf'),
      'Poppins-SemiBold': require('./App/assets/fonts/Poppins-SemiBold.ttf'),
      'Poppins-Bold': require('./App/assets/fonts/Poppins-Bold.ttf'),
      'Poppins-ExtraBold': require('./App/assets/fonts/Poppins-ExtraBold.ttf'),
      'Poppins-Light': require('./App/assets/fonts/Poppins-Light.ttf'),
      'Poppins-ExtraLight': require('./App/assets/fonts/Poppins-ExtraLight.ttf'),
      'Poppins-Thin': require('./App/assets/fonts/Poppins-Thin.ttf'),
      'Poppins-Black': require('./App/assets/fonts/Poppins-Black.ttf'),
      'Poppins-Italic': require('./App/assets/fonts/Poppins-Italic.ttf'),
      'Poppins-BlackItalic': require('./App/assets/fonts/Poppins-BlackItalic.ttf'),
    }
  )

  // const dispatch = useDispatch();

  // if(!fontsLoaded){
  //   return <AppLoading/>;
  // }

  useEffect(() => {
    (async () => {
      // const media = await MediaLibrary.requestPermissionsAsync();
      const notification = await Notifications.requestPermissionsAsync();
      // const camera = await Camera.requestCameraPermissionsAsync();
      const location = await Location.requestForegroundPermissionsAsync();
      // console.log("status notification", media, notification, camera, location);

    })();
  }, []);


  useEffect(() => {

    notificationListeners();

  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer ref={(ref) => navigationService.setTopLevelNavigator(ref)} >
        <GlobalNavigation />
        <StatusBar backgroundColor="#FB8C00" />
      </NavigationContainer>
    </Provider>
  );
}
