import React from 'react';

const MyControl = () => {
  const constraints = {audio: false, video: true};

  const video = document.querySelector('video');
  console.log('can i see video: ', video);


  const successCallback = stream => {
    window.stream = stream;
    if (window.URL) {
      console.log('Chrome case');
      video.src = window.URL.createObjectURL(stream);
    } else {
      video.src = stream;
    }
    video.play();
  };

  const errorCallback = error => console.log('navigatior.getUserMedia error: ', error);

  navigator.getUserMedia(constraints, successCallback, errorCallback);

};

export default MyControl;