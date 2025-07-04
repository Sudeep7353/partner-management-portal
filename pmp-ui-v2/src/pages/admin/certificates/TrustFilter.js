
import { useState, useEffect } from 'react';
import DropdownComponent from '../../common/fields/DropdownComponent.js';
import { useTranslation } from 'react-i18next';
import { createDropdownData, getFilterDropdownStyle, getFilterTextFieldStyle, isLangRTL, validateInputRegex } from '../../../utils/AppUtils.js';
import TextInputComponent from '../../common/fields/TextInputComponent.js';
import { getUserProfile } from '../../../services/UserProfileService.js';
import PropTypes from 'prop-types';

function TrustFilter({ onApplyFilter }) {
    const { t } = useTranslation();
    const isLoginLanguageRTL = isLangRTL(getUserProfile().locale);
    const [partnerDomainData, setPartnerDomainData] = useState([]);
    const [partnerDomainDropdownData, setPartnerDomainDropdownData] = useState([
        { partnerDomain: 'AUTH' },
        { partnerDomain: 'DEVICE' },
        { partnerDomain: 'FTM' }
    ]);
    const [filters, setFilters] = useState({
        certificateId: "",
        partnerDomain: "",
        issuedTo: "",
        issuedBy: "",
    });
    const [invalidCertId, setInvalidCertId] = useState("");
    const [invalidIssuedTo, setInvalidIssuedTo] = useState("");
    const [invalidIssuedBy, setInvalidIssuedBy] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setPartnerDomainData(
                createDropdownData("partnerDomain", "", true, partnerDomainDropdownData, t, t("trustList.selectPartnerDomain"))
            );
        };
        fetchData();
    }, [t]);

    const onFilterChangeEvent = (fieldName, selectedFilter) => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          [fieldName]: selectedFilter
        }));
        if (fieldName === 'certificateId') { validateInputRegex(selectedFilter, setInvalidCertId, t); }
        if (fieldName === 'issuedTo') { validateInputRegex(selectedFilter, setInvalidIssuedTo, t); }
        if (fieldName === 'issuedBy') { validateInputRegex(selectedFilter, setInvalidIssuedBy, t); }
    };

    const areFiltersEmpty = () => {
        return Object.values(filters).every(value => value === "") || invalidCertId || invalidIssuedTo || invalidIssuedBy;
    };

    return (
        <>
            <div className="flex w-full p-3 justify-start bg-[#F7F7F7] flex-wrap">
                <TextInputComponent
                    fieldName="certificateId"
                    onTextChange={onFilterChangeEvent}
                    fieldNameKey="trustList.certificateId"
                    placeHolderKey="trustList.searchCertificateId"
                    styleSet={getFilterTextFieldStyle()}
                    id="cert_id_filter"
                    inputError={invalidCertId}
                />
                <DropdownComponent
                    fieldName="partnerDomain"
                    dropdownDataList={partnerDomainData}
                    onDropDownChangeEvent={onFilterChangeEvent}
                    fieldNameKey="trustList.partnerDomain"
                    placeHolderKey="trustList.selectPartnerDomain"
                    styleSet={getFilterDropdownStyle()}
                    isPlaceHolderPresent={true}
                    id="cert_partner_domain_filter"
                />
                <TextInputComponent
                    fieldName='issuedTo'
                    onTextChange={onFilterChangeEvent}
                    fieldNameKey='trustList.issuedTo'
                    placeHolderKey='trustList.searchIssuedTo'
                    styleSet={getFilterTextFieldStyle()}
                    id='cert_issued_to_filter'
                    inputError={invalidIssuedTo}
                />
                <TextInputComponent
                    fieldName='issuedBy'
                    onTextChange={onFilterChangeEvent}
                    fieldNameKey='trustList.issuedBy'
                    placeHolderKey='trustList.searchIssuedBy'
                    styleSet={getFilterTextFieldStyle()}
                    id='cert_issued_by_domain_filter'
                    inputError={invalidIssuedBy}
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
        </>
    );
}

TrustFilter.propTypes = {
    onApplyFilter: PropTypes.func.isRequired,
};

export default TrustFilter;