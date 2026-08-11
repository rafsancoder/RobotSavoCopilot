import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { getRobotTheme } from '../../constants/theme';

type FloatingButtonProps = {
    onPress?: () => void;
};

export function FloatingButton({ onPress }: FloatingButtonProps) {
    const theme = getRobotTheme();

    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.9 : 1 }]}> 
            <View style={[styles.button, { backgroundColor: theme.colors.robotBlue, width: 56, height: 56 }]}> 
                <MaterialCommunityIcons name="robot" size={24} color="#fff" />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        right: 16,
        bottom: 32,
        zIndex: 50
    },
    button: {
        width: 64,
        height: 64,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6
    }
});
