import React from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text,
  Dimensions
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withDelay,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

const { width } = Dimensions.get('window');

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1000, easing: Easing.ease }),
      -1,
      true
    );
    
    opacity.value = withRepeat(
      withDelay(
        500,
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Animated.View style={[styles.pulseCircle, animatedStyle]} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    position: 'absolute',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#616161',
    fontWeight: '500',
  },
});