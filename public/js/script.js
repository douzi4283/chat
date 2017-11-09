//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
  // apiKey: "AIzaSyCTw5HVSY8nZ7QpRp_gBOUyde_IPU9UfXU",
  // authDomain: "websitebeaver-de9a6.firebaseapp.com",
  // databaseURL: "https://websitebeaver-de9a6.firebaseio.com",
  // storageBucket: "websitebeaver-de9a6.appspot.com",
  // messagingSenderId: "411433309494"

  apiKey: "AIzaSyAivuocdoQVZYS5CYCitvDAiDV7Jh2uwEg",
  authDomain: "douzi-d45bc.firebaseapp.com",
  databaseURL: "https://douzi-d45bc.firebaseio.com",
  // projectId: "douzi-d45bc",
  storageBucket: "douzi-d45bc.appspot.com",
  messagingSenderId: "796630894603"
};



firebase.initializeApp(config);

var database = firebase.database().ref();

console.log('firebase database: ', database);

var yourVideo = document.getElementById("yourVideo");

console.log('-yourVideo: ', yourVideo);

var friendsVideo = document.getElementById("friendsVideo");

console.log('-friendsVideo: ', friendsVideo);

var yourId = Math.floor(Math.random()*1000000000);
//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'} with the information from your account
//var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'},
// {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'}]};

console.log('-your id: ', yourId);
var servers = {'iceServers': [

    {'urls': 'stun:stun.services.mozilla.com'},
  {'urls': 'stun:stun.l.google.com:19302'},
  {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'}




]};






var pc = new RTCPeerConnection(servers);

console.log('-pc: ', pc);

const handleOnIceCandidate = event => {
  if(event.candidate) {
    sendMessage(yourId, JSON.stringify({'ice': event.candidate}))
  } else {
    console.log("Sent All Ice");
  }
}


//pc.onicecandidate = handleOnIceCandidate;



pc.onicecandidate = (event => event.candidate?
    sendMessage(yourId, JSON.stringify({'ice': event.candidate}))
    :console.log("Sent All Ice") );

pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

function sendMessage(senderId, data) {
  var msg = database.push({ sender: senderId, message: data });
  msg.remove();
}



function readMessage(data) {
  var msg = JSON.parse(data.val().message);
  var sender = data.val().sender;
  if (sender != yourId) {
    if (msg.ice != undefined)
      pc.addIceCandidate(new RTCIceCandidate(msg.ice));
    else if (msg.sdp.type == "offer")
      pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
          .then(() => pc.createAnswer())
          .then(answer => pc.setLocalDescription(answer))
          .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
    else if (msg.sdp.type == "answer")
      pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  }
};

database.on('child_added', readMessage);



function showMyFace() {
  console.log('---showMyFace ---')
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
      .then(stream => {
        console.log('first stream: ', stream);
        console.log('yourVideo: ', yourVideo);
        return yourVideo.srcObject = stream
      })
      .then(stream => pc.addStream(stream));
}

function showFriendsFace() {
  pc.createOffer()
      .then(offer => pc.setLocalDescription(offer) )
      .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
}