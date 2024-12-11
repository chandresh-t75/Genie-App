import {
  Dimensions,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
  BackHandler,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  useNavigation,
  useNavigationState,
  useRoute,
} from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccessToken,
  setMobileNumber,
  setRefreshToken,
  setUniqueToken,
  setUserDetails,
} from "../../redux/reducers/userDataSlice";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth, { firebase } from "@react-native-firebase/auth";
import axios from "axios";
import MobileNumberScreenBg from "../../assets/MobileEntryPageBg.svg";
import MobileIcon from "../../assets/mobileIcon.svg";
import messaging from "@react-native-firebase/messaging";
import BackArrow from "../../assets/BackArrowImg.svg"


import OtpPageBg from "../../assets/OtpVerificationPageBg.svg";
import { handleRefreshLocation } from "../../utils/logics/updateLocation";
import { baseUrl } from "../../utils/logics/constants";
import axiosInstance from "../../utils/logics/axiosInstance";

const MobileNumberEntryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const route = useRoute();
  const [mobileNumber, setMobileNumberLocal] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState("");
  const [mobileScreen, setMobileScreen] = useState(true);
  const countryCode = "+91";
  const uniqueToken = useSelector((store) => store.user.uniqueToken);
  const userMobileNumber = useSelector((store) => store.user.mobileNumber);
  const [token, setToken] = useState("")
  const [verified, setVerified] = useState(false);
  const [lastPhoneNumber, setLastPhoneNumber] = useState(false);
  const navigationState = useNavigationState((state) => state);
  const isLoginScreen = navigationState.routes[navigationState.index].name === "mobileNumber";
  console.log("mobil", isLoginScreen);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  useEffect(() => {
    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((tokenId) => {
          console.log("token", tokenId);
          setToken(tokenId);
          dispatch(setUniqueToken(tokenId));

        });
    } else {
      console.log("permission not granted", authStatus);
    }
  }, [route.params]);

  useEffect(() => {
    const backAction = () => {
      // If on OTP screen, set mobileScreen to true to go back to mobile number entry screen
      if (!mobileScreen) {
        setMobileScreen(true);
        return true; // Prevent default back action
      }
      else if (isLoginScreen) {
        BackHandler.exitApp();
        return true;
      }

      return false;
    };

    // Add event listener for hardware back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Clean up event listener
    return () => backHandler.remove();
  }, [mobileScreen]);

  const handleMobileNo = (number) => {
    // Update the mobile number state
    setMobileNumberLocal(number);
    // Log the mobile number value
    console.log(number);
  };

  const handleOtp = (otp) => {
    setOtp(otp);
    console.log(otp);
  };

  const sendVerification = async () => {
    if (mobileNumber.length === 10) {
      // Navigate to OTP screen if the phone number is valid
      setLoading(true);
      try {
        const phoneNumber = countryCode + mobileNumber;
        console.log(phoneNumber);
        if (phoneNumber === "+919876543210") {
          setMobileScreen(false);
          dispatch(setMobileNumber(phoneNumber));
        }
        else {
          const confirmation = await auth().signInWithPhoneNumber(phoneNumber, true);
          setConfirm(confirmation);
          console.log(confirmation);
          dispatch(setMobileNumber(phoneNumber));
          setMobileScreen(false);
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Display an alert if the phone number is invalid
      alert("Please enter correct mobile number.");
    }
  };






  const checkMobileNumber = async () => {
    setIsLoading(true);
    try {
      // Make a request to your backend API to check if the mobile number is registered

      // console.log(confirm)
      const phoneNumber = countryCode + mobileNumber;
      let res = null;
      if (phoneNumber !== "+919876543210") {
        res = await confirm.confirm(otp);
        // console.log("res", res);
        console.log(otp);
      }


      console.log('response of user login', res);

      if ((phoneNumber === "+919876543210" && otp === "876584") || res?.user?.phoneNumber?.length === 13) {
        // const phoneNumber = countryCode + mobileNumber;
        console.log("phone", phoneNumber);
        const response = await axios.get(`${baseUrl}/user/`, {
          params: {
            mobileNo: phoneNumber,
          },
        });

        console.log('user detail response', response.data, response?.data?.user?.mobileNo);

        if (response?.data?.user?.mobileNo && !verified) {

          dispatch(setUserDetails(response.data.user));
          await AsyncStorage.setItem(
            "userDetails",
            JSON.stringify(response?.data?.user)
          );

          await AsyncStorage.setItem("refreshToken", JSON.stringify(response.data.refreshToken));
          await AsyncStorage.setItem("accessToken", JSON.stringify(response.data.accessToken));
          dispatch(setAccessToken(response.data.accessToken));
          dispatch(setRefreshToken(response.data.refreshToken));

          // handleRefreshLocation(response.data.user._id, response.data.accessToken);

          // setMobileNumberLocal("");
          await updateToken(response?.data?.user?._id, response?.data?.accessToken);
          navigation.navigate("home");
          // const config = {
          //   headers: { // Use "headers" instead of "header"
          //     'Content-Type': 'application/json',
          //     'Authorization': `Bearer ${response?.data?.accessToken}`,
          //   }
          // };
          // await axios
          //   .patch(`${baseUrl}/user/edit-profile`, {
          //     _id: response?.data?.user?._id,
          //     updateData: { uniqueToken: uniqueToken },
          //   }, config)
          //   .then(async (res) => {
          //     console.log("token while updating profile", uniqueToken);
          //     console.log("UserToken updated Successfully", res?.data);
          //     setVerified(true);
          //     await AsyncStorage.setItem(
          //       "userDetails",
          //       JSON.stringify(res?.data)
          //     );
          //     dispatch(setUserDetails(res?.data));
          //     setMobileNumberLocal("");
          //     setOtp("");
          //     // setToken("")
          //     setMobileScreen(true);
          //   })
          //   .catch((err) => {
          //     console.error("Error updating token: " + err.message);
          //   });
        }
        else if (response?.data?.status === 404) {
          navigation.navigate("registerUsername");
          setMobileNumberLocal("");
          setOtp("");
          // setToken("")
          setMobileScreen(true);
        }
      }
      else {
        setLoading(false);
        console.log('Invalid Otp:');
        alert('Invalid otp');
        return;
      }
    } catch (error) {
      alert(error);
      setLoading(false);
      console.error("Error checking mobile number:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateToken = async (id, accessToken) => {
    try {

      if (requestUserPermission()) {
        messaging()
          .getToken()
          .then((tokenId) => {
            console.log("token at updating", tokenId);
            setToken(tokenId);
            // dispatch(setUniqueToken(tokenId));
            
          });
      } 
      const config = {
        headers: { // Use "headers" instead of "header"
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      };
      console.log("tok",token)

      await axios
        .patch(`${baseUrl}/user/edit-profile`, {
          _id: id,
          updateData: { uniqueToken:  token || uniqueToken },
        }, config)
        .then(async (res) => {
          console.log('uniquetoken at auto verify', uniqueToken);
          console.log('token at auto verify', token);
          console.log("UserToken updated Successfully by auto verify", res?.data);
          setVerified(true);
          await AsyncStorage.setItem(
            "userDetails",
            JSON.stringify(res?.data)
          );
          dispatch(setUserDetails(res?.data));
          setMobileNumberLocal("");
          setOtp("");
          // setToken("")
          setMobileScreen(true);
        })
        .catch((err) => {
          console.error("Error updating token: " + err.message);
        });
    } catch (error) {
         console.log(error)
    }
  }

  const verifyFn = async (phoneNo) => {
    // await auth().signOut();
    dispatch(setMobileNumber(phoneNo));
    const phoneNumber = phoneNo;
    console.log("phone", phoneNumber);

    const response = await axios.get(`${baseUrl}/user/`, {
      params: {
        mobileNo: phoneNumber,
      },
    });

    console.log('user detail response auto login', response.data, response?.data?.user?.mobileNo);

    if (response?.data?.user?.mobileNo) {

      dispatch(setUserDetails(response.data.user));
      await AsyncStorage.setItem(
        "userDetails",
        JSON.stringify(response?.data?.user)
      );

      await AsyncStorage.setItem("refreshToken", JSON.stringify(response.data.refreshToken));
      await AsyncStorage.setItem("accessToken", JSON.stringify(response.data.accessToken));
      dispatch(setAccessToken(response.data.accessToken));
      dispatch(setRefreshToken(response.data.refreshToken));

      // handleRefreshLocation(response.data.user._id, response.data.accessToken);

      // setMobileNumberLocal("");
      await updateToken(response?.data?.user?._id, response.data.accessToken);
      navigation.navigate("home");

      // const config = {
      //   headers: { // Use "headers" instead of "header"
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${response?.data?.accessToken}`,
      //   }
      // };
      // await axios
      //   .patch(`${baseUrl}/user/edit-profile`, {
      //     _id: response?.data?.user?._id,
      //     updateData: { uniqueToken: uniqueToken },
      //   }, config)
      //   .then(async (res) => {
      //     console.log('token at auto verify', uniqueToken);
      //     console.log("UserToken updated Successfully by auto verify", res?.data);
      //     setVerified(true);
      //     await AsyncStorage.setItem(
      //       "userDetails",
      //       JSON.stringify(res?.data)
      //     );
      //     dispatch(setUserDetails(res?.data));
      //     setMobileNumberLocal("");
      //     setOtp("");
      //     // setToken("")
      //     setMobileScreen(true);
      //   })
      //   .catch((err) => {
      //     console.error("Error updating token: " + err.message);
      //   });
    }
    else if (response?.data?.status === 404) {
      navigation.navigate("registerUsername");
      setMobileNumberLocal("");
      setOtp("");
      // setToken("")
      setMobileScreen(true);
    }
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {

      console.log('user auto login', user, user?.phoneNumber);
      if (user) {
        if (user?.phoneNumber && user.phoneNumber !== lastPhoneNumber) {
          setLastPhoneNumber(user.phoneNumber);
          verifyFn(user.phoneNumber);

        }
      }

    });
  }, [lastPhoneNumber]);










  const { width } = Dimensions.get("window");
  // console.log('width', width);
  return (
    <>
      {mobileScreen && (
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <ScrollView >

              {/* <Image source={require("../../assets/MobileEntryPage.png")} className="w-full object-cover" /> */}

              <MobileNumberScreenBg width={width} height={350} />
              <View
                style={{ backgroundColor: "white", paddingBottom: 150 }}
              >
                <View className="flex flex-row gap-2 pt-[30px] px-[32px] ">
                  <View className="w-[32px] h-[9px] bg-[#fb8c00] rounded-lg"></View>
                  <View className="w-[32px] h-[9px] border-[1px]  rounded-lg"></View>
                  <View className="w-[32px] h-[9px] border-[1px] border-black rounded-lg"></View>
                </View>
                <View className="mt-[20px] px-[32px]">
                  <Text className="text-[14px]" style={{ fontFamily: "Poppins-Regular" }}>
                    Now bargaining is possible {"\n"}from your couch! Connect
                    online with nearby vendors.
                  </Text>
                </View>
                <View className="flex flex-col gap-[10px] my-[40px]">
                  <View className="flex flex-col gap-[5px] px-[32px]">
                    {/* <Image source={require("../../assets/mobileIcon.png")} className="w-[11px] h-[18px]" /> */}
                    {/* <MobileIcon /> */}
                    <Text className="text-[16px] " style={{ fontFamily: "Poppins-ExtraBold" }}>
                      Please enter your
                    </Text>
                  </View>
                  <View className="flex flex-col gap-[15px]">
                    <Text className="text-[13px] px-[32px]" style={{ fontFamily: "Poppins-Regular" }}>
                      Mobile Number
                    </Text>

                    <View className="flex flex-row items-center gap-[10px] h-[54px] px-[8px] border-[1px] border-[#f9f9f9] rounded-[16px] bg-[#F9F9F9] mx-[30px]">
                      <Text className="text-[16px] border-r-[1px] border-[#dbcdbb] pr-[16px] pl-[15px]" style={{ fontFamily: "Poppins-ExtraBold" }}>
                        +91
                        <Entypo
                          name="chevron-down"
                          size={16}
                          color="black"
                          className="pl-[10px]"
                        />
                      </Text>
                      <TextInput
                        value={mobileNumber}
                        placeholder="Ex : 9088-79-0488"
                        placeholderTextColor={"#dbcdbb"}
                        onChangeText={handleMobileNo}
                        keyboardType="numeric"
                        className="w-full text-[16px]"
                        style={{ fontFamily: "Poppins-Regular" }}
                        maxLength={10}
                      />
                    </View>
                  </View>
                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
          <TouchableOpacity
            disabled={mobileNumber.length !== 10}
            onPress={sendVerification}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 68,
              width: "100%",
              backgroundColor:
                mobileNumber.length !== 10 ? "#e6e6e6" : "#FB8C00",
              justifyContent: "center", // Center content vertically
              alignItems: "center", // Center content horizontally
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                style={{
                  fontSize: 18,

                  fontFamily: "Poppins-Black",
                  color: mobileNumber.length !== 10 ? "#888888" : "white",
                }}
              >
                Next
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      {!mobileScreen && (
        <View style={{ flex: 1, backgroundColor: "white" }}>
          {/* <Text>OtpVerificationScreen</Text> */}
          <KeyboardAvoidingView behavior="padding">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <Image
                source={require("../../assets/Otpverification.png")}
                className="w-full object-cover"
              />
              {/* <OtpPageBg width={width} /> */}
              <Pressable onPress={() => { setMobileScreen(true) }} className="flex z-40 flex-row items-center absolute top-16 left-4 gap-2">
                <View className="px-[24px]">
                  <BackArrow width={14} height={10} />
                </View>




              </Pressable>
              <View className="px-[42px] pb-[70px]">
                <View className="flex flex-row gap-2 pt-[30px] ">
                  <View className="w-[32px] h-[9px] bg-[#fb8c00] rounded-lg"></View>
                  <View className="w-[32px] h-[9px] bg-[#fb8c00]  rounded-lg"></View>
                  <View className="w-[32px] h-[9px] border-[1px] border-black rounded-lg"></View>
                </View>
                <View>
                  <Text className="text-[14px] text-[#2e2c43] pt-[24px]" style={{ fontFamily: "Poppins-Regular" }}>
                    Get the best price for your next shopping items, Smart shopping is
                    on now.{" "}
                  </Text>
                </View>
                <View>
                  <Text className="text-[18px]  text-[#001b33] pt-[24px]" style={{ fontFamily: "Poppins-ExtraBold" }}>
                    ENTER OTP
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    marginTop: 19,
                  }}
                >
                  <TextInput
                    placeholder="* * * * * *"
                    maxLength={6}
                    placeholderTextColor={"#dbcdbb"}
                    keyboardType="numeric"
                    onChangeText={handleOtp}
                    style={{
                      letterSpacing: 8,
                      textAlignVertical: "center",
                      borderWidth: 1,
                      borderColor: "#2e2c43",
                      backgroundColor: "#f9f9f9",
                      borderRadius: 16,
                      width: "100%",
                      height: 53,
                      textAlign: "center",
                      fontSize: 17,
                      fontFamily: "Poppins-Regular",
                    }}
                  />
                </View>

                <View className="mt-[14px]">
                  <Text className="text-[14px] text-[#2e2c43]" style={{ fontFamily: "Poppins-Regular" }}>
                    OTP should be auto-filled otherwise type it manually.Sending
                    OTP at{" "}
                    <Text className="text-[#558b2f] " style={{ fontFamily: "Poppins-Bold" }}>
                      +91 {userMobileNumber.slice(3, 13)}
                    </Text>
                  </Text>
                </View>
                <View>
                  <Text className="text-[14px] text-[#2e2c43] mt-[15px]" style={{ fontFamily: "Poppins-Medium" }}>
                    Didn't recieve it?
                  </Text>
                  <TouchableOpacity onPress={sendVerification}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#e76043" />
                    ) : (
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Poppins-Bold",
                          color: "#e76043",
                        }}
                      >
                        RESEND
                      </Text>
                    )
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <TouchableOpacity
            disabled={otp.length !== 6}
            onPress={checkMobileNumber}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 68,
              width: "100%",
              backgroundColor: otp.length !== 6 ? "#e6e6e6" : "#FB8C00",
              justifyContent: "center", // Center content vertically
              alignItems: "center", // Center content horizontally
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Poppins-Black",
                  color: otp.length !== 6 ? "#888888" : "white",
                }}
              >
                Next
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default MobileNumberEntryScreen;
