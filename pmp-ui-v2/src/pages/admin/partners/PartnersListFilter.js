import { useState, useEffect } from "react";
import DropdownComponent from "../../common/fields/DropdownComponent.js";
import TextInputComponent from "../../common/fields/TextInputComponent.js";
import { useTranslation } from "react-i18next";
import { isLangRTL, createDropdownData, createRequest, getPartnerManagerUrl, handleServiceErrors, validateInputRegex, getFilterTextFieldStyle, getFilterDropdownStyle } from "../../../utils/AppUtils.js";
import { getUserProfile } from '../../../services/UserProfileService';
import { HttpService } from "../../../services/HttpService.js";
import PropTypes from 'prop-types';

function PartnerListFilter({ onApplyFilter, setErrorCode, setErrorMsg }) {
  const { t } = useTranslation();

  const [partnerType, setPartnerType] = useState([]);
  const [status, setStatus] = useState([]);
  const [certUploadStatus, setCertUploadStatus] = useState([]);
  const isLoginLanguageRTL = isLangRTL(getUserProfile().locale);
  const [certUploadStatusDropdownData, setCertUploadStatusDropdownData] = useState([
    { certificateUploadStatus: 'uploaded' },
    { certificateUploadStatus: 'not_uploaded' }
  ]);
  const [statusDropdownData, setStatusDropdownData] = useState([
    { status: 'active' },
    { status: 'deactivated' }
  ]);
  const [filters, setFilters] = useState({
    partnerId: "",
    partnerType: "",
    status: "",
    orgName: "",
    emailAddress: "",
    certificateUploadStatus: "",
    policyGroupName: ""
  });
  const [invalidPartnerId, setInvalidPartnerId] = useState("");
  const [invalidOrgName, setInvalidOrgName] = useState("");
  const [invalidPolicyGroup, setInvalidPolicyGroup] = useState("");
  const [invalidEmail, setInvalidEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const partnerTypeDropdownData = await fetchPartnerTypeData();
      setPartnerType(
        createDropdownData("partnerType", "", true, partnerTypeDropdownData, t, t("partnerList.selectPartnerType"))
      );
      setStatus(
        createDropdownData("status", "", true, statusDropdownData, t, t("partnerList.selectStatus"))
      );
      setCertUploadStatus(
        createDropdownData("certificateUploadStatus", "", true, certUploadStatusDropdownData, t, t("partnerList.selectCertUploadStatus"))
      );
    };

    fetchData();
  }, [t]);

  async function fetchPartnerTypeData() {
    const request = createRequest({
      "filters": [],
      "pagination": { "pageFetch": 100, "pageStart": 0 },
      "sort": []
    });

    try {
      const response = await HttpService.post(
        getPartnerManagerUrl(`/partners/partnertype/search`, process.env.NODE_ENV),
        request
      );

      if (response && response.data) {
        const responseData = response.data;
        if (responseData.response && responseData.response.data) {
          const partnerTypeData = responseData.response.data.map(item => ({
            partnerType: item.code
          }));
          return partnerTypeData;
        } else {
          handleServiceErrors(responseData, setErrorCode, setErrorMsg);
          return [];
        }
      } else {
        setErrorMsg(t('partnerList.errorInPartnersList'));
        return [];
      }
    } catch (err) {
      console.error("Error fetching partner type data: ", err);
      if (err.response?.status && err.response.status !== 401) {
        setErrorMsg(err.message || t('partnerList.errorInPartnersList'));
      }
      return [];
    }
  }


  const onFilterChangeEvent = (fieldName, selectedFilter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [fieldName]: selectedFilter
    }));
    if (fieldName === 'partnerId') { validateInputRegex(selectedFilter, setInvalidPartnerId, t); }
    if (fieldName === 'orgName') { validateInputRegex(selectedFilter, setInvalidOrgName, t); }
    if (fieldName === 'policyGroupName') { validateInputRegex(selectedFilter, setInvalidPolicyGroup, t); }
    if (fieldName === 'emailAddress') { validateInputRegex(selectedFilter, setInvalidEmail, t); }
  };

  const areFiltersEmpty = () => {
    return Object.values(filters).every(value => value === "") || invalidPartnerId || invalidOrgName || invalidPolicyGroup || invalidEmail;
  };

  return (
    <div className="flex w-full p-2.5 justify-start bg-[#F7F7F7] flex-wrap">
      <TextInputComponent
        fieldName="partnerId"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.partnerId}
        fieldNameKey="partnerList.partnerId"
        placeHolderKey="partnerList.searchPartnerId"
        styleSet={getFilterTextFieldStyle()}
        id="partner_id_filter"
        inputError={invalidPartnerId}
      />
      <DropdownComponent
        fieldName="partnerType"
        dropdownDataList={partnerType}
        onDropDownChangeEvent={onFilterChangeEvent}
        fieldNameKey="partnerList.partnerType"
        placeHolderKey="partnerList.selectPartnerType"
        styleSet={getFilterDropdownStyle()}
        isPlaceHolderPresent={true}
        id="partner_type_filter"
      />
      <TextInputComponent
        fieldName="orgName"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.orgName}
        fieldNameKey="partnerList.organisation"
        placeHolderKey="partnerList.searchOrganisation"
        styleSet={getFilterTextFieldStyle()}
        id="partner_organisation_filter"
        inputError={invalidOrgName}
      />
      <TextInputComponent
        fieldName="policyGroupName"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.policyGroupName}
        fieldNameKey="partnerList.policyGroup"
        placeHolderKey="partnerList.searchPolicyGroup"
        styleSet={getFilterTextFieldStyle()}
        id="policy_group_filter"
        inputError={invalidPolicyGroup}
      />
      <TextInputComponent
        fieldName="emailAddress"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.emailAddress}
        fieldNameKey="partnerList.email"
        placeHolderKey="partnerList.searchEmailAddress"
        infoKey={"partnerList.emailAddressToolTip"}
        addInfoIcon={true}
        styleSet={getFilterTextFieldStyle()}
        id="email_address_filter"
        inputError={invalidEmail}
      />
      <DropdownComponent
        fieldName="certificateUploadStatus"
        dropdownDataList={certUploadStatus}
        onDropDownChangeEvent={onFilterChangeEvent}
        fieldNameKey="partnerList.certUploadStatus"
        placeHolderKey="partnerList.selectCertUploadStatus"
        styleSet={getFilterDropdownStyle()}
        isPlaceHolderPresent={true}
        id="cert_upload_status_filter"
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

PartnerListFilter.propTypes = {
    onApplyFilter: PropTypes.func.isRequired,
    setErrorCode: PropTypes.func.isRequired,
    setErrorMsg: PropTypes.func.isRequired,
};

export default PartnerListFilter;
