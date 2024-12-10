import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native'
import React from 'react';
import UserImg from '../../assets/User.svg';
import { useNavigation } from '@react-navigation/native';
import { handleRefreshLocation } from '../../utils/logics/updateLocation';
import LocationRefreshImg from "../../assets/locationRefresh.svg"

const LocationRefreshModal = ({ locationRefresh, setLocationRefresh }) => {
    const navigation = useNavigation();
    return (
        <Modal
            visible={locationRefresh}
            transparent={true}
            animationType="fade"
            style={{ flex: 1 }}
        >
            <Pressable
                // onPress={() => { setSignUpModal(false) }}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
            >
                <View style={{ width:"85%", flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', padding: 20, paddingVertical: 40 }}>
                    <LocationRefreshImg width={150} height={150}/>
                    <Text style={{ fontFamily: 'Poppins-Black', fontSize: 16, color: '#2e2c43', marginTop: 20 }}>Refresh the location!</Text>
                    {/* <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 14, color: '#2e2c43', marginBottom: 30 }}>Enjoy seamless shopping experience</Text> */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 40 ,marginTop:10}}>
                        <TouchableOpacity onPress={() => { setLocationRefresh(false) }}>
                            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16, color: '#fb8c00' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {  handleRefreshLocation(); setTimeout(()=>{
                            setLocationRefresh(false);
                        },300)}}>
                            <Text style={{ fontFamily: 'Poppins-Black', fontSize: 16, color: '#fb8c00' }}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    )
}

export default LocationRefreshModal;