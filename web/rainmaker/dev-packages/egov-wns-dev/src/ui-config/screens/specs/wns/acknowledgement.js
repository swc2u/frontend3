import {
  getCommonHeader,
  getCommonContainer
} from "egov-ui-framework/ui-config/screens/specs/utils";
import { applicationSuccessFooter, DownloadAndPrint } from "./acknowledgementResource/applicationSuccessFooter";
import { paymentSuccessFooter } from "./acknowledgementResource/paymentSuccessFooter";
import { approvalSuccessFooter } from "./acknowledgementResource/approvalSuccessFooter";
import { gotoHomeFooter } from "./acknowledgementResource/gotoHomeFooter";
import { paymentFailureFooter } from "./acknowledgementResource/paymentFailureFooter";
import acknowledgementCard from "./acknowledgementResource/acknowledgementUtils";
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import { loadReceiptGenerationData } from "../utils/receiptTransformer";
import { handleScreenConfigurationFieldChange as handleField } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import {
  downloadApp,
  getSearchResultsForSewerage,
  getSearchResults,
  findAndReplace,
  prepareDocumentsUploadRedux,
  prepareDocumentsUploadData,
  prepareDocUploadRedux,
  downloadAndPrintForNonApply
} from "../../../../ui-utils/commons";
import set from "lodash/set";
import get from "lodash/get";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getMdmsData } from './apply';
import { getLabel } from "egov-ui-framework/ui-config/screens/specs/utils";


const headerrow = getCommonContainer({
  header: getCommonHeader({
    labelKey: "WS_APPLICATION_NEW_CONNECTION_HEADER",
  }),
});

const commonHeader = (state,
  dispatch,
  applicationNumber,
  tenant) => {
  return getCommonContainer({
    headerDiv: {
      uiFramework: "custom-atoms",
      componentPath: "Container",
      children: {
        header1: {
          gridDefination: {
            xs: 12,
            sm: 8
          },
          ...headerrow
        },
        helpSection: {
          uiFramework: "custom-atoms",
          componentPath: "Container",
          props: {
            color: "primary",
            style: { justifyContent: "flex-end" } //, dsplay: "block"
          },
          gridDefination: {
            xs: 12,
            sm: 4,
            align: "right"
          },
          children: {
            DownloadAndPrint: DownloadAndPrint(
              state,
              dispatch,
              applicationNumber,
              tenant
            ),
          },
          visible:false

        }
      }
    },
  })
}

const getAcknowledgementCard = (
  state,
  dispatch,
  purpose,
  status,
  applicationNumber,
  applicationNumberWater,
  applicationNumberSewerage,
  secondNumber,
  tenant,
  consumerNo
) => {
  if (purpose === "apply" && status === "success" && applicationNumberWater && applicationNumberSewerage) {
    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        props: {
          // style: {
          //   position: "absolute",
          //   width: "95%"
          // }
        },
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName: "Thank you for submitting the Application",
              labelKey: "WS_APPLICATION_SUCCESS_MESSAGE_MAIN"
            },
            // body: {
            //   labelName:
            //     " A notification regarding Application Submission has been sent to trade owner at registered Mobile No. Please note your application No. for future reference ",
            //   labelKey: "WS_APPLICATION_SUCCESS_ACKO_MESSAGE_SUB"
            // },
            tailText: {
              labelName: "Water Application No.",
              labelKey: "WS_ACKNO_APP_NO_LABEL"
            },
            number: applicationNumberWater,
            tailTextOne: {
              labelName: "Sewerage Application No.",
              labelKey: "WS_ACKNO_SEW_APP_NO_LABEL"
            },
            newNumber: applicationNumberSewerage,
          })
        }
      },
      iframeForPdf: {
        uiFramework: "custom-atoms",
        componentPath: "Div"
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
  } else if (purpose === "apply" && status === "success") {
    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        props: {
          // style: {
          //   position: "absolute",
          //   width: "95%"
          // }
        },
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName: "Thank you for submitting the Application",
              labelKey: "WS_APPLICATION_SUCCESS_MESSAGE_MAIN"
            },
            // body: {
            //   labelName:
            //     " A notification regarding application submission has been sent at registered mobile no. Please note the application no. for future reference. ",
            //   labelKey: "WS_APPLICATION_SUCCESS_ACKO_MESSAGE_SUB"
            // },
            tailText: {
              labelName: "Application Number.",
              labelKey: "WS_ACK_COMMON_APP_NO_LABEL"
            },
            number: applicationNumber
          })
        }
      },
      iframeForPdf: {
        uiFramework: "custom-atoms",
        componentPath: "Div"
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
  } else if (purpose === "pay" && status === "success") {
    loadReceiptGenerationData(applicationNumber, tenant);
    return {
      header: getCommonContainer({
        header: getCommonHeader({
          labelName: `Payment for New Trade License ${financialYearText}`,
          labelKey: "WS_COMMON_PAYMENT_NEW_LICENSE",
          dynamicArray: [financialYearText]
        }),
        applicationNumber: {
          uiFramework: "custom-atoms-local",
          moduleName: "egov-wns",
          componentPath: "ApplicationNoContainer",
          props: {
            number: applicationNumber
          }
        }
      }),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName:
                "Payment is collected successfully, Now you can dowload and issue Trade License Certificate to citizen",
              labelKey: "WS_CONFIRMATION_MESSAGE_MAIN"
            },
            // body: {
            //   labelName:
            //     "A notification regarding Payment Collection has been sent to trade owner at registered Mobile No.",
            //   labelKey: "WS_CONFIRMATION_MESSAGE_SUB"
            // },
            tailText: {
              labelName: "Payment Receipt No.",
              labelKey: "WS_PMT_RCPT_NO"
            },
            number: secondNumber
          })
        }
      },
      paymentSuccessFooter: paymentSuccessFooter(
        state,
        dispatch,
        "APPROVED",
        applicationNumber
      )
    };
  } else if (purpose === "approve" && status === "success") {
    loadReceiptGenerationData(applicationNumber, tenant);
    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName: "Application is Approved Successfully",
              labelKey: "WS_APPROVAL_CHECKLIST_MESSAGE_HEAD"
            },
            // body: {
            //   labelName:
            //     "A notification regarding Approval connection has been sent to registered Mobile No.",
            //   labelKey: "WS_APPROVAL_CHECKLIST_MESSAGE_SUB"
            // },
            tailText: {
              labelName: "Application Number.",
              labelKey: "WS_ACK_COMMON_APP_NO_LABEL"
            },
            number: applicationNumber
          })
        }
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
  } else if (purpose === "sendback" && status === "success") {
    loadReceiptGenerationData(applicationNumber, tenant);
    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant),
      
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName: "Application is sent back Successfully",
              labelKey: "WS_SENDBACK_CHECKLIST_MESSAGE_HEAD"
            },
            // body: {
            //   labelName:
            //     "A notification regarding above application status has been sent to registered Mobile No.",
            //   labelKey: "WS_SENDBACK_CHECKLIST_MESSAGE_SUB"
            // },
            tailText: {
              labelName: "Application Number.",
              labelKey: "WS_ACK_COMMON_APP_NO_LABEL"
            },
            number: applicationNumber
          })
        }
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
  } else if (purpose === "application" && status === "rejected") {
    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "close",
            backgroundColor: "#E54D42",
            header: {
              labelName: "Application Rejected",
              labelKey: "WS_APPROVAL_REJ_MESSAGE_HEAD"
            },
            // body: {
            //   labelName:
            //     "A notification regarding Application Rejection has been sent to registered Mobile No.",
            //   labelKey: "WS_APPROVAL_REJ_MESSAGE_SUBHEAD"
            // }
            tailText: {
              labelName: "Application Number.",
              labelKey: "WS_ACK_COMMON_APP_NO_LABEL"
            },
            number: applicationNumber
          })
        }
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
    
  } else if (purpose === "application" && status === "cancelled") {
    return {
      header: getCommonContainer({
        header: getCommonHeader({
          labelName: `Trade License Application ${financialYearText}`,
          labelKey: "TL_TRADE_APPLICATION",
          dynamicArray: [financialYearText]
        }),
        applicationNumber: {
          uiFramework: "custom-atoms-local",
          moduleName: "egov-wns",
          componentPath: "ApplicationNoContainer",
          props: {
            number: applicationNumber
          }
        }
      }),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "close",
            backgroundColor: "#E54D42",
            header: {
              labelName: "Trade License Cancelled",
              labelKey: "WS_WS_CANCELLED_MESSAGE_HEAD"
            },
            // body: {
            //   labelName:
            //     "A notification regarding Trade License cancellation has been sent to trade owner at registered Mobile No.",
            //   labelKey: "TL_TL_CANCELLED_MESSAGE_SUBHEAD"
            // },
            tailText: {
              labelName: "Trade License No.",
              labelKey: "TL_HOME_SEARCH_RESULTS_TL_NO_LABEL"
            },
            number: secondNumber
          })
        }
      },
    };
  } else if (purpose === "pay" && status === "failure") {
    return {
      header: getCommonContainer({
        header: getCommonHeader({
          labelName: `Trade License Application ${financialYearText}`,
          dynamicArray: [financialYearText],
          labelKey: "TL_TRADE_APPLICATION"
        }),
        applicationNumber: {
          uiFramework: "custom-atoms-local",
          moduleName: "egov-wns",
          componentPath: "ApplicationNoContainer",
          props: {
            number: applicationNumber
          }
        }
      }),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "close",
            backgroundColor: "#E54D42",
            header: {
              labelName: "Payment has failed!",
              labelKey: "TL_PAYMENT_FAILED"
            },
            // body: {
            //   labelName:
            //     "A notification regarding payment failure has been sent to the trade owner and applicant.",
            //   labelKey: "TL_PAYMENT_NOTIFICATION"
            // }
          })
        }
      },
      paymentFailureFooter: paymentFailureFooter(applicationNumber, tenant)
    };
  } else if (purpose === "mark" && status === "success") {
    return {
      header: getCommonHeader({
        labelName: `Application for Trade License ${financialYearText}`,
        labelKey: "WS_APPLICATION_TRADE_LICENSE",
        dynamicArray: [financialYearText]
      }),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName: "Application Marked Successfully",
              labelKey: "WS_MARK_SUCCESS_MESSAGE_MAIN"
            },
            body: {
              labelName: "Application has been marked successfully",
              labelKey: "WS_APPLICATION_MARKED_SUCCESS"
            },
            tailText: {
              labelName: "Application No.",
              labelKey: "WS_HOME_SEARCH_RESULTS_APP_NO_LABEL"
            },
            number: applicationNumber
          })
        }
      },
    };
  } else if (purpose === "forward" && status === "success") {
    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName: "Application Forwarded Successfully",
              labelKey: "WS_FORWARD_SUCCESS_MESSAGE_MAIN"
            },
            // body: {
            //   labelName:
            //     "A notification regarding above application status has been sent to registered Mobile No.",
            //   labelKey: "WS_APPLICATION_FORWARD_SUCCESS_SUBHEAD"
            // },
            tailText: {
              labelName: "Application No.",
              labelKey: "WS_ACK_COMMON_APP_NO_LABEL"
            },
            number: applicationNumber
          })
        }
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
  } else if (purpose === "activate" && status === "success") {

    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant,
        consumerNo),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "done",
            backgroundColor: "#39CB74",
            header: {
              labelName: "Connection Activated Successfully ",
              labelKey: "WS_ACTIVATE_SUCCESS_MESSAGE_MAIN"
            },
            // body: {
            //   labelName:
            //     "A notification regarding above application status has been sent to registered Mobile No.",
            //   labelKey: "WS_CONNECTION_ACTIVATE_SUCCESS_SUBHEAD"
            // },
            tailText: {
              labelName: "Application No.",
              labelKey: "WS_ACK_COMMON_APP_NO_LABEL"
            },
            number: applicationNumber,
            tailTextOne: {
              labelName: "Consumer No",
              labelKey: "WS_COMMON_CONSUMER_NO_LABEL"
            },
            newNumber: consumerNo,
          })
        }
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
  }
  else if (purpose === "cancel" && status === "success") {
    return {
      commonHeader: commonHeader(state,
        dispatch,
        applicationNumber,
        tenant),
      applicationSuccessCard: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        children: {
          card: acknowledgementCard({
            icon: "close",
            backgroundColor: "#E54D42",
            header: {
              labelName: "Application Rejected",
              labelKey: "WS_APPROVAL_CALCELLED_MESSAGE_HEAD"
            },
            // body: {
            //   labelName:
            //     "A notification regarding Application Rejection has been sent to registered Mobile No.",
            //   labelKey: "WS_APPROVAL_REJ_MESSAGE_SUBHEAD"
            // }
            tailText: {
              labelName: "Application Number.",
              labelKey: "WS_ACK_COMMON_APP_NO_LABEL"
            },
            number: applicationNumber
          })
        }
      },
      applicationSuccessFooter: applicationSuccessFooter(
        state,
        dispatch,
        applicationNumber,
        tenant
      )
    };
    
  }
};

export const downloadPrintContainer = (
  action,
  state,
  dispatch,
  appStatus,
  applicationNumber,
  tenantId
) => {
  /** MenuButton data based on status */
  let downloadMenu = [];
  let printMenu = [];
  let wsEstimateDownloadObject = {
    label: { labelKey: "WS_ESTIMATION_NOTICE" },
    link: () => {
      const { WaterConnection } = state.screenConfiguration.preparedFinalObject;
      downloadApp(state,WaterConnection, 'estimateNotice','download',dispatch);
    },
    leftIcon: "book"
  };
  let wsEstimatePrintObject = {
    label: { labelKey: "WS_ESTIMATION_NOTICE" },
    link: () => {
      const { WaterConnection } = state.screenConfiguration.preparedFinalObject;
      downloadApp(state,WaterConnection, 'estimateNotice', 'print',dispatch);
    },
    leftIcon: "book"
  };
  let ReceiptDownloadObject = {
    label: { labelKey: "WS_RECEIPT_LETTER" },
    link: () => {
      const { WaterConnection } = state.screenConfiguration.preparedFinalObject;
      const appUserType = process.env.REACT_APP_NAME === "Citizen" ? "To Citizen" : "Department Use";     
      downloadApp(state,WaterConnection, 'receiptLetter','download',dispatch);
    },
    leftIcon: "receipt"
  };
  let ReceiptDownloadPrintObject = {
    label: { labelKey: "WS_RECEIPT_LETTER" },
    link: () => {
      const { WaterConnection } = state.screenConfiguration.preparedFinalObject;
      const appUserType = process.env.REACT_APP_NAME === "Citizen" ? "To Citizen" : "Department Use";     
      downloadApp(state,WaterConnection, 'receiptLetter' ,'print',dispatch);
    },
    leftIcon: "receipt"
  };
  let ndcDownloadObject = {
    label: { labelKey: "WS_NDC_LETTER" },
    link: () => {
      const { WaterConnection } = state.screenConfiguration.preparedFinalObject;  
      downloadApp(state,WaterConnection, 'ndcLetter','download',dispatch);
    },
    leftIcon: "receipt"
  };
  let ndcDownloadPrintObject = {
    label: { labelKey: "WS_NDC_LETTER" },
    link: () => {
      const { WaterConnection } = state.screenConfiguration.preparedFinalObject;  
      downloadApp(state,WaterConnection, 'ndcLetter','print',dispatch);
    },
    leftIcon: "receipt"
  };
  let sanctionPrintObject = {
    label: { labelKey: "WS_RECEIPT_LETTER" },
    link: () => {
      const { WaterConnection } = state.screenConfiguration.preparedFinalObject;
      const appUserType = process.env.REACT_APP_NAME === "Citizen" ? "Department Use" : "To Citizen";
      // WaterConnection[0].appUserType = appUserType;
      // WaterConnection[0].commissionerName = "S.Ravindra Babu";
      downloadApp(state,WaterConnection, 'receiptLetter', 'print',dispatch);
    },
    leftIcon: "receipt"
  };
  let applicationDownloadObject = {
    label: { labelKey: "WS_SANCTION_LETTER" },
    link: () => {
      const { WaterConnection, DocumentsData } = state.screenConfiguration.preparedFinalObject;
      let filteredDocs = DocumentsData;
      filteredDocs.map((val) => {
        if (val.title.includes("WS_OWNER.IDENTITYPROOF.")) {
          val.title = "WS_OWNER.IDENTITYPROOF";
        } else if (val.title.includes("WS_OWNER.ADDRESSPROOF.")) {
          val.title = "WS_OWNER.ADDRESSPROOF";
        }
      });
      WaterConnection[0].pdfDocuments = filteredDocs;
      downloadApp(state,WaterConnection, 'application','download',dispatch);
    },
    leftIcon: "assignment"
  };
  let applicationPrintObject = {
    label: { labelName: "Application", labelKey: "WS_SANCTION_LETTER" },
    link: () => {
      const { WaterConnection, DocumentsData } = state.screenConfiguration.preparedFinalObject;
      let filteredDocs = DocumentsData;
      filteredDocs.map((val) => {
        if (val.title.includes("WS_OWNER.IDENTITYPROOF.")) {
          val.title = "WS_OWNER.IDENTITYPROOF";
        } else if (val.title.includes("WS_OWNER.ADDRESSPROOF.")) {
          val.title = "WS_OWNER.ADDRESSPROOF";
        }
      });
      WaterConnection[0].pdfDocuments = filteredDocs;
      downloadApp(state,WaterConnection, 'application', 'print',dispatch);
    },
    leftIcon: "assignment"
  };
  switch (appStatus) {
    
    case "PENDING_FOR_CONNECTION_ACTIVATION_":
    case "SEWERAGE_CONNECTION_ACTIVATED":
    case "CONNECTION_ACTIVATED_":
      // downloadMenu = [sanctionDownloadObject, wsEstimateDownloadObject, applicationDownloadObject];
      // printMenu = [sanctionPrintObject, wsEstimatePrintObject, applicationPrintObject];
      downloadMenu = [applicationDownloadObject];
      printMenu = [applicationPrintObject];
      const { WaterConnection, DocumentsData ,dataCalculation} = state.screenConfiguration.preparedFinalObject;
      if(WaterConnection && WaterConnection[0])
      {
        let totalAmountPaid = parseInt(get(WaterConnection[0], "waterApplication.totalAmountPaid",0));

        if(WaterConnection[0].service ==='SEWERAGE')
        {
          totalAmountPaid = parseInt(get(dataCalculation, "totalAmountPaid",0));

        }

        if(totalAmountPaid>0)
        {
          downloadMenu = [applicationDownloadObject,ReceiptDownloadObject];
          printMenu = [applicationPrintObject,ReceiptDownloadPrintObject];
        }

      }
      let Active_ = false
      if(downloadMenu.length>0)
      {
        Active_ = true
      }     

      // downloadMenu = [applicationDownloadObject, sanctionDownloadObject];
      // printMenu = [applicationPrintObject,sanctionPrintObject];
      break;
    
    default: downloadMenu = [];
      printMenu = [];
      let NDCDoc = false
      let WaterConnection_  = state.screenConfiguration.preparedFinalObject.WaterConnection;
      let dataCalculation_ = state.screenConfiguration.preparedFinalObject.dataCalculation;
      if(WaterConnection_ && WaterConnection_[0])
      {
        let totalAmountPaid = parseInt(get(WaterConnection_[0], "waterApplication.totalAmountPaid",0));
        if(WaterConnection_[0].service ==='SEWERAGE')
        {
          if(dataCalculation_)
          totalAmountPaid = parseInt(get(dataCalculation_, "totalAmountPaid",0));

        }
        if(totalAmountPaid>0)
        {
          downloadMenu = [ReceiptDownloadObject];
          printMenu = [ReceiptDownloadPrintObject];

          if(WaterConnection_[0].activityType ==='TEMPORARY_DISCONNECTION' &&  WaterConnection_[0].property.subusageCategory ==='RESIDENTIAL.GOVERNMENTHOUSING')
          {
            NDCDoc = true;
          }

         if(NDCDoc)
         {
          downloadMenu = [ReceiptDownloadObject,ndcDownloadObject];
          printMenu = [ReceiptDownloadPrintObject,ndcDownloadPrintObject];

         }

        }

      }
     
      break;
  }
  /** END */
  // if(appStatus==="CONNECTION_ACTIVATED" || appStatus==="SEWERAGE_CONNECTION_ACTIVATED"){
  //   set(action.screenConfig, "components.div.children.headerDiv.children.helpSection.children.rightdiv.children.downloadMenu.visible",true );
  //   set(action.screenConfig, "components.div.children.headerDiv.children.helpSection.children.rightdiv.children.printMenu.visible",true );

  // }
  // else{
  //   set(action.screenConfig, "components.div.children.headerDiv.children.helpSection.children.rightdiv.children.downloadMenu.visible",false );
  //   set(action.screenConfig, "components.div.children.headerDiv.children.helpSection.children.rightdiv.children.printMenu.visible",false );

  // }

  return {
    rightdiv: {
      uiFramework: "custom-atoms",
      componentPath: "Div",
      props: {
        style: { textAlign: "right", display: "flex" }
      },
      children: {
        downloadMenu: {
          uiFramework: "custom-atoms-local",
          moduleName: "egov-tradelicence",
          componentPath: "MenuButton",
          props: {
            data: {
              label: { labelName: "DOWNLOAD", labelKey: "WS_COMMON_BUTTON_DOWNLOAD" },
              leftIcon: "cloud_download",
              rightIcon: "arrow_drop_down",
              props: { variant: "outlined", style: { height: "60px", color: "#FE7A51", maxWidth: "95%", marginRight: "-15px" }, className: "tl-download-button" },
              menu: downloadMenu
            }
          }
        },
        printMenu: {
          uiFramework: "custom-atoms-local",
          moduleName: "egov-tradelicence",
          componentPath: "MenuButton",
          props: {
            data: {
              label: { labelName: "PRINT", labelKey: "WS_COMMON_BUTTON_PRINT" },
              leftIcon: "print",
              rightIcon: "arrow_drop_down",
              props: { variant: "outlined", style: { height: "60px", color: "#FE7A51", maxWidth: "85%" }, className: "tl-print-button" },
              menu: printMenu
            }
          }
        }

      },
      // gridDefination: {
      //   xs: 12,
      //   sm: 6
      // }
    }
  }
};

const fetchData = async (dispatch) => {
  const applicationNumber = getQueryArg(window.location.href, "applicationNumber");
  const applicationNumberWater = getQueryArg(window.location.href, "applicationNumberWater");
  const applicationNumberSewerage = getQueryArg(window.location.href, "applicationNumberSewerage");
  const tenantId = getQueryArg(window.location.href, "tenantId");
  if (applicationNumberSewerage && applicationNumberWater) {
    await getWaterData(dispatch, applicationNumberWater, tenantId);
    await getSewerageData(dispatch, applicationNumberSewerage, tenantId);
  } else if (applicationNumber) {
    if (applicationNumber.includes("WS")) {
      await getWaterData(dispatch, applicationNumber, tenantId);
    } else if (applicationNumber.includes("SW")) {
      await getSewerageData(dispatch, applicationNumber, tenantId);
    }
  }
}

const getWaterData = async (dispatch, applicationNumber, tenantId) => {
  let waterResponse = [];
  let queryObject = [{ key: "tenantId", value: tenantId }, { key: "applicationNumber", value: applicationNumber }];
  try { waterResponse = await getSearchResults(queryObject); } catch (error) { console.log(error); waterResponse = [] };
  if (waterResponse && waterResponse.WaterConnection !== undefined && waterResponse.WaterConnection.length > 0) {
    waterResponse.WaterConnection[0].service = "WATER";
    dispatch(prepareFinalObject("WaterConnection", findAndReplace(waterResponse.WaterConnection, "NA", null)));
  } else { dispatch(prepareFinalObject("WaterConnection", [])); }
}

const getSewerageData = async (dispatch, applicationNumber, tenantId) => {
  let sewerResponse = [];
  let queryObject = [{ key: "tenantId", value: tenantId }, { key: "applicationNumber", value: applicationNumber }];
  try { sewerResponse = await getSearchResultsForSewerage(queryObject, dispatch) } catch (error) { console.log(error); sewerResponse = [] };
  if (sewerResponse && sewerResponse.SewerageConnections !== undefined && sewerResponse.SewerageConnections.length > 0) {
    sewerResponse.SewerageConnections[0].service = "SEWERAGE";
    dispatch(prepareFinalObject("SewerageConnection", findAndReplace(sewerResponse.SewerageConnections, "NA", null)));
  } else { dispatch(prepareFinalObject("SewerageConnection", [])); }
}

const pageReset = (dispatch) => {
  dispatch(prepareFinalObject("WaterConnection", []));
  dispatch(prepareFinalObject("SewerageConnection", []));
  dispatch(prepareFinalObject("applyScreen", {}));
  dispatch(prepareFinalObject("searchScreen", {}));
  dispatch(prepareFinalObject("waterSubSourceForSelectedWaterSource", {}));
  dispatch(prepareFinalObject("UploadedDocs", []));
}

const screenConfig = {
  uiFramework: "material-ui",
  name: "acknowledgement",
  components: {
    div: {
      uiFramework: "custom-atoms",
      componentPath: "Div",
      props: {
        className: "common-div-css"
      }
    }
  },
  beforeInitScreen: (action, state, dispatch) => {
    pageReset(dispatch);
    fetchData(dispatch)
    .then(() => {
        const purpose = getQueryArg(window.location.href, "purpose");
        const status = getQueryArg(window.location.href, "status");
        // const service = getQueryArg(window.location.href, "service");
        const applicationNumber = getQueryArg(window.location.href, "applicationNumber");
        const applicationNumberWater = getQueryArg(window.location.href, "applicationNumberWater");
        const applicationNumberSewerage = getQueryArg(window.location.href, "applicationNumberSewerage");
        const secondNumber = getQueryArg(window.location.href, "secondNumber");
        const tenant = getQueryArg(window.location.href, "tenantId");
        let consumerNo = ""
        if (applicationNumber && applicationNumber.includes("WS")) {
          consumerNo = get(state,"screenConfiguration.preparedFinalObject.WaterConnection[0].connectionNo");
        } else if (applicationNumber && applicationNumber.includes("SW")) {
          consumerNo = get(state,"screenConfiguration.preparedFinalObject.SewerageConnection[0].connectionNo");
        }
        if (applicationNumberSewerage && applicationNumberWater) {
          const cardOne = getAcknowledgementCard(state, dispatch, purpose, status, applicationNumber, applicationNumberWater, applicationNumberSewerage, secondNumber, tenant);
          set(action, "screenConfig.components.div.children", cardOne);
        } else {
          const data = getAcknowledgementCard(
            state,
            dispatch,
            purpose,
            status,
            applicationNumber,
            applicationNumberWater, 
            applicationNumberSewerage,
            secondNumber,
            // financialYear,
            tenant,
            consumerNo
          );
          set(action, "screenConfig.components.div.children", data);
        }
      })
      .then(() => getMdmsData(dispatch))
      .then(() => prepareDocumentsUploadData(state, dispatch))
      .then(() => prepareDocUploadRedux(state, dispatch))
      .then(() => prepareDocumentsUploadRedux(state, dispatch))
      .then(() => downloadAndPrintForNonApply(state, dispatch))
      
      .catch(error => console.log(error))    
    return action;
  }
};

export default screenConfig;
