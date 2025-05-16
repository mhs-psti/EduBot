import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
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
  const dropdownHeight = useSharedValue(0);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    dropdownHeight.value = withTiming(
      isOpen ? 0 : levels.length * 48,
      {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    );
  };

  const dropdownStyle = useAnimatedStyle(() => {
    return {
      height: dropdownHeight.value,
      opacity: dropdownHeight.value === 0 ? 0 : 1,
      overflow: 'hidden',
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={toggleDropdown}
        activeOpacity={0.7}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
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
    dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden', // tambahkan untuk jaga-jaga
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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