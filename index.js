import { AppRegistry } from 'react-native';
import App from './src/App';
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-community/async-storage'

messaging().setBackgroundMessageHandler((remoteMessage) => {

    console.log('RNFirebase setBackgroundMessageHandler')

  // // Update a users messages list using AsyncStorage
  // let currentMessages = await AsyncStorage.getItem('messages')
  // let messageArray = JSON.parse(currentMessages)
  // if (!messageArray) {
  //   messageArray = []
  // }
  // messageArray.push(remoteMessage.data);
  // await AsyncStorage.setItem('messages', JSON.stringify(messageArray));

  AsyncStorage.setItem('messages', JSON.stringify([remoteMessage]));

  // console.log('FIREBASE setBackgroundMessageHandler', remoteMessage.data);
})


AppRegistry.registerComponent('CoopCycle', () => App);
