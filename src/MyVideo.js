import React, { Component } from 'react';
import { Button, Grid, TextArea } from 'semantic-ui-react';

class MyVideo extends Component {
  state = {
    dataChannelSendValue: null,
    dataChannelReceiveValue: null
  };

  localStream;
  localPeerConnection;
  remotePeerConnection;

  sendChannel;
  receiveChannel;

  // dataChannelSendValue;
  // dataChannelReceivedValue;

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
        maxWidth: 1280,
        maxHeight: 960
      }
    }
  };


  successCallback = stream => {
    this.localStream = stream;

    // this.localVideo set from UI
    this.localVideo.src = window.URL.createObjectURL(stream);
    this.localVideo.play();
  }

  errorCallback = (error) => {
    console.log('navigator.getUserMedia error: ', error);
  }

  getMedia = constraints => {
    this.localVideo.src = null;
    navigator.getUserMedia(constraints, this.successCallback, this.errorCallback);
  }

  componentWillMount() {
  }


  componentDidMount() {
    // navigator.getUserMedia(this.constraints, this.successCallback, this.errorCallback);

    // this.setState({
    //   dataChannelSend: {},
    //   dataChannelReceive: {}
    // })

    //console.log('current state: ', this.state);
  }

  _handleQVGA = e => {
    this.getMedia(this.qvgaConstraints)
  }

  _handleVGA = e => {
    this.getMedia(this.vgaConstraints)
  }

  _handleHD = e => {
    console.log('for hd')
    this.getMedia(this.hdConstraints)
  }

  _handleStart = e => {
    console.log('start-Requesting local stream...');
    navigator.getUserMedia(this.constraints, this.successCallback, this.errorCallback);
  }

  _handleCall = e => {
    console.log('call');

    console.log('waht is navigator: ', navigator);
    console.log('connection: ', RTCPeerConnection);
    //console.log('another: ', webkitRTCPeerConnection);
    if(navigator.webkitGetUserMedia) {
      if(this.localStream.getVideoTracks().length > 0) {
        console.log('===see more details: ', this.state.localStream);
        console.log('Using video device: ', this.localStream.getVideoTracks()[0].label);
      }

      if(this.localStream.getAudioTracks().length > 0) {
        console.log('Using audio device: ', this.state.localStream.getAudioTracks()[0].label);
      }

      // Create the local PeerConnection object
      const servers = null;

      this.localPeerConnection = new RTCPeerConnection(servers);
      console.log('localPeerConnection: ', this.localPeerConnection);
      // Add a handler associated with ICE protocol events
      this.localPeerConnection.onicecandidate = this.gotLocalIceCandidate;
      this.localPeerConnection.addStream(this.localStream);
      this.localPeerConnection.createOffer(this.gotLocalDescription, this.onSignalingError);

      // Create the remote PeerConnection object
      this.remotePeerConnection = new RTCPeerConnection(servers);
      this.remotePeerConnection.onicecandidate = this.gotRemoteIceCandidate;
      this.remotePeerConnection.onaddstream = this.gotRemoteStream;


    }

  }






  onSignalingError = error => {
    console.log('Failed to create signaling message: ', error.name);
  }


  // Handler to be called when the local SDP becomes available
  gotLocalDescription = description => {
    this.localPeerConnection.setLocalDescription(description);
    console.log('Offer from localPeerConnection: \n', description.sdp);

    this.remotePeerConnection.setRemoteDescription(description);
    this.remotePeerConnection.createAnswer(this.gotRemoteDescription,  this.onSignalingError);
  }

  gotRemoteDescription = description => {
    this.remotePeerConnection.setLocalDescription(description);
    console.log("Answer from remotePeerConnection:", description.sdp);
    this.localPeerConnection.setRemoteDescription(description);
  }



  _handleHangUp = e => {
    console.log('ending call');
    this.localPeerConnection.close();
    this.remotePeerConnection.close();

    // reset loacl variables
    this.localPeerConnection = null;
    this.remotePeerConnection = null;

  }

  gotRemoteStream = event => {
    this.remoteVideo.src = window.URL.createObjectURL(event.stream);
    console.log('Received retmoe stream');
  }



  gotLocalIceCandidate = event => {
    if(event.candidate) {
      // Add candidate to the remote PeerConnection
      this.remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
      console.log('Local ICE candidate: \n' + event.candidate.candidate);
    }
  }

  gotRemoteIceCandidate = event => {
    if(event.candidate) {
      this.localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
      console.log("Remote ICE candidata: ", event.candidate.candidate);
    }
  }

  _createConnection = () => {
    console.log('#####create connection');

    const servers = null;
    // DTLS/SRTP
    const pc_constraints = {
      'optional': [
        {'DtlsSrtpKeyAgreement': true}
      ]
    }

    this.localPeerConnection =  new RTCPeerConnection(servers, pc_constraints);
    console.log('Created local peer connection object, with Data Channel');

    try {
      this.sendChannel = this.localPeerConnection.createDataChannel('sendDataChannel', { reliable: true});
      console.log('****** Create reliable send data channel', this.sendChannel);
    } catch (e) {
      console.log('Failed to create data channel: ', e.message);
    }

    this.localPeerConnection.onicecandidate = this.gotLocalCandidate;

    this.sendChannel.onopen = this.handeSendChannelStateChange;
    this.sendChannel.onClose = this.handleSendChannelStateChange;

    this.remotePeerConnection = new RTCPeerConnection(servers, pc_constraints);
    console.log('Create remote peer connnection object, with DataChannel');

    this.remotePeerConnection.onicecandidate = this.gotRemoteIceCandidate;
    this.remotePeerConnection.ondatachannel = this.gotReceiveChannel;

    this.localPeerConnection.createOffer(this.gotLocalDescription, this.onSignalingError);


  }

  gotReceiveChannel = event => {
    console.log('-----Receive channel callback: event -> ', event);
    this.receiveChannel = event.channel;

    this.receiveChannel.onopen = this.handleReceiveChannelStateChange;
    this.receiveChannel.onmessage = this.handleMessage;
    this.receiveChannel.onclose = this.handleReceiveChannelStateChange;
  }

  handleMessage = event => {
    //this.dataChannelReceivedValue = event.data;
    console.log('+++++ handleMessage called ', event.data);

    // this.setState({
    //   dataChannelSend: event.data,
    //   dataChannelReceive: ''
    // })
    // this.dataChannelReceive.value = event.data;
    // this.dataChannelSend.value = '';

    this.setState({
      dataChannelReceiveValue: event.data,
      dataChannelSendValue: ''});

    console.log('current state: ', this.state);
  };

  handleSendChannelStateChange = () => {
    const readyState = this.sendChannel.readyState;
    console.log('#########Send channel state is: ', readyState);
    if(readyState === 'open') {
      console.log('readySTate is open');
    }
  }

  handleReceiveChannelStateChange = () => {
    const readyState = this.receiveChannel.readyState;
    console.log()
  }

  _sendData = () => {
    console.log('--- send data -----');
    // this.sendChannel.send(this.dataChannelSendValue);
    this.sendChannel.send(this.state.dataChannelSendValue);
    console.log('send data: ', this.state.dataChannelSendValue);
  }

  _closeDataChannels = () => {
    console.log('close data channels');

    console.log('closing data channels');

    this.sendChannel.close();
    this.receiveChannel.close();
    this.localPeerConnection.close();
    this.remotePeerConnection.close();

  }

  _handleAreaChange1 = (e, { value }) => {
    //console.log('your input in area 1', value);
    //this.dataChannelSend.value = value;
    this.setState({dataChannelSendValue: value});

    console.log('--- what is current state: ', this.state);
  }

  _handleAreaChange2 = (e, { value}) => {
    //console.log('your input in area 2', value);
    //this.dataChannelReceive.value = value;
    this.setState({dataChannelReceiveValue: value});
  }




  render() {
    return (
    <div>
      <video autoPlay controls ref={el => this.localVideo = el} ></video>
      <video autoPlay controls ref={el => this.remoteVideo = el} ></video>

      <div>
        <TextArea onChange={this._handleAreaChange1} value={this.state.dataChannelSendValue} ref = { el => this.dataChannelSend = el }  placeholder='1: Press Start 2: Enter text 3: Press Send' rows={6} style={{ minHeight: 100 }}/>
        <TextArea onChange={this._handleAreaChange2} value={this.state.dataChannelReceiveValue} ref = { el => this.dataChannelReceive = el } placeholder='Tell us more' rows={6} style={{ minHeight: 100 }}/>
      </div>
      <div>
        <Button primary onClick={this._handleQVGA}>320X240</Button>
        <Button primary onClick={this._handleVGA}>640X480</Button>
        <Button primary onClick={this._handleHD}>1280X960</Button>



        <Button primary onClick={this._handleStart}>Start</Button>
        <Button primary onClick={this._handleCall}>Call</Button>
        <Button primary onClick={this._handleHangUp}>Hang Up</Button>


        <Button primary onClick={this._createConnection}>Msg-Start</Button>
        <Button primary onClick={this._sendData}>Msg-Send</Button>
        <Button primary onClick={this._closeDataChannels}>Msg-Stop</Button>


      </div>

    </div>
    )

  }
}


export default MyVideo;