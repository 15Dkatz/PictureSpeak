import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  NativeModules,
  Image
} from 'react-native';

// allow multiple by making the name of their pictures unique!
let Speech = require('react-native-speech');


import Camera from 'react-native-camera';
var RNUploader = require('NativeModules').RNUploader;

import * as firebase from 'firebase';
const config = {
    apiKey: "AIzaSyCa1TSayY_Fqn9nrTXU8WqVwQSjdBF5haQ",
    authDomain: "pspeakapp.firebaseapp.com",
    databaseURL: "https://pspeakapp.firebaseio.com",
    storageBucket: ""
};
const firebaseApp = firebase.initializeApp(config);
const textRef = firebase.database().ref();

module.exports = React.createClass({
  getInitialState() {
    return ({
      title: 'PictureSpeak',
      text: 'Hear your picture!',
      speaking: false
    })
  },

  componentDidMount() {
    this.listenForItems(textRef);
  },

  _startHandler(text) {
    Speech.speak({
      text,
      voice: 'en-US'
    }).then(started => {
      console.log('Speech started');
      this.setState({speaking: true});
    }).catch(error => {
      console.log('You have already started a speech instance');
    })
  },

  _pauseHandler() {
    Speech.pause();
    this.setState({speaking: false});
  },

  _resumeHandler() {
    Speech.resume();
    this.setState({speaking: true});
  },

  _stopHandler() {
    Speech.stop();
    this.setState({speaking: false});
  },

  listenForItems(ref) {
    console.log('listening for items!');
    ref.on('child_changed', (snap) => {
      let text = snap.val();
      this._startHandler(text);
      this.setState({text});
    })
  },

  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => {
            this.camera = cam
          }}
          style={styles.preview}
          keepAwake={true}
          aspect={Camera.constants.Aspect.fill}
        >
          {/*<Text style={styles.text}>
            {this.state.text}
          </Text>*/}
          <View style={styles.buttonsView}>
            <TouchableOpacity style={styles.sideButton}>
              <Image source={require('../resources/settings_icon.png')} style={{width: 40, height: 40}}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.capture} onPress={()=>this.takePicture()}>
              <Text style={styles.captureText}>SPEAK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sideButton, styles.pauseButton]}
              onPress={this.state.speaking ? () => this._pauseHandler : () => this._resumeHandler}
            >
              <Text style={styles.sideButtonText}>&#10073;&#10073;</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    )
  },

  takePicture() {
    //remember to reset the default to Hear your Picture on Firebase!

    this.camera.capture()
      .then((data) => {
        let pathToPic = data.path;
        NativeModules.ReadImageData.readImage(pathToPic, image => {
          // console.log('image', image);
          let file = JSON.stringify({
            file: 'file',
            filename: 'photo.jpeg',
            base64: image,
            filetype: 'image/jpeg'
          })
          fetch('https://pspeak.herokuapp.com/convert', {
          // fetch('http://localhost:3000/convert', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: file
          })
        })
      })
      .catch(err => console.error(err));
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    width: 100,
    height: 100,
    backgroundColor: '#a5d6a7',
    borderColor: '#000',
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 40,
  },
  captureText: {
    textAlign: 'center',
    color: '#000',
    // padding: 10,
    fontWeight: 'bold',
    fontSize: 18
  },

  pauseButton: {
    backgroundColor: '#ef9a9a',
  },
  // text: {
  //   color: '#222', //change to black
  //   textAlign: 'center',
  //   padding: 10,
  //   marginBottom: 100,
  //   fontSize: 24,
  //   backgroundColor: 'transparent'
  //   // marginBottom: 50
  // }

  //*** BUTTONS *** //
  buttonsView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,

    justifyContent: 'center',
  },
  sideButton: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    margin: 10,
    marginLeft: 23,
    marginRight: 23,
    borderColor: '#000',
    borderWidth: 5,
  },
  sideButtonText: {
    textAlign: 'center',
    fontWeight: 'bold'
  }
})
