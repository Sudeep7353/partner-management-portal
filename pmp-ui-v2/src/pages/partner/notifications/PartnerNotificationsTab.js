import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { getUserProfile } from "../../../services/UserProfileService";
import { isLangRTL } from "../../../utils/AppUtils";

function PartnerNotificationsTab({ activeTab }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isLoginLanguageRTL = isLangRTL(getUserProfile().locale);
    const partnerType = getUserProfile().partnerType;

    const changeToPartnerCert = () => {
        navigate('/partnermanagement/notifications/view-partner-certificate-expiry');
    };

    const changeToFtmChipCert = () => {
        navigate('/partnermanagement/notifications/view-ftm-chip-certificate-expiry');
    };

    const changeToApiKeyTab = () => {
        navigate('/partnermanagement/notifications/view-api-key-expiry');
    };

    const changeToSbiTab = () => {
        navigate('/partnermanagement/notifications/view-sbi-expiry');
    };

    return (
        <div className={`flex text-xs bg-[#FCFCFC] font-bold ${isLoginLanguageRTL && 'space-x-reverse'} gap-x-4 sm:gap-x-16 items-start rounded-lg px-8`}>
            <div id='partner_cert_notifications_tab' className={`flex-col justify-center text-center w-full sm:w-auto`}>
                <button onClick={changeToPartnerCert} className={`${activeTab === "partner" ? "text-[#1447b2]" : "text-[#031640]"} py-4 cursor-pointer text-base`}>
                    <h6> {t('partnerNotificationsTab.partnerCertificate')} </h6>
                </button>

                <div className={`h-1 w-full ${activeTab === "partner" ? "bg-tory-blue" : "bg-transparent"}  rounded-t-md`}></div>
            </div>
            { partnerType === "FTM_PROVIDER" && (
                <div id='ftm_cert_notifications_tab' className={`flex-col justify-center text-center w-full sm:w-auto`}>
                    <button onClick={changeToFtmChipCert} className={`${activeTab === "ftm-chip" ? "text-[#1447b2]" : "text-[#031640]"} py-4 cursor-pointer text-base`}>
                        <h6> {t('partnerNotificationsTab.ftmCertificate')} </h6>
                    </button>

                    <div className={`h-1 w-full ${activeTab === "ftm-chip" ? "bg-tory-blue" : "bg-transparent"}  rounded-t-md`}></div>
                </div>
            )}
            { partnerType === "AUTH_PARTNER" && (
                <div id='api_key_notifications_tab' className={`flex-col justify-center text-center w-full sm:w-auto`}>
                    <button onClick={changeToApiKeyTab} className={`${activeTab === "apikey" ? "text-[#1447b2]" : "text-[#031640]"} py-4 cursor-pointer text-base`}>
                        <h6> {t('partnerNotificationsTab.apikey')} </h6>
                    </button>

                    <div className={`h-1 w-full ${activeTab === "apikey" ? "bg-tory-blue" : "bg-transparent"}  rounded-t-md`}></div>
                </div>
            )}
            { partnerType === "DEVICE_PROVIDER" && (
                <div id='sbi_notifications_tab' className={`flex-col justify-center text-center w-full sm:w-auto`}>
                    <button onClick={changeToSbiTab} className={`${activeTab === "sbi" ? "text-[#1447b2]" : "text-[#031640]"} py-4 cursor-pointer text-base`}>
                        <h6> {t('partnerNotificationsTab.sbi')} </h6>
                    </button>

                    <div className={`h-1 w-full ${activeTab === "sbi" ? "bg-tory-blue" : "bg-transparent"}  rounded-t-md`}></div>
                </div>
            )}
        </div>
    );
}

PartnerNotificationsTab.propTypes = {
    activeTab: PropTypes.string.isRequired,
};

export default PartnerNotificationsTab;