import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Animated,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ClickImage from "../../assets/ClickImg.svg";
import AddMoreImage from "../../assets/AddImg.svg";
import DelImg from "../../assets/delImg.svg";
import PriceInfo from "../../assets/priceModalInfo.svg";
import ReferenceImg from "../../assets/ReferenceImgModal.svg";
import {
  FontAwesome,
  Entypo,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setExpectedPrice,
  setRequestDetail,
  setRequestImages,
} from "../../redux/reducers/userRequestsSlice.js";

import ModalCancel from "../../screens/components/ModalCancel.js";
import { manipulateAsync } from "expo-image-manipulator";
import { AntDesign } from "@expo/vector-icons";
import { launchCamera } from "react-native-image-picker";
import BackArrow from "../../assets/BackArrowImg.svg";
import RightArrow from "../../assets/rightblack.svg";
import AddImageContent from "../../assets/addImageContent.svg";
import UploadImg from "../../assets/UploadImg.svg";
import Genie from "../../assets/Genie.svg";

const AddImageScreen = () => {
  const [imagesLocal, setImagesLocal] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [cameraScreen, setCameraScreen] = useState(false);
  const [addMore, setAddMore] = useState(false);
  const [imgIndex, setImgIndex] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [whiteBalance, setWhiteBalance] = useState(
    Camera.Constants.WhiteBalance.auto
  );
  const [autoFocus, setAutoFocus] = useState(Camera.Constants.AutoFocus.on);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const requestCategory = useSelector(
    (store) => store.userRequest.requestCategory
  );

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scaleAnimation] = useState(new Animated.Value(0));
  const requestImages = useSelector((store) => store.userRequest.requestImages);
  const [uploadModal, setUploadModal] = useState(false);
  const [priceModal, setPriceModal] = useState(false);
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState("");
  // console.log("requestCategory: " + requestCategory)

  const suggestions = {
    "Consumer Electronics & Accessories - Home appliances and equipment etc": [
      "Smart Tv 55 inch, Ultra HD",
      "12 Ltr Oven Toaster Griller with Heating Mode",
      "Double Door Refrigerator",
      "1600 Watts Induction Cooktop with Automatic Voltage Regulator",
    ],
    "Fashion/Clothings - Top, bottom, dresses": [
      "Boiler suits",
      "Jeans: Denim jackets",
      "Trench coats",
      "Wrap dress",
      "Plain white shirt",
    ],
    "Fashion Accessories - Jewellery, Gold & Diamond": [
      "vintage jewelry",
      "wedding jewelry",
      "Gold earrings",
      "Diamond Rings",
      "mett finish jewellery set",
    ],
    "Fashion Accessories - Shoes, bags etc": [
      "School Uniform Shoe",
      "EXTRA SOFT Men's Classic Casual Clogs/ Sandals with Adjustable Back Strap",
      "Black Nike Shoes",
      "Red Puma Shoes",
    ],
    "Fashion Accessories - Sharee, suits, kurti & dress materials etc": [
      "A-Line Kurta with Pant and Dupatta Suit Set",
      "Floor Length Suits",
      "Banarsi Sari",
      "Elegant Draped Styles",
    ],
    "Kids Games,Toys & Accessories": [
      "Monopoly",
      "Chess",
      "Jenga",
      "Game of States",
      "Audi Tt Rs Plus Electric Motor Car",
      "Vintage Electric Motor Car",
    ],
    "Luxury Watches": [
      "Digital Watch",
      "Apple Watch",
      "Android Digital Watch",
      "Tissot T classic man’s watch",
    ],
    "Hardware - Plumbing, Paint,& Electricity": [
      "5 KG paint bucket",
      "Need Plumber",
      "Kitchen Sinks",
      "Sink Couplings",
      "Need Painter",
    ],
    "Sports Nutrition - Whey Pro etc": [
      "Nutrabay Pure Creatine Monohydrate",
      "Nutrabay Gold 100% Whey Protein Concentrate",
      "Wellversed (wellcore) - Micronised Creatine",
    ],
    "Automotive Parts/Services - 2 wheeler Fuel based": [
      "Bike Battery",
      "Engine Repair",
      "Tyre Replacement",
      "Bike Service",
    ],
    "Automotive Parts/Services - 4 wheeler Fuel based": [
      "Car Battery",
      "Engine Repair",
      "Tyre Replacement",
      "Car Service",
    ],
    "Services & Repair, Consumer Electronics & Accessories - Home appliances and equipment etc":
      [
        "Refrigerator Repair",
        "Washing Machine Repair Services",
        "Geyser Repair Services",
        "AC repair",
        "Cooler Repair",
      ],
    "Services & Repair, Consumer Electronics & Accessories - Mobile, Laptop, digital products etc":
      [
        "Laptop Keyboard repair",
        "Laptop RAM Customization",
        "Laptop battery service",
        "Mobile Screen repair",
      ],
    "Clock Repair & Services": [
      "Replace watch battery - Armani",
      "Fog on my watch",
      "Watch screen damage",
      "Watch glass repair",
    ],
    "Hardware - Cement, Hand tools, Powertools etc": [
      "Drill Machine ",
      "Electric Saw for wood ",
      "Heavy Load Hammer",
      "Screw drivers",
    ],
    "Kitchen Utensils & Kitchenware": [
      "Stainless Steel Knife Set",
      "Cutting Board",
      "Frying Pan",
      "Measuring Cups and Spoons",
    ],
    "Electrical Services & Repair - Electrician": [
      "Repair my electricity board",
      "Wiring Repair",
      "Repair split AC",
    ],
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedImage(null));
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, [cameraScreen]);

  const takePicture = async () => {
    const options = {
      mediaType: "photo",
      saveToPhotos: true,
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ");
      } else {
        try {
          const newImageUri = response.assets[0].uri;
          const compressedImage = await manipulateAsync(
            newImageUri,
            [{ resize: { width: 600, height: 800 } }],
            { compress: 0.5, format: "jpeg", base64: true }
          );
          dispatch(setRequestImages([compressedImage.uri, ...requestImages]));
          // await getImageUrl(compressedImage);
          //   setImagesLocal((prevImages) => [...prevImages, compressedImage.uri]);
          //   dispatch(setRequestImages(compressedImage));
          // //   console.log("ImgUris", compressedImage.uri);
          //   setCameraScreen(false);
        } catch (error) {
          console.error("Error processing image: ", error);
        }
      }
    });
  };

  // const getImageUrl = async (image) => {
  //   setLoading(true);
  //   const CLOUDINARY_URL =
  //     "https://api.cloudinary.com/v1_1/kumarvivek/image/upload";
  //   const base64Img = `data:image/jpg;base64,${image.base64}`;
  //   const data = {
  //     file: base64Img,
  //     upload_preset: "CulturTap",
  //     quality: 50,
  //   };

  //   try {
  //     const response = await fetch(CLOUDINARY_URL, {
  //       body: JSON.stringify(data),
  //       headers: {
  //         "content-type": "application/json",
  //       },
  //       method: "POST",
  //     });

  //     const result = await response.json();
  //     if (result.secure_url) {
  //       console.log("cloud", result.secure_url)
  //       // setImagesLocal((prevImages) => [...prevImages, result.secure_url]);
  //       dispatch(setRequestImages(result.secure_url));
  //       setCameraScreen(false);
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     setLoading(false);
  //     console.log(err);
  //   }
  // };

  const deleteImage = (index) => {
    setImgIndex(index);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      // await getImageUrl(result.assets[0]);
      const newImageUri = result?.assets[0]?.uri;
      const compressedImage = await manipulateAsync(
        newImageUri,
        [{ resize: { width: 600, height: 800 } }],
        { compress: 0.5, format: "jpeg" }
      );
      dispatch(setRequestImages([compressedImage.uri, ...requestImages]));
    }
  };

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      {!cameraScreen && (
        <View
          edges={["top", "bottom"]}
          style={{
            flex: 1,
            backgroundColor: "white",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <ScrollView style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{ zIndex: 100, position: "absolute", marginTop: 40 }}
            >
              <View className="px-[32px] py-[15px] ">
                <BackArrow width={14} height={10} />
              </View>
            </TouchableOpacity>
            <View className="flex-row justify-center mt-[40px] mb-[10px] ">
              <Genie width={35} height={52} />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignContent: "center",
                marginBottom: 100,
              }}
            >
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Poppins-Black",
                    color: "#2E2C43",
                    textAlign: "center",
                  }}
                >
                  Spades my master
                </Text>
              </View>
              <View
                className="mx-[20px] mt-[20px]  h-[127px] bg-[#ffe5c4] rounded-xl "
                style={{
                  marginBottom: 20,
                  borderWidth: 0.5,
                  borderRadius: 16,
                  borderColor: "#fb8c00",
                }}
              >
                <TextInput
                  multiline
                  numberOfLines={6}
                  onChangeText={(val) => {
                    setQuery(val);
                  }}
                  value={query}
                  placeholder="Type here..."
                  placeholderTextColor="#fb8c00"
                  className="w-full h-[127px] overflow-y-scroll px-[20px]  rounded-xl"
                  style={{
                    padding: 20,
                    height: 300,
                    flex: 1,
                   
                    textAlignVertical: "top",
                    fontFamily: "Poppins-Regular",
                  }}
                />
              </View>

              {requestCategory && suggestions[requestCategory] && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      paddingVertical: 10,
                      fontSize: 14,
                    }}
                  >
                    Suggestions
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                  >
                    {suggestions[requestCategory].map((categ, index) => (
                      <TouchableOpacity
                        onPress={() => {
                          setQuery(categ);
                        }}
                        key={index}
                        style={{
                          borderWidth: 1,
                          borderRadius: 16,
                          borderColor: "#fb8c00",
                          backgroundColor: "#ffe5c4",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Poppins-Regular",
                            fontSize: 12,
                            color: "#FB8C00",
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                          }}
                        >
                          {categ}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View className="relative mb-[20px]">
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Poppins-Bold",
                    color: "#2E2C43",
                    textAlign: "center",
                  }}
                >
                  Add reference images
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setUploadModal(!uploadModal);
                  }}
                  style={{
                    width: 25,
                    height: 25,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: "red",
                    borderWidth: 2,
                    borderRadius: 16,
                    position: "absolute",
                    right: 20,
                    zIndex: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "red",
                      fontSize: 16,
                      fontFamily: "Poppins-SemiBold",
                    }}
                  >
                    ?
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{ paddingLeft: 20, paddingRight: 20 }}
                className="z-0 flex flex-row justify-center gap-4"
              >
                <TouchableOpacity onPress={() => takePicture()}>
                  <View className="flex-row justify-center">
                    <ClickImage width={150} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pickImage()}>
                  <View className="flex-row justify-center">
                    <UploadImg width={150} />
                  </View>
                </TouchableOpacity>
                {/* <View style={{ alignItems: "center", marginVertical: 50 }}>
                    <AddImageContent />
                  </View> */}
              </View>

              <View style={{ paddingLeft: 20, paddingRight: 0 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ alignSelf: "flex-start" }}
                >
                  <View style={styles.container}>
                    <View style={styles.imageContainer}>
                      {requestImages && requestImages?.map((image, index) => (
                        <Pressable
                          key={index}
                          onPress={() => handleImagePress(image)}
                        >
                          <View style={styles.imageWrapper}>
                            <Image
                              source={{ uri: image }}
                              style={styles.image}
                            />
                            <Pressable
                              onPress={() => deleteImage(index)}
                              style={styles.deleteIcon}
                            >
                              <DelImg />
                            </Pressable>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                    <Modal
                      transparent
                      visible={!!selectedImage}
                      onRequestClose={handleClose}
                    >
                      <Pressable
                        style={styles.modalContainer}
                        onPress={() => {
                          handleClose();
                        }}
                      >
                        <Animated.Image
                          source={{ uri: selectedImage }}
                          style={[
                            styles.modalImage,
                            {
                              transform: [{ scale: scaleAnimation }],
                            },
                          ]}
                        />
                      </Pressable>
                    </Modal>
                  </View>
                </ScrollView>
              </View>

              <View style={{ marginVertical: 20 }}>
                <View className="relative mb-[20px]">
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Poppins-Bold",
                      color: "#2E2C43",
                      textAlign: "center",
                    }}
                  >
                    Your expected price
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setPriceModal(!priceModal);
                    }}
                    style={{
                      width: 25,
                      height: 25,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      borderColor: "red",
                      borderWidth: 2,
                      borderRadius: 16,
                      position: "absolute",
                      right: 20,
                      zIndex: 20,
                    }}
                  >
                    <Text
                      style={{
                        color: "red",
                        fontSize: 16,
                        fontFamily: "Poppins-SemiBold",
                      }}
                    >
                      ?
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  className="mx-[20px]   h-[54px] bg-[#ffe5c4] rounded-xl "
                  style={{
                    marginBottom: 20,
                    borderWidth: 0.5,
                    borderRadius: 16,
                    borderColor: "#fb8c00",
                  }}
                >
                  <TextInput
                    placeholder="Ex:1,200 Rs"
                    value={price}
                    onChangeText={(val) => {
                      setPrice(val);
                      // if (val.length > 0) {
                      //   dispatch(setExpectedPrice(parseInt(val)));
                      // } else {
                      //   dispatch(setExpectedPrice(0));
                      // }
                    }}
                    keyboardType="numeric"
                    placeholderTextColor={"#558b2f"}
                    className="w-full h-[54px] overflow-y-scroll  rounded-xl"
                    style={{
                      paddingHorizontal: 20,
                      height: 54,
                      textAlign: "center",
                      flex: 1,
                      fontFamily: "Poppins-SemiBold",
                      color: "#558b2f",
                    }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          <ModalCancel
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            index={imgIndex}
            delImgType={"clicked"}
          />
          {modalVisible && <View style={styles.overlay} />}
          {/* {addMore && <View style={styles.overlay} />} */}

          <TouchableOpacity
        disabled={!query}
        onPress={() => {
          dispatch(setRequestDetail(query));
          if (price?.length> 0) {
            dispatch(setExpectedPrice(parseInt(price)));
        }
        else {
            dispatch(setExpectedPrice(0));
        }
          navigation.navigate('requestpreview');
        }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 68,
          width: "100%",
          backgroundColor: !query ? "#e6e6e6" : "#FB8C00",
          justifyContent: "center", // Center content vertically
          alignItems: "center", // Center content horizontally
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Poppins-Black",
            color: !query ? "#888888" : "white",
          }}
        >
          Preview and Send
        </Text>
      </TouchableOpacity>
        </View>
      )}

      <Modal visible={priceModal} transparent={true}>
        <TouchableOpacity
          onPress={() => {
            setPriceModal(false);
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <PriceInfo />
        </TouchableOpacity>
      </Modal>
      <Modal visible={uploadModal} transparent={true}>
        <TouchableOpacity
          onPress={() => {
            setUploadModal(false);
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <ReferenceImg />
        </TouchableOpacity>
      </Modal>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fb8c00" />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    // marginHorizontal: 30,
    gap: 5,
    marginTop: 10,
  },
  imageWrapper: {
    margin: 5,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "gray",
  },
  image: {
    width: 168,
    height: 232,
    borderRadius: 10,
  },
  // deleteIc: {
  //   position: 'absolute',
  //   top: 5,
  //   right: 5,
  // },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalImage: {
    width: 300,
    height: 400,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 2,
  },
  overlay: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent greyish background
  },
  bottomBar: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  captureButton: {
    alignSelf: "center",
    backgroundColor: "#FB8C00",
    padding: 10,
    borderRadius: 100,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default AddImageScreen;
