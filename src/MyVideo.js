import React from 'react';

const MyVideo = () => {
  const _handleLoadStart = e => console.log('#####load start ....');

  return <video width="400" autoPlay controls onLoadedMetadata={_handleLoadStart}></video>
};

export default MyVideo;