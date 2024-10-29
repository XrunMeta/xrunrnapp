import {useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {fontSize, getFontFam} from '../../../utils';

const Countdown = ({onFinish, lang, onProblem, restart}) => {
  const [seconds, setSeconds] = useState(599); // Durasi
  const intervalRef = useRef(); // Gunakan useRef untuk menyimpan interval agar tidak ter-reset

  useEffect(() => {
    // Reset countdown ketika "restart" berubah
    setSeconds(599);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds > 0) {
          return prevSeconds - 1;
        } else {
          clearInterval(intervalRef.current); // Hentikan countdown saat habis
          if (onFinish) onFinish(); // Callback ketika countdown selesai
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, [restart]); // Tambahkan "restart" sebagai dependency agar ter-reset

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      {seconds > 0 ? (
        <Text style={styles.disableText}>
          {lang &&
          lang.screen_emailVerification &&
          lang.screen_emailVerification.timer
            ? lang.screen_emailVerification.timer.on
            : ''}{' '}
          {formattedMinutes}:{formattedSeconds}
        </Text>
      ) : (
        <Pressable onPress={onProblem} style={styles.resetPassword}>
          <Text style={styles.emailAuth}>
            {lang &&
            lang.screen_emailVerification &&
            lang.screen_emailVerification.timer
              ? lang.screen_emailVerification.timer.off
              : ''}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emailAuth: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
  disableText: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: '#aeb1b5',
  },
  codeInput: {
    width: 40,
    height: 60,
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('title'),
    color: '#343a59',
    borderBottomWidth: 2,
    borderRadius: 5,
    borderColor: '#cdced4',
    marginHorizontal: 5,
    textAlign: 'center',
  },
});

export default Countdown;
