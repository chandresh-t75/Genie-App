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
  Linking,
  FlatList,
  BackHandler,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import ClickImage from "../../assets/ClickImg.svg";
import UploadImg from "../../assets/UploadImg.svg";
import AddMoreImage from "../../assets/AddImg.svg";
import DelImg from "../../assets/delImg.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  emtpyRequestImages,
  setEstimatedPrice,
  setExpectedPrice,
  setRequestImages,
  setSuggestedImages,
} from "../../redux/reducers/userRequestsSlice.js";
import { Feather } from "@expo/vector-icons";
import ModalCancel from "../../screens/components/ModalCancel.js";
import { manipulateAsync } from "expo-image-manipulator";
import { AntDesign } from "@expo/vector-icons";
import { launchCamera } from "react-native-image-picker";
import BackArrow from "../../assets/BackArrowImg.svg";
import RightArrow from "../../assets/rightblack.svg";
import AddImageContent from "../../assets/addImageContent.svg";
import AddImageContentService from "../../assets/addImageContentService.svg";
import axiosInstance from "../../utils/logics/axiosInstance";
import { baseUrl } from "../../utils/logics/constants";
import axios from "axios";
import SignUpModal from "../components/SignUpModal";

const ImageSuggestion = () => {
  const [imagesLocal, setImagesLocal] = useState([]);
  const navigation = useNavigation();
  const route=useRoute();
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
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scaleAnimation] = useState(new Animated.Value(0));
  const requestImages = useSelector((store) => store.userRequest.requestImages);
  const [suggestionImages, setSuggestionImages] = useState([]);
  const userLongitude = useSelector((store) => store.user.userLongitude);
  const userLatitude = useSelector((store) => store.user.userLatitude);
  const requestCategory = useSelector(
    (store) => store.userRequest.requestCategory
  );
  const [page, setPage] = useState(1);
  const suggestedImages = useSelector(
    (store) => store.userRequest.suggestedImages
  );
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [delImgType, setDelImgType] = useState("clicked");
  const [descModal, setDescModal] = useState(false);
  const [selectedImgEstimatedPrice, setSelectedImgEstimatedPrice] = useState(0);
  const [selectedImageDesc, setSelectedImageDesc] = useState("");
  const [isService, setIsService] = useState(false);
  const [showImageLength, setShowImageLength] = useState(20);
  const [loadMore, setLoadMore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const userDetails = useSelector((store) => store.user.userDetails);
  const [signUpModal, setSignUpModal] = useState(false);
  const navigationState = useNavigationState((state) => state);

  const isImgSuggestion =navigationState.routes[navigationState.index].name === "image-suggestion";
  useEffect(() => {
    if (requestCategory.includes("Service")) setIsService(true);
  }, []);

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
  const handleCloseSuggestion = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0,
      duration: 100,
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
    setLoading(true);
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
          dispatch(setRequestImages([compressedImage.uri]));
          dispatch(setSuggestedImages([]));

          navigation.navigate("define-request");
          setLoading(false)

        } catch (error) {
          setLoading(false)
          console.error("Error processing image: ", error);
        }
      }
    });
  };

  // const categoryListedProduct = async () => {
  //     try {
  //         // console.log('category', requestCategory);
  //         if (!loadMore) return;
  //         setLoadingProducts(true);
  //         await axios.get(`${baseUrl}/product/product-by-category`, {
  //             params: {
  //                 productCategory: requestCategory,
  //                 page: page
  //             }
  //         })
  //             .then((res) => {
  //                 if (res.status === 200) {
  //                     setSuggestionImages(prev => [...prev, ...res.data]);
  //                     setPage(curr => curr + 1);
  //                     setLoadingProducts(false);
  //                     console.log("productImages", res.data[0]);
  //                     if (res.data.length < 10) setLoadMore(false);
  //                 }

  //             })
  //         setLoadingProducts(false);

  //     } catch (error) {
  //         setLoadingProducts(false);
  //         if (error.response.status === 404) setLoadMore(false);
  //         console.error("Error occured while fetching listedProducts", error);
  //     }
  // }
  const categoryListedProduct = async () => {
    if (!loadMore) return;

    try {
      setLoadingProducts(true);
      const response = await axios.get(
        `${baseUrl}/product/product-by-category`,
        {
          params: { productCategory: requestCategory, page },
        }
      );

      if (response.status === 200) {
        const fetchedImages = response.data;

        setSuggestionImages((prev) => [...prev, ...fetchedImages]);
        setPage((curr) => curr + 1);

        if (fetchedImages.length < 10) {
          setLoadMore(false); // Stop further loading if less than 10 products
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setLoadMore(false);
      }
      console.error("Error while fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    
    categoryListedProduct();
  }, []);

  // useEffect(() => {
  //   if (isImgSuggestion) {
  //     const backAction = () => {
  //       dispatch(setSuggestedImages([]));
  //       dispatch(setRequestImages([]));
  //       dispatch(setExpectedPrice(0));
  //       dispatch(setEstimatedPrice(0));
  //       return false; // Prevent the default back action
  //     };
  
  //     const backHandler = BackHandler.addEventListener(
  //       "hardwareBackPress",
  //       backAction
  //     );
  
  //     return () => backHandler.remove(); // Clean up the event listener
  //   }
  // }, [isImgSuggestion]);
  
 

  const renderProductItem = ({ item }) => (
    <Pressable
      onPress={() => {
        
        handleImagePress(item.productImage);
        setIsSuggestion(true);
        setSelectedImgEstimatedPrice(item.productPrice);
        setSelectedImageDesc(item.productDescription);
      }}
      style={{ marginBottom: 10 }}
    >
      <Image
        source={{ uri: item.productImage }}
        style={{
          width: 154,
          height: 200,
          borderRadius: 16,
        }}
        resizeMode="cover"
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: 154,
          height: 50,
          backgroundColor: "rgba(0,0,0,0.5)",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderBottomEndRadius: 16,
          borderBottomStartRadius: 16,
        }}
      >
        {item?.productDescription && (
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: 10,
              color: "white",
            }}
          >
            {item.productDescription.length > 25
              ? `${item.productDescription.substring(0, 25)}...`
              : item.productDescription}
          </Text>
        )}
        <Text
          style={{
            fontFamily: "Poppins-Regular",
            fontSize: 8,
            color: "white",
          }}
        >
          Estimated Price
        </Text>
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            color: "#70b241",
          }}
        >
          Rs {item.productPrice}
        </Text>
      </View>
    </Pressable>
  );

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
      dispatch(setRequestImages([compressedImage.uri]));
      dispatch(setSuggestedImages([]));
      navigation.navigate("define-request");

    }
  };


//       if (requestImages || suggestedImages) {
//         return true;
//       } else {
//         return false;
//       }
//     };

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );

//     return () => backHandler.remove(); // Clean up the event listener
//   }, []);

  const handleDownloadDocument = async () => {
    // const url = `https://www.google.com/search?q=${encodeURIComponent(bidDetails.bidImages[0])}`
    // const url = `${bidDetails.bidImages[0]}`;
    Linking.openURL(selectedImage).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  // if (hasCameraPermission === null) {
  //   return <View />;
  // }
  // if (hasCameraPermission === false) {
  //   return <Text>No access to camera</Text>;
  // }


  

  return (
    <>
      <View
      
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <View style={{ flex: 1}}>
          <View className=" flex  mt-[40px] flex-row  items-center  px-[32px]">
          <TouchableOpacity
              onPress={() =>{
              navigation.goBack()
              dispatch(setSuggestedImages([]));
              dispatch(setRequestImages([]));
              dispatch(setExpectedPrice(0));
              dispatch(setEstimatedPrice(0));
              }}
              style={{paddingHorizontal:8, paddingVertical:20}}
            >
              <BackArrow width={14} height={10} />
            </TouchableOpacity>
            <Text
              className="text-[16px] flex flex-1 justify-center text-[#2e2c43] items-center text-center"
              style={{ fontFamily: "Poppins-ExtraBold" }}
            >
              {isService ? "Add Service" : "Select Product"}
            </Text>
            <Pressable
              onPress={() => {
                if (!userDetails?._id) setSignUpModal(true);
                else navigation.navigate("define-request");
              }}
              className=""
            >
              <Text
                className="text-[16px] text-[#FB8C00]"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Skip
              </Text>
            </Pressable>
          </View>
          <View className="mt-[10px] mb-[27px] px-[32px]">
            {/* <Text
              className="text-[14.5px] text-[#FB8C00] text-center mb-[15px] "
              style={{ fontFamily: "Poppins-Medium" }}
            >
              Step 2/4
            </Text> */}
           
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text
                  className="text-[14px] text-center text-[#2e2c43]"
                  style={{ fontFamily: "Poppins-Regular" }}
                >
                  {isService
                    ? "Share the image of defect"
                    : "Search any product in the market."}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setDescModal(!descModal);
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
        

            {/* {suggestedImages?.length > 0 ||
              (requestImages?.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text
                    className="text-[14px] text-center text-[#2e2c43]"
                    style={{ fontFamily: "Poppins-Regular" }}
                  >
                    {isService
                      ? "Add more image of defect/damage"
                      : "Add more product images."}
                  </Text>
                </View>
              ))} */}

            {/* {(suggestedImages?.length > 0 || requestImages?.length > 0) && <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 15, color: '#2e2c43' }}>Add Product</Text>
                        </View>} */}
          </View>

         
            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <TouchableOpacity onPress={() =>{
                 if (!userDetails?._id) setSignUpModal(true);
                 else takePicture();
                   } }>
                <ClickImage />
              </TouchableOpacity>
              <TouchableOpacity onPress={() =>{
                if (!userDetails?._id) setSignUpModal(true);
                else pickImage();
                 } }>
                <UploadImg />
              </TouchableOpacity>
            </View>
          
          {/* {(requestImages?.length > 0 || suggestedImages?.length > 0) && (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ alignSelf: "flex-start" }}
              >
                <View style={styles.container}>
                  <View style={styles.imageContainer}>
                    {requestImages.map((image, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                          handleImagePress(image);
                          setIsSuggestion(false);
                          setSelectedImgEstimatedPrice(0);
                        }}
                      >
                        <View style={styles.imageWrapper}>
                          <Image source={{ uri: image }} style={styles.image} />
                          <Pressable
                            onPress={() => {
                              deleteImage(index);
                              setDelImgType("clicked");
                            }}
                            style={styles.deleteIcon}
                          >
                            <DelImg />
                          </Pressable>
                        </View>
                      </Pressable>
                    ))}
                    {suggestedImages.map((image, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                          handleImagePress(image);
                          setIsSuggestion(false);
                          setSelectedImgEstimatedPrice(0);
                        }}
                      >
                        <View style={styles.imageWrapper}>
                          <Image source={{ uri: image }} style={styles.image} />
                          <Pressable
                            onPress={() => {
                              deleteImage(index);
                              setDelImgType("suggested");
                            }}
                            style={styles.deleteIcon}
                          >
                            <DelImg />
                          </Pressable>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>
              {suggestedImages?.length === 0 && (
                <TouchableOpacity
                  onPress={() => setAddMore(!addMore)}
                  style={{ alignSelf: "flex-start" }}
                >
                  <View style={{ marginLeft: 36, marginTop: 45 }}>
                    <AddMoreImage />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )} */}

        
            <View
              style={{
                flex: 1,
                paddingHorizontal: 20,
                marginTop: 30,
                // marginBottom: 80,
              }}
            >
              {/* {suggestionImages?.length > 0 && <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, paddingHorizontal: 12, paddingBottom: 20 }}>Available stock in the market</Text>}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>

                            {suggestionImages && suggestionImages.map((suggestionImage, index) => {

                                return (
                                    <Pressable
                                        key={index}
                                        onPress={() => { handleImagePress(suggestionImage.productImage); setIsSuggestion(true); setSelectedImgEstimatedPrice(suggestionImage.productPrice); setSelectedImageDesc(suggestionImage.productDescription) }}
                                    >
                                        <Image
                                            source={{ uri: suggestionImage.productImage }}
                                            width={154}
                                            height={200}
                                            style={{ borderRadius: 16 }}
                                            loading='lazy'
                                        />
                                        <View style={{ position: 'absolute', bottom: 0, width: 154, height: 50, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderBottomEndRadius: 16, borderBottomStartRadius: 16 }}>
                                            {suggestionImage?.productDescription && suggestionImage?.productDescription.length > 0 && <View >
                                                {suggestionImage?.productDescription.length > 25 && <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 10, color: 'white' }}>{suggestionImage.productDescription.substring(0, 25)}...</Text>}
                                                {suggestionImage?.productDescription.length <= 25 && <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 10, color: 'white' }}>{suggestionImage.productDescription}</Text>}
                                            </View>}
                                            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 8, color: 'white' }}>Estimated Price</Text>
                                            <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#70b241' }}>Rs {suggestionImage.productPrice}</Text>
                                        </View>

                                    </Pressable>
                                )
                            })}
                        </View>
                        {loadMore && !loadingProducts && <TouchableOpacity onPress={() => { categoryListedProduct(); }} style={{ justifyContent: 'center', alignItems: 'center', borderColor: '#fb8c00', borderWidth: 1, marginTop: 20, marginHorizontal: 80, borderRadius: 16 }}>
                            <Text style={{ fontFamily: 'Poppins-Regular', color: '#fb8c00' }}> View More</Text>
                        </TouchableOpacity>}
                        {loadingProducts && (
                            <View style={{ marginTop: 20 }}>
                                <ActivityIndicator size="large" color="#fb8c00" />
                            </View>
                        )} */}
              <Text className="text-center  mb-[10px] text-[14px]" style={{ fontFamily: "Poppins-SemiBold" }}>Available stock in the market</Text>
             
              <FlatList
                data={suggestionImages}
                renderItem={renderProductItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  gap: 10,
                }}
                nestedScrollEnabled={true}
                onEndReached={() => {
                  if (loadMore && !loadingProducts) {
                    // console.log("Fetching next page...");
                    categoryListedProduct();
                  }
                }}
                onEndReachedThreshold={.5}
                ListFooterComponent={
                  loadingProducts ? (
                    <ActivityIndicator
                      size="large"
                      color="#fb8c00"
                      style={{ marginVertical: 20 }}
                    />
                  ) : null
                }
                contentContainerStyle={{
                  paddingBottom: 50,
                }}
              />
            </View>
         
        </View>
        <ModalCancel
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          index={imgIndex}
          delImgType={delImgType}
        />
        {modalVisible && <View style={styles.overlay} />}
        {/* {addMore && <View style={styles.overlay} />} */}
        {/* {!addMore &&
          (requestImages.length > 0 || suggestedImages.length > 0) && (
            <View className="absolute bottom-0 left-0 right-0">
              <TouchableOpacity
                onPress={() => {
                  if (!userDetails?._id) {
                    setSignUpModal(true);
                  } else {
                    navigation.navigate("define-request", {
                      imagesLocal: imagesLocal,
                    });
                    if (suggestedImages.length === 0)
                      dispatch(setEstimatedPrice(0));
                  }
                }}
              >
                <View className="w-full h-[63px] bg-[#fb8c00]  flex items-center justify-center  ">
                  <Text
                    className="text-white text-[18px]"
                    style={{ fontFamily: "Poppins-Black" }}
                  >
                    Continue
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )} */}

        
        <Modal visible={descModal} transparent={true}>
          <TouchableOpacity
            onPress={() => {
              setDescModal(false);
            }}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            {isService ? <AddImageContentService /> : <AddImageContent />}
          </TouchableOpacity>
        </Modal>
        <Modal
          transparent
          visible={!!selectedImage}
          onRequestClose={handleClose}
        >
          <Pressable
            onPress={() => {
              handleClose();
            }}
            style={styles.modalContainer}
          >
            <Animated.View
              style={[
                {
                  transform: [{ scale: scaleAnimation }],
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  handleClose();
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ffe7c8",
                    position: "absolute",
                    top: 20,
                    right: 20,
                    zIndex: 100,
                    padding: 5,
                    borderRadius: 100,
                  }}
                  onPress={() => {
                    handleDownloadDocument();
                  }}
                >
                  <Feather name="download" size={16} color="#fb8c00" />
                </TouchableOpacity>
                <Image
                  source={{ uri: selectedImage }}
                  style={[
                    styles.modalImage,
                    // {
                    //     transform: [{ scale: scaleAnimation }],
                    // },
                  ]}
                />
                {(selectedImgEstimatedPrice > 0 ||
                  selectedImageDesc?.length > 0) && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      width: 300,
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 5,
                      borderBottomEndRadius: 10,
                      borderBottomStartRadius: 10,
                    }}
                  >
                    {selectedImageDesc?.length > 0 &&
                      selectedImageDesc.length > 40 && (
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontFamily: "Poppins-Regular",
                          }}
                        >
                          {selectedImageDesc.substring(0, 40)}...
                        </Text>
                      )}
                    {selectedImageDesc?.length > 0 &&
                      selectedImageDesc.length <= 40 && (
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontFamily: "Poppins-Regular",
                          }}
                        >
                          {selectedImageDesc}
                        </Text>
                      )}
                    <Text
                      style={{
                        color: "white",
                        fontSize: 14,
                        fontFamily: "Poppins-Regular",
                      }}
                    >
                      Estimated Price
                    </Text>
                    {selectedImgEstimatedPrice > 0 && (
                      <Text
                        style={{
                          color: "#70b241",
                          fontSize: 18,
                          fontFamily: "Poppins-SemiBold",
                        }}
                      >
                        Rs {selectedImgEstimatedPrice}
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>
              {isSuggestion && (
                <Pressable
                  onPress={() => {
                    handleCloseSuggestion();
                    if (!userDetails?._id) setSignUpModal(true);
                    else{
                      
                      dispatch(
                        setSuggestedImages([selectedImage])
                      );
                      dispatch(setRequestImages([]));

                      
                      if (selectedImgEstimatedPrice > 0) {
                        dispatch(setEstimatedPrice(selectedImgEstimatedPrice));
                      }
                        setTimeout(()=>{
                          navigation.navigate("define-request");
                        },200);
                   
                      
                      
                    }
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-SemiBold",
                      backgroundColor: "white",
                      color: "#fb8c00",
                      fontSize: 16,
                      borderWidth: 2,
                      borderRadius: 16,
                      borderColor: "#fb8c00",
                      paddingHorizontal: 20,
                      paddingVertical: 15,
                      marginTop: 10,
                    }}
                  >
                    Add Product To View & Bargaining
                  </Text>
                </Pressable>
              )}
            </Animated.View>
          </Pressable>
        </Modal>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fb8c00" />
        </View>
      )}
      {signUpModal && (
        <SignUpModal
          signUpModal={signUpModal}
          setSignUpModal={setSignUpModal}
        />
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
    marginHorizontal: 30,
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

export default ImageSuggestion;
