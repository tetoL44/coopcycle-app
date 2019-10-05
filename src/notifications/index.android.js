import messaging from '@react-native-firebase/messaging'
import { Alert, AppState, Linking } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

/**
 * App behavior when receiving messages that include both notification and data payloads
 * depends on whether the app is in the background or the foreground—essentially,
 * whether or not it is active at the time of receipt.
 *
 * When in the background, apps receive the notification payload in the notification tray,
 * and only handle the data payload when the user taps on the notification.
 *
 * When in the foreground, your app receives a message object with both payloads available.
 *
 * @see https://rnfirebase.io/docs/v4.2.x/messaging/receiving-messages
 * @see https://rnfirebase.io/docs/v4.2.x/messaging/device-token
 * @see https://rnfirebase.io/docs/v4.2.x/notifications/receiving-notifications
 */

const parseNotification = (notification, isForeground) => {

  let data = notification.data

  if (data.hasOwnProperty('event')) {
    data.event = JSON.parse(data.event)
  }

  return {
    foreground: isForeground,
    data
  }
}

let notificationOpenedListener = () => {}
let notificationListener = () => {}
let tokenRefreshListener = () => {}
let appStateChangeListener = () => {}

class PushNotification {

  static configure(options) {

    /*
    // Notification was received in the background
    notificationOpenedListener = firebase.notifications()
      .onNotificationOpened(notificationOpen => {
        options.onNotification(parseNotification(notificationOpen.notification, false))
    })

    // Notification was received in the foreground
    notificationListener = firebase.notifications()
      .onNotification(notification => {
        options.onNotification(parseNotification(notification, true))
    })
    */

    AsyncStorage.getItem('messages').then(msgs => {
      // const messageArray = JSON.parse(msgs);
      console.log('RNFirebase msgs', msgs);
    });

    messaging().onMessage(async (remoteMessage) => {
      console.log('RNFirebase FCM Message Data:', remoteMessage.data);

       // // Update a users messages list using AsyncStorage
       // const currentMessages = await AsyncStorage.get('messages');
       // const messageArray = JSON.parse(currentMessages);
       // messageArray.push(remoteMessage.data);
       // await AsyncStorage.set('messages', JSON.stringify(messageArray));
    })

    // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    //   // Update a users messages list using AsyncStorage
    //   let currentMessages = await AsyncStorage.getItem('messages')
    //   let messageArray = JSON.parse(currentMessages)
    //   if (!messageArray) {
    //     messageArray = []
    //   }
    //   messageArray.push(remoteMessage.data);
    //   await AsyncStorage.setItem('messages', JSON.stringify(messageArray));

    //   // console.log('FIREBASE setBackgroundMessageHandler', remoteMessage.data);
    // })

    messaging().hasPermission()
      .then(enabled => {

        if (!enabled) {
          // We tell the user to open the app settings to enable notifications
          Alert.alert(
            'Notifications désactivées',
            'Voulez-vous ouvrir les paramètres de l\'application ?',
            [
              {
                text: 'Annuler',
                onPress: () => {}
              },
              {
                text: 'Ouvrir',
                onPress: () => {

                  appStateChangeListener = nextState => {
                    // User is coming back from app settings
                    // Check again if notifications have been enabled
                    if ('active' === nextState) {
                      AppState.removeEventListener('change', appStateChangeListener)
                      messaging().hasPermission()
                        .then(enabled => {
                          messaging()
                            .getToken()
                            .then(fcmToken => {
                              if (fcmToken) {
                                options.onRegister(fcmToken)
                              }
                            })
                        })
                        .catch(e => console.log(e))
                    }
                  }
                  AppState.addEventListener('change', appStateChangeListener)

                  Linking.openSettings()
                }
              },
            ],
            {
              cancelable: true
            }
          )
        } else {
          messaging()
            .getToken()
            .then(fcmToken => {
              if (fcmToken) {
                options.onRegister(fcmToken)
              }
            })
        }

      })
      .catch(e => console.log(e))

    tokenRefreshListener = messaging()
      .onTokenRefresh(fcmToken => options.onRegister(fcmToken))
  }

  static removeListeners() {
    // notificationOpenedListener()
    // notificationListener()
    tokenRefreshListener()
  }

}

export default PushNotification
