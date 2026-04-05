import * as Haptics from 'expo-haptics';

class SoundService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async play(soundType: 'levelUp' | 'questComplete' | 'coin' | 'achievement' | 'click') {
    if (!this.enabled) return;
    
    try {
      await Haptics.notificationAsync(
        soundType === 'levelUp' 
          ? Haptics.NotificationFeedbackType.Success
          : soundType === 'questComplete'
          ? Haptics.NotificationFeedbackType.Success
          : soundType === 'achievement'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  async playClick() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {}
  }
}

export const soundService = new SoundService();
