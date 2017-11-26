import React, { Component } from 'react';
import fire from './fire';
import { Button } from 'semantic-ui-react';

class TwoVideos extends Component {

  state = {};
  _yourId = null;
  _database = null;
  _pc = null;
  _localStream = null;


  ////////////////////////////////////// componentDidMount() ///////////////////////////////////////////////////////////

  componentDidMount() {

    this._yourId = Math.floor(Math.random()*1000000000);
    this._database = fire.database().ref('videos');

    this._database.on('child_added', this._readMessage);

    const configuration = {
      'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
      ]
    };

    // but not sure if I need to add stream to PC
    this._pc = new RTCPeerConnection(configuration);

    const handleIceCandidate = event => {
      if(event.candidate) {
        this._sendMessage(this._yourId, JSON.stringify({'ice': event.candidate}))
      } else {
        console.log("Sent All Ice")
      }
    };

    const handleIceCandidateError = error => {
      console.log('Ice Candidate Error ...');
    };

    this._pc.onicecandidate = handleIceCandidate;


    const handleAddStream = event => {
      this._remoteVideo.srcObject = event.stream;
    };

    const handleAddStreamError = error => console.log('Add Stream Error ...');

    this._pc.onaddstream = handleAddStream;


  }



  /////////////////////////////////////////////////////////////////////////////////////////////



  _sendMessage = (senderId, data) => {
    //console.log(' call sendMessage: ', senderId, data);
    // _sendMessage(senderId, data) {
    let msg = this._database.push({ sender: senderId, message: data });
    //console.log('what is msg after sending: ', msg);
    msg.remove();
  }


  /////////////////////////////////////////////////////////////////////////////////////////////

  _readMessage = data => {
    // console.log('# data: ', JSON.parse(data.val().message));
    //console.log('# sender: ', this._yourId);
    var msg = JSON.parse(data.val().message);
    console.log('========= receive something===== msg: ', msg);
    var sender = data.val().sender;
    console.log('========= test sender===== sender: ', this._yourId, sender);


    if (sender != this._yourId) {
      console.log('====== receive something from remote part: ', sender, this._yourId);

      if (msg.ice != undefined) {
        console.log('msg.ice: ', msg.ice);
        console.log('======== 1) receive remote ice candidate: ', msg.ice)
        this._pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      }


      else if (msg.sdp.type == "offer") {
        console.log('==== 2) receive remtoe  offer: ', msg.sdp)
        this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));


        // create local answer and sent to remote
        const handleAnswer = answer => {
          console.log('====== 3: my local answer to remote offer: ', answer);
          this._pc.setLocalDescription(answer);
          console.log('=== send my answer to remote ')
          this._sendMessage(this._yourId, JSON.stringify({'sdp': answer}));
        };

        const handleAnswerError = error => console.log('Answer Error...');

        // after receive remote offer, create an answer to an remote offer
        this._pc.createAnswer(handleAnswer, handleAnswerError);
      }

      else if (msg.sdp.type == "answer") {
        console.log('====== 3) receive remote answer: ', msg.sdp)
        this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }

    }






  };




  ////////////////////////////////////// _showMyFace //////////////////////////////////////////////////////////


  _showMyFace = () => {
    const handleStream = stream => {
      console.log('---- 1: create stream -----: ', stream);
      this._localStream = stream;
      // show it in the local video element
      this._localVideo.src = window.URL.createObjectURL(stream);
      // need to call play()
      this._localVideo.play();

      this._pc.addStream(stream);
    };

    const handleStreamError = error => console.log('Stream Error: ', error);

    // 1) get the local stream, show it in the local video element and send it
    navigator.getUserMedia({ audio: true, video: true }, handleStream, handleStreamError);
  };


  /////////////////////////////////////////// _showFriendsFace /////////////////////////////////////////////////////




  _showFriendsFace = () => {
    const handleOffer = offer => {
      console.log('handleOffer: ', offer);
      this._pc.setLocalDescription(offer);
      this._sendMessage(this._yourId, JSON.stringify({'sdp': offer}));
    };

    const handleOfferError = error => {
      console.log('Offer error....')
    };

    this._pc.createOffer(handleOffer, handleOfferError);
  };



  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  render() {
    return (
        <div>
          <video ref={el => this._localVideo = el} autoPlay muted></video>
          <video ref={el => this._remoteVideo = el} autoPlay></video>
          <br />
          <Button primary onClick={this._showMyFace}>Start</Button>
          <Button primary onClick={this._showFriendsFace}>Call</Button>
        </div>
    )
  }


}

export default TwoVideos;