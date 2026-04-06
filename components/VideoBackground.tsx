import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface Props {
  opacity?: number;
}

export default function VideoBackground({ opacity = 0.3 }: Props) {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '110%',
          objectFit: 'cover',
          objectPosition: 'center top',
          opacity: opacity,
          filter: 'blur(2px)',
        }}
      >
        <source src={require('../assets/cosmic-background.mp4')} type="video/mp4" />
      </video>
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0e0520',
    opacity: 0.4,
  },
});
