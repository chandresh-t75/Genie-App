import {
    View,
    Button,
    Image,
    Text,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
} from "react-native";
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Send from "../../assets/SendMessage.svg";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { formatDateTime } from "../../utils/logics/Logics";
import { setCurrentSpadeRetailer, setCurrentSpadeRetailers } from "../../redux/reducers/userDataSlice";
import { socket } from "../../utils/scoket.io/socket";

const SendDocument = () => {

    const [query, setQuery] = useState("");
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const currentSpadeRetailer = useSelector(state => state.user.currentSpadeRetailer);
    const currentSpadeRetailers = useSelector(state => state.user.currentSpadeRetailers);
    const currentSpade = useSelector(state => state.user.currentSpade);
    const route = useRoute();
    const { result, messages, setMessages } = route.params;
    const [loading, setLoading] = useState(false);
    const fileSize = parseFloat(result.assets[0].size) / (1e6);
    console.log('document result', result);
    console.log('fileSize', fileSize);

    const sendDocument = async () => {
        console.log('Sending document');
        try {

            if (!result) {
                console.log('No document selected');
                return;
            }

            const formData = new FormData();
            const message = `${result.assets[0].size} | ${result.assets[0].name} | ${query}`
            formData.append('bidImages', {
                uri: result.assets[0].uri,
                name: result.assets[0].name,
                type: result.assets[0].mimeType,
            });

            const fileSizeMB = parseFloat(result.assets[0].size) / (1e6);

            formData.append('sender', JSON.stringify({ type: 'UserRequest', refId: currentSpadeRetailer.requestId._id }));
            formData.append('userRequest', currentSpade._id);
            formData.append('message', query);
            formData.append('bidType', "document");
            formData.append('chat', currentSpadeRetailer._id);
            formData.append('bidPrice', result.assets[0].size);

            await axios.post('http://173.212.193.109:5000/chat/send-message', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(res);
                    const data = formatDateTime + (res.data.createdAt);
                    res.data.createdAt = data.formattedTime;

                    //updating messages
                    setMessages([...messages, res.data]);
                    console.log('mess after send document', res.data);
                    //updating chat latest message
                    setLoading(false);
                    const updateChat = { ...currentSpadeRetailer, unreadCount: 0, latestMessage: { _id: res.data._id, message: res.data.message, bidType: "false", sender: { type: 'UserRequest', refId: currentSpade._id } } };
                    const updatedRetailers = [updateChat, ...currentSpadeRetailers.filter(c => c._id !== updateChat._id)];
                    dispatch(setCurrentSpadeRetailers(updatedRetailers));
                    dispatch(setCurrentSpadeRetailer(updateChat));

                    socket.emit("new message", res.data);
                    navigation.goBack();
                })
                .catch(err => {
                    setLoading(false);
                    console.log(err);
                })
        } catch (error) {
            setLoading(false);
            console.error('Error while sending document', error);
        }
    }
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <View style={{ flex: 1 }}>
                <View className="flex-col items-center mt-[200px]">
                    <MaterialCommunityIcons name="file-document-multiple-outline" size={80} color="white" />
                    <Text className="text-white text-[16px] pt-[10px]">{result?.assets[0].name}</Text>
                    <Text className="text-white">{fileSize < 1 ? `${(parseFloat(fileSize).toFixed(3) * 1000)} kb` : `${parseFloat(fileSize).toFixed(1)}Mb`}</Text>
                </View>
                <KeyboardAvoidingView
                    behavior={"height"}
                    style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}
                >
                    <TextInput
                        placeholder="Add response..."
                        placeholderTextColor="white"
                        style={{
                            height: 64,
                            backgroundColor: "#001b33",
                            marginBottom: 0,
                            marginHorizontal: 15,
                            borderWidth: 2,
                            borderColor: "#fb8c00",
                            borderRadius: 30,
                            fontWeight: "bold",
                            paddingHorizontal: 30,
                            color: "white",
                        }}
                        onChangeText={(val) => {
                            setQuery(val);
                        }}
                        value={query}
                    />
                </KeyboardAvoidingView>
                <View className=" flex-row justify-between items-center mx-[25px] pb-[10px]">
                    <Text
                        className="text-white pl-[40px] capitalize"
                        style={{ fontFamily: "Poppins-SemiBold" }}
                    >
                        {currentSpadeRetailer?.retailerId.storeName.length > 25 ? `${currentSpadeRetailer?.retailerId.storeName.slice(0, 25)}...` : currentSpadeRetailer?.retailerId.storeName}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            sendDocument();
                        }}
                    >
                        {loading ? (
                            <View className="bg-[#fb8c00] p-[20px] rounded-full">
                                <ActivityIndicator size="small" color="#ffffff" />
                            </View>
                        ) : (
                            <Send />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}

export default SendDocument