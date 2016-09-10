import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  NativeModules
} from 'react-native';

import Camera from 'react-native-camera';
// let FileUpload = require('NativeModules').FileUpload;
var RNUploader = require('NativeModules').RNUploader;

module.exports = React.createClass({
  getInitialState() {
    return ({
      title: 'PictureSpeak'
    })
  },

  render() {
    return (
      <View style={styles.container}>
        {/*<Text>{this.state.title}</Text>*/}
        <Camera
          ref={(cam) => {
            this.camera = cam
          }}
          style={styles.preview}
          keepAwake={true}
          aspect={Camera.constants.Aspect.fill}
        >
          <TouchableOpacity style={styles.capture} onPress={()=>this.takePicture()}>
            <Text style={styles.captureText}>SPEAK</Text>
          </TouchableOpacity>
        </Camera>
      </View>
    )
  },

  takePicture() {
    this.camera.capture()
      .then((data) => {
        let pathToPic = data.path;
        NativeModules.ReadImageData.readImage(pathToPic, image => {
          console.log('image', image);
          let file = JSON.stringify({
            file: 'file',
            filename: 'photo.jpeg',
            base64: image,
            filetype: 'image/jeg'
          })
          fetch('http://localhost:3000/convert', {
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 40,
  },
  captureText: {
    textAlign: 'center',
    color: '#000',
    padding: 10
  }
})
