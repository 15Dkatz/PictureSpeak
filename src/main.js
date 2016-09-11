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
// let Translate = require('@google-cloud/translate');
let NativeSpeechSynthesizer = NativeModules.SpeechSynthesizer;

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
      speaking: false,
      hidden: true,
      languagesHidden: true,
      voice: 'en-US',
      original: true
    })
  },

  componentDidMount() {
    this.listenForItems(textRef);
  },

  _startHandler(text) {
    NativeSpeechSynthesizer.stopSpeakingAtBoundary;
    Speech.speak({
      text,
      // hopefully no asynchronous messups, otherwise pass voice as second param
      voice: this.state.voice
    }).then(started => {
      console.log('Speech started');
      this.setState({speaking: true, hidden: false});
    }).catch(error => {
      console.log('You have already started a speech instance');
      // Speech.stop();
      // this._startHandler(text);
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
    // NativeSpeechSynthesizer.stopSpeakingAtBoundary;
    this.setState({speaking: false});
  },

  listenForItems(ref) {
    console.log('listening for items!');
    ref.on('value', (snap) => {
      let text = '';
      if (this.state.original) {
        text = snap.val().original_text;
      } else {
        text = snap.val().text;
      }

      console.log('snap.val().original_text', snap.val().text);
      if (!this.state.hidden) {
        this._startHandler(text);
      }
      this.setState({text});
    })
  },

  toggleLanguages() {
    Speech.supportedVoices()
      .then(locales => {
        console.log(locales);
      })
    this.setState({languagesHidden: !this.state.languagesHidden});
  },

  kill() {
    Speech.stop();
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
          <View style={styles.buttonsView}>
            <View style={styles.leftButtons}>
              {
                this.state.languagesHidden ?
                <View></View> :
                <View>
                  <TouchableOpacity style={styles.sideButton} onPress={() => {this.translate('hi-IN')}}>
                    <Text style={styles.text}>Hindi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sideButton} onPress={() => {this.translate('ko-KR')}}>
                    <Text style={styles.text}>Korean</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sideButton} onPress={() => {this.translate('es-MX')}}>
                    <Text style={styles.text}>Spanish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sideButton} onPress={() => {this.translate('de')}}>
                    <Text style={styles.text}>German</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sideButton} onPress={() => {this.translate('fr-FR')}}>
                    <Text style={styles.text}>French</Text>
                  </TouchableOpacity>
                </View>
              }
              <TouchableOpacity style={styles.sideButtonA} onPress={() => {this.toggleLanguages()}}>
                <Image source={require('../resources/settings_icon.png')} style={{width: 40, height: 40}}/>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.capture} onPress={()=>this.takePicture()}>
              <Text style={styles.captureText}>Speak.</Text>
            </TouchableOpacity>
            {this.state.hidden ?
              <View style={[styles.sideButtonA, {opacity: 0}]}>
              </View>
              :
              <View>
                <TouchableOpacity style={[styles.sideButton, styles.pauseButton]} onPress={() => {this.kill()}}>
                  <Text style={{fontSize: 24}}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sideButtonA, styles.pauseButton]}
                  onPress={
                    this.state.speaking ? () => this._pauseHandler() : () => this._resumeHandler()
                  }
                >
                  {this.state.speaking ?
                    // initialize as ...
                    <Image source={require('../resources/pause_icon.png')} style={{width: 20, height: 20}}/> :
                    <Image source={require('../resources/play_icon.png')} style={{marginLeft: 2,  paddingLeft: 4, width: 20, height: 20}}/>
                  }
                </TouchableOpacity>
              </View>
            }
          </View>
        </Camera>
      </View>
    )
  },

  translate(language) {
    // check i fnecessary to avoid bugs
    console.log('language', language);
    // Speech = require('react-native-speech');
    this.kill();
    this.setState({original: false});
    let languageCode = 'en';
    if (language == 'fr-FR') {
      languageCode = 'fr';
      this.setState({voice: language})
    }
    if (language == 'de') {
      languageCode = 'de'
      this.setState({voice: language});
    }
    if (language == 'es-MX') {
      languageCode = 'es'
      this.setState({voice: language});
    }
    if (language == 'ko-KR') {
      languageCode = 'ko'
      this.setState({voice: language})
    }
    if (language == 'hi-IN') {
      languageCode = 'hi'
      this.setState({voice: language})
    }

    fetch('http://69.164.217.188:4000/translate', {
    // fetch('http://localhost:3000/translate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({language: languageCode})
    })
  },

  takePicture() {
    //remember to reset the default to Hear your Picture on Firebase!
    this.setState({hidden: false, original: true, voice: 'en-US'});
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
          fetch('http://69.164.217.188:4000/convert', {
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
    borderColor: '#616161',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 40,
    opacity: 0.9
  },
  captureText: {
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Palatino-Italic',
    fontWeight: 'bold',
    fontSize: 20
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
  leftButtons: {
    flexDirection: 'column'
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
    borderColor: '#616161',
    borderWidth: 2,
    opacity: 0.9,
    marginBottom: 7
  },
  sideButtonA:{
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    margin: 10,
    marginLeft: 23,
    marginRight: 23,
    borderColor: '#616161',
    borderWidth: 2,
    opacity: 0.9,
    marginBottom: 40
  },
  sideButtonText: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  text: {
    fontFamily: 'Palatino-Italic'
  }
})
