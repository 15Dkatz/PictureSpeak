/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  View,
  AppRegistry
} from 'react-native';

import Main from './src/main';

class PictureSpeak extends Component {
  render() {
    return (
      <Main />
    );
  }
}
AppRegistry.registerComponent('PictureSpeak', () => PictureSpeak);
