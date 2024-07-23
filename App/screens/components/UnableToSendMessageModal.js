import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React from 'react';
import SuccessImg from '../../assets/SuccessImg.svg';
import DocumentIcon from '../../assets/DocumentIcon.svg';
import { useNavigation } from '@react-navigation/native';

const UnableToSendMessage = ({ openModal, setOpenModal, errorContent, ErrorIcon }) => {
    // console.log(errorModal);
    const navigation = useNavigation();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={openModal}
            onRequestClose={() => {
                setOpenModal(!openModal);
            }}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                    <ErrorIcon width={71} height={98} />
                    <Text style={{ marginTop: 25, alignItems: 'center', textAlign: 'center', fontSize: 14, color: '#2e2c43', fontFamily: 'Poppins-Regular' }}>{errorContent}</Text>
                    {/* <Text style={{ alignItems: 'center', fontSize: 14, textAlign: 'center', color: '#E76063', fontFamily: 'Poppins-Regular' }}>You can upload documents up to <Text style={{ fontFamily: 'Poppins-Bold' }}>2MB</Text>  in size</Text> */}
                    <TouchableOpacity onPress={() => { setOpenModal(false), navigation.goBack(); }}>
                        <Text style={{ marginTop: 20, alignItems: 'center', fontSize: 16, color: '#fb8c00', fontFamily: 'Poppins-Bold' }}>Ok</Text>
                    </TouchableOpacity>


                </View>

            </View>
        </Modal>
    )
}

export default UnableToSendMessage;