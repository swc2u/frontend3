import {
  getCommonContainer,
  getCommonCard,
  getCommonHeader,
  getCommonTitle,
  getCommonParagraph,
  getLabel,
  getLabelWithValue,
  getBreak,
  getStepperObject
} from "egov-ui-framework/ui-config/screens/specs/utils";
//import { getCurrentFinancialYear } from "../utils";
import { footer } from "./dopDetailsResource/footer";
import { empDetails } from "./dopDetailsResource/empDetails";
import { employeeOtherDetails } from "./dopDetailsResource/employeeOtherDetails";
import { pensionDetails,arrealPensionDetails } from "./dopDetailsResource/pensionDetails";
//import { propertyLocationDetails } from "./applyResource/propertyLocationDetails";
import { otherDetails } from "./dopDetailsResource/otherDetails";
import { documentDetails } from "./dopDetailsResource/documentDetails";
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import {
  prepareFinalObject,
  handleScreenConfigurationFieldChange as handleField
} from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getTenantId } from "egov-ui-kit/utils/localStorageUtils";
import {
  
  epochToYmd,
  showHideAdhocPopup,
} from "../utils";
import { httpRequest } from "../../../../ui-utils";
import {
  sampleSearch,
  sampleSingleSearch,
  sampleDocUpload,
  ActionStepDop
} from "../../../../ui-utils/sampleResponses";
import set from "lodash/set";
import get from "lodash/get";
import {
  prepareDocumentsUploadData,
  getSearchResults,
  getworkflowData,
  getworkflowhistoryData,
  getWorkflowAccessibility,
  setApplicationNumberBox
} from "../../../../ui-utils/commons";
import { stringify } from "jsonpath";

//SU0001 fix for set application number
const tenantId = getQueryArg(window.location.href, "tenantId");
let applicationNumber = getQueryArg(window.location.href, "applicationNumber");
 
 let employeeOtherDetailsUpdate = true;
 let employeeLeaveUpdate = true;
 let pensionCalculation = true;
 let pensionDataUpdate = true;
 let IsCalculate = false;
 let Isletter = false;
 let Isletterdoc =false;
 //const Accesslable = [];
 let activeStep_= ActionStepDop()
 const step = getQueryArg(window.location.href, "step");
 let responce = get
 switch(step.toUpperCase())
 {
  case activeStep_.INITIATED:
    employeeOtherDetailsUpdate = false;   
    employeeLeaveUpdate= false;    
    break;   
    case activeStep_.PENDING_FOR_CALCULATION:  
    pensionCalculation = false;  
    pensionDataUpdate= false;
    IsCalculate = true;
    Isletterdoc =true;
    break;
    case activeStep_.PENDING_FOR_AUDIT:  
    Isletter = true; 
    Isletterdoc =true;
    break;
    // default:
    //   employeeOtherDetailsUpdate = true;
    //   pensionCalculation = true;
    //   employeeLeaveUpdate= true;
    //   pensionDataUpdate= true;    
 }
 export const Accesslable =[
  {employeeOtherDetailsUpdate:employeeOtherDetailsUpdate},
  {pensionCalculation:pensionCalculation},
  {employeeLeaveUpdate:employeeLeaveUpdate},
  {pensionDataUpdate:pensionDataUpdate},
  {IsCalculate:IsCalculate},  
  {Isletter:Isletter},
  {Isletterdoc:Isletterdoc},

 ]

 
 
export const stepsData = [
  { labelName: "Employee Detail", labelKey: "PENSION_SEQUENCE_EMPLOYEE_DETAILS" },
  { labelName: "Documents", labelKey: "PENSION_SEQUENCE_DOCUMENT_DETAILS" },
  { labelName: "Pension Detail", labelKey: "PENSION_SEQUENCE_PENSION_DETAILS" },
  { labelName: "Other Details", labelKey: "PENSION_SEQUENCE_OTHER_DETAILS" },
  
];
export const pensiondata=[];
export const stepper = getStepperObject(
  { props: { activeStep: 0 } },
  stepsData
);

const applicationNumberContainer = () => {
  const applicationNumber = getQueryArg(
    window.location.href,
    "applicationNumber"
  );
  if (applicationNumber)
    return {
      uiFramework: "custom-atoms-local",
      moduleName: "egov-noc",
      componentPath: "ApplicationNoContainer",
      props: {
        number: `${applicationNumber}`,
        visibility: "hidden"
      },
      visible: true
    };
  else return {};
};

export const header = getCommonContainer({
  header: getCommonHeader({
    labelName: "Death of an Pensioner",
    labelKey: "PENSION_NP_DETAIL_HEADER_DOP"
  }),
  //applicationNumber: applicationNumberContainer()
  applicationNumber: {
    uiFramework: "custom-atoms-local",
    moduleName: "egov-noc",
    componentPath: "ApplicationNoContainer",
    props: {
      number: getQueryArg(window.location.href, "applicationNumber")
    },
    visible: true
  }
});

export const formwizardFirstStep = {
  
  uiFramework: "custom-atoms",
  componentPath: "Form",
  props: {
    id: "apply_form1"
  },
  children: {
    taskStatus: {
      uiFramework: "custom-containers-local",
      componentPath: "WorkFlowContainer",
      moduleName: "egov-pms",
      // visible: process.env.REACT_APP_NAME === "Citizen" ? false : true,
      props: {
        dataPath: "ProcessInstances",
        moduleName: "DOP_SERVICE",
        updateUrl: "/tl-services/v1/_processWorkflow"
      }
    },
    empDetails:empDetails(Accesslable),
    EmployeeService: {
      uiFramework: "custom-containers-local",
      componentPath: "EmployeeServiceContainer",
      moduleName: "egov-pms",
      // visible: process.env.REACT_APP_NAME === "Citizen" ? false : true,
      props: {
        dataPath: "ProcessInstances",
        moduleName: "RRP_SERVICE",       
      }
    },
    employeeDisabiltyDetails: getCommonCard(
      {
        header: getCommonTitle(
          {
            labelName: "Disability Information",
            labelKey: "PENSION_EMPLOYEE_DISABILITY_INFORMATION"
          },
      ),
      break: getBreak(),
      employeeDisabiltyConatiner: getCommonContainer({ 

        attendantAllowanceGranted: getLabelWithValue(
          {
            labelName: "Attendant Allowance Granted",
            labelKey: "PENSION_ATTENDANT_ALLOWANCE_GRANTED"
          },
          {
            jsonPath:
              "ProcessInstances[0].employeeDisability.attendantAllowanceGranted"
          }
        ), 
        woundExtraordinaryPension: getLabelWithValue(
          {
            labelName: "woundExtraordinaryPension",
            labelKey: "PENSION_DISABILITY_WOUND_PENSION"
          },
          {
            jsonPath:
              "ProcessInstances[0].employeeDisability.woundExtraordinaryPension"
          }
        ), 
        disabilityPercentage: getLabelWithValue(
          {
            labelName: "Disability Percentage",
            labelKey: "PENSION_DISABILITY_PERCENTAGE"
          },
          {
            jsonPath:
              "ProcessInstances[0].employeeDisability.disabilityPercentage"
          }
        ), 
      }),
      employeeDisabiltyInfoContainer:getCommonParagraph({
        labelName: "Disability information message",
        labelKey: "PENSION_DISABILITYINFO_MESSAGE"
      })

      }),
    employeeOtherDetails:employeeOtherDetails(Accesslable)
  }
};

export const formwizardSecondStep = {
  uiFramework: "custom-atoms",
  componentPath: "Form",
  props: {
    id: "apply_form2"
  },
  children: {
    
    pensionDetails:pensionDetails(Accesslable),
    arrealPensionDetails:arrealPensionDetails(Accesslable),
  },
  visible: false
};

export const formwizardThirdStep = {
  uiFramework: "custom-atoms",
  componentPath: "Form",
  props: {
    id: "apply_form3"
  },
  children: {
    otherDetails:otherDetails(Accesslable)
  },
  visible: false
};

export const formwizardFourthStep = {
  uiFramework: "custom-atoms",
  componentPath: "Form",
  props: {
    id: "apply_form4"
  },
  children: {
    documentDetails
  },
  visible: false
};
let response = sampleSingleSearch(); 

export const getMdmsData = async (action, state, dispatch) => {
  
  let tenantId = getTenantId();
  let mdmsBody = {
    MdmsCriteria: {
      tenantId: tenantId,
      moduleDetails: [
        
        {
          moduleName: "egov-location",
          masterDetails: [
            {
              name: "TenantBoundary"
            }
          ]
        },
        {
          moduleName: "tenant",
          masterDetails: [
            {
              name: "tenants"
            }
          ]
        },
        { moduleName: "Pension_RRP", masterDetails: [{ name: "Documents" }] },
        {
          moduleName: "common-masters",
          masterDetails: [
            { name: "Department", filter: "[?(@.active == true)]" },
            { name: "Designation", filter: "[?(@.active == true)]" }
           
          ]
        },
        { 
          moduleName: "pension", 
          masterDetails: 
          [{ name: "EmployeeLeaveType" 
          },
          {
            name:"ReasonForRetirementType"
          },
          {
            name:"relationships"
          },
          {
            name:"marritalStatus"
          },
          {
            name:"employeeGroup"
          },
          {
            name:"BankDetails"
          },
        ] }
      ]
    }
  };
  try {
     let payload = null;
    payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "_search",
      [],
      mdmsBody
    );
   
    dispatch(prepareFinalObject("applyScreenMdmsData", payload.MdmsRes));
   
    console.log(payload.MdmsRes);
    console.log('mdms')
  } catch (e) {
    console.log(e);
  }
};
export const wfActionLoad = async (state, dispatch) => {
  

  let response = sampleSingleSearch(); 
const applicationNumber = getQueryArg(
  window.location.href,
  "applicationNumber"
);
const tenantId = getQueryArg(window.location.href, "tenantId");
let queryObject = [
  {
    key: "tenantId",
    value: tenantId
  }];
queryObject.push({
  key: "businessIds",
  value: applicationNumber
});
try {
  let payload =[];
  
 payload = await httpRequest(
    "post",
    "/pension-services/v1/_searchWorkflow",
    "_search",
    
    queryObject
  );
  
  
 
return payload
} catch (e) {
  console.log(e);
}
  
};

const getFirstListFromDotSeparated = list => {
  list = list.map(item => {
    if (item.active) {
      return item.code.split(".")[0];
    }
  });
  list = [...new Set(list)].map(item => {
    return { code: item };
  });
  return list;
};

export const getData = async (action, state, dispatch) => {
 
  await getMdmsData(action, state, dispatch);
  
  let queryObject = [
    {
      key: "tenantId",
      value: tenantId
    }
  ];
  queryObject.push({
    key: "businessIds",
    value: applicationNumber
  });
  try{
 
 
   let responce = await getWorkflowAccessibility(queryObject);
 
     if(!responce.ProcessInstances[0].isViewEnabled)
     {
       //window.location.href ="/index"
       dispatch(prepareFinalObject("IsValidApplication", true));
 
     }
     else{
       dispatch(prepareFinalObject("IsValidApplication", true));
     }
   }
   catch(error)
   {
     dispatch(prepareFinalObject("IsValidApplication", true));
   }
};

export const prepareEditFlow = async (
  state,
  dispatch,
  applicationNumber,
  tenantId,
  action
) => {
 
  
  if (applicationNumber) {

    let queryObject = [
      {
        key: "businessIds",
      value: applicationNumber
       
      }];
    queryObject.push({
      key: "tenantId",
      value: tenantId
    });
    response = await getworkflowData(queryObject);
    const queryObjecth = [
      { key: "businessIds", value: applicationNumber },
      { key: "history", value: true },
      { key: "tenantId", value: tenantId },
      { key: "offset", value: 0 },
      { key: "limit", value: 100 }]
    let payload = await getworkflowhistoryData(queryObjecth)
     //response = sampleSingleSearch(); 
     
     //export const pmsfooter = footer(response) ;
    
     dispatch(prepareFinalObject("TaskHistory", get(payload, "ProcessInstances", [])));
    
    
    
    const step = getQueryArg(window.location.href, "step");
    // Code to goto a specific step through URL
    if (step && step.match(/^\d+$/)) {
     let intStep = parseInt(step);
     set(
       action.screenConfig,
       "components.div.children.stepper.props.activeStep",
       intStep
     );
     let formWizardNames = [
       "formwizardFirstStep",
       "formwizardFourthStep",
       "formwizardSecondStep",
       "formwizardThirdStep",
      
     ];
     for (let i = 0; i < 4; i++) {
       set(
         action.screenConfig,
         `components.div.children.${formWizardNames[i]}.visible`,
         i == step
       );
       set(
         action.screenConfig,
         `components.div.children.footer.children.previousButton.visible`,
         step != 0
       );
     }
   }

 let isDuesPresent =
 get(response, "ProcessInstances[0].employeeOtherDetails.isDuesPresent") 
 let isDuesAmountDecided =
 get(response, "ProcessInstances[0].employeeOtherDetails.isDuesAmountDecided") 
 let disabilityPercentage =
 get(response, "ProcessInstances[0].employeeDisability.disabilityPercentage",0) 
  
      

   let DuesPresent =
   isDuesPresent === true
     ? "YES"
     : "NO";
     let DuesAmountDecided =
     isDuesAmountDecided === true
       ? "YES"
       : "NO";
   dispatch(
    handleField(
      "dopDetails",
      "components.div.children.formwizardFirstStep.children.employeeOtherDetails.children.cardContent.children.employeeOtherDetailsConatiner.children.isDuesPresent",
      "props.value",
      DuesPresent
    )
  );
  if(!Accesslable[4].IsCalculate)
  {
    dispatch(
      handleField(
        "dopDetails",
        "components.div.children.formwizardSecondStep.children.pensionDetails.children.cardContent.children.CalculationNote",
        "props.style",
        { display: "none" }
      )
    );
  }
  if(disabilityPercentage===0 || disabilityPercentage === null)
  { 
  dispatch(
    handleField(
      "dopDetails",
      "components.div.children.formwizardFirstStep.children.employeeDisabiltyDetails.children.cardContent.children.employeeDisabiltyConatiner",//.children.attendantAllowanceGranted",
      "props.style",
      { display: "none" }
    )
  );
}
  dispatch(
    handleField(
      "dopDetails",
      "components.div.children.formwizardFirstStep.children.employeeOtherDetails.children.cardContent.children.employeeOtherDetailsConatiner.children.DuesAmountDecided.children.isDuesAmountDecided",
      "props.value",
      DuesAmountDecided
    )
  );
   if(isDuesPresent)
   {
    dispatch(
      handleField(
        "dopDetails",
        "components.div.children.formwizardFirstStep.children.employeeOtherDetails.children.cardContent.children.DuesAmountDecided",
        "props.style",
        { display: "inline-block" }
      )
    );
   }
   else{
    dispatch(
      handleField(
        "dopDetails",
        "components.div.children.formwizardFirstStep.children.employeeOtherDetails.children.cardContent.children.DuesAmountDecided",
        "props.style",
        { display: "none" }
      )
    );

   }
  
   if(isDuesAmountDecided)
   {
    
    dispatch(
      handleField(
        "dopDetails",
        "components.div.children.formwizardFirstStep.children.employeeOtherDetails.children.cardContent.children.employeeOtherDetailsConatiner.children.dues",
        "props.style",
        { display: "inline-block" }
      )
    ); 

   }
   else{
    dispatch(
      handleField(
        "dopDetails",
        "components.div.children.formwizardFirstStep.children.employeeOtherDetails.children.cardContent.children.employeeOtherDetailsConatiner.children.dues",
        "props.style",
        { display: "none" }
      )
    );  
     
   }

//set default value for due function

// set(state,"screenConfiguration.preparedFinalObject.ProcessInstances[0].employeeOtherDetails.isDuesPresent", false);
// set(state,"screenConfiguration.preparedFinalObject.ProcessInstances[0].employeeOtherDetails.isDuesAmountDecided", false);
let cardIndex=0;
 // Set default for dependent
 let dependents =
 get(response, "ProcessInstances[0].dependents",[]) 
//  let isDuesPresent =
//  get(response, "ProcessInstances[0].employeeOtherDetails.isDuesPresent") 
 console.log(dependents)
 console.log("dependents")
if(dependents) 
{
//set gratuity text box and lable based on api responce
for (let index = 0; index < dependents.length; index++) {

//  alert(dependents[index].isEligibleForPension);
//    set(action.screenConfig,
//     "components.div.children.formwizardFirstStep.children.empDetails.children.cardContent.children.dependentUnitcard.props.items[" + index + "].item" + index + ".children.cardContent.children.dependentUnitcardContainer.children.PensionEligible.visible"
//     ,dependents[index].isEligibleForPension);
//     set(action.screenConfig,
//           "components.div.children.formwizardFirstStep.children.empDetails.children.cardContent.children.dependentUnitcard.props.items[" + index + "].item" + index + ".children.cardContent.children.dependentUnitcardContainer.children.gratuityEligible.visible"
//      ,dependents[index].isEligibleForGratuity);
//      set(action.screenConfig,
//        "components.div.children.formwizardFirstStep.children.empDetails.children.cardContent.children.dependentUnitcard.props.items[" + index + "].item" + index + ".children.cardContent.children.dependentUnitcardContainer.children.gratuityPercentage.visible"
//        ,dependents[index].isEligibleForGratuity);
   
 }
} 




    // Set sample docs upload
    // dispatch(prepareFinalObject("documentsUploadRedux", sampleDocUpload()));
  }
  dispatch(prepareFinalObject("ProcessInstances", get(response, "ProcessInstances", [])));
   dispatch(prepareFinalObject("ProcessInstancesTemp", get(response, "ProcessInstances", [])));
  dispatch(prepareFinalObject("ApplicationDetails", get(response, "ApplicationDetails", [])));
  dispatch(prepareFinalObject("pensionArrears.pensionArrears", get(response,'ProcessInstances[0].pensionArrears',[]))); 
  let nqsyy = get(state.screenConfiguration.preparedFinalObject,"ProcessInstances[0].pensionCalculationUpdateDetails.nqsYearVerified", 0 )
  let nqsmm = get(state.screenConfiguration.preparedFinalObject,"ProcessInstances[0].pensionCalculationUpdateDetails.nqsMonthVerified", 0 )
  let nqsdd = get(state.screenConfiguration.preparedFinalObject,"ProcessInstances[0].pensionCalculationUpdateDetails.nqsDayVerified", 0 )
  if (nqsyy > 0 || nqsmm > 0 || nqsdd > 0)
  dispatch(prepareFinalObject("IsCalculated", true));
  else 
  dispatch(prepareFinalObject("IsCalculated", false));
  dispatch(prepareFinalObject("IsCalculatedWarning", false));
     //get set department and degignation
     let department =
     get(response, "ProcessInstances[0].employee.assignments[0].department",'') 
     let degignation =
     get(response, "ProcessInstances[0].employee.assignments[0].designation",'') 
   
     if(department)
     {
       let deptMdmsData = get(
         state.screenConfiguration.preparedFinalObject,
         "applyScreenMdmsData.common-masters.Department",
         []
       );
       let codeNames = deptMdmsData.filter(x=>x.code ===department)
       
       if(codeNames && codeNames[0])
       codeNames = codeNames[0].name;
       else
       codeNames =department;
   
       set(state,"screenConfiguration.preparedFinalObject.ProcessInstances[0].employee.assignments[0].department", codeNames);
     }
     if(degignation)
     {
       let desigMdmsData = get(
         state.screenConfiguration.preparedFinalObject,
         "applyScreenMdmsData.common-masters.Designation",
         []
       );
       let codeNames = desigMdmsData.filter(x=>x.code ===degignation)
       if(codeNames && codeNames[0])
       codeNames = codeNames[0].name;
       else
       codeNames =degignation;
     
       set(state,"screenConfiguration.preparedFinalObject.ProcessInstances[0].employee.assignments[0].designation", codeNames);
       
     }
     let dateOfDeath = get(state.screenConfiguration.preparedFinalObject,"ProcessInstances[0].employee.dateOfDeath", 0 )
     let CurrentDate = new Date()
     if(Number(dateOfDeath))
     dateOfDeath = epochToYmd(dateOfDeath)
     const  dateOfDeath_ = new Date(dateOfDeath)
     if(dateOfDeath_ <CurrentDate)
     {
      set(
        action.screenConfig,
        "components.div.children.formwizardSecondStep.children.arrealPensionDetails.visible",
        true
      );

     }
     else{
      set(
        action.screenConfig,
        "components.div.children.formwizardSecondStep.children.arrealPensionDetails.visible",
        false
      );
     }
  prepareDocumentsUploadData(state, dispatch);
};
export const pmsfooter = footer(response) ;
const screenConfig = {
  uiFramework: "material-ui",
  name: "dopDetails",
  beforeInitScreen: (action, state, dispatch) => {
     applicationNumber = getQueryArg(
      window.location.href,
      "applicationNumber"
    );
    //SU0001
    set(
      action.screenConfig,
      "components.div.children.headerDiv.children.header.children.applicationNumber.props.number",
      applicationNumber
    );
    const tenantId = getQueryArg(window.location.href, "tenantId");
    const step = getQueryArg(window.location.href, "step");
    getData(action, state, dispatch).then(responseAction => {
    
    });
    //Set Module Name
    set(state, "screenConfiguration.moduleName", "DOE_Service");
   
//get workflow details data
prepareEditFlow(state, dispatch, applicationNumber, tenantId, action).then(res=>
  {

  }
);
    

    // Code to goto a specific step through URL
    if (step && step.match(/^\d+$/)) {
      let intStep = parseInt(step);
      set(
        action.screenConfig,
        "components.div.children.stepper.props.activeStep",
        intStep
      );
      let formWizardNames = [
        "formwizardFirstStep",
        "formwizardFourthStep",
        "formwizardSecondStep",
        "formwizardThirdStep",
       
      ];
      for (let i = 0; i < 4; i++) {
        set(
          action.screenConfig,
          `components.div.children.${formWizardNames[i]}.visible`,
          i == step
        );
        set(
          action.screenConfig,
          `components.div.children.footer.children.previousButton.visible`,
          step != 0
        );
      }
    }
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
        
        // actionDialog: {
        //   uiFramework: "custom-containers-local",
        //   componentPath: "ResubmitActionContainer",
        //   moduleName: "egov-pms",
        //   visible: process.env.REACT_APP_NAME === "Citizen" ? true : false,
        //   props: {
        //     open: true,
        //     dataPath: "ProcessInstances",
        //     moduleName: "RRP_SERVICE",
        //     updateUrl: "/tl-services/v1/_processWorkflow",
        //     data: {
        //       buttonLabel: "RESUBMIT",
        //       moduleName: "RRP_SERVICE",
        //       isLast: false,
        //       dialogHeader: {
        //         labelName: "RESUBMIT Application",
        //         labelKey: "WF_RESUBMIT_APPLICATION"
        //       },
        //       showEmployeeList: false,
        //       roles: "CITIZEN",
        //       isDocRequired: false
        //     }
        //   }
        // },
        formwizardFirstStep,
        formwizardFourthStep,
        formwizardSecondStep,
        formwizardThirdStep,
        footer:footer(pensiondata)
       // pmsfooter
      }
    },
    adhocDialog: {
      uiFramework: "custom-containers-local",
      moduleName: "egov-pms",
      componentPath: "DialogContainer",
      props: {
        open: false,
       maxWidth: "xi",
        screenKey: "dopDetails"
      },
      children: {
        
        popup: getCommonContainer({
          header: {
            uiFramework: "custom-atoms",
            componentPath: "Container",
            props: {
              style: {
                width: "100%",
                float: "right"
              }
            },
            children: {
              div1: {
                uiFramework: "custom-atoms",
                componentPath: "Div",
                gridDefination: {
                  xs: 10,
                  sm: 10
                },
                props: {
                  style: {
                    width: "100%",
                    float: "right"
                  }
                },
                children: {
                  div: getCommonHeader(
                    {
                      labelKey: "PENSION_POPUP_HEAD_ARREAR"
                    },
                    {
                      style: {
                        fontSize: "20px"
                      }
                    }
                  )
                }
              },
              div2: {
                uiFramework: "custom-atoms",
                componentPath: "Div",
                gridDefination: {
                  xs: 2,
                  sm: 2
                },
                props: {
                  style: {
                    width: "100%",
                    float: "right",
                    cursor: "pointer"
                  }
                },
                children: {
                  closeButton: {
                    componentPath: "Button",
                    props: {
                      style: {
                        float: "right",
                        color: "rgba(0, 0, 0, 0.60)"
                      }
                    },
                    children: {
                      previousButtonIcon: {
                        uiFramework: "custom-atoms",
                        componentPath: "Icon",
                        props: {
                          iconName: "close"
                        }
                      }
                    },
                    onClickDefination: {
                      action: "condition",
                      callBack: (state, dispatch) => {
                        showHideAdhocPopup(state, dispatch, "dopDetails");
                      }
                    }
                  }
                }
              },
             
            }
          },
          pensionArrears: {
            uiFramework: "custom-containers-local",
            componentPath: "EmployeeServiceContainer",
            moduleName: "egov-pms",
            props: {
              dataPath: "taskInstance",
              moduleName: "RRP_SERVICE_ARREAR",
              updateUrl: "/tl-services/v1/_processWorkflow"
                    }
          },
        })
      }
    }
  }
};

export default screenConfig;
