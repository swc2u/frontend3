import { getCommonApplyFooter, validateFields } from "../utils";
import { toggleSnackbar } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import get from "lodash/get";
import { applyOwnershipTransfer, submittransitsiteimages ,getDetailsFromPropertyTransit ,getDetailsFromProperty ,applyDuplicateCopy, getDuplicateDetailsFromProperty} from "../../../../ui-utils/apply";
import { previousButton, submitButton, nextButton, changeStep, moveToSuccess, DETAILS_STEP, DOCUMENT_UPLOAD_STEP, SUMMARY_STEP, submitButtontransit } from "../rented-properties/applyResource/footer";
import { some } from "lodash";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";

const callBackForNext = async(state, dispatch) => {
    let activeStep = get(
        state.screenConfiguration.screenConfig["ownership-apply"],
        "components.div.children.stepper.props.activeStep",
        0
    );
    
    let isFormValid = true;
    let hasFieldToaster = true;
    if(activeStep === DETAILS_STEP) {
        const isOwnerDetailsValid = validateFields(
          "components.div.children.formwizardFirstStep.children.applicantDetails.children.cardContent.children.detailsContainer.children",            
          state,
          dispatch,
          "ownership-apply"
        )
        
        const isAddressDetailsValid = validateFields(
          "components.div.children.formwizardFirstStep.children.ownershipAddressDetails.children.cardContent.children.detailsContainer.children",            
          state,
          dispatch,
          "ownership-apply"
        )
        if(!!isOwnerDetailsValid && !!isAddressDetailsValid) {
          const propertyId = get(state.screenConfiguration.preparedFinalObject, "Owners[0].property.id");
          let res = true;
          if(!propertyId) {
            res = await getDetailsFromProperty(state, dispatch)
          }
          if(!!res) {
            const applyRes = applyOwnershipTransfer(state, dispatch, activeStep)
            if(!applyRes) {
              return
            }
          } else {
            return
          }
        } else {
            isFormValid = false;
        }
    }
    if(activeStep === DOCUMENT_UPLOAD_STEP) {
      const uploadedDocData = get(
        state.screenConfiguration.preparedFinalObject,
        "Owners[0].ownerDetails.ownershipTransferDocuments",
        []
    );

    const uploadedTempDocData = get(
        state.screenConfiguration.preparedFinalObject,
        "OwnersTemp[0].ownershipTransferDocuments",
        []
    );

    for (var y = 0; y < uploadedTempDocData.length; y++) {
      if (
          uploadedTempDocData[y].required &&
          !some(uploadedDocData, { documentType: uploadedTempDocData[y].name })
      ) {
          isFormValid = false;
      }
    }
    if(isFormValid) {
      const reviewDocData =
              uploadedDocData &&
              uploadedDocData.map(item => {
                  return {
                      title: `RP_${item.documentType}`,
                      link: item.fileUrl && item.fileUrl.split(",")[0],
                      linkText: "View",
                      name: item.fileName
                  };
              });
              dispatch(
                prepareFinalObject("OwnersTemp[0].reviewDocData", reviewDocData)
            );
    }
    }
    if(activeStep === SUMMARY_STEP) {
    isFormValid = await applyOwnershipTransfer(state, dispatch);
      if (isFormValid) {
        const rentedData = get(
          state.screenConfiguration.preparedFinalObject,
          "Owners[0]"
      );
          moveToSuccess(rentedData, dispatch, "OWNERSHIPTRANSFERRP");
      }
    }
    if(activeStep !== SUMMARY_STEP) {
        if (isFormValid) {
            changeStep(state, dispatch, "ownership-apply");
        } else if (hasFieldToaster) {
            let errorMessage = {
                labelName:
                    "Please fill all mandatory fields and upload the documents !",
                labelKey: "ERR_FILL_MANDATORY_FIELDS_UPLOAD_DOCS"
            };
            switch (activeStep) {
                case DETAILS_STEP:
                    errorMessage = {
                        labelName:
                            "Please fill all mandatory fields, then do next !",
                        labelKey: "ERR_FILL_RENTED_MANDATORY_FIELDS"
                    };
                    break;
                case DOCUMENT_UPLOAD_STEP:
                    errorMessage = {
                        labelName: "Please upload all the required documents !",
                        labelKey: "ERR_UPLOAD_REQUIRED_DOCUMENTS"
                    };
                    break;
            }
            dispatch(toggleSnackbar(true, errorMessage, "warning"));
        }
    }
}


const callBackForNextTransitImages = async(state, dispatch) => {

        let uploadFlag = false;
        let activeStep = 1;
        let isFormValid = true;
  
      if(activeStep === 1){
      const isOwnerDetailsValid = validateFields(
        "components.div.children.formwizardFirstStep.children.ownershipAddressDetails.children.cardContent.children.detailsContainer.children.ownershipTransitNumber",   
                 
        state,
        dispatch,
        "transit-site-images"
      )
      
      const isImageDetailsValid = validateFields(
        "components.div.children.formwizardFirstStep.children.imageUploadDetailsProperties.children.cardContent.children.detailsContainer.children",       
             
        state,
        dispatch,
        "transit-site-images"
      )
      if(!!isOwnerDetailsValid && !!isImageDetailsValid) {
        const propertyId = get(state.screenConfiguration.preparedFinalObject, "PropertyImagesApplications[0].property.id");
        let res = true;
        if(!propertyId) {
          res = await getDetailsFromPropertyTransit(state, dispatch)
        }
        if(!!res) {
          const applytrans = submittransitsiteimages(state, dispatch)
          if(!applytrans){
            return
          }
        } 
        else {
          return 
        }
      }
     else{
       isFormValid = false;
     } 
    } 

    isFormValid = await submittransitsiteimages(state, dispatch);
      if (isFormValid) {
        const transitData = get(
          state.screenConfiguration.preparedFinalObject,
          "PropertyImagesApplications[0]"
      );
      moveToSuccess(transitData, dispatch);
      }

    if (!isFormValid && !uploadFlag) {
        
        let errorMessage = {
          labelName:
              "Please fill all mandatory fields and upload the images !",
          labelKey: "ERR_FILL_MANDATORY_FIELDS_UPLOAD_IMG"
      };
      
      dispatch(toggleSnackbar(true, errorMessage, "warning"));
    }   
}

const callBackForNextDuplicate = async(state, dispatch) => {
    let activeStep = get(
        state.screenConfiguration.screenConfig["duplicate-copy-apply"],
        "components.div.children.stepper.props.activeStep",
        0
    );
    
    let isFormValid = true;
    let hasFieldToaster = true;
    if(activeStep === DETAILS_STEP) {
        const isOwnerDetailsValid = validateFields(
          "components.div.children.formwizardFirstStep.children.rentHolderDetailsForDuplicateProperties.children.cardContent.children.detailsContainer.children",            
          state,
          dispatch,
          "duplicate-copy-apply"
        )
        const isAddressDetailsValid = validateFields(
          "components.div.children.formwizardFirstStep.children.transitSiteDetails.children.cardContent.children.detailsContainer.children",            
          state,
          dispatch,
          "duplicate-copy-apply"
        )
        if(!!isOwnerDetailsValid && !!isAddressDetailsValid) {
          const propertyId = get(state.screenConfiguration.preparedFinalObject, "DuplicateCopyApplications[0].property.id");
          let res = true;
          if(!propertyId) {
            res = await getDuplicateDetailsFromProperty(state, dispatch)
          }
          if(!!res) {
            const applyRes = applyDuplicateCopy(state, dispatch, activeStep)
            if(!applyRes) {
              return
            }
          } else {
            return
          }
        } else {
            isFormValid = false;
        }
    }
    if(activeStep === DOCUMENT_UPLOAD_STEP) {
  
    const uploadedDocData = get(
        state.screenConfiguration.preparedFinalObject,
        "DuplicateCopyApplications[0].applicationDocuments",
        []
    );

    const uploadedTempDocData = get(
        state.screenConfiguration.preparedFinalObject,
        "DuplicateTemp[0].ownershipTransferDocuments",
        []
    );

    for (var y = 0; y < uploadedTempDocData.length; y++) {
      if (
          uploadedTempDocData[y].required &&
          !some(uploadedDocData, { documentType: uploadedTempDocData[y].name })
      ) {
          isFormValid = false;
      }
    }
    if(isFormValid) {
      const reviewDocData =
              uploadedDocData &&
              uploadedDocData.map(item => {
                  return {
                      title: `RP_${item.documentType}`,
                      link: item.fileUrl && item.fileUrl.split(",")[0],
                      linkText: "View",
                      name: item.fileName
                  };
              });
              dispatch(
                prepareFinalObject("DuplicateTemp[0].reviewDocData", reviewDocData)
            );
    }
    }
    if(activeStep === SUMMARY_STEP) {
      const rentedData = get(
        state.screenConfiguration.preparedFinalObject,
        "DuplicateCopyApplications[0]"
    );
    isFormValid = await applyDuplicateCopy(state, dispatch);
      if (isFormValid) {
          moveToSuccess(rentedData, dispatch, "DUPLICATECOPYOFALLOTMENTLETTERRP");
      }
    }
    if(activeStep !== SUMMARY_STEP) {
        if (isFormValid) {
            changeStep(state, dispatch, "duplicate-copy-apply");
        } else if (hasFieldToaster) {
            let errorMessage = {
                labelName:
                    "Please fill all mandatory fields and upload the documents !",
                labelKey: "ERR_FILL_MANDATORY_FIELDS_UPLOAD_DOCS"
            };
            switch (activeStep) {
                case DETAILS_STEP:
                    errorMessage = {
                        labelName:
                            "Please fill all mandatory fields, then do next !",
                        labelKey: "ERR_FILL_RENTED_MANDATORY_FIELDS"
                    };
                    break;
                case DOCUMENT_UPLOAD_STEP:
                    errorMessage = {
                        labelName: "Please upload all the required documents !",
                        labelKey: "ERR_UPLOAD_REQUIRED_DOCUMENTS"
                    };
                    break;
            }
            dispatch(toggleSnackbar(true, errorMessage, "warning"));
        }
    }
}

const callBackForPrevious = (state, dispatch) => {
  changeStep(state, dispatch, "ownership-apply", "previous");
};


export const footer = getCommonApplyFooter({
    previousButton: {
      ...previousButton,
      onClickDefination: {
        action: "condition",
        callBack: callBackForPrevious
      },
    },
    nextButton: {
      ...nextButton,
      onClickDefination: {
        action: "condition",
        callBack: callBackForNext
      }
    },
    submitButton: {
      ...submitButton,
      onClickDefination: {
        action: "condition",
        callBack: callBackForNext
      },
    }
  });

const callBackForPreviousDuplicate = (state, dispatch) => {
  changeStep(state, dispatch, "duplicate-copy-apply", "previous");
};

  
export const duplicatefooter = getCommonApplyFooter({
    previousButton: {
      ...previousButton,
      onClickDefination: {
        action: "condition",
        callBack: callBackForPreviousDuplicate
      },
    },
    nextButton: {
      ...nextButton,
      onClickDefination: {
        action: "condition",
        callBack: callBackForNextDuplicate
      }
    },
    submitButton: {
      ...submitButton,
      onClickDefination: {
        action: "condition",
        callBack: callBackForNextDuplicate
      },
    }
  });

  export const transitsiteimagefooter = getCommonApplyFooter({
    
    submitButton: {
      ...submitButtontransit,
      onClickDefination: {
        action: "condition",
        callBack: callBackForNextTransitImages
      },
    }
  });