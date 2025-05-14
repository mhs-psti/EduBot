import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

interface FloatingActionButtonProps {
  onPress: () => void;
  title?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  title,
}) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { 
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      true
    );

    return () => {
      cancelAnimation(scale);
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{title}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.pulse, pulseStyle]} />
        <MessageSquare color="#FFFFFF" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
  },
  labelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  pulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F51B5',
    opacity: 0.5,
  },
});