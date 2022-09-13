import { View, StyleSheet, StatusBar } from 'react-native'
import React from 'react'
import MusicPlayer from './screen/MusicPlayer'

const App = () => {
  return (
    <View style={style.container}>
      <StatusBar barStyle={'light-content'}/>
     <MusicPlayer/>
    </View>
  )
}

export default App


const style = StyleSheet.create({
  container : {
    flex: 1
  }
})
