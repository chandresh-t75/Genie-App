import { View, Text, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import ArrowLeft from '../../assets/arrow-left.svg';
import Genie from '../../assets/Genie.svg';
import { useNavigation } from '@react-navigation/native';
import { setRequestDetail } from '../../redux/reducers/userRequestsSlice';
import { useSelector, useDispatch } from 'react-redux';
import BackArrow from "../../assets/BackArrowImg.svg";


const RequestEntry = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [query, setQuery] = useState("");
    const requestDetail = useSelector(store => store.userRequest.requestDetail);



    return (
        <View style={{ flex: 1,backgroundColor: "white"  }}>
            <View style={{ flex: 1 }}>

                <View className=" w-full flex flex-row px-[29px]  justify-between absolute  top-[60px]">
                    <Pressable onPress={() => { navigation.goBack() }} className="p-2">
                        <BackArrow width={14} height={10} />

                    </Pressable>
                </View>

                <View className="flex-row justify-center mt-[40px] mb-[10px] ">
                    <Genie width={35} height={52} />
                </View>
                <Text className="text-[14.5px]  text-[#FB8C00] text-center mb-[10px] " style={{fontFamily:"Poppins-Medium"}}>
                    Step 1/4
                </Text>

                <View className="px-[32px] mb-[20px]">
                    <Text className="text-[16px]  text-[#2e2c43] text-center mb-[18px] " style={{fontFamily:"Poppins-Black"}}>Type your spade</Text>

                    <Text className="text-[14px] mx-[16px] mt-[15px] text-center text-[#2e2c43]" style={{fontFamily:"Poppins-Regular"}}>like: My phone charger get damage / I want a 55 inch screen tv / I need a plumber to repair my water supply. </Text>

                </View>

                <View className="mx-[20px]  h-[127px] bg-[#f9f9f9] rounded-xl ">
                    <TextInput
                        multiline
                        numberOfLines={6}
                        onChangeText={(val) => {
                            setQuery(val);
                        }}
                        value={query}
                        placeholder="Type here..."
                        placeholderTextColor="#dbcdbb"
                        className="w-full h-[127px] overflow-y-scroll px-[20px] border-[0.3px] border-[#2e2c43] rounded-xl"
                        style={{ padding: 20, height: 300, flex: 1, textAlignVertical: 'top',fontFamily:"Poppins-Regular" }}
                    />
                </View>



                {/* <View className=" absolute bottom-0 left-0 right-0">
                    <TouchableOpacity onPress={() => { dispatch(setRequestDetail(query)); console.log(requestDetail); navigation.navigate('requestcategory'); }}>
                        <View className="w-full h-[63px] bg-[#fb8c00]  flex items-center justify-center  ">
                            <Text className="text-white text-[18px] font-extrabold">NEXT</Text>
                        </View>
                    </TouchableOpacity>
                </View> */}

                <TouchableOpacity
                    disabled={!query}
                    onPress={() => { dispatch(setRequestDetail(query)); console.log(requestDetail); navigation.navigate('requestcategory'); }}
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
                            fontFamily:"Poppins-Black" ,
                            color: !query ? "#888888" : "white",
                        }}
                    >
                        NEXT
                    </Text>
                </TouchableOpacity>


            </View>
        </View>
    )
}

export default RequestEntry;