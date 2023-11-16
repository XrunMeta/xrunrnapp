import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import CustomInputEdit from '../../components/CustomInputEdit/CustomInputEdit';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import CustomMultipleChecbox from '../../components/CustomCheckbox/CustomMultipleCheckbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const langData = require('../../../lang.json');

const ModifInfoScreen = ({route}) => {
  const [lang, setLang] = useState({});
  const [lastName, setLastName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [name, setName] = useState('');
  const [tempName, setTempName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [checkedAge, setCheckedAge] = useState(0);
  const [region, setRegion] = useState('');
  const [gender, setGender] = useState('pria');
  const [refferalEmail, setRefferalEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const {flag, countryCode, country} = route.params || {};
  const [areaData, setAreaData] = useState([]);
  const [isListWrapperVisible, setIsListWrapperVisible] = useState(false);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();

  const onSignUp = () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Nama harus diisi');
    } else if (email.trim() === '') {
      Alert.alert('Error', 'Email harus diisi');
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', `Format email tidak valid`);
    } else if (password.trim() === '') {
      Alert.alert('Error', 'Password harus diisi');
    } else if (phoneNumber.trim() === '') {
      Alert.alert('Error', `Nomor Telepon harus diisi`);
    } else if (region.trim() === '') {
      Alert.alert('Error', `Daerah harus diisi`);
    } else {
      console.warn('Cek login');
    }
  };

  const isValidEmail = email => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
  };

  onEmailChange = text => {
    setEmail(text);
    setIsEmailValid(isValidEmail(text));
  };

  const onBack = () => {
    navigation.replace('InfoHome');
  };

  const chooseRegion = (flag, countryCode, country) => {
    navigation.navigate('ChooseRegion', {
      flag: flag,
      countryCode: countryCode,
      country: country,
    });
  };

  const genderSelector = getGender => {
    if (getGender == 0) {
      setGender('pria');
    } else {
      setGender('wanita');
    }
  };

  const ageSelector = getAge => {
    if (getAge == 0) {
      setTempAge('10');
    } else if (getAge == 1) {
      setTempAge('20');
    } else if (getAge == 2) {
      setTempAge('30');
    } else if (getAge == 3) {
      setTempAge('40');
    } else if (getAge == 4) {
      setTempAge('50');
    }
  };

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();

    fetch(
      `https://app.xrun.run/gateway.php?act=app7190-01&country=${
        countryCode ? countryCode : 62
      }`,
    )
      .then(response => response.json())
      .then(jsonData => {
        var jsonToArr = Object.values(jsonData);
        var arrResult = jsonToArr.flat();
        setAreaData(arrResult);
        // setAreaData(jsonData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

    // Get User Information
    fetch(`https://app.xrun.run/gateway.php?act=app7000-01&member=1102`)
      .then(response => response.json())
      .then(jsonData => {
        var userData = jsonData.data[0];

        setUserData(userData);
        console.log(userData);

        // Lastname
        setLastName(userData.firstname);
        setTempLastName(userData.firstname);

        // Firstname
        setName(userData.lastname);
        setTempName(userData.lastName);

        // Password
        var pinChange = formatDate(userData.datepinchanged);
        setPassword(pinChange);

        // Age
        const getAge = justGetNumber(userData.cages);
        setAge(getAge);
        setTempAge(getAge);

        // Remove Loading
        setIsLoading(false);
        console.log('Fetch udah selesai');
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Get Update Area Data
  useEffect(() => {
    fetch(
      `https://app.xrun.run/gateway.php?act=app7190-01&country=${
        countryCode ? countryCode : 62
      }`,
    )
      .then(response => response.json())
      .then(jsonData => {
        var jsonToArr = Object.values(jsonData);
        var arrResult = jsonToArr.flat();
        setAreaData(arrResult);
        // setAreaData(jsonData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [countryCode]);

  // ListWrapper
  const ListWrapper = ({onClose}) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          setIsListWrapperVisible(false);
          onClose();
        }}
        style={{
          flex: 1,
        }}>
        <View
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
          <ScrollView
            style={{
              position: 'absolute',
              top: '56.5%', // Sesuaikan sesuai kebutuhan
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              maxHeight: 155, // Sesuaikan sesuai kebutuhan
              overflowY: 'auto',
              elevation: 4,
              padding: 5,
              marginHorizontal: 25,
            }}>
            {areaData
              .filter(item => {
                return item.description
                  .toLowerCase()
                  .includes(region.toLowerCase());
              })
              .map((item, index) => (
                <Pressable
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#dbdbdb',
                    paddingTop: 5,
                    paddingBottom: 2,
                    marginHorizontal: 5,
                  }}
                  key={index}
                  onPress={() => {
                    setRegion(item.description);
                    setIsListWrapperVisible(false);
                  }}>
                  {console.log(item.description)}
                  <Text style={styles.normalText}>{item.description}</Text>
                </Pressable>
              ))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const closeButton = () => {
    setIsListWrapperVisible(false);
  };

  useEffect(() => {
    if (region !== '') {
      setIsListWrapperVisible(true);
    } else {
      setIsListWrapperVisible(false);
    }
  }, [region]);

  useEffect(() => {
    if (region.trim() !== '') {
      setIsListWrapperVisible(true);
    } else {
      setIsListWrapperVisible(false);
    }
  }, [region]);

  // Format Date
  const formatDate = dateTimeString => {
    // Ubah string tanggal dan waktu menjadi objek Date
    const date = new Date(dateTimeString);

    // Ambil bagian tanggal dalam format YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];

    return formattedDate;
  };

  const onChangePassword = () => {
    console.log('Buka halaman');
    navigation.navigate('ConfirmPasswordEdit');
  };

  const justGetNumber = str => {
    // Menggunakan ekspresi reguler untuk menghapus karakter selain angka
    const angkaPolos = str.replace(/\D/g, '');

    // Mengonversi string yang sudah bersih menjadi nomor
    const angka = parseInt(angkaPolos);

    return isNaN(angka) ? null : angka; // Mengembalikan null jika tidak ada angka
  };

  return (
    <View style={[styles.root]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#343a59" />
          <Text
            style={{
              color: 'white',
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
            }}>
            {lang && lang.screen_map && lang.screen_map.section_marker
              ? lang.screen_map.section_marker.loader
              : ''}
          </Text>
          {/* Show Loading While Data is Load */}
        </View>
      ) : (
        ''
      )}
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Modify Information</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/*  Field - Last Name */}
        <CustomInputEdit
          title="Last Name"
          label="Last Name"
          placeholder="Your last name"
          value={lastName}
          setValue={setLastName}
          onSaveChange={() => setLastName(tempLastName)}
          onBack={() => setTempLastName(lastName)}
          content={
            <View
              style={{
                flex: 1,
                paddingHorizontal: 25,
                marginTop: 30,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  marginBottom: -10,
                  color: '#343a59',
                }}>
                Last Name
              </Text>
              <TextInput
                value={tempLastName}
                onChangeText={setTempLastName}
                placeholder="Your last name"
                placeholderTextColor="#a8a8a7"
                style={{
                  height: 40,
                  paddingBottom: -10,
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  color: '#343a59',
                  borderBottomColor: '#cccccc',
                  borderBottomWidth: 1,
                  paddingRight: 30,
                  paddingLeft: -10,
                }}
              />
            </View>
          }
        />

        {/*  Field - Name */}
        <CustomInputEdit
          title="Name"
          label="Name"
          placeholder="Your name"
          value={name}
          setValue={setName}
          onSaveChange={() => setName(tempName)}
          onBack={() => setTempName(name)}
          content={
            <View
              style={{
                flex: 1,
                paddingHorizontal: 25,
                marginTop: 30,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  marginBottom: -10,
                  color: '#343a59',
                }}>
                Name
              </Text>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                placeholder="Your name"
                placeholderTextColor="#a8a8a7"
                style={{
                  height: 40,
                  paddingBottom: -10,
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  color: '#343a59',
                  borderBottomColor: '#cccccc',
                  borderBottomWidth: 1,
                  paddingRight: 30,
                  paddingLeft: -10,
                }}
              />
            </View>
          }
        />

        {/*  Field - Email */}
        <CustomInputEdit
          title="Email"
          label="Email"
          placeholder="xrun@xrun.run"
          value={userData.email}
          setValue={onEmailChange}
          isDisable={true}
          content={
            <View
              style={{
                flex: 1,
                paddingHorizontal: 25,
                marginTop: 30,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  marginBottom: -10,
                  color: '#343a59',
                }}>
                Email
              </Text>
              <TextInput
                value={userData.email}
                onChangeText={onEmailChange}
                placeholder="xrun@xrun.run"
                placeholderTextColor="#a8a8a7"
                style={{
                  height: 40,
                  paddingBottom: -10,
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  color: '#343a59',
                  borderBottomColor: '#cccccc',
                  borderBottomWidth: 1,
                  paddingRight: 30,
                  paddingLeft: -10,
                }}
              />
            </View>
          }
        />

        {/*  Field - Phone Number */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              backgroundColor: '#e5e5e56e',
              height: 30,
              marginTop: 5,
            }}>
            <Pressable
              style={{flexDirection: 'row', marginBottom: -5}}
              onPress={() => chooseRegion(flag, countryCode, country)}
              disabled={true}>
              <Image
                resizeMode="contain"
                style={{
                  width: 35,
                  marginRight: 10,
                  marginBottom: 5,
                  marginLeft: 5,
                }}
                source={
                  flag == undefined
                    ? {
                        uri: 'https://app.xrun.run/flags/id.png',
                      }
                    : {
                        uri: flag,
                      }
                }
              />
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  color: '#a8a8a7',
                  alignSelf: 'center',
                  paddingRight: 10,
                }}>
                +{countryCode == undefined ? '62' : countryCode}
              </Text>
            </Pressable>
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              value={userData.mobile}
              onChangeText={text => setPhoneNumber(text)}
              editable={false}
            />
          </View>
        </View>

        {/* Password */}
        <View style={{width: '100%', paddingHorizontal: 25, marginTop: 30}}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 13,
              marginBottom: -10,
              color: '#343a59',
              zIndex: 1,
            }}>
            Password
          </Text>
          <TouchableOpacity onPress={onChangePassword}>
            <View
              style={[
                {
                  height: 40,
                  borderBottomColor: '#cccccc',
                  borderBottomWidth: 1,
                  justifyContent: 'center',
                },
              ]}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  color: '#343a59',
                  paddingRight: 30,
                  paddingLeft: -10,
                }}>
                Final change date :{' '}
                <Text
                  style={{color: '#ffc404', fontFamily: 'Poppins-SemiBold'}}>
                  {password}
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/*  Field - Age */}
        <CustomInputEdit
          title="Age"
          label="Age"
          placeholder="Age"
          value={age + 's'}
          setValue={setAge}
          onSaveChange={() => {
            setAge(tempAge);
          }}
          onBack={() => setTempAge(age)}
          content={
            <View style={[styles.formGroup, {zIndex: -1}]}>
              <Text style={styles.label}>Age</Text>
              <CustomMultipleChecbox
                texts={['10', '20', '30', '40', '50']}
                count={5}
                singleCheck={true}
                wrapperStyle={styles.horizontalChecbox}
                defaultCheckedIndices={() => {
                  // Masalah disini soal checked buat di Age Modify
                  const getCheckedAge = parseInt(age) / 10 - 1;
                  setCheckedAge(getCheckedAge);
                  return [getCheckedAge];
                }}
                onCheckChange={ageSelector}
              />
            </View>
            // Halo selamat malam semua hari ini saya mengerjakan data parsing dan UI pada last name, name, password (dengan konfirmasi keamanan), dan pilihan umur. Terimakasih
          }
        />

        {/*  Field - Gender */}
        <CustomInput
          label={'Gender'}
          placeholder={'Gender'}
          value={region}
          setValue={setRegion}
          isPassword={false}
        />

        {/*  Field - Region */}
        <CustomInput
          label={
            lang && lang.screen_signup && lang.screen_signup.area
              ? lang.screen_signup.area.label
              : ''
          }
          placeholder={
            lang && lang.screen_signup && lang.screen_signup.area
              ? lang.screen_signup.area.placeholder
              : ''
          }
          value={region}
          setValue={setRegion}
          isPassword={false}
        />
        {isListWrapperVisible && <ListWrapper onClose={closeButton} />}
        {/*  Field - Gender */}
        <View style={[styles.formGroup, {zIndex: -1}]}>
          <Text style={styles.label}>
            {lang && lang.screen_signup && lang.screen_signup.gender
              ? lang.screen_signup.gender.label
              : ''}
          </Text>
          <CustomMultipleChecbox
            texts={[
              lang && lang.screen_signup && lang.screen_signup.gender
                ? lang.screen_signup.gender.male
                : '',
              lang && lang.screen_signup && lang.screen_signup.gender
                ? lang.screen_signup.gender.female
                : '',
              ,
            ]}
            count={2}
            singleCheck={true}
            wrapperStyle={styles.horizontalChecbox}
            defaultCheckedIndices={[0]}
            onCheckChange={genderSelector}
          />
        </View>
        {/*  Field - Age */}
        <View style={[styles.formGroup, {zIndex: -1}]}>
          <Text style={styles.label}>
            {lang && lang.screen_signup && lang.screen_signup.age
              ? lang.screen_signup.age.label
              : ''}
          </Text>
          <CustomMultipleChecbox
            texts={['10', '20', '30', '40', '50']}
            count={5}
            singleCheck={true}
            wrapperStyle={styles.horizontalChecbox}
            defaultCheckedIndices={[0]}
            onCheckChange={ageSelector}
          />
        </View>
        {/* Field - Referral Email */}
        <CustomInput
          label={
            lang && lang.screen_signup && lang.screen_signup.referral
              ? lang.screen_signup.referral.label
              : ''
          }
          placeholder={
            lang && lang.screen_signup && lang.screen_signup.referral
              ? lang.screen_signup.referral.placeholder
              : ''
          }
          value={refferalEmail}
          setValue={setRefferalEmail}
          isPassword={false}
        />
        {/* Bottom Section */}
        <View style={[styles.bottomSection]}>
          <View style={styles.additionalLogin}>
            <Text style={styles.normalText}>
              {lang && lang.screen_signup && lang.screen_signup.add_desc
                ? lang.screen_signup.add_desc.ad1
                : ''}{' '}
              {'\n'}
              {lang && lang.screen_signup && lang.screen_signup.add_desc
                ? lang.screen_signup.add_desc.ad2
                : ''}
            </Text>
          </View>
          <Pressable onPress={onSignUp} style={styles.buttonSignUp}>
            <Image
              source={require('../../../assets/images/icon_next.png')}
              resizeMode="contain"
              style={styles.buttonSignUpImage}
            />
          </Pressable>
          {/*  */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#343a59',
    margin: 10,
  },
  bottomSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
  },
  normalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#343a59',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
    marginBottom: -5,
  },
  buttonSignUp: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    height: 100,
    justifyContent: 'center',
  },
  buttonSignUpImage: {
    height: 80,
    width: 80,
  },
  horizontalChecbox: {
    flexDirection: 'row',
    paddingTop: 5,
    alignSelf: 'flex-start',
  },
  formGroup: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
  },
  input: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#a8a8a7',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingHorizontal: 5,
    paddingBottom: -10,
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
});

export default ModifInfoScreen;
