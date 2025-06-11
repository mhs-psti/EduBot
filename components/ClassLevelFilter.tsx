import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ClassLevelFilterProps {
  selectedLevel: string;
  levels: string[];
  onSelectLevel: (level: string) => void;
}

export const ClassLevelFilter: React.FC<ClassLevelFilterProps> = ({
  selectedLevel,
  levels,
  onSelectLevel,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [buttonLayout, setButtonLayout] = React.useState({ x: 0, y: 0, width: 160, height: 48 });
  const dropdownOpacity = useSharedValue(0);
  const dropdownScale = useSharedValue(0.95);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Opening animation
      dropdownOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      dropdownScale.value = withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      // Closing animation
      dropdownOpacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      dropdownScale.value = withTiming(0.95, {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  const dropdownStyle = useAnimatedStyle(() => {
    return {
      opacity: dropdownOpacity.value,
      transform: [
        { scale: dropdownScale.value },
        { translateY: -2 }
      ],
    };
  });

  const handleButtonLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setButtonLayout({ x, y, width, height });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={toggleDropdown}
        activeOpacity={0.7}
        onLayout={handleButtonLayout}
      >
        <Text style={styles.buttonText}>
          {selectedLevel === 'All' ? 'All Classes' : `Class ${selectedLevel}`}
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color="#3F51B5" />
        ) : (
          <ChevronDown size={20} color="#3F51B5" />
        )}
      </TouchableOpacity>

      {/* Modal approach for guaranteed top stacking */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={toggleDropdown}
      >
        <TouchableWithoutFeedback onPress={toggleDropdown}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[
                styles.modalDropdown, 
                dropdownStyle,
                {
                  top: buttonLayout.y + buttonLayout.height + 4,
                  left: buttonLayout.x,
                  width: buttonLayout.width,
                }
              ]}>
                {levels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.dropdownItem,
                      selectedLevel === level && styles.selectedItem,
                    ]}
                    onPress={() => {
                      onSelectLevel(level);
                      toggleDropdown();
                    }}
                  >
                    <Text 
                      style={[
                        styles.dropdownItemText,
                        selectedLevel === level && styles.selectedItemText,
                      ]}
                    >
                      {level === 'All' ? 'All Classes' : `Class ${level}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Fallback absolute positioning (if Modal doesn't work well) */}
      {/* {isOpen && (
        <Animated.View style={[styles.dropdown, dropdownStyle]}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.dropdownItem,
                selectedLevel === level && styles.selectedItem,
              ]}
              onPress={() => {
                onSelectLevel(level);
                toggleDropdown();
              }}
            >
              <Text 
                style={[
                  styles.dropdownItemText,
                  selectedLevel === level && styles.selectedItemText,
                ]}
              >
                {level === 'All' ? 'All Classes' : `Class ${level}`}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
    position: 'relative',
    zIndex: 9999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3F51B5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalDropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 10000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedItem: {
    backgroundColor: '#EEF1FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#424242',
  },
  selectedItemText: {
    fontWeight: '600',
    color: '#3F51B5',
  },
});