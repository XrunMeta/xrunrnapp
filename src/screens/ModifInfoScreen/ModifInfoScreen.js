import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
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
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [valueAge, setValueAge] = useState(2200);
  const [gender, setGender] = useState(0);
  const [tempGender, setTempGender] = useState(0);

  const {flag, countryCode} = route.params || {};
  const [userData, setUserData] = useState({});
  const [astorUserData, setAstorUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [areaModalVisible, setAreaModalVisible] = useState(false);

  const [region, setRegion] = useState({});
  const [tempRegion, setTempRegion] = useState({});
  const [regionData, setRegionData] = useState([]);

  const [country, setCountry] = useState({});
  const [tempCountry, setTempCountry] = useState({});
  const [countryData, setCountryData] = useState([]);

  const navigation = useNavigation();

  const onBack = () => {
    navigation.replace('InfoHome');
  };

  const ageSelector = getAge => {
    if (getAge == 0) {
      setTempAge('10');
      setValueAge(2210);
    } else if (getAge == 1) {
      setTempAge('20');
      setValueAge(2220);
    } else if (getAge == 2) {
      setTempAge('30');
      setValueAge(2230);
    } else if (getAge == 3) {
      setTempAge('40');
      setValueAge(2240);
    } else if (getAge == 4) {
      setTempAge('50');
      setValueAge(2250);
    }
  };

  const genderSelector = getGender => {
    if (getGender == 0) {
      setTempGender(2110); // Boy/Men
    } else {
      setTempGender(2111); // Girl/Women
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

    const fetchData = async () => {
      try {
        // Get User Data from Asyncstorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        setAstorUserData(astorJsonData);

        // Get User Information
        const userResponse = await fetch(
          `https://app.xrun.run/gateway.php?act=app7000-01&member=${astorJsonData.member}`,
        );
        const userJsonData = await userResponse.json();
        const userData = userJsonData.data[0];
        setUserData(userData);

        // Lastname
        setLastName(userData.firstname);
        setTempLastName(userData.firstname);

        // Firstname
        setName(userData.lastname);
        setTempName(userData.lastname);

        // Password
        var pinChange = formatDate(userData.datepinchanged);
        setPassword(pinChange);

        // Age
        const getAge = justGetNumber(userData.cages);
        setAge(getAge);
        setTempAge(getAge);
        setValueAge(userData.ages);

        // Gender
        setGender(userData.gender);
        setTempGender(userData.gender);

        // Region & Country
        var countryData = {
          cDesc: userData.cdesc,
          cCode: userData.country,
        };

        var regionData = {
          rDesc: userData.rdesc,
          rCode: userData.region,
        };

        setCountry(countryData);
        setTempCountry(countryData);
        setRegion(regionData);
        setTempRegion(regionData);

        // Get Data Country
        const countriesResponse = await fetch(
          'https://app.xrun.run/gateway.php?act=countries',
        );
        const countriesData = await countriesResponse.json();
        setCountryData(countriesData);

        // Get Region Data as Selected Country
        const regionsResponse = await fetch(
          'https://app.xrun.run/gateway.php?act=app7190-01&country=' +
            userData.country,
        );
        const regionsData = await regionsResponse.json();
        setRegionData(regionsData.data);

        // Remove Loading
        setIsLoading(false);
        console.log('Fetch udah selesai');
      } catch (error) {
        console.error('Terjadi kesalahan:', error);
      }
    };

    fetchData(); // Get Data from API
    getLanguage(); // Get Language
  }, []);

  // Format Date
  const formatDate = dateTimeString => {
    // Ubah string tanggal dan waktu menjadi objek Date
    const date = new Date(dateTimeString);

    // Ambil bagian tanggal dalam format YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];

    return formattedDate;
  };

  const onChangePassword = () => {
    navigation.navigate('ConfirmPasswordEdit');
  };

  const justGetNumber = str => {
    // Menggunakan ekspresi reguler untuk menghapus karakter selain angka
    const angkaPolos = str.replace(/\D/g, '');

    // Mengonversi string yang sudah bersih menjadi nomor
    const angka = parseInt(angkaPolos);

    return isNaN(angka) ? null : angka; // Mengembalikan null jika tidak ada angka
  };

  const saveChangesToAPI = async (
    act,
    memberId,
    additionalKey,
    additionalValue,
    bodyData,
  ) => {
    try {
      const apiUrl = `https://app.xrun.run/gateway.php?act=${act}&member=${memberId}&${additionalKey}=${additionalValue}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan perubahan.');
      }

      console.log('Perubahan berhasil disimpan ke API');
    } catch (error) {
      console.error('Terjadi kesalahan:', error.message);
    }
  };

  const openCountryModal = () => {
    setCountryModalVisible(true);
  };

  const openAreaModal = () => {
    setAreaModalVisible(true);
  };

  const onSelectCountry = selectedCountry => {
    setTempCountry({
      cDesc: selectedCountry.country,
      cCode: selectedCountry.callnumber,
    });

    setTempRegion({
      rDesc: 'Please Select',
      rCode: 0,
    });

    fetch(
      'https://app.xrun.run/gateway.php?act=app7190-01&country=' +
        selectedCountry.callnumber,
    )
      .then(response => response.json())
      .then(data => {
        setRegionData(data.data);
      })
      .catch(error => {
        console.error('Error fetching areas:', error);
      });

    // Setelah mengirim data, Anda bisa menutup modal
    setCountryModalVisible(false);
  };

  // On Select Area / Region
  const onSelectArea = selectedArea => {
    setTempRegion({
      rDesc: selectedArea.description,
      rCode: selectedArea.subcode,
    });

    // Setelah mengirim data, Anda bisa menutup modal
    setAreaModalVisible(false);
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
        </View>
      ) : (
        //
        <View style={[[styles.root], {width: '100%'}]}>
          {console.log(`
            Countries data : ${countryData.length}
            Region data    : ${regionData.length}
          `)}
          <View style={{flexDirection: 'row'}}>
            <View style={{position: 'absolute', zIndex: 1}}>
              <ButtonBack onClick={onBack} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>
                {lang && lang.screen_modify_information
                  ? lang.screen_modify_information.title
                  : ''}
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{width: '100%'}}>
            <View style={{paddingBottom: 35}}>
              <CustomInputEdit
                title={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.lastname.label
                    : ''
                }
                label={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.lastname.label
                    : ''
                }
                placeholder={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.lastname.placeholder
                    : ''
                }
                value={lastName}
                setValue={setLastName}
                onSaveChange={() => {
                  setLastName(tempLastName);
                  saveChangesToAPI(
                    'app7120-01',
                    astorUserData.member,
                    'firstname',
                    tempLastName,
                    {
                      firstname: tempLastName,
                    },
                  );

                  return 1;
                }}
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
                      {lang && lang.screen_modify_information
                        ? lang.screen_modify_information.lastname.label
                        : ''}
                    </Text>
                    <TextInput
                      value={tempLastName}
                      onChangeText={setTempLastName}
                      placeholder={
                        lang && lang.screen_modify_information
                          ? lang.screen_modify_information.lastname.placeholder
                          : ''
                      }
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
                title={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.name.label
                    : ''
                }
                label={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.name.label
                    : ''
                }
                placeholder={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.name.placeholder
                    : ''
                }
                value={name}
                setValue={setName}
                onSaveChange={() => {
                  setName(tempName);
                  saveChangesToAPI(
                    'app7130-01',
                    astorUserData.member,
                    'lastname',
                    tempName,
                    {
                      lastname: tempName,
                    },
                  );

                  return 1;
                }}
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
                      {lang && lang.screen_modify_information
                        ? lang.screen_modify_information.name.label
                        : ''}
                    </Text>
                    <TextInput
                      value={tempName}
                      onChangeText={setTempName}
                      placeholder={
                        lang && lang.screen_modify_information
                          ? lang.screen_modify_information.name.placeholder
                          : ''
                      }
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
                title={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.email.label
                    : ''
                }
                label={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.email.label
                    : ''
                }
                placeholder={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.email.placeholder
                    : ''
                }
                value={userData.email}
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
                      {lang && lang.screen_modify_information
                        ? lang.screen_modify_information.email.label
                        : ''}
                    </Text>
                    <TextInput
                      value={userData.email}
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
                <Text style={styles.label}>
                  {lang && lang.screen_modify_information
                    ? lang.screen_modify_information.phone.label
                    : ''}
                </Text>
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
                    editable={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View
                style={{width: '100%', paddingHorizontal: 25, marginTop: 30}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 13,
                    marginBottom: -10,
                    color: '#343a59',
                    zIndex: 1,
                  }}>
                  {lang && lang.screen_modify_information
                    ? lang.screen_modify_information.password.label
                    : ''}
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
                      {lang && lang.screen_modify_information
                        ? lang.screen_modify_information.password.extstr
                        : ''}{' '}
                      <Text
                        style={{
                          color: '#ffc404',
                          fontFamily: 'Poppins-SemiBold',
                        }}>
                        {password}
                      </Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/*  Field - Age */}
              <CustomInputEdit
                title={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.age.label
                    : ''
                }
                label={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.age.label
                    : ''
                }
                placeholder={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.age.label
                    : ''
                }
                value={age + 's'}
                setValue={setAge}
                onSaveChange={() => {
                  saveChangesToAPI(
                    'app7170-01',
                    astorUserData.member,
                    'ages',
                    valueAge,
                    {
                      ages: valueAge,
                    },
                  );
                  setAge(tempAge);

                  return 1;
                }}
                onBack={() => setTempAge(age)}
                content={
                  <View style={[styles.formGroup, {zIndex: -1}]}>
                    <Text style={styles.label}>
                      {lang && lang.screen_modify_information
                        ? lang.screen_modify_information.age.label
                        : ''}
                    </Text>
                    <CustomMultipleChecbox
                      texts={['10', '20', '30', '40', '50']}
                      count={5}
                      singleCheck={true}
                      wrapperStyle={styles.horizontalChecbox}
                      defaultCheckedIndices={() => {
                        const getCheckedAge = parseInt(age) / 10 - 1;
                        return [getCheckedAge];
                      }}
                      onCheckChange={ageSelector}
                    />
                  </View>
                }
              />

              {/*  Field - Gender */}
              <CustomInputEdit
                title={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.gender.label
                    : ''
                }
                label={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.gender.label
                    : ''
                }
                placeholder={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.gender.label
                    : ''
                }
                value={
                  gender == 2110
                    ? lang && lang.screen_modify_information
                      ? lang.screen_modify_information.gender.opt1
                      : ''
                    : lang && lang.screen_modify_information
                    ? lang.screen_modify_information.gender.opt2
                    : ''
                }
                setValue={setGender}
                onSaveChange={() => {
                  saveChangesToAPI(
                    'app7180-01',
                    astorUserData.member,
                    'gender',
                    tempGender,
                    {
                      gender: tempGender,
                    },
                  );
                  setGender(tempGender);

                  return 1;
                }}
                onBack={() => setTempGender(gender)}
                content={
                  <View style={[styles.formGroup, {zIndex: -1}]}>
                    <Text style={styles.label}>
                      {lang && lang.screen_modify_information
                        ? lang.screen_modify_information.gender.label
                        : ''}
                    </Text>
                    <CustomMultipleChecbox
                      texts={[
                        lang && lang.screen_modify_information
                          ? lang.screen_modify_information.gender.opt1
                          : '',
                        lang && lang.screen_modify_information
                          ? lang.screen_modify_information.gender.opt2
                          : '',
                      ]}
                      count={2}
                      singleCheck={true}
                      wrapperStyle={styles.horizontalChecbox}
                      defaultCheckedIndices={gender == 2110 ? [0] : [1]}
                      onCheckChange={genderSelector}
                    />
                  </View>
                }
              />

              {/*  Field - Area */}
              <CustomInputEdit
                title={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.area.label
                    : ''
                }
                label={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.area.label
                    : ''
                }
                placeholder={
                  lang && lang.screen_modify_information
                    ? lang.screen_modify_information.area.placeholder
                    : ''
                }
                value={country.cDesc + ', ' + region.rDesc}
                setValue={setRegion.rDesc}
                onSaveChange={() => {
                  if (tempRegion.rCode === 0) {
                    Alert.alert(
                      'Error',
                      lang && lang.screen_modify_information
                        ? lang.screen_modify_information.area.empty
                        : '',
                    );
                    return 0;
                  } else {
                    setCountry({
                      cDesc: tempCountry.cDesc,
                      cCode: tempCountry.cCode,
                    });

                    setRegion({
                      rDesc: tempRegion.rDesc,
                      rCode: tempRegion.rCode,
                    });

                    const saveChangeArea = async () => {
                      try {
                        const apiUrl = `https://app.xrun.run/gateway.php?act=app7190-02&member=${astorUserData.member}&country=${tempCountry.cCode}&region=${tempRegion.rCode}`;

                        const response = await fetch(apiUrl, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            country: tempCountry.cCode,
                            region: tempRegion.rCode,
                          }),
                        });

                        if (!response.ok) {
                          throw new Error('Gagal menyimpan perubahan.');
                        }

                        console.log(
                          'Save Success! => ' +
                            tempCountry.cCode +
                            ' - ' +
                            tempRegion.rCode,
                        );
                      } catch (error) {
                        console.error('Terjadi kesalahan:', error.message);
                      }
                    };

                    saveChangeArea();

                    return 1;
                  }
                }}
                onBack={() => {
                  setTempLastName(lastName);
                  setTempCountry({
                    cDesc: country.cDesc,
                    cCode: country.cCode,
                  });

                  setTempRegion({
                    rDesc: region.rDesc,
                    rCode: region.rCode,
                  });
                }}
                content={
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        width: '100%',
                        paddingHorizontal: 25,
                        marginTop: 30,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: 13,
                          marginBottom: -10,
                          color: '#343a59',
                          zIndex: 1,
                        }}>
                        {lang && lang.screen_modify_information
                          ? lang.screen_modify_information.area.label_country
                          : ''}
                      </Text>
                      <TouchableOpacity onPress={() => openCountryModal()}>
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
                              marginBottom: -7,
                            }}>
                            {tempCountry.cDesc + ` (+${tempCountry.cCode})`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        width: '100%',
                        paddingHorizontal: 25,
                        marginTop: 30,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: 13,
                          marginBottom: -10,
                          color: '#343a59',
                          zIndex: 1,
                        }}>
                        {lang && lang.screen_modify_information
                          ? lang.screen_modify_information.area.label_area
                          : ''}
                      </Text>
                      <TouchableOpacity onPress={() => openAreaModal()}>
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
                              marginBottom: -7,
                            }}>
                            {tempRegion.rDesc
                              ? tempRegion.rDesc
                              : 'Please Select'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                }
              />
            </View>
          </ScrollView>

          {/* Country Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={countryModalVisible}
            onRequestClose={() => {
              setModalCountryVisible(false);
            }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={countryData}
                  keyExtractor={item => item.code}
                  ListEmptyComponent={() => (
                    <View style={{marginVertical: 20}}>
                      <Text style={[styles.normalText, {textAlign: 'center'}]}>
                        {lang && lang.screen_modify_information
                          ? lang.screen_modify_information.modal.empty
                          : ''}
                      </Text>
                    </View>
                  )}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => onSelectCountry(item)}>
                      <Text style={[styles.modalItemText, {marginRight: 10}]}>
                        +{item.callnumber}
                      </Text>
                      <Text style={styles.modalItemText}>{item.country}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setCountryModalVisible(false)}>
                  <Text style={styles.closeButtonText}>
                    {lang && lang.screen_modify_information
                      ? lang.screen_modify_information.close
                      : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Area Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={areaModalVisible}
            onRequestClose={() => {
              setModalAreaVisible(false);
            }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={regionData}
                  keyExtractor={item => item.subcode}
                  ListEmptyComponent={() => (
                    <View style={{marginVertical: 20}}>
                      <Text style={[styles.normalText, {textAlign: 'center'}]}>
                        {lang && lang.screen_modify_information
                          ? lang.screen_modify_information.modal.empty
                          : ''}
                      </Text>
                    </View>
                  )}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => onSelectArea(item)}>
                      <Text style={styles.modalItemText}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setAreaModalVisible(false)}>
                  <Text style={styles.closeButtonText}>
                    {lang && lang.screen_modify_information
                      ? lang.screen_modify_information.close
                      : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
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

  // Styles for Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 150,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
  },
  modalItemText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#343a59',
  },
  closeButton: {
    marginTop: 5,
    backgroundColor: '#343a59',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
});

export default ModifInfoScreen;
