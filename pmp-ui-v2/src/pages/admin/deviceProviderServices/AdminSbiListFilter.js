import { useState, useEffect } from "react";
import DropdownComponent from "../../common/fields/DropdownComponent";
import TextInputComponent from "../../common/fields/TextInputComponent";
import { useTranslation } from "react-i18next";
import { getUserProfile } from "../../../services/UserProfileService";
import { isLangRTL, createDropdownData, validateInputRegex, getFilterDropdownStyle, getFilterTextFieldStyle } from "../../../utils/AppUtils";
import PropTypes from 'prop-types';

function AdminSbiListFilter( {onApplyFilter} ) {
    const { t } = useTranslation();
    const isLoginLanguageRTL = isLangRTL(getUserProfile().locale);
    const [status, setStatus] = useState([]);
    const [sbiExpiryStatus, setSbiExpiryStatus] = useState([]);
    const [statusDropdownData, setStatusDropdownData] = useState([
        { status: 'approved' },
        { status: 'rejected'},
        { status: 'pending_approval'},
        { status: 'deactivated'}
    ]);
    const [sbiExpiryStatusDropdownData, setSbiExpiryStatusDropdownData] = useState([
        { sbiExpiryStatus: 'expired' },
        { sbiExpiryStatus: 'valid'}
      ]);
    const [filters, setFilters] = useState({
      partnerId: "",
      orgName: "",
      sbiId: "",
      sbiVersion: "",
      status: "",
      sbiExpiryStatus: "",
    });
    const [invalidPartnerId, setInvalidPartnerId] = useState("");
    const [invalidOrgName, setInvalidOrgName] = useState("");
    const [invalidSbiId, setInvalidSbiId] = useState("");
    const [invalidSbiVersion, setInvalidSbiVersion] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setStatus(createDropdownData("status", "", true, statusDropdownData, t, t("partnerList.selectStatus")));
            setSbiExpiryStatus(createDropdownData("sbiExpiryStatus", "", true, sbiExpiryStatusDropdownData, t, t("sbiList.selectSbiExpiryStatus")));
        };
        fetchData();
    }, [t]);

    const onFilterChangeEvent = (fieldName, selectedFilter) => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          [fieldName]: selectedFilter
        }));
        if (fieldName === 'partnerId') { validateInputRegex(selectedFilter, setInvalidPartnerId, t); }
        if (fieldName === 'orgName') { validateInputRegex(selectedFilter, setInvalidOrgName, t); }
        if (fieldName === 'sbiId') { validateInputRegex(selectedFilter, setInvalidSbiId, t); }
        if (fieldName === 'sbiVersion') { validateInputRegex(selectedFilter, setInvalidSbiVersion, t); }
    };

    const areFiltersEmpty = () => {
        return Object.values(filters).every(value => value === "") || invalidPartnerId || invalidOrgName
            || invalidSbiId || invalidSbiVersion;
    };

    return (
        <div className="flex w-full p-2.5 justify-start bg-[#F7F7F7] flex-wrap">
            <TextInputComponent
                fieldName="partnerId"
                onTextChange={onFilterChangeEvent}
                fieldNameKey="oidcClientsList.partnerId"
                placeHolderKey="partnerList.searchPartnerId"
                styleSet={getFilterTextFieldStyle()}
                id="partner_id_filter"
                inputError={invalidPartnerId}
            />
            <TextInputComponent
                fieldName="orgName"
                onTextChange={onFilterChangeEvent}
                fieldNameKey="oidcClientsList.orgName"
                placeHolderKey="partnerList.searchOrganisation"
                styleSet={getFilterTextFieldStyle()}
                id="org_name_filter"
                inputError={invalidOrgName}
            />
            <TextInputComponent
                fieldName="sbiId"
                onTextChange={onFilterChangeEvent}
                fieldNameKey="sbiList.sbiId"
                placeHolderKey="sbiList.searchSbiId"
                styleSet={getFilterTextFieldStyle()}
                id="sbi_id_filter"
                inputError={invalidSbiId}
            />
            <TextInputComponent
                fieldName="sbiVersion"
                onTextChange={onFilterChangeEvent}
                fieldNameKey="sbiList.sbiVersion"
                placeHolderKey="sbiList.searchVersion"
                styleSet={getFilterTextFieldStyle()}
                id="sbi_version_filter"
                inputError={invalidSbiVersion}
            />
            <DropdownComponent
                fieldName="sbiExpiryStatus"
                dropdownDataList={sbiExpiryStatus}
                onDropDownChangeEvent={onFilterChangeEvent}
                fieldNameKey="sbiList.sbiExpiryStatus"
                placeHolderKey="sbiList.selectSbiExpiryStatus"
                styleSet={getFilterDropdownStyle()}
                isPlaceHolderPresent={true}
                id="sbi_expiry_status_filter"
            />
            <DropdownComponent
                fieldName="status"
                dropdownDataList={status}
                onDropDownChangeEvent={onFilterChangeEvent}
                fieldNameKey="partnerList.status"
                placeHolderKey="partnerList.selectStatus"
                styleSet={getFilterDropdownStyle()}
                isPlaceHolderPresent={true}
                id="status_filter"
            />
            <div className={`mt-6 mr-6 ${isLoginLanguageRTL ? "mr-auto" : "ml-auto"}`}>
                <button
                id="apply_filter__btn"
                onClick={() => onApplyFilter(filters)}
                type="button"
                disabled={areFiltersEmpty()}
                className={`h-10 text-sm font-semibold px-7 text-white rounded-md ml-6 
                ${areFiltersEmpty() ? 'bg-[#A5A5A5] cursor-auto' : 'bg-tory-blue'}`}
                >
                {t("partnerList.applyFilter")}
                </button>
            </div>
        </div>
    );

}

AdminSbiListFilter.propTypes = {
    onApplyFilter: PropTypes.func.isRequired,
};

export default AdminSbiListFilter;