import { View, Text, ScrollView, Pressable, Image } from 'react-native'
import React, { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import RandomImg from '../../assets/RandomImg.svg';
import Gallery from '../../assets/grayGallery.svg';
import GreenClock from '../../assets/greenClock.svg';
import ThreeDots from '../../assets/3dots.svg';
import ArrowLeft from '../../assets/arrow-left.svg';
import axios from 'axios';
import Tick from '../../assets/Tick.svg';
import { Clipboard } from 'expo';
import { setCurrentSpade, setCurrentSpadeRetailer } from '../../redux/reducers/userDataSlice';
import { useDispatch, useSelector } from 'react-redux';
import CloseSpadeModal from '../components/CloseSpadeModal';
import SuccessModal from '../components/SuccessModal';
import { setCurrentSpadeRetailers } from '../../redux/reducers/userDataSlice';
import { setSpades } from '../../redux/reducers/userDataSlice';
import useRequestSocket from './useRequestSocket';
import { socket } from '../../utils/scoket.io/socket';
import Star from '../../assets/Star.svg';
import HomeIcon from '../../assets/homeIcon.svg';
import { getGeoCoordinates, haversineDistance } from '../../utils/logics/Logics';
import { formatDateTime } from '../../utils/logics/Logics';

const RequestDetail = () => {
    const navigation = useNavigation();

    const spade = useSelector(store => store.user.currentSpade);
    const spades = useSelector(store => store.user.spades);
    const [modal, setModal] = useState(false);
    const [retailers, setRetailers] = useState([]);
    const dispatch = useDispatch();
    const [confirmModal, setConfirmModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const currentSpadeRetailers = useSelector(store => store.user.currentSpadeRetailers);
    const currentSpade = useSelector(store => store.user.currentSpade);
    const [socketConnected, setSocketConnected] = useState(false);
    const [userLongitude, setUserLongitude] = useState(0);
    const [userLatitude, setUserLatitude] = useState(0);

    const connectSocket = async (id) => {
        // socket.emit("setup", currentSpadeRetailer?.users[1]._id);
        socket.emit("setup", id);
        //  console.log('Request connected with socket with id', spadeId);
        socket.on('connected', () => setSocketConnected(true));
        console.log('Particular spade socekt connect with id', id);
    }



    useEffect(() => {
        // const socket = io('http://your-server-address:3000');
        const spadeId = currentSpade._id;
        connectSocket(spadeId);



        // socket.on('updated retailer', (updatedUser) => {
        //     console.log('Message receiver for chat for unread chat', updatedUser);
        //     // setCurrentSpadeRetailers((prevUsers) => {
        //     //     return prevUsers.map((user) =>
        //     //         user._id === updatedUser._id ? updatedUser : user
        //     //     );
        //     // });
        // });

        const fetchRetailers = () => {
            axios.get(`http://173.212.193.109:5000/chat/spade-chats`, {
                params: {
                    id: currentSpade._id,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        // setRetailers(response.data);
                        const chats = response.data;
                        chats.map(chat => {
                            const data = formatDateTime(chat.updatedAt);
                            chat.updatedAt = data.formattedTime;
                            chat.createdAt = data.formattedDate;
                            // console.log(mess.createdAt);
                            console.log(chat._id, chat.updatedAt);
                        })

                        console.log('all reatailers fetched while setting up socket');
                        dispatch(setCurrentSpadeRetailers(chats));
                    }
                })
                .catch((error) => {
                    console.error('Error while fetching chats', error);
                });
        }
        fetchRetailers();
        getGeoCoordinates().then(coordinates => {
            console.log('coordinates', coordinates);
            if (coordinates) {
                setUserLongitude(coordinates.coords.longitude);
                setUserLatitude(coordinates.coords.latitude);
            }
        })


        return () => {
            // socket.disconnect();
            socket.emit('leave room', spadeId);
            console.log('Reailer disconnected');
        };
    }, []);

    useEffect(() => {
        const handleMessageReceived = (updatedUser) => {
            console.log('Updated user data received at socket', updatedUser._id);
            const data = formatDateTime(updatedUser.updatedAt);
            updatedUser.createdAt = data.formattedDate;
            updatedUser.updatedAt = data.formattedTime;
            // dispatch(setCurrentSpadeRetailers((prevUsers) => {
            //     return prevUsers.map((user) =>
            //         user._id === updatedUser._id ? updatedUser : user
            //     );
            // }));
            const retailers = currentSpadeRetailers.filter(c => c._id !== updatedUser._id);

            dispatch(setCurrentSpadeRetailers([updatedUser, ...retailers]));
        };

        socket.on("updated retailer", handleMessageReceived);

        // Cleanup the effect
        return () => {
            socket.off("updated retailer", handleMessageReceived);
        };
    }, []); // No dependencies


    // console.log('spade details', spade);

    // useEffect(() => {
    //     // console.log('object', spade._id);
    //     const fetchRetailers = () => {
    //         axios.get(`http://173.212.193.109:5000/chat/spade-chats`, {
    //             params: {
    //                 id: spade._id,
    //             }
    //         })
    //             .then((response) => {
    //                 if (response.status === 200) {
    //                     setRetailers(response.data);
    //                     // console.log('all reatailers', response.data);
    //                     dispatch(setCurrentSpadeRetailers(response.data));
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.error('Error while fetching chats', error);
    //             });
    //     }
    //     fetchRetailers();
    // }, []);

    const closeRequest = async () => {

        const request = await axios.patch(`http://173.212.193.109:5000/user/closespade/`, {
            id: spade._id
        });

        if (request.status === 200) {
            console.log('request closed');
            spades = spades.filter(curr => curr._id !== request._id);
            dispatch(setSpades(spades));
            navigation.navigate('home');
        }
        else {
            console.error('Error occuring while closing user request');
        }

    }

    return (
        <>
            {<SafeAreaView style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ flex: 1 }} className="relative">

                        <View className="z-50 w-full flex flex-row px-[9px] absolute justify-between  top-[37px]">


                            <Pressable onPress={() => { navigation.goBack(); }}>
                                <View className="px-[20px] py-[10px] ">
                                    <ArrowLeft />
                                </View>
                            </Pressable>

                            {spade.requestActive !== "closed" && <Pressable onPress={() => { setModal(!modal) }} >
                                <View className="px-[20px] py-[10px] ">
                                    <ThreeDots />
                                </View>
                            </Pressable>}



                        </View>

                        {modal && <View className="absolute top-[20px] right-[50px] z-50 bg-white">
                            <Pressable onPress={() => navigation.navigate('view-request', { data: spade })}>
                                <Text className="mx-5 border-1 border-b-[1px] py-5">View Request</Text>
                            </Pressable>
                            <Pressable onPress={() => closeRequest()}>
                                <Text className="mx-5 py-5">Close Request</Text>
                            </Pressable>
                        </View>}

                        <View className="bg-[#ffe7c8] px-[64px] py-[30px]">
                            <Text className="text-[16px] font-extrabold">Request for</Text>
                            <View className=" flex-row">
                                <Text className="text-[14px] bg-[#fb8c00]  text-white px-1 py-1 my-[7px]">{spade?.requestCategory}</Text>
                            </View>
                            <View className="flex-row gap-[10px] items-center ">
                                <Text className="font-extrabold text-[12px]">Request ID:</Text>
                                <Text className="text-[12px]">{spade._id}</Text>
                                <Pressable onPress={() => { Clipboard.setString(spade._id) }}>
                                    <Image source={require('../../assets/copy.png')} />
                                </Pressable>


                            </View>
                            <Text className="mt-[5px]">{spade.requestDescription}</Text>
                            <Pressable onPress={() => navigation.navigate('image-refrences')}>
                                <View className="flex-row gap-[15px] mt-[15px] items-center">
                                    <Image source={require('../../assets/gallery.png')} />
                                    <Text className="text-[14px] font-extrabold text-[#fb8c00]">Image References</Text>
                                </View>
                            </Pressable>

                            <View>{
                                (spade.requestActive === "completed" || spade.requestActive === "closed") && <View className="flex-row gap-[5px] mt-[15px]">
                                    <Tick />
                                    <Text className="font-bold text-[##79B649]">Spade Completed</Text>


                                </View>
                            }</View>
                        </View>

                        <View>
                            {
                                currentSpadeRetailers && currentSpadeRetailers.length > 0 && currentSpadeRetailers.map((details, index) => {
                                    let distance = null;
                                    // if (userLongitude !== 0 && userLatitude !== 0 && details.retailerId.longitude !== 0 && details.retailerId.lattitude !== 0) {
                                    //     distance = haversineDistance(userLongitude, userLatitude, details.retailerId.lattitude, details.retailerId.longitude);
                                    // }
                                    // else
                                    if (details.customerId.longitude !== 0 && details.customerId.latitude !== 0 && details.retailerId.longitude !== 0 && details.retailerId.lattitude !== 0) {
                                        distance = haversineDistance(details.customerId.latitude, details.customerId.longitude, details.retailerId.lattitude, details.retailerId.longitude);
                                    }
                                    console.log(details.customerId.latitude, details.customerId.longitude);

                                    // Calculate distance if coordinates are valid
                                    // distance = validCoordinates ? haversineDistance(details.customerId.latitude, details.customerId.longitude, details.retailerId.lattitude, details.retailerId.longitude) : null;
                                    return (
                                        <Pressable key={index} onPress={() => { dispatch(setCurrentSpadeRetailer(details)); navigation.navigate('bargain') }}>
                                            <View className={`flex-row px-[34px] gap-[20px] h-[96px] w-screen items-center border-b-[1px] border-[#3f3d56] ${((spade.requestActive === "completed" || spade.requestActive === "closed") && spade.requestAcceptedChat !== details._id) ? "bg-[#001b33] opacity-50" : ""}`}>

                                                {details?.users.length > 0 && <Image
                                                    source={{ uri: details?.users[0].populatedUser.storeImages[0] ? details?.users[0].populatedUser.storeImages[0] : 'https://res.cloudinary.com/kumarvivek/image/upload/v1718021385/fddizqqnbuj9xft9pbl6.jpg' }}
                                                    style={styles.image}
                                                />}
                                                <View className="gap-[10px] w-4/5">
                                                    <View className="flex-row justify-between">
                                                        <Text className="text-[14px] text-[#2e2c43] ">{details?.users[0].populatedUser.storeName}</Text>
                                                        <View className="flex-row items-center gap-[5px]">
                                                            <GreenClock />
                                                            <Text className="text-[12px] text-[#558b2f]">{details.updatedAt}</Text>
                                                        </View>
                                                    </View>
                                                    {/* <View className="flex-row items-center gap-[15px]">

                                                        {details?.retailerId?.totalReview > 0 && (
                                                            <View className="flex-row items-center gap-[5px]">
                                                                <Star />
                                                                <Text><Text>{parseFloat(details.retailerId.totalRating / details.retailerId.totalReview).toFixed(1)}</Text>/5</Text>
                                                            </View>
                                                        )}

                                                        {details?.retailerId?.homeDelivery && <View>
                                                            <HomeIcon />
                                                        </View>}
                                                        {
                                                            distance && <View>
                                                                <Text className="bg-[#ffe7c8] text-text  px-[5px] py-[2px] rounded-md"><Text>{parseFloat(distance).toFixed(1)}</Text> km</Text>
                                                            </View>
                                                        }
                                                    </View> */}

                                                    <View className="flex-row justify-between">
                                                        <View className="flex-row gap-[5px]">
                                                            <Gallery />
                                                            <Text className="text-[14px] text-[#c4c4c4]">{details?.latestMessage?.message || 'No message available'}</Text>

                                                        </View>
                                                        {details?.unreadCount > 0 && <View className="w-[18px] h-[18px] rounded-full bg-[#55cd00] flex-row justify-center items-center">
                                                            <Text className=" text-white text-[12px] font-bold ">{details.unreadCount}</Text>
                                                        </View>}
                                                    </View>


                                                </View>
                                            </View>
                                        </Pressable>
                                    )
                                })
                            }


                        </View>
                    </View>
                </ScrollView>

                {spade.requestActive === "completed" && <View className="w-screen h-[68px]  bg-[#fb8c00] justify-center absolute bottom-0 left-0 right-0">
                    <Pressable onPress={() => { setConfirmModal(true); }}>
                        <Text className="text-white font-bold text-center text-[16px]">Close Request</Text>
                    </Pressable>
                </View>}
            </SafeAreaView>}
            {confirmModal && <CloseSpadeModal confirmModal={confirmModal} setConfirmModal={setConfirmModal} setSuccessModal={setSuccessModal} />}
            {successModal && <SuccessModal successModal={successModal} setSuccessModal={setSuccessModal} successMessage={"Request Closed"} />}
        </>
    )
}


const styles = {

    image: {
        width: 50,
        height: 50,
        borderRadius: 15
    },

};



export default RequestDetail;