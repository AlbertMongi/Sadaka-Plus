// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   Animated,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';

// export default function Register() {
//   const router = useRouter();

//   const [fullName, setFullName] = useState('');
//   const [phoneNo, setPhoneNo] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [buttonOpacity] = useState(new Animated.Value(1));
//   const [loading, setLoading] = useState(false);

//   const splitFullName = (name) => {
//     const parts = name.trim().split(/\s+/);
//     const firstName = parts[0] || '';
//     const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
//     const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
//     return { firstName, middleName, lastName };
//   };

//   const handleRegister = async () => {
//     setErrorMessage('');

//     if (!fullName || !phoneNo) {
//       setErrorMessage('Please fill in all fields.');
//       return;
//     }

//     const { firstName, middleName, lastName } = splitFullName(fullName);

//     if (!firstName || !lastName) {
//       setErrorMessage('Please enter at least a first and last name.');
//       return;
//     }

//     setLoading(true);
//    console.log("Sending request to backend...");

//     try {
//       const response = await fetch('${API_BASE_URL}/api/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           firstName,
//           middleName,
//           lastName,
//           phoneNo,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setErrorMessage('');
//         router.push('/otp');
//       } else {
//         setErrorMessage(data.message || 'Registration failed. Please try again.');
//       }
//     } catch (error) {
//       setErrorMessage('Network error. Please try again later.');
//       console.error('Registration error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onPressIn = () => {
//     Animated.timing(buttonOpacity, {
//       toValue: 0.7,
//       duration: 100,
//       useNativeDriver: true,
//     }).start();
//   };

//   const onPressOut = () => {
//     Animated.timing(buttonOpacity, {
//       toValue: 1,
//       duration: 100,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Create Account</Text>
//         <Text style={styles.subtitle}>Join the Sadaka Community</Text>
//       </View>

//       <View style={styles.form}>
//         {errorMessage !== '' && (
//           <Text style={styles.errorText}>{errorMessage}</Text>
//         )}

//         <TextInput
//           placeholder="Full Name"
//           placeholderTextColor="#FFA54F"
//           style={styles.input}
//           value={fullName}
//           onChangeText={setFullName}
//           autoCapitalize="words"
//         />
//         <TextInput
//           placeholder="Phone Number"
//           placeholderTextColor="#FFA54F"
//           style={styles.input}
//           value={phoneNo}
//           onChangeText={setPhoneNo}
//           keyboardType="phone-pad"
//         />

//         <Animated.View style={{ width: '80%', opacity: buttonOpacity }}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={[
//               styles.button,
//               { backgroundColor: fullName && phoneNo ? '#FF8C00' : '#e0c8a3' },
//             ]}
//             disabled={!(fullName && phoneNo) || loading}
//             onPress={handleRegister}
//             onPressIn={onPressIn}
//             onPressOut={onPressOut}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? 'Registering...' : 'Register'}
//             </Text>
//             {!loading && (
//               <Ionicons
//                 name="person-add-outline"
//                 size={18}
//                 color="#fff"
//                 style={{ marginLeft: 6 }}
//               />
//             )}
//           </TouchableOpacity>
//         </Animated.View>

//         <TouchableOpacity onPress={() => router.push('/login')}>
//           <Text style={styles.loginLink}>
//             Already have an account? <Text>Login</Text>
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     marginBottom: 30,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FF8C00',
//   },
//   subtitle: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 6,
//   },
//   form: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   input: {
//     width: '80%',
//     height: 42,
//     borderWidth: 1,
//     borderColor: '#FF8C00',
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 12,
//   },
//   button: {
//     flexDirection: 'row',
//     width: '100%',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   loginLink: {
//     color: '#FF8C00',
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   errorText: {
//     color: '#FF8C00',
//     marginBottom: 10,
//     fontSize: 13,
//     fontWeight: '500',
//     textAlign: 'center',
//     paddingHorizontal: 10,
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

// ✅ Only define API_BASE_URL once
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonOpacity] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(false);

  const splitFullName = (name) => {
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
    return { firstName, middleName, lastName };
  };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!fullName || !phoneNo) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    const { firstName, middleName, lastName } = splitFullName(fullName);

    if (!firstName || !lastName) {
      setErrorMessage('Please enter at least a first and last name.');
      return;
    }

    setLoading(true);
    console.log('Sending request to backend...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          phoneNo,
        }),
      });

      const contentType = response.headers.get('content-type');
      const data =
        contentType && contentType.includes('application/json')
          ? await response.json()
          : await response.text(); // fallback in case response is HTML

      if (response.ok) {
        setErrorMessage('');
        router.push({
          pathname: '/otp',
          params: {
            token: data.token,
            phoneNo: phoneNo,
          },
        });
      } else {
        setErrorMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again later.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPressIn = () => {
    Animated.timing(buttonOpacity, {
      toValue: 0.7,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Sadaka Community</Text>
      </View>

      <View style={styles.form}>
        {errorMessage !== '' && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#FFA54F"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#FFA54F"
          style={styles.input}
          value={phoneNo}
          onChangeText={setPhoneNo}
          keyboardType="phone-pad"
        />

        <Animated.View style={{ width: '80%', opacity: buttonOpacity }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.button,
              { backgroundColor: fullName && phoneNo ? '#FF8C00' : '#e0c8a3' },
            ]}
            disabled={!(fullName && phoneNo) || loading}
            onPress={handleRegister}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registering...' : 'Register'}
            </Text>
            {!loading && (
              <Ionicons
                name="person-add-outline"
                size={18}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginLink}>
            Already have an account? <Text>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 42,
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginLink: {
    color: '#FF8C00',
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF8C00',
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
