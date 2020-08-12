import {
    getCommonHeader
  } from "egov-ui-framework/ui-config/screens/specs/utils";
import {stepper, formwizardOwnershipFirstStep, formwizardOwnershipSecondStep, formwizardOwnershipThirdStep } from '../rented-properties/applyResource/applyConfig';
import {footer} from './footer';
import { getMdmsData } from "../rented-properties/apply";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { handleScreenConfigurationFieldChange as handleField } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { get } from "lodash";
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import { getOwnershipSearchResults, setDocsForEditFlow, setDocumentData } from "../../../../ui-utils/commons";

const header = getCommonHeader({
    labelName: "Apply for Ownership Transfer",
    labelKey: "RP_APPLY_OWNERSHIP_TRANFER"
});

const getData = async(action, state, dispatch) => {
  const applicationNumber = getQueryArg(window.location.href, "applicationNumber");
  if(!!applicationNumber) {
    const queryObject = [
      {key: "applicationNumber", value: applicationNumber}
    ]
    const response = await getOwnershipSearchResults(queryObject);
    if (response && response.Owners) {
    dispatch(prepareFinalObject("Owners", response.Owners))
    }
    setDocsForEditFlow(state, dispatch, "Owners[0].ownerDetails.ownershipTransferDocuments", "OwnersTemp[0].uploadedDocsInRedux");
  } else {
    dispatch(
      prepareFinalObject(
        "Owners",
        []
        )
        )
    dispatch(
      prepareFinalObject(
        "OwnersTemp",
        []
      )
    )
  }
  setDocumentData(action, state, dispatch, {documentCode: "FRESHLICENSE", jsonPath: "Owners[0].ownerDetails.ownershipTransferDocuments", screenKey: "ownership-apply", screenPath: "components.div.children.formwizardSecondStep.children.ownershipTransferDocumentsDetails.children.cardContent.children.documentList", tempJsonPath:"OwnersTemp[0].ownershipTransferDocuments"})
}


const applyLicense = {
    uiFramework: "material-ui",
    name: "ownership-apply",
    beforeInitScreen: (action, state, dispatch) => {
        getData(action, state, dispatch)
        return action;
      },
    components: {
        div: {
            uiFramework: "custom-atoms",
            componentPath: "Div",
            props: {
                className: "common-div-css"
            },
            children: {
                headerDiv: {
                    uiFramework: "custom-atoms",
                    componentPath: "Container",
                    children: {
                        header: {
                            gridDefination: {
                              xs: 12,
                              sm: 10
                            },
                            ...header
                          }
                    }
                },
                stepper,
                formwizardFirstStep: formwizardOwnershipFirstStep,
                formwizardSecondStep: formwizardOwnershipSecondStep,
                formwizardThirdStep: formwizardOwnershipThirdStep,
                footer
            }
        }
    }
}

export default applyLicense;