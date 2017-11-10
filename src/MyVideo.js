import React, { Component } from 'react';
import { Button, Grid } from 'semantic-ui-react';

class MyVideo extends Component {
  state = {
    stream: null
  };

  constraints = { audio: false, video: true };

  qvgaConstraints = {
    video: {
      mandatory: {
        maxWidth: 320,
        maxHeight: 240
      }
    }
  };

  vgaConstraints = {
    video: {
      mandatory: {
        maxWidth: 640,
        maxHeight: 480
      }
    }
  };

  hdConstraints = {
    video: {
      mandatory: {
        minWidth: {
          minWidth: 1280,
          minHeight: 960
        }
      }
    }
  };

  successCallback = stream => {
    this.setState({
      stream: stream
    });

    this.myVideo.src = window.URL.createObjectURL(stream);
    this.myVideo.play();
  }

  errorCallback = (error) => {
    console.log('navigator.getUserMedia error: ', error);
  }

  getMedia = constraints => {
    this.myVideo.src = null;
    navigator.getUserMedia(constraints, this.successCallback, this.errorCallback);
  }

  componentWillMount() {
  }


  componentDidMount() {
    navigator.getUserMedia(this.constraints, this.successCallback, this.errorCallback);
  }

  _handleQVGA = e => {
    this.getMedia(this.qvgaConstraints)
  }

  _handleVGA = e => {
    this.getMedia(this.vgaConstraints)
  }

  _handleHD = e => {
    this.getMedia(this.hdConstraints)
  }


  render() {
    return (
    <div>
      <video autoPlay controls ref={el => this.myVideo = el} ></video>
      <Button primary onClick={this._handleQVGA}>320X240</Button>
      <Button primary onClick={this._handleVGA}>640X480</Button>
      <Button primary onClick={this._handleHD}>1280X960</Button>
    </div>
    )

  }
}


export default MyVideo;