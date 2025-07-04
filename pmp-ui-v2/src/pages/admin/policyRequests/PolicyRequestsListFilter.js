import { useState, useEffect } from "react";
import DropdownComponent from "../../common/fields/DropdownComponent.js";
import TextInputComponent from "../../common/fields/TextInputComponent.js";
import { useTranslation } from "react-i18next";
import { isLangRTL, createDropdownData, createRequest, getPartnerManagerUrl, handleServiceErrors, validateInputRegex, getFilterTextFieldStyle, getFilterDropdownStyle } from "../../../utils/AppUtils.js";
import { getUserProfile } from '../../../services/UserProfileService';
import { HttpService } from "../../../services/HttpService.js";
import PropTypes from 'prop-types';

function PolicyRequestsListFilter({ onApplyFilter, setErrorCode, setErrorMsg }) {
  const { t } = useTranslation();

  const [partnerType, setPartnerType] = useState([]);
  const [status, setStatus] = useState([]);
  const isLoginLanguageRTL = isLangRTL(getUserProfile().locale);
  const [statusDropdownData, setStatusDropdownData] = useState([
    { status: 'approved' },
    { status: 'rejected' },
    { status: 'InProgress' }
  ]);
  const [filters, setFilters] = useState({
    partnerId: "",
    partnerType: "",
    status: "",
    orgName: "",
    policyId: "",
    policyName: "",
    policyGroupName: ""
  });
  const [invalidPartnerId, setInvalidPartnerId] = useState("");
  const [invalidOrgName, setInvalidOrgName] = useState("");
  const [invalidPolicyId, setInvalidPolicyId] = useState("");
  const [invalidPolicyName, setInvalidPolicyName] = useState("");
  const [invalidPolicyGroupName, setInvalidPolicyGroupName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const partnerTypeDropdownData = await fetchPartnerTypeData();
      setPartnerType(
        createDropdownData("partnerType", "", true, partnerTypeDropdownData, t, t("partnerPolicyMappingRequestList.selectPartnerType"))
      );
      setStatus(
        createDropdownData("status", "", true, statusDropdownData, t, t("partnerPolicyMappingRequestList.selectStatus"))
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
        setErrorMsg(t('partnerPolicyMappingRequestList.errorInpartnerPolicyMappingRequestList'));
        return [];
      }
    } catch (err) {
      if (err.response?.status && err.response.status !== 401) {
        setErrorMsg(err.message || t('partnerPolicyMappingRequestList.errorInpartnerPolicyMappingRequestList'));
      }
      console.error("Error fetching partner type data: ", err);
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
    if (fieldName === 'policyId') { validateInputRegex(selectedFilter, setInvalidPolicyId, t); }
    if (fieldName === 'policyName') { validateInputRegex(selectedFilter, setInvalidPolicyName, t); }
    if (fieldName === 'policyGroupName') { validateInputRegex(selectedFilter, setInvalidPolicyGroupName, t); }
  };

  const areFiltersEmpty = () => {
    return Object.values(filters).every(value => value === "") || invalidPartnerId || invalidOrgName
      || invalidPolicyId || invalidPolicyName || invalidPolicyGroupName;
  };

  return (
    <div className="flex w-full p-3 justify-start bg-[#F7F7F7] flex-wrap">
      <TextInputComponent
        fieldName="partnerId"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.partnerId}
        fieldNameKey="partnerPolicyMappingRequestList.partnerId"
        placeHolderKey="partnerPolicyMappingRequestList.searchPartnerId"
        styleSet={getFilterTextFieldStyle()}
        id="partner_id_filter"
        inputError={invalidPartnerId}
      />
      <DropdownComponent
        fieldName="partnerType"
        dropdownDataList={partnerType}
        onDropDownChangeEvent={onFilterChangeEvent}
        fieldNameKey="partnerPolicyMappingRequestList.partnerType"
        placeHolderKey="partnerPolicyMappingRequestList.selectPartnerType"
        styleSet={getFilterDropdownStyle()}
        isPlaceHolderPresent={true}
        id="partner_type_filter"
      />
      <TextInputComponent
        fieldName="orgName"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.orgName}
        fieldNameKey="partnerPolicyMappingRequestList.organisation"
        placeHolderKey="partnerPolicyMappingRequestList.searchOrganisation"
        styleSet={getFilterTextFieldStyle()}
        id="partner_organisation_filter"
        inputError={invalidOrgName}
      />
      <TextInputComponent
        fieldName="policyId"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.policyId}
        fieldNameKey="partnerPolicyMappingRequestList.policyId"
        placeHolderKey="partnerPolicyMappingRequestList.searchPolicyId"
        styleSet={getFilterTextFieldStyle()}
        id="policy_id_filter"
        inputError={invalidPolicyId}
      />
      <TextInputComponent
        fieldName="policyName"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.policyName}
        fieldNameKey="partnerPolicyMappingRequestList.policyName"
        placeHolderKey="partnerPolicyMappingRequestList.searchPolicyName"
        styleSet={getFilterTextFieldStyle()}
        id="policy_name_filter"
        inputError={invalidPolicyName}
      />
      <TextInputComponent
        fieldName="policyGroupName"
        onTextChange={onFilterChangeEvent}
        textBoxValue={filters.policyGroupName}
        fieldNameKey="partnerPolicyMappingRequestList.policyGroupName"
        placeHolderKey="partnerPolicyMappingRequestList.searchPolicyGroup"
        styleSet={getFilterTextFieldStyle()}
        id="policy_group_filter"
        inputError={invalidPolicyGroupName}
      />
      <DropdownComponent
        fieldName="status"
        dropdownDataList={status}
        onDropDownChangeEvent={onFilterChangeEvent}
        fieldNameKey="partnerPolicyMappingRequestList.status"
        placeHolderKey="partnerPolicyMappingRequestList.selectStatus"
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
          {t("partnerPolicyMappingRequestList.applyFilter")}
        </button>
      </div>
    </div>
  );
}

PolicyRequestsListFilter.propTypes = {
    onApplyFilter: PropTypes.func.isRequired,
    setErrorCode: PropTypes.func.isRequired,
    setErrorMsg: PropTypes.func.isRequired,
};

export default PolicyRequestsListFilter;
