import { View, Text } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MobileNumberEntryScreen from '../screens/login/MobileNumberEntryScreen';
import OtpVerificationScreen from '../screens/login/OtpVerificationScreen';
import UserNameEntryScreen from '../screens/login/UserNameEntryScreen';
import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/Menu&Profile/MenuScreen';
import ProfileScreen from '../screens/Menu&Profile/ProfileScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import RequestDetail from '../screens/activeRequest/RequestDetailScreen';
import BargainingScreen from '../screens/activeRequest/BargainingScreen';
import RequestEntry from '../screens/createRequest/RequestEntry';
import RequestCategory from '../screens/createRequest/RequestCategory';
import AddImgScreen from '../screens/createRequest/AddImgScreen';
import RequestPreviewScreen from '../screens/createRequest/RequestPreviewScreen';
import ExpectedPriceScreen from '../screens/createRequest/ExpectedPriceScreen';
import AboutScreen from '../screens/Menu&Profile/AboutScreen';
import HowItWorks from '../screens/Menu&Profile/HowItWorks';
import HelpScreen from '../screens/Menu&Profile/HelpScreen';
import ImageRefrencesScreen from '../screens/activeRequest/ImageRefrencesScreen';
import ViewRequestScreen from '../screens/activeRequest/ViewRequestScreen';
import CreateNewBidScreen from '../screens/activeRequest/CreateNewBidScreen';
import SendQueryScreen from '../screens/activeRequest/SendQueryScreen';
import CameraScreen from '../screens/components/CameraScreen';
import RatingAndFeedback from '../screens/Rating&Feedback/RatingAndFeedback';
import SplashScreen from '../screens/SplashScreen';
import StoreProfileScreen from '../screens/activeRequest/StoreProfileScreen';
import Razorpay from '../screens/paymentGateway/Razorpay.js';
import AvailableCategories from '../screens/components/AvailableCategories';
import { useSelector } from 'react-redux';
import ReportVendor from '../screens/components/ReportVendor.js';
import SendDocument from '../screens/components/SendDocument';
import NetworkError from '../screens/components/NetworkError';
import SearchPage from '../screens/storeSearch/SearchPage';
import StoreProfilePage from '../screens/storeSearch/StoreProfilePage';
import DefineRequest from '../screens/createRequest/DefineRequest';
import ActiveRequests from '../screens/activeRequest/ActiveRequests.js';
import ImageSuggestion from '../screens/createRequest/ImagesSuggestions';

const Stack = createNativeStackNavigator();
const GlobalNavigation = () => {
    const [userId, setUserId] = useState("")

    const bargainingScreens = useSelector(store => store.user.bargainingScreens);
    // console.log('bargaining screens', bargainingScreens);
    // const currentSpadeChatId = useSelector(store => store.user.currentSpadeChatId);

    // const chatUserId = currentSpadeChatId?.chatId;
    // console.log("Chat User ID in App.js:", chatUserId);
    // useEffect(() => {
    //     setUserId(chatUserId);
    // }, []);

    const memoizedScreens = useMemo(() => {
        console.log('bargaining screens', bargainingScreens);
        return bargainingScreens.map((screen, index) => (
            <Stack.Screen key={index} name={screen} component={BargainingScreen} />
        ));
    }, [bargainingScreens]);

    return (

        <Stack.Navigator initialRouteName="splash"
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                animationDuration: "50"
            }}>
            <Stack.Screen name="network-error" component={NetworkError} />
            <Stack.Screen name="payment-gateway" component={Razorpay} />
            <Stack.Screen name="splash" component={SplashScreen} />
            <Stack.Screen name="mobileNumber" component={MobileNumberEntryScreen} />
            {/* <Stack.Screen name="otpVerification" component={OtpVerificationScreen} /> */}
            <Stack.Screen name="registerUsername" component={UserNameEntryScreen} />
            <Stack.Screen name="home" component={HomeScreen} />
            <Stack.Screen name="menu" component={MenuScreen} />
            <Stack.Screen name="profile" component={ProfileScreen} />
            <Stack.Screen name="history" component={HistoryScreen} />
            <Stack.Screen name="orders" component={ActiveRequests} />
            <Stack.Screen name="activerequest" component={RequestDetail} />
            <Stack.Screen name={`bargain${userId}`} component={BargainingScreen} />
            <Stack.Screen name="requestentry" component={RequestEntry} />
            <Stack.Screen name="image-suggestion" component={ImageSuggestion} />
            <Stack.Screen name="define-request" component={DefineRequest} />
            <Stack.Screen name="requestcategory" component={RequestCategory} />
            <Stack.Screen name="addimg" component={AddImgScreen} />
            <Stack.Screen name="addexpectedprice" component={ExpectedPriceScreen} />
            <Stack.Screen name="requestpreview" component={RequestPreviewScreen} />
            <Stack.Screen name="about" component={AboutScreen} />
            <Stack.Screen name="how-it-works" component={HowItWorks} />
            <Stack.Screen name="help" component={HelpScreen} />
            <Stack.Screen name="report-vendor" component={ReportVendor} />
            <Stack.Screen name="image-refrences" component={ImageRefrencesScreen} />
            <Stack.Screen name="view-request" component={ViewRequestScreen} />
            <Stack.Screen name="send-bid" component={CreateNewBidScreen} />
            <Stack.Screen name="send-query" component={SendQueryScreen} />
            <Stack.Screen name="camera" component={CameraScreen} />
            <Stack.Screen name="rating-feedback" component={RatingAndFeedback} />
            <Stack.Screen name="retailer-profile" component={StoreProfileScreen} />
            <Stack.Screen name="available-categories" component={AvailableCategories} />
            <Stack.Screen name={`send-document`} component={SendDocument} />
            <Stack.Screen name="store-search" component={SearchPage} />
            <Stack.Screen name="store-page" component={StoreProfilePage} />
            {memoizedScreens}
        </Stack.Navigator>

    )
}

export default GlobalNavigation;