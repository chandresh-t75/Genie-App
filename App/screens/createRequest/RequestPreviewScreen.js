import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowLeft from "../../assets/arrow-left.svg";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  emtpyRequestImages,
  requestClear,
  setCreatedRequest,
  setExpectedPrice,
  setRequestImages,
} from "../../redux/reducers/userRequestsSlice";
import { setSpades, setUserDetails } from "../../redux/reducers/userDataSlice";
import { formatDateTime } from "../../utils/logics/Logics";
import { NewRequestCreated } from "../../notification/notificationMessages";
import BackArrow from "../../assets/BackArrowImg.svg";
import { ActivityIndicator } from "react-native";
import SuccessPopup from "../components/SuccessPopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { socket } from "../../utils/scoket.io/socket";
import { baseUrl } from "../../utils/logics/constants";
import axiosInstance from "../../utils/logics/axiosInstance";

const RequestPreviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // const [images, setImagesLocal] = useState([]);
  const userDetails = useSelector((store) => store.user.userDetails);
  const requestDetail = useSelector((store) => store.userRequest.requestDetail);
  const requestCategory = useSelector(
    (store) => store.userRequest.requestCategory
  );
  const requestImages = useSelector((store) => store.userRequest.requestImages);
  const suggestedImages = useSelector(store => store.userRequest.suggestedImages);
  const expectedPrice = useSelector((store) => store.userRequest.expectedPrice);
  const spadePrice = useSelector((store) => store.userRequest.spadePrice);
  const spadeCouponCode = useSelector(store => store.userRequest.spadeCouponCode);
  const spades = useSelector((store) => store.user.spades);
  const userLongitude = useSelector(store => store.user.userLongitude);
  const userLatitude = useSelector(store => store.user.userLatitude);
  const dispatch = useDispatch();
  // console.log('userData', userDetails);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const accessToken = useSelector(store => store.user.accessToken);

  // console.log('expected Price', expectedPrice > 0 ? "HII" : expectedPrice);
  // console.log("spadePride", spadePrice);

  // console.log('coupon', spadeCouponCode);

  // const { imagesLocal } = route.params

  // console.log('spades request', spades);
  // useEffect(() => {
  // if (expectedPrice > 0) {
  //   dispatch(setExpectedPrice(expectedPrice));
  // }
  // else {
  //   setExpectedPrice(0);
  // }


  // }, [])
  console.log(
    "userDetails",
    userDetails._id,
    requestDetail,
    requestCategory,
    requestImages,
    suggestedImages,
    expectedPrice,
    spadePrice,
    userLongitude,
    userLatitude
  );

  const handleSubmit = async () => {
    console.log(
      "userDetails",
      userDetails._id,
      requestDetail,
      requestCategory,
      requestImages,
      suggestedImages,
      expectedPrice,
      spadePrice,
      userLongitude,
      userLatitude
    );


    const formData = new FormData();

    requestImages?.forEach((image, index) => {
      formData.append('requestImages', {
        uri: image,
        type: 'image/jpeg', // Adjust this based on the image type
        name: `photo-${Date.now()}-${index}.jpg`, // Adjust this based on the image name
      });
    });

    formData.append('customerID', userDetails._id);
    formData.append('request', requestDetail);
    formData.append('requestCategory', requestCategory);
    formData.append('expectedPrice', expectedPrice > 0 ? expectedPrice : 0);
    formData.append('spadePrice', userDetails.freeSpades > 0 ? 0 : spadePrice);
    formData.append('appliedCoupon', spadeCouponCode.length > 0 ? spadeCouponCode : "NA");
    formData.append('longitude', userLongitude !== 0 ? userLongitude : userDetails.longitude);
    formData.append('latitude', userLatitude !== 0 ? userLatitude : userDetails.latitude);
    formData.append('suggestedImages', suggestedImages);

    setLoading(true);
    try {
      const config = {
        headers: { // Use "headers" instead of "header"
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        }
      };
      const response = await axiosInstance.post(
        `${baseUrl}/user/createrequest`, formData, config
      );

      console.log("created request data", response.data);

      if (response.status === 201) {

        dispatch(setUserDetails(response.data.userDetails));
        await AsyncStorage.setItem('userDetails', JSON.stringify(response.data.userDetails));

        let res = response.data.userRequest;
        const dateTime = formatDateTime(res.updatedAt);
        res.createdAt = dateTime.formattedTime;
        res.updatedAt = dateTime.formattedDate;

        dispatch(setSpades([res, ...spades]));
        setIsVisible(true);
        setTimeout(() => {
          setIsVisible(false);
          navigation.navigate("home");
        }, 3000);
        // dispatch(setCreatedRequest(res));

        socket.emit('new request', response.data.userRequest._id);
        //make redux to its inital state

        const notification = {
          uniqueTokens: response.data.uniqueTokens,
          title: userDetails?.userName,
          body: requestDetail,
          image: response.data?.userRequest?.requestImages?.length > 0 ? response.data?.userRequest?.requestImages[0] : "",

        };

        await NewRequestCreated(notification);

        // dispatch(emtpyRequestImages());
        dispatch(requestClear());

      } else {
        // dispatch(emtpyRequestImages());
        // dispatch(requestClear());
        console.error("Error while creating request");
      }
    } catch (error) {
      // dispatch(emtpyRequestImages());
      // dispatch(requestClear());
      console.error("Error while creating request", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={{ flex: 1 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ position: 'absolute', paddingHorizontal: 36, paddingVertical: 50, zIndex: 100 }}>
          <BackArrow />
        </Pressable>
        <View className=" flex flex-row items-center mt-[40px] mb-[24px] px-[24px]">

          <Text className="flex flex-1 justify-center text-[#2e2c43] items-center text-center text-[16px]  " style={{ fontFamily: "Poppins-Bold" }}>
            Request Preview
          </Text>
        </View>
        <View className="px-[32px]">
          <Text className="text-[14px]  text-[#2e2c43]" style={{ fontFamily: "Poppins-Black" }}>
            Spades of my master
          </Text>
          <Text className="text-[14px] text-[#2e2c43] w-4/5 mt-[5px]" style={{ fontFamily: "Poppins-Regular" }}>
            {requestDetail}
          </Text>
        </View>

        {/* <View className="px-[32px] pt-[20px]">
          <Text className="text-[14px]  text-[#2e2c43]" style={{ fontFamily: "Poppins-Black" }}>
            Spades Location
          </Text>
          <Text className="text-[14px] text-[#2e2c43]  mt-[5px]" style={{ fontFamily: "Poppins-Regular" }}>
            {userDetails?.location}
          </Text>
        </View> */}
        <View className="px-[32px] pt-[20px]">
          <Text className="text-[14px]  text-[#2e2c43]" style={{ fontFamily: "Poppins-Black" }}>
            Category
          </Text>
          <Text className="text-[14px] text-[#2e2c43]  mt-[5px]" style={{ fontFamily: "Poppins-Regular" }}>
            {requestCategory}
          </Text>
        </View>

        <View className=" mt-[20px]">
          <Text className="text-[14px] px-[32px]  text-[#2e2c43]" style={{ fontFamily: "Poppins-Black" }}>
            Reference images for vendors
          </Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "row",
              gap: 10,
              paddingVertical: 15,
              paddingHorizontal:32
            }}
            style={{ alignSelf: 'flex-start' }}
          >
            {requestImages &&
              requestImages?.map((image, index) => (
                <View key={index} className="">
                  <Image
                    source={{ uri: image }}
                    width={174}
                    height={232}
                    className="rounded-3xl border-1 border-b-[1px] border-[#cdcdd6]"
                  />
                </View>
              ))}
            {suggestedImages &&
              suggestedImages?.map((image, index) => (
                <View key={index} className="">
                  <Image
                    source={{ uri: image }}
                    width={174}
                    height={232}
                    className="rounded-3xl border-1 border-b-[1px] border-[#cdcdd6]"
                  />
                </View>
              ))}
          </ScrollView>
        </View>
        <View className="mx-[32px] mt-[30px] mb-[100px]">
          <Text className=" text-[14px]  text-[#2e2c43]   mb-[6px] " style={{ fontFamily: "Poppins-Bold" }}>
            Your expected price
          </Text>
          <Text className="text-[24px] text-[#558b2f] mb-[20px] border-b-[1px] border-[#e7e7e7] border-opacity-5" style={{ fontFamily: "Poppins-ExtraBold" }}>
            {expectedPrice === 0 ? "NaN" : `${expectedPrice} Rs`}
          </Text>
          {/* <Text className=" text-[14px] text-[#2e2c43] mb-[6px] " style={{ fontFamily: "Poppins-Bold" }}>
            Applied Coupon
          </Text>
          <Text className="text-[18px]  text-[#558b2f] pb-[10px] border-b-[1px] border-[#dcdbdb]" style={{ fontFamily: "Poppins-ExtraBold" }}>
            {spadeCouponCode.length > 0 ? spadeCouponCode : "NA"}
          </Text> */}

          <Text className=" text-[14px] text-[#2e2c43] mb-[6px] mt-[0px] " style={{ fontFamily: "Poppins-Bold" }}>
            Cost for this request
          </Text>
          <Text className="text-[18px]  text-[#558b2f] pb-[20px]" style={{ fontFamily: "Poppins-ExtraBold" }}>
            {userDetails.freeSpades > 0 ? 0 : spadePrice} Rs
          </Text>
        </View>
        {isVisible && (
          <SuccessPopup isVisible={isVisible} setIsVisible={setIsVisible} />
        )}

      </ScrollView>
      <View className=" absolute bottom-0 left-0 right-0">
        <TouchableOpacity
          onPress={() => {
            handleSubmit();
          }}
        >
          <View className="w-full h-[63px] bg-[#fb8c00]  flex items-center justify-center  ">
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-[18px] " style={{ fontFamily: "Poppins-Black" }}>
                Send Request
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fb8c00" />
        </View>
      )}

      {/* { visible  && <View style={styles.overlay} />} */}
    </View>
  );
};
const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    zIndex: 100,
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    //  position:"absolute",
    //  bottom:0// Semi-transparent greyish background
  },
});
export default RequestPreviewScreen;
