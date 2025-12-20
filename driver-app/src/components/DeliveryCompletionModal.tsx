import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StainedGlassTheme, Typography, Spacing, BorderRadius } from '../styles/globalStyles';

interface DeliveryCompletionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (photos: any[], signature: string) => Promise<void>;
    uploading: boolean;
}

export const DeliveryCompletionModal: React.FC<DeliveryCompletionModalProps> = ({
    visible,
    onClose,
    onSubmit,
    uploading
}) => {
    const [step, setStep] = useState(1); // 1: Photos, 2: Signature, 3: Review
    const [photos, setPhotos] = useState<any[]>([]);
    const [signature, setSignature] = useState<string | null>(null);
    const [skippedSignature, setSkippedSignature] = useState(false);
    const signatureRef = useRef<any>(null);

    // --- Photo Logic ---
    const handleTakeBitmap = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert("Permission Required", "Camera access is needed.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });

            if (!result.canceled && result.assets) {
                setPhotos([...photos, ...result.assets]);
            }
        } catch (e) {
            Alert.alert("Error", "Camera failed to open" + e);
        }
    }

    const removePhoto = (index: number) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    // --- Signature Logic ---
    const handleSignatureOK = (signatureBase64: string) => {
        setSignature(signatureBase64.replace('data:image/png;base64,', ''));
        setSkippedSignature(false);
        setStep(3); // Move to review
    };

    const handleSignatureClear = () => {
        signatureRef.current?.clearSignature();
        setSignature(null);
        setSkippedSignature(false);
    }

    const handleSignatureEnd = () => {
        signatureRef.current?.readSignature(); // Triggers onOK
    }

    const handleSignatureSkip = () => {
        setSignature(null);
        setSkippedSignature(true);
        setStep(3);
    }

    // --- Render Steps ---

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
                <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
            ))}
        </View>
    );

    const Step1Photos = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 1: Evidence</Text>
            <Text style={styles.stepSubtitle}>Take photos of the delivered cargo.</Text>

            <ScrollView horizontal contentContainerStyle={styles.photoList}>
                {photos.map((p, i) => (
                    <View key={i} style={styles.photoThumbContainer}>
                        <Image source={{ uri: p.uri }} style={styles.photoThumb} />
                        <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(i)}>
                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={styles.addPhotoBtn} onPress={handleTakeBitmap}>
                    <Ionicons name="camera" size={32} color={StainedGlassTheme.colors.gold} />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
                style={[styles.nextBtn, photos.length === 0 && styles.disabledBtn]}
                onPress={() => {
                    if (photos.length > 0) setStep(2);
                    else Alert.alert("Required", "Please take at least one photo.");
                }}
            >
                <Text style={styles.nextBtnText}>Next: Signature</Text>
                <Ionicons name="arrow-forward" size={20} color="#1A0B4E" />
            </TouchableOpacity>
        </View>
    );

    const Step2Signature = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2: Sign Off</Text>
            <Text style={styles.stepSubtitle}>Ask the customer to sign specifically in the box below.</Text>

            <View style={styles.signatureBox}>
                <SignatureScreen
                    ref={signatureRef}
                    onOK={handleSignatureOK}
                    webStyle={`.m-signature-pad--footer {display: none; margin: 0px;} body,html {width: 100%; height: 100%;}`}
                    backgroundColor="rgba(255,255,255,0.1)"
                    penColor={StainedGlassTheme.colors.gold}
                />
            </View>

            <View style={styles.sigActions}>
                <TouchableOpacity onPress={handleSignatureClear} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={handleSignatureSkip} style={styles.skipBtn}>
                        <Text style={styles.skipBtnText}>Skip / Unavailable</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignatureEnd} style={styles.nextBtn}>
                        <Text style={styles.nextBtnText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const Step3Review = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3: Finish</Text>
            <Text style={styles.stepSubtitle}>Ready to complete delivery?</Text>

            <View style={styles.summaryBox}>
                <Text style={styles.summaryRow}>Photos: <Text style={styles.summaryVal}>{photos.length}</Text></Text>
                <Text style={styles.summaryRow}>
                    Signature: <Text style={styles.summaryVal}>
                        {signature ? 'Captured' : (skippedSignature ? 'Skipped (Customer Unavailable)' : 'Missing')}
                    </Text>
                </Text>
            </View>

            <TouchableOpacity
                style={styles.mainActionBtn}
                onPress={() => onSubmit(photos, signature || '')}
                disabled={uploading}
            >
                {uploading ? <ActivityIndicator color="#1A0B4E" /> : <Text style={styles.mainActionText}>COMPLETE JOB</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)} disabled={uploading} style={styles.backBtn}>
                <Text style={styles.backBtnText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    <View style={styles.header}>
                        <Text style={styles.modalHeaderTitle}>Complete Delivery</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    {renderStepIndicator()}

                    {step === 1 && <Step1Photos />}
                    {step === 2 && <Step2Signature />}
                    {step === 3 && <Step3Review />}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: StainedGlassTheme.colors.deepPurple,
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: StainedGlassTheme.colors.goldDark,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalHeaderTitle: {
        ...Typography.h3,
        color: StainedGlassTheme.colors.parchment,
    },
    closeBtn: {
        padding: 4,
    },
    stepIndicator: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: Spacing.xl,
    },
    stepDot: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
    },
    stepDotActive: {
        backgroundColor: StainedGlassTheme.colors.gold,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        ...Typography.h4,
        color: StainedGlassTheme.colors.gold,
        marginBottom: 4,
    },
    stepSubtitle: {
        color: StainedGlassTheme.colors.parchmentLight,
        fontSize: 14,
        marginBottom: Spacing.lg,
    },
    // Photos
    photoList: {
        gap: Spacing.md,
        paddingVertical: Spacing.md,
    },
    photoThumbContainer: {
        position: 'relative',
    },
    photoThumb: {
        width: 120,
        height: 160,
        borderRadius: BorderRadius.md,
        backgroundColor: '#000',
    },
    removePhoto: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
    addPhotoBtn: {
        width: 120,
        height: 160,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: StainedGlassTheme.colors.gold,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
    },
    addPhotoText: {
        color: StainedGlassTheme.colors.gold,
        fontWeight: '600',
    },
    // Signature
    signatureBox: {
        height: 300,
        borderWidth: 1,
        borderColor: StainedGlassTheme.colors.goldMedium,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
        overflow: 'hidden',
    },
    sigActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.lg,
        gap: Spacing.md,
    },
    clearBtn: {
        padding: Spacing.md,
    },
    clearBtnText: {
        color: StainedGlassTheme.colors.parchmentLight,
    },
    // Common Buttons
    nextBtn: {
        backgroundColor: StainedGlassTheme.colors.gold,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
    },
    nextBtnText: {
        color: '#1A0B4E',
        fontWeight: 'bold',
        fontSize: 16,
    },
    skipBtn: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: StainedGlassTheme.colors.parchmentLight,
    },
    skipBtnText: {
        color: StainedGlassTheme.colors.parchmentLight,
        fontWeight: '600',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    // Review
    summaryBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
    },
    summaryRow: {
        color: StainedGlassTheme.colors.parchment,
        fontSize: 16,
        marginBottom: 8,
    },
    summaryVal: {
        color: StainedGlassTheme.colors.gold,
        fontWeight: 'bold',
    },
    mainActionBtn: {
        backgroundColor: '#34D399',
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.xxl,
        shadowColor: '#34D399',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    mainActionText: {
        color: '#1A0B4E',
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 1,
    },
    backBtn: {
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    backBtnText: {
        color: StainedGlassTheme.colors.parchmentLight,
    },
});
