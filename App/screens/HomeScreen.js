import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  AppState,
  RefreshControl,
  Animated,
  Linking,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useIsFocused,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  setSpades,
  setCurrentSpade,
  setUserDetails,
  setUserLongitude,
  setUserLatitude,
  setIsHome,
} from "../redux/reducers/userDataSlice";
import io from "socket.io-client";
import { socket } from "../utils/scoket.io/socket";
import { theme } from "../theme/theme.js";
import "../../tailwind.config.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { notificationListeners } from "../notification/notificationServices.js";
import HomeImage from "../assets/homeImg.svg";
import GenieCulturTapLogo from "../assets/genie-homescreen-logo.svg";
import GenieLogo from "../assets/Genie-Icon.svg";
import HomeScreenBg from "../assets/homeScreenBg.svg";
import HomeMain from "../assets/HomeMain.svg";
import {
  formatDateTime,
  getGeoCoordinates,
  getLocationName,
} from "../utils/logics/Logics";
import Home0 from "../assets/Home0.png";
import Home1 from "../assets/Home1.png";
import Home2 from "../assets/Home2.png";
import Home3 from "../assets/Home3.png";
import Home4 from "../assets/Home4.png";
import Home5 from "../assets/Home5.png";
import Home6 from "../assets/Home6.png";
import Home7 from "../assets/Home7.png";
import DropArrow from "../assets/drop-arrow.svg";
import ProfileIcon from "../assets/ProfileIcon.svg";
import HistoryIcon from "../assets/historyIcon.svg";
import { baseUrl } from "../utils/logics/constants";
import { handleRefreshLocation } from "../utils/logics/updateLocation";
import axiosInstance from "../utils/logics/axiosInstance";
import NetworkError from "./components/NetworkError";
import Calender from "../assets/calender.svg";
import Time from "../assets/time.svg";
import SpadeIcon from "../assets/SpadeIcon.svg";
import { Octicons } from "@expo/vector-icons";
import TextTicker from "react-native-text-ticker";
import Offer from "../assets/offer.svg";
import DeviceInfo from "react-native-device-info";
import MobileIcon from "../assets/mobileIcon.svg";
import RightArrow from "../assets/arrow-right.svg";
import SmallArrow from "../assets/small-arrow.svg";
import YouTubeIframe from "react-native-youtube-iframe";
import Category1 from "../assets/category1.png";
import Category2 from "../assets/category2.png";
import Category3 from "../assets/category3.png";
import Category4 from "../assets/category4.png";
import Category5 from "../assets/category5.png";
import Category6 from "../assets/category6.png";
import Category7 from "../assets/category7.png";
import Category8 from "../assets/category8.png";
import Category9 from "../assets/category9.png";
import Category10 from "../assets/category10.png";
import Category11 from "../assets/category11.png";
import Service1 from "../assets/service1.png";
import Service2 from "../assets/service2.png";
import Service3 from "../assets/service3.png";
import Service4 from "../assets/service4.png";
import Service5 from "../assets/service5.png";
import Service6 from "../assets/service6.png";
import Service7 from "../assets/service7.png";
import Tab11 from "../assets/tab11.svg";
import Tab2 from "../assets/tab2.svg";
import Tab3 from "../assets/tab3.svg";
import Tab4 from "../assets/tab4.svg";
// import Search from "../assets/search.svg";
import Search from "../assets/search-black.svg";

import {
  emtpyRequestImages,
  setEstimatedPrice,
  setExpectedPrice,
  setNearByStoresCategory,
  setRequestCategory,
  setRequestImages,
  setSuggestedImages,
} from "../redux/reducers/userRequestsSlice";
import { useFocusEffect } from "@react-navigation/native";
import Share from "react-native-share";
import SignUpModal from "./components/SignUpModal";
import LocationRefreshModal from "./components/LocationRefreshModal.js";

const { width } = Dimensions.get("window");

const images = [Home0, Home1, Home2, Home3, Home4, Home5, Home6, Home7];
const categoriess = [
  {
    cat: Category1,
    name: "Consumer Electronics & Accessories - Home appliances and equipment etc",
  },
  { cat: Category2, name: "Fashion/Clothings - Top, bottom, dresses" },
  { cat: Category3, name: "Fashion Accessories - Jewellery, Gold & Diamond" },
  { cat: Category4, name: "Fashion Accessories - Shoes, bags etc" },
  {
    cat: Category5,
    name: "Fashion Accessories - Sharee, suits, kurti & dress materials etc",
  },
  { cat: Category6, name: "Gifts, Kids Games,Toys & Clothings" },
  { cat: Category7, name: "Luxury Watches" },
  { cat: Category8, name: "Hardware - Plumbing, Paint,& Electricity" },
  { cat: Category9, name: "Sports Nutrition - Whey Pro etc" },
  { cat: Category10, name: "Hardware - Cement, Hand tools, Powertools etc" },
  { cat: Category11, name: "Kitchen Utensils & Kitchenware" },
];
const servicess = [
  {
    cat: Service1,
    name: "Services & Repair, Consumer Electronics & Accessories - Home appliances and equipment etc",
  },
  {
    cat: Service2,
    name: "Services & Repair, Consumer Electronics & Accessories - Mobile, Laptop, digital products etc",
  },
  // { cat: Service3, name: "Clock Repair & Services" },
  { cat: Service4, name: "Automotive Parts/Services - 2 wheeler Fuel based" },
  { cat: Service5, name: "Automotive Parts/Services - 4 wheeler Fuel based" },
  {
    cat: Service6,
    name: "Services & Repair, Heavy Construction & Commercial Vehicles - JCB, Cranes, Trucks etc",
  },
  { cat: Service7, name: "Electrical Services & Repair - Electrician" },
];
const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user.userDetails);
  const spades = useSelector((state) => state.user.spades);
  const currentSpade = useSelector((store) => store.user.currentSpade);
  const navigationState = useNavigationState((state) => state);
  const currentLocation = useSelector((store) => store.user.currentLocation);
  const isHomeScreen =
    navigationState.routes[navigationState.index].name === "home";
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const [socketConnected, setSocketConnected] = useState(false);
  const accessToken = useSelector((store) => store.user.accessToken);
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (width - 90));
    setCurrentIndex(index);
  };
  const [spadesLoading, setSpadesLoading] = useState(false);
  const [createSpadeLoading, setCreateSpadeLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [refreshing, setRefreshing] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [signUpModal, setSignUpModal] = useState(false);
  const userLongitude = useSelector((store) => store.user.userLongitude);
  const userLatitude = useSelector((store) => store.user.userLatitude);
const [locationRefresh, setLocationRefresh] = useState(false)
  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      // alert('Video has finished playing!');
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const scrollX = useRef(new Animated.Value(0)).current;

  const getAppVersion = async () => {
    try {
      await axios.get(`${baseUrl}/user/current-app-version`).then((res) => {
        if (res.status === 200) {
          console.log(DeviceInfo.getVersion(), res.data);
          setCurrentVersion(res.data);
        }
      });
    } catch (error) {
      console.error("Error getting app version ", error.message);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: 0.5 * width,
          duration: 0, // Adjust the duration for speed
          useNativeDriver: true,
        }),
        Animated.timing(scrollX, {
          toValue: -width, // Reset to start
          duration: 20000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scrollX]);

  useEffect(() => {
    const backAction = () => {
      if (isHomeScreen) {
        BackHandler.exitApp();
        return true;
      } else {
        return false;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Clean up the event listener
  }, [isHomeScreen]);

  const fetchData = async () => {
    setSpadesLoading(true);
    // connectSocket();

    const userData = JSON.parse(await AsyncStorage.getItem("userDetails"));
    if (!userData?._id) return;
    dispatch(setUserDetails(userData));
    try {
      // console.log('userHomeScreem', userDetails._id);
      const config = {
        headers: {
          // Use "headers" instead of "header"
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          id: userData?._id,
        },
      };
      const response = await axiosInstance.get(
        `${baseUrl}/user/getspades`,
        config
      );

      // console.log('HomeScreen', response.data);

      // Check the status from the response object
      setSpadesLoading(false);
      if (response.status === 200) {
        // Dispatch the action with the spades data
        const spadesData = response.data;
        spadesData.map((spade, index) => {
          const dateTime = formatDateTime(spade.createdAt);
          spadesData[index].createdAt = dateTime.formattedTime;
          spadesData[index].updatedAt = dateTime.formattedDate;
        });
        dispatch(setSpades(spadesData));

        // console.log('spades', response.data);
      } else {
        console.error("No Spades Found");
      }
    } catch (error) {
      setSpadesLoading(false);
      if (!error?.response?.status) {
        setNetworkError(true);
        console.log("Network Error occurred: ");
      }
      console.error("Error while finding spades", error);
    }
  };

  useEffect(() => {
    fetchData();
    getAppVersion();
  }, []);

  /////////////////////////////////////////
  useFocusEffect(
    useCallback(() => {
      dispatch(setSuggestedImages([]));
      dispatch(setExpectedPrice(0));
      dispatch(setEstimatedPrice(0));
      dispatch(setRequestImages([]));
    }, [navigation])
  );

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //HomeScreen Socket Settings

  const connectSocket = async () => {
    // socket.emit("setup", currentSpadeRetailer?.users[1]._id);
    const userData = JSON.parse(await AsyncStorage.getItem("userDetails"));
    if (!userData?._id) return;
    if (userData) {
      const userId = userData._id;
      const senderId = userId;

      socket.emit("setup", { userId, senderId });
      //  console.log('Request connected with socket with id', spadeId);
      socket.on("connected", () => setSocketConnected(true));
      console.log("HomeScreen socekt connect with id", userData._id);
    }
  };

  const updateLocationHomeScreen = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem("userDetails"));
      if (!userData?._id) return;
      const token = JSON.parse(await AsyncStorage.getItem("accessToken"));
      if (userData) {
        console.log("refreshing location home screen");
        handleRefreshLocation(userData._id, token);
      }
    } catch (error) {
      console.error("Error while updating location");
    }
  };
  useEffect(() => {
    connectSocket();
    updateLocationHomeScreen();

    return () => {
      socket.disconnect();
      console.log("Socket Disconnected Successfully");
    };
  }, []);

  ////////////////////////////////////////////////////////////////////////Connecting the socket when app comes to foreground from background////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const subcription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        connectSocket();
        console.log("App has come to the foreground!");
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
    });
    return () => subcription.remove();
  }, []);

  //////////////////////////////////////////////////////////////////////Getting data from socket/////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const handleMessageReceived = (updatedSpade) => {
      console.log("Update message received at Home socket", updatedSpade._id);
      let spadesData = [...spades];
      const idx = spadesData.findIndex(
        (spade) => spade._id === updatedSpade._id
      );

      console.log("Spdes updated ", idx);
      if (idx !== -1) {
        let data = spadesData.filter((spade) => spade._id === updatedSpade._id);
        // let spadeToUpdate = { ...spadesData[idx] };
        let data2 = spadesData.filter(
          (spade) => spade._id !== updatedSpade._id
        );

        if (updatedSpade.bidAccepted === "accepted") {
          data[0] = {
            ...data[0],
            unread: true,
            requestAcceptedChat: updatedSpade.chatId,
            requestActive: "completed",
          };
        } else {
          data[0] = { ...data[0], unread: true };
        }
        // console.log('data', data);
        spadesData = [...data, ...data2];

        // console.log("Spdes updated Successfully", data.length, data2.length);
        dispatch(setSpades(spadesData));
      }
    };

    socket.on("update userspade", handleMessageReceived);

    // Cleanup the effect
    return () => {
      socket.off("update userspade", handleMessageReceived);
    };
  }, [spades]);

  /////////////////

  const fetchNearByStores = useCallback(async () => {
    try {
      // console.log('User coors', userLongitude, userLatitude, userDetails.longitude, userDetails.latitude);
      const longitude =
        userLongitude !== 0 ? userLongitude : userDetails.longitude;
      const latitude = userLatitude !== 0 ? userLatitude : userDetails.latitude;
      // console.log(longitude, latitude);
      if (!longitude || !latitude) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          longitude: longitude,
          latitude: latitude,
        },
      };
      await axiosInstance
        .get(`${baseUrl}/retailer/stores-near-me`, config)
        .then((res) => {
          const categories = res.data.map((category, index) => {
            return { id: index + 1, name: category };
          });

          // Log the categories array to verify
          console.log(categories);
          dispatch(setNearByStoresCategory(categories));
        });
    } catch (error) {
      console.error("error while fetching nearby stores", error);
    }
  }); ///////////////////////////////////////////////////Fetch user details for getting payment status ////////////////////////////////////////////////////////////////////////////////////

  const fetchUserDetailsToCreateSpade = async () => {
    if (!userDetails?._id) {
      setSignUpModal(true);
      return;
    }
    setCreateSpadeLoading(true);
    try {
      if (userDetails?.unpaidSpades.length > 0) {
        navigation.navigate("payment-gateway", {
          spadeId: userDetails.unpaidSpades[0],
        });
        setCreateSpadeLoading(true);
        return;
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          userId: userDetails._id,
        },
      };
      await axiosInstance
        .get(`${baseUrl}/user/user-details`, config)
        .then(async (response) => {
          setCreateSpadeLoading(false);

          if (response.status !== 200) return;

          if (response?.data.unpaidSpades.length > 0) {
            navigation.navigate("payment-gateway", {
              spadeId: response.data.unpaidSpades[0],
            });
            // fetchSpadeDetails(userDetails.unpaidSpades[0]);
          } else {
            // navigation.navigate("requestentry");
            await fetchNearByStores();
            navigation.navigate("requestcategory");
          }
          await AsyncStorage.setItem(
            "userDetails",
            JSON.stringify(response.data)
          );
        });
    } catch (error) {
      setCreateSpadeLoading(false);
      if (!error?.response?.status) {
        setNetworkError(true);
        console.log("Network Error occurred: ");
      }
      console.error(error.message);
    } finally {
      setCreateSpadeLoading(false);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleRefresh = async () => {
    setRefreshing(true);
    if (!userDetails?._id) return;
    try {
      connectSocket();
      fetchData();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const { width } = Dimensions.get("window");

  //Referral Sharing ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const onShare = async () => {
    try {
      const result = await Share.open({
        message:
          "Install the CulturTap Genie App and start bargaining! Download the app now: https://play.google.com/store/apps/details?id=com.culturtapgenie.Genie",
        title: "Share via",
      });
      if (result.success) {
        console.log("Shared successfully!");
      }
    } catch (error) {
      console.log("Error while sharing:", error);
    }
  };

  // console.log('userDetails home', userDetails._id);
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={{ flex: 1 }}
        className="relative"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#9Bd35A", "#FB8C00"]}
          />
        }
      >
        {!networkError && (
          <View
            style={{
              position: "absolute",
              flex: 1,
              top: -30,
              left: 0,
              bottom: 0,
            }}
          >
            <HomeScreenBg width={width} />
          </View>
        )}

        <View className="w-full flex-row px-[29px] justify-between items-center pt-[20px]">
          <Pressable
            onPress={() => {
              if (!userDetails?._id) setSignUpModal(true);
              else navigation.navigate("menu");
            }}
          >
            <View className="bg-[#fb8c00] w-[42px] h-[42px] rounded-full flex justify-center items-center mx-auto">
              <ProfileIcon />
            </View>
          </Pressable>
          <GenieCulturTapLogo />

          <Pressable
            onPress={() => {
              if (!userDetails?._id) setSignUpModal(true);
              else {
                navigation.navigate("history");
                dispatch(setIsHome(false));
              }
            }}
          >
            <View className="bg-[#fb8c00] w-[42px] h-[42px] rounded-full flex justify-center items-center mx-auto">
              <HistoryIcon />
            </View>
          </Pressable>
        </View>

        {!networkError && (
          <View>
            <View className="w-full bg-white mt-[20px] flex-row px-[30px] gap-2 justify-between h-[max-content] items-center">
              <View className="w-[75%]">
                <Text
                  className="text-[14px] pt-[10px] text-[#2e2c43] "
                  style={{ fontFamily: "Poppins-Black" }}
                >
                  Location
                </Text>

                <Text
                  className="text-[#7c7c7c] text-[14px]"
                  style={{ fontFamily: "Poppins-Regular" }}
                >
                  {(() => {
                    if (!!userDetails?._id && userDetails?.location) {
                      return `${userDetails.location.substring(0, 30)}....`;
                    }
                    if (!userDetails?._id && currentLocation?.length > 0) {
                      return `${currentLocation.substring(0, 30)}....`;
                    }
                    return "Refresh to fetch location...";
                  })()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  setIsLoading(true);
                  await handleRefreshLocation(userDetails._id, accessToken);
                  setIsLoading(false);
                }}
                style={{ width: "25%" }}
              >
                <View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fb8c00" />
                  ) : (
                    <Text
                      className="text-[14px]  text-[#fb8c00]"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      Refresh
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
            {
              <View
                style={{
                  height: 50,
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  flexDirection: "row",
                  textAlign: "center",
                  justifyContent: "center",
                  borderTopColor: "#FFC882",
                  borderTopWidth: 1,
                }}
              >
                <Animated.View
                  style={[
                    styles.scrollMarqContainer,
                    { transform: [{ translateX: scrollX }] },
                  ]}
                >
                  <View className="flex flex-row items-center justify-center gap-2">
                    <Offer />
                    <Text
                      style={{
                        fontFamily: "Poppins-BlackItalic",
                        color: "#3f3d56",
                      }}
                    >
                      Service Free Orders Remaining:{" "}
                      <Text className="text-[#55cd00]">
                        {userDetails.freeSpades}
                      </Text>{" "}
                      <Text
                        className="text-[#3f3d56]"
                        style={{ fontFamily: "Poppins-BlackItalic" }}
                      >
                        {" "}
                        SAVE MORE, START BARGAINING!
                      </Text>{" "}
                    </Text>
                  </View>
                </Animated.View>
              </View>
            }

            {/* <TouchableOpacity onPress={() => { navigation.navigate('store-search'); }}>
            <View className="flex-row items-center justify-center bg-[#ffe8cd] mt-[15px] py-[10px] px-[10px] mx-[16px] rounded-2xl border-[1px] border-[#fb8c00] gap-[5px]">
              <Text className="text-center flex-1 text-[#fb8c00]" style={{ fontFamily: "Poppins-Regular" }}>Search stores</Text>
              <Octicons name="search" size={19} style={{ color: '#fb8c00' }} />
            </View>
          </TouchableOpacity> */}

            {/* <View className=" relative mt-[20px]  h-[140px] flex-row justify-center scale-50 items-center">
            
            <Image source={require('../assets/Genie-Icon.png')} />
          </View> */}

            <View className="mt-[20px] ">
              <View className="flex-col items-center justify-center px-[10px]">
                <Text
                  className="text-center  text-[#fb8c00] text-[14px]"
                  style={{ fontFamily: "Poppins-Regular" }}
                >
                  Ask Genie for any shopping item or maintenance service you
                  need.{" "}
                </Text>
                <Text
                  className="text-center mt-[4px]  text-[#fb8c00] text-[14px]"
                  style={{ fontFamily: "Poppins-Black" }}
                >
                  Start your live shopping now.{" "}
                </Text>
              </View>
              <TouchableOpacity
                // onPress={() => {
                //   navigation.navigate("store-search");
                // }}
                onPress={() => {
                  fetchUserDetailsToCreateSpade();
                }}
                // disabled={createSpadeLoading }
                // className="mx-[16px] mt-[16px]"
                style={{ margin: 16 }}
              >
                <View className="h-[60px]  flex-row border-[1px] border-[#fb8c00] bg-white rounded-3xl items-center justify-center ">
                  {!createSpadeLoading ? (
                    <Tab3 style={{ position: "absolute", left: 20 }} />
                  ) : (
                    <ActivityIndicator
                      color="#fb8c00"
                      style={{ position: "absolute", left: 20 }}
                    />
                  )}
                  <View
                    style={{ paddingHorizontal: 20, width: "70%" }}
                    className=" flex flex-row justify-between items-center"
                  >
                    <View className="bg-[#55CD00] w-[10px] h-[10px] rounded-full"></View>

                    <Text
                      style={{
                        fontFamily: "Poppins-Italic",
                        fontSize: 14,
                        color: "#fb8c00",
                        paddingRight: 10,
                        textAlign: "center",
                      }}
                    >
                      Start Live Shopping
                    </Text>
                    <View>
                      <SmallArrow />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View>
              {currentVersion &&
                currentVersion !== DeviceInfo.getVersion().toString() && (
                  <View
                    style={{
                      backgroundColor: "white",
                      marginHorizontal: 10,
                      borderRadius: 16,
                      marginTop: 20,
                    }}
                  >
                    <View className="flex-row px-[20px] py-[20px] gap-[30px] justify-center itmes-center ">
                      <View className="justify-center">
                        <MobileIcon />
                      </View>

                      <View className="w-[75%]">
                        <Text
                          className="text-[#2e2c43] text-[16px]"
                          style={{ fontFamily: "Poppins-Regular" }}
                        >
                          New update available! Enjoy the new release features.
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            Linking.openURL(
                              "https://play.google.com/store/apps/details?id=com.culturtapgenie.Genie"
                            );
                          }}
                          style={{
                            flexDirection: "row",
                            gap: 40,
                            alignItems: "center",
                            paddingTop: 10,
                          }}
                        >
                          <Text
                            className="text-[16px] text-[#fb8c00]"
                            style={{ fontFamily: "Poppins-Black" }}
                          >
                            Update Now
                          </Text>
                          <RightArrow />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
            </View>

            <View>
              <Text
                className="text-[16px] text-center my-[40px] text-[#fb8c00]"
                style={{ fontFamily: "Poppins-ExtraBold" }}
              >
                Shop By Categories
              </Text>
              <View
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  {/* {categoriess.map((Category, index) => (
                  <TouchableOpacity key={index} style={{ paddingTop: 10 }} onPress={() => { dispatch(setRequestCategory(Category.name)); navigation.navigate('image-suggestion'); }}>
                    <Category.cat width={.465 * width} />
                  </TouchableOpacity>
                ))} */}
                  {categoriess.map((Category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ paddingTop: 10 }}
                      onPress={() => {
                        dispatch(setRequestCategory(Category.name));
                        navigation.navigate("image-suggestion");
                      }}
                    >
                      <Image
                        source={Category.cat}
                        style={{
                          width: 0.465 * width,
                          height: 201,
                          // aspectRatio: 1,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text
                className="text-[16px] text-center  text-[#fb8c00] my-[40px]"
                style={{ fontFamily: "Poppins-ExtraBold" }}
              >
                Service By Categories
              </Text>
              <View
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginBottom: 100,
                  }}
                >
                  {/* {servicess.map((Service, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ paddingTop: 10 }}
                      onPress={() => {
                        dispatch(setRequestCategory(Service.name));
                        navigation.navigate("image-suggestion");
                      }}
                    >
                      <Service.cat width={0.465 * width} />
                    </TouchableOpacity>
                  ))} */}

                  {servicess.map((Service, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ paddingTop: 10 }}
                      onPress={() => {
                        dispatch(setRequestCategory(Service.name));
                        navigation.navigate("image-suggestion");
                      }}
                    >
                      <Image
                        source={Service.cat}
                        style={{
                          width: 0.465 * width,
                          height: 201,
                          // aspectRatio: 1,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* How it works when user have no ongoing requests */}

            {/* {(currentVersion && currentVersion === DeviceInfo.getVersion().toString() && spades.length === 0) && !networkError && !spadesLoading && (
            <View className="">
              <Text className=" text-text text-[16px] text-center mt-[50px]" style={{ fontFamily: "Poppins-Bold" }}>
                How it works?
              </Text>
              <View className=" flex flex-col  mt-[24px]">
                <HomeMain width={width} />
                <YouTubeIframe
                  height={250}
                  videoId={'f3WwRCuu7F8'}
                  play={playing}
                  onChangeState={onStateChange}
                />
                <Text className="text-[#3f3d56] text-[14px] text-center px-[32px]" style={{ fontFamily: "Poppins-Bold" }}>
                  Bargaining is the consumer's right Because money doesn't grow on trees.
                </Text>
              </View>
              <View className="px-[38px] flex flex-col gap-[38px] mt-[40px]">
                <Text className="text-[#3f3d56] text-[14px] text-center" style={{ fontFamily: "Poppins-Regular" }}>
                  Now bargaining is possible from your couch. Do you want anything new or to service the old one?
                </Text>
                <Text className="text-[#3f3d56] text-[14px] text-center" style={{ fontFamily: "Poppins-Regular" }}>
                  Connect with nearby vendors and bargain for the lowest prices for your shopping products.You can also avail any types of maintenance services here, like plumber, electrician,carpenter & lot more.</Text>
              </View>
              <View style={styles.scrollcontainer}>
                <ScrollView
                  horizontal
                  // pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  // scrollEventThrottle={16}
                  ref={scrollViewRef}
                >
                  {images.map((uri, index) => (
                    <View key={index} className="flex-row rounded-2xl my-[10px] shadow-2xl " style={{ width: 285, height: 343, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} >

                      <View className="scale-50">
                        <Image source={uri} />
                      </View>

                    </View>

                  ))}
                </ScrollView>

                <View style={styles.indicatorContainer}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        {
                          backgroundColor:
                            index <= currentIndex ? "orange" : "grey",
                        },

                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          )} */}

            {/* Ongoing requests  */}

            {/* {(currentVersion && currentVersion !== DeviceInfo.getVersion().toString() || spades.length > 0) && !networkError && !spadesLoading && (
            <View>
              <Text
                className={`text-center  text-text my-[33px]`}
                style={{ fontFamily: "Poppins-Bold" }}
              >
                Your ongoing requests
              </Text>

              {currentVersion && currentVersion !== DeviceInfo.getVersion().toString() &&
                <View style={styles.container}>

                  <View className="flex-row px-[20px] py-[20px] gap-[30px]  ">
                    <MobileIcon />
                    <View className=" w-[75%]">
                      <Text className="text-[#2e2c43] text-[16px]" style={{ fontFamily: 'Poppins-Regular' }}>New update available! Enjoy the new release features.</Text>
                      <TouchableOpacity onPress={() => { Linking.openURL("https://play.google.com/store/apps/details?id=com.culturtapgenie.Genie") }} style={{ flexDirection: 'row', gap: 40, alignItems: 'center', paddingTop: 10 }}>
                        <Text className="text-[16px] text-[#fb8c00]" style={{ fontFamily: 'Poppins-Black' }}>Update Now</Text>
                        <RightArrow />
                      </TouchableOpacity>
                    </View>
                  </View>

                </View>
              }
              {spades.map((spade, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    dispatch(setCurrentSpade(spade));
                    navigation.navigate("activerequest");
                  }}
                >
                  <View style={styles.container}>
                    {
                      spade?.unread && <View style={styles.dot}></View>
                    }
                    <View style={styles.imageContainer}>
                      {spade.requestImages.length > 0 ? (<Image
                        source={{ uri: spade.requestImages[0] }}
                        style={styles.image}
                      />) : (<SpadeIcon width={95} height={95} />)}
                    </View>

                    <View className="w-10/12 px-[10px]">
                      <View className="flex flex-wrap w-[70%] pb-1 ">
                        <Text className="text-[14px] w-full flex flex-wrap " style={{ fontFamily: "Poppins-Regular" }}>{spade?.requestDescription}</Text>
                      </View>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>Expected Price:</Text>
                        <Text style={styles.priceValue}>
                          {spade?.expectedPrice > 0 ? `${spade?.expectedPrice} Rs` : 'Na'}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Time />
                          <Text style={styles.infoText}>{spade?.createdAt}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Calender />
                          <Text style={styles.infoText}>{spade?.updatedAt}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}

            </View>
          )} */}

            {/* {spadesLoading && <View className="py-[150px]"><ActivityIndicator size={30} color={'#fb8c00'} /></View>} */}
          </View>
        )}
        {networkError && (
          <View className="mt-[100px] ">
            <NetworkError
              callFunction={fetchData}
              setNetworkError={setNetworkError}
              connectSocket={connectSocket}
            />
          </View>
        )}
      </ScrollView>

      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignContent: "baseline",
            backgroundColor: "#FFE7C8",
            paddingVertical: 10,
            shadowColor: "#FB8C00",
            elevation: 30,
            shadowOffset: { width: 10, height: 18 },
            shadowOpacity: 0.9,
            shadowRadius: 20,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Tab11 />
            <Text style={{ fontFamily: "Poppins-Regular", color: "#fb8c00" }}>
              Home
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate("orders");
            }}
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Tab2 />
            {spades.length > 0 && (
              <View
                style={{
                  position: "absolute",
                  backgroundColor: "#e76063",
                  borderRadius: 16,
                  right: 5,
                  top: 0,
                  width: 15,
                  height: 15,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 10 }}>
                  {spades.length}
                </Text>
              </View>
            )}
            <Text style={{ fontFamily: "Poppins-Regular", color: "#2e2c43" }}>
              Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if(!userLongitude || !userLatitude){
                 setLocationRefresh(true);
              }
              else{
              navigation.navigate("store-search");
              }
            }}
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Search />
            <Text style={{ fontFamily: "Poppins-Regular", color: "#2e2c43" }}>
              Stores
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onShare();
            }}
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Tab4 />
              <Text style={{ fontFamily: "Poppins-Regular", color: "#2e2c43" }}>
                Refer Us
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {
        locationRefresh &&
        <LocationRefreshModal locationRefresh={locationRefresh} setLocationRefresh={setLocationRefresh}/>
      }
      {signUpModal && (
        <SignUpModal
          signUpModal={signUpModal}
          setSignUpModal={setSignUpModal}
        />
      )}
    </View>
  );
};

const styles = {
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 9,
    marginBottom: 10,
    backgroundColor: "#fff",
    shadowColor: "#bdbdbd",
    gap: 15,
    paddingVertical: 15,
    borderRadius: 15,
    shadowOffset: { width: 8, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.05)",
  },
  imageContainer: {
    paddingHorizontal: 10,
  },
  image: {
    width: 95,
    height: 95,
    borderRadius: 15,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    width: "83.33%",
    // 10/12 in tailwind is 83.33%
  },
  priceRow: {
    flexDirection: "row",
    paddingVertical: 0,
    paddingBottom: 10,
  },
  priceText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  priceValue: {
    fontSize: 12,
    color: "#70B241",
    fontFamily: "Poppins-Bold",
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },

  scrollcontainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 0,
    marginVertical: 40,
    gap: 0,
  },
  scrollimageContainer: {
    // width: width,
    // height: 600,
    // marginHorizontal: 20,

    justifyContent: "center",
    backgroundColor: "fff",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
    borderRadius: 16,

    // border: 2,
    // borderColor: "#FB8C00",
    // borderWidth: 2,
  },
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: -25,
    gap: 4,
  },
  indicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#FB8C00",
  },
  dot: {
    position: "absolute",
    top: -5,
    right: 30,
    backgroundColor: "#e76063",
    height: 20,
    width: 20,
    borderRadius: 20,
  },
  scrollMarqContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: width * 1.5,
  },
};

export default HomeScreen;
