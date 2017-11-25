import React, { Component } from 'react';
import fire from './fire';
import { Button } from 'semantic-ui-react';

class TwoVideos extends Component {

  // constructor(props) {
  //   console.log('in constructor....');
  // }

  constructor(props) {
    super(props);
    //state = {};
    console.log('in constructor...');
    console.log('this._localVideo: ', this._localVideo);

    // this.yourId = Math.floor(Math.random()*1000000000);
    // const servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'} ]};
    // this.pc = new RTCPeerConnection(servers);


  }

  state = {};
  _yourId = Math.floor(Math.random()*1000000000);
  _pc;
  _database = fire.database().ref('videos');
  _localStream;

  ////////////////////////////////////////////////////////////////////////////////////////////

  gotLocalIceCandidate = event => {
    if(event.candidate) {
      // Add candidate to the remote PeerConnection
      this.remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
      console.log('Local ICE candidate: \n' + event.candidate.candidate);
    }
  }

  _handleOnIceCandidate = description => {
    console.log('event: ', description);
    this._pc.setLocalDescription(description);
  };

  _handleAddStream = event => {

  };

  componentWillMount() {
    console.log('componentWillMount: ...')
    console.log('this._localVideo: ', this._localVideo);
  }

  /*
  componentDidMount() {

    console.log('componentDidMount: ...')
    console.log('this._localVideo: ', this._localVideo);
    this._pc.onicecandidate = this._handleOnIceCandidate;
    this._pc.onaddstream = this._handleAddStream;

    // let database = fire.database().ref();
    this._database.on('child_added', this._readMessage);


  }
  */

  ////////////////////////////////////// componentDidMount() ///////////////////////////////////////////////////////////

  componentDidMount() {
    console.log('componentDidMount ...');

    // connect to database
    this._database.on('child_added', this._readMessage);


    const handleStream = stream => {
      this._localStream = stream;
      this._localVideo.src = window.URL.createObjectURL(stream);
      // need to call play()
      this._localVideo.play();


      const configuration = {
        'iceServers': [
          {'urls': 'stun:stun.services.mozilla.com'},
          {'urls': 'stun:stun.l.google.com:19302'}
        ]
      };

      // but not sure if I need to add stream to PC
      this._pc = new RTCPeerConnection(configuration);
      this._pc.addStream(stream);

      // once remote stream arrives, show it in the remote video element
      const handleAddStream = event => {
        console.log('onaddstream');
        this._remoteVideo.src = window.URL.createObjectURL(event.stream);
      };
      this._pc.onaddstream = handleAddStream;

      // send any ice candidates to the other peer
      const handleIceCandidate = event => {
        //console.log('=====onicecandidate, use arrow', event);
        if(event.candidate){
          // send to firebase
          //socket.emit('video_call',{user:2, type: 'candidate', candidate: evt.candidate});
          //console.log('in candidate: ',  this);

          this._sendMessage(this._yourId, JSON.stringify({'ice': event.candidate}))
          //this._sendMessage(this._yourId, {type: 'candidate', candidate: event.candidate});
        }
      };

      this._pc.onicecandidate = handleIceCandidate;





      // offer is RTCSessionDescription
      const handleOffer = offer => {
        console.log('offer: ', offer);
        //socket.emit('video_call', {user:2,  type: "offer", offer: offer});
        this._pc.setLocalDescription(offer);
        //console.log('this._pc.localDescription: ', this._pc.localDescription);
        this._sendMessage(this._yourId, JSON.stringify({'sdp': offer}));
      };

      const handleOfferError = error => console.log('Error when creating an offer', error);

      // create an offer
      this._pc.createOffer(handleOffer, handleOfferError);
    };

    const handleStreamError = error => console.log('Stream Error: ', error);

    // get the local stream, show it in the local video element and send it
    navigator.getUserMedia({ audio: true, video: true }, handleStream, handleStreamError);










  }



  /////////////////////////////////////////////////////////////////////////////////////////////////


  /*
  componentDidMount() {
    this._pc.onicecandidate = (event => {
      event.candidate
          ? this._sendMessage(this._yourId, JSON.stringify({'ice': event.candidate}))
          : console.log("Sent All Ice")
    });
    this._pc.onaddstream = (event => {
      console.log('-- this: ', this);
      this.friendsVideo.srcObject = event.stream;
    });

    // let database = fire.database().ref();
    this._database.on('child_added', this._readMessage);
  }
  */


  /////////////////////////////////////////////////////////////////////////////////////////////

  //componentWillMount(){
    // this._pc.onicecandidate = (event => event.candidate?this._sendMessage(this._yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
    // this._pc.onaddstream = (event => this.friendsVideo.srcObject = event.stream);
    //
    // // let database = fire.database().ref();
    // this._database.on('child_added', this._readMessage);


    /* Create reference to messages in Firebase Database */
    // let messagesRef = fire.database().ref('messages').orderByKey().limitToLast(100);
    // messagesRef.on('child_added', snapshot => {
    //   /* Update React state when message is added at Firebase Database */
    //   let message = { text: snapshot.val(), id: snapshot.key };
    //   this.setState({ messages: [message].concat(this.state.messages) });
    // })
  //}
  // addMessage(e){
  //   e.preventDefault(); // <- prevent form submit from reloading the page
  //   /* Send the message to Firebase */
  //   fire.database().ref('messages').push( this.inputEl.value );
  //   this.inputEl.value = ''; // <- clear the input
  // }

  _sendMessage = (senderId, data) => {
    //console.log(' call sendMessage: ', senderId, data);
  // _sendMessage(senderId, data) {
    let msg = this._database.push({ sender: senderId, message: data });
    //console.log('what is msg after sending: ', msg);
    msg.remove();
  }

  _readMessage = data => {
    // console.log('# data: ', JSON.parse(data.val().message));
    //console.log('# sender: ', this._yourId);
    var msg = JSON.parse(data.val().message);
    console.log('# msg: ', msg);
    var sender = data.val().sender;






    if (sender != this._yourId) {
      console.log('-- enter here: ', sender, this._yourId);

      if (msg.ice != undefined) {
        console.log('msg.ice: ', msg.ice);
        this._pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      }


      else if (msg.sdp.type == "offer") {
        this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));


        const handleAnswer = answer => {
          console.log('what is answer: ', answer);
          this._pc.setLocalDescription(answer);
          this._sendMessage(this._yourId, JSON.stringify({'sdp': answer}));
        };

        const handleAnswerError = error => console.log('Answer Error...');

        // create an answer to an offer
        this._pc.createAnswer(handleAnswer, handleAnswerError);
      }

      else if (msg.sdp.type == "answer") {
        this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }

    }


/*

    this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
        .then(() => this._pc.createAnswer())
        .then(answer => this._pc.setLocalDescription(answer))
        .then(() => this._sendMessage(this._yourId, JSON.stringify({'sdp': this._pc.localDescription})));


    this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    */

    //when somebody sends us an offer
    /*
    const handleOffer = offer => {
      this._pc.setRemoteDescription(offer);


      const handleAnswer = answer => {
        console.log('what is answer: ', answer);
        this._pc.setLocalDescription(answer);
        //socket.emit('video_call', {user:2, type: "answer", answer: answer});
      };

      const handleAnswerError = error => console.log('Answer Error...');

      // create an answer to an offer
      this._pc.createAnswer(handleAnswer, handleAnswerError);
    }

    //when we got an answer from a remote user
    const handleAnswer2 = answer => {
      console.log('in handleAnswer2: ', answer);
      this._pc.setRemoteDescription(answer);
    }

    //when we got an ice candidate from a remote user
    const handleCandidate = candidate => {
      console.log('candidate: ', candidate);
      this._pc.addIceCandidate(new RTCIceCandidate(candidate))
    }
    */


  };


  /*
  _readMessage = data => {
  // _readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != this._yourId) {
      if (msg.ice != undefined)
        this._pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      else if (msg.sdp.type == "offer")
        this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
            .then(() => this._pc.createAnswer())
            .then(answer => this._pc.setLocalDescription(answer))
            .then(() => this._sendMessage(this._yourId, JSON.stringify({'sdp': this._pc.localDescription})));
      else if (msg.sdp.type == "answer")
        this._pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
  };
  */

  ////////////////////////////////////// _showMyFace //////////////////////////////////////////////////////////

  _successCB = stream => {
    this._localStream = stream;
    this._localVideo.src = window.URL.createObjectURL(stream);
    this._localVideo.play();
  };

  _errorCB = error => console.log('Error show local face...');

  _showMyFace = () => {
    navigator.getUserMedia({ audio: true, video: true }, this._successCB, this._errorCB);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  /*
  _showMyFace = () => {
    navigator.mediaDevices.getUserMedia({audio:true, video:true})
        .then(stream => {
          console.log('---- pass in stream: ', stream);
          return this.yourVideo.srcObject = stream;
        })
        .then(val => {
          console.log('second stream: ', val);
          // this._pc.addStream(stream);
          this._pc.addStream(val);
        });
  }
  */

  /////////////////////////////////////////// _showFriendsFace /////////////////////////////////////////////////////

  _showFriendsFace = () => {


  };



  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /*
  _showFriendsFace = () => {
    console.log('-- show friend face --');

    this._pc.createOffer()
        .then(offer => {
          console.log('offer: ', offer)
          return this._pc.setLocalDescription(offer);
        })
        .then(val => {
          console.log('-- what is val now', val);
          return this._sendMessage(this._yourId, JSON.stringify({'sdp': this._pc.localDescription}));
    });
  }
  */




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