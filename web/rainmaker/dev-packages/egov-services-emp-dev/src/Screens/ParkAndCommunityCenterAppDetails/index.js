import React, { Component } from "react";
import { Details } from "modules/common";
import { Button, TextField } from "components";
import { ComplaintTimeLine } from "modules/common";
import { Comments } from "modules/common";
import { Screen } from "modules/common";
import { resetFiles } from "egov-ui-kit/redux/form/actions";
import get from "lodash/get";
import axios from "axios";
import isEqual from "lodash/isEqual";
import _ from "lodash";
import { toggleSnackbarAndSetText } from "egov-ui-kit/redux/app/actions";
import { prepareFormData } from "egov-ui-kit/redux/common/actions";
import { getTenantId } from "egov-ui-kit/utils/localStorageUtils";
import OSMCCBookingDetails from "../AllApplications/components/OSMCCBookingDetails";
import AppDetails from "./components/ApplicantDetails";
import ViewBankDetails from "./components/ViewBankDetails";
import RoomCard from "./components/RoomCard"; //RoomCard  PaymentCardForRoom
import RefundCard from "./components/RefundCard";
import PaymentCardForRoom from "./components/PaymentCardForRoom";
import BookingDetails from "./components/BookingDetails"; //
import DocumentPreview from "../AllApplications/components/DocumentPreview";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import PaymentDetails from "./components/PaymentDetails";
import PaymentDetailFirstModified from "./components/PaymentDetailFirstModified";
import AppStateModifiedPayDetail from "./components/AppStateModifiedPayDetail";
import ApproveCancellation from "../CancelledAppApproved";
import RejectCancellation from "../CancelledAppReject";
import Label from "egov-ui-kit/utils/translationNode"; 
import jp from "jsonpath";
import {
  downloadEsamparkApp,
  downloadEsamparkPL,
} from "egov-ui-kit/redux/bookings/actions";
import { getFileUrlFromAPI } from "../../modules/commonFunction";
import { httpRequest } from "egov-ui-kit/utils/api";
import {
  getDateFromEpoch,
  mapCompIDToName,
  isImage,
  fetchImages,
  returnSLAStatus,
  getPropertyFromObj,
  findLatestAssignee,
  getTranslatedLabel,
} from "egov-ui-kit/utils/commons";
import {
  fetchApplications,
  fetchPayment,
  fetchHistory,
  fetchDataAfterPayment,
  downloadReceiptForPCC,
  downloadAppForPCC,
  sendMessage,
  downloadPLForPCC,
  sendMessageMedia,
  downloadEsampPaymentReceipt,PaccCitizenPaymentRecpt,
  downloadPaccPermissionLetter,PaccCitizenPermissionLetter,citizenCommunityPL
} from "egov-ui-kit/redux/bookings/actions";
import { connect } from "react-redux";
import DialogContainer from "../../modules/DialogContainer";
import Footer from "../../modules/footer";
import ActionButtonDropdown from "../../modules/ActionButtonDropdown";
import {
  convertEpochToDate,
  getDurationDate,
} from "../../modules/commonFunction";
import "./index.css";

class ApplicationDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      BKROOM_TAX: "", //operatorCode,Address,hsnCode
      BKROOM: "",
      BKROOM_ROUND_OFF: "",
      four: "",
      totalAmountPaid: "",
      PaymentDate: "",
      receiptNumber: "",
      PaymentMode: "",
      transactionNumber: "",
      operatorCode: "",
      Address: "",
      hsnCode: "",
      name: "",
      openMap: false,
      docFileData: [],
      bookingType: "",
      open: false,
      setOpen: false,
      togglepopup: false,
      dateVenchangePop: false,
      actionOnApplication: "",
      actionTittle: "",
      actionOpen: false,
      refundCard: false,
      totalRefundAmount: "",
      payload: "",
      AppName: "",
      fullAmountDetail: "",
      CheckStatus: "",
      modifiedFirstAmount: "",
      modifiedSecondAmount: "",
      newPaymentDetails: "NotFound",
      checkGreaterDate: "",
      checkNumDays: "",
      createdDate: "",
      stateCode: "",
      placeOfService: "",
      mcGSTN: "",
      isDiscount: false,
      proofOfResDocumentType: "",
      proofOfResDocName: "",
      proofOfResDocumentfileStoreId: "",
      discountDocfileStoreId: "",
      discountDocName: "",
      allDocumentList: [],
      reasonForBookingCancellation: "",
      enterReasonForBookingCancellation: false,
    };
  }

  handleActionButtonClose = () => {
    this.setState({
      actionOpen: false,
    });
  };

  handleActionButtonOpen = () => {
    this.setState({
      actionOpen: true,
    });
  };

  componentDidMount = async () => {
    let {
      fetchApplications,
      fetchHistory,
      fetchPayment,
      fetchDataAfterPayment,
      downloadReceiptForPCC,
      match,
      resetFiles,
      transformedComplaint,
      prepareFormData,
      userInfo,
      documentMap,
      prepareFinalObject,
      selectedComplaint,
    } = this.props;
    console.log("propsforRefund--", this.props);
    // let AppNo = selectedComplaint.bkApplicationNumber
    // console.log("AppNo--", AppNo)

    let funtenantId = userInfo.tenantId;
    console.log("funtenantId--", funtenantId);

    let mdmsBody = {
      MdmsCriteria: {
        tenantId: funtenantId,
        moduleDetails: [
          {
            moduleName: "Booking",
            masterDetails: [
              {
                name: "E_SAMPARK_BOOKING",
              },
            ],
          },
        ],
      },
    };

    let payloadRes = null;
    payloadRes = await httpRequest(
      "egov-mdms-service/v1/_search",
      "_search",
      [],
      mdmsBody
    );
    console.log(payloadRes, "hsncodeAndAll");

    let mdmsBodyTwo = {
      MdmsCriteria: {
        tenantId: userInfo.tenantId,
        moduleDetails: [
          {
            moduleName: "Booking",
            masterDetails: [
              {
                name: "PDF_BOOKING_DETAILS",
              },
            ],
          },
        ],
      },
    };

    let payloadResTwo = null;
    payloadResTwo = await httpRequest(
      "egov-mdms-service/v1/_search",
      "_search",
      [],
      mdmsBodyTwo
    );
    console.log(payloadResTwo, "MCGSTnumberDetail");

    let pdfDetails = payloadResTwo.MdmsRes.Booking.PDF_BOOKING_DETAILS;
    console.log("pdfDetails-", pdfDetails); //stateCode  placeOfService  mcGSTN

    this.setState(
      {
        stateCode: pdfDetails[0].stateCode,
        placeOfService: pdfDetails[0].placeOfService,
        mcGSTN: pdfDetails[0].mcGSTN,
      },
      console.log(
        "thisStatestateCode",
        this.state.stateCode,
        this.state.placeOfService,
        this.state.mcGSTN
      )
    );

    let samparkDetail = payloadRes.MdmsRes.Booking.E_SAMPARK_BOOKING;

    let operatorCode;
    let Address;
    let hsnCode;
    let name;

    for (let i = 0; i < samparkDetail.length; i++) {
      if (samparkDetail[i].id == userInfo.fatherOrHusbandName) {
        operatorCode = samparkDetail[i].operatorCode;
        hsnCode = samparkDetail[i].hsnCode;
        name = samparkDetail[i].name;
        Address = samparkDetail[i].centreAddres;
      }
    }
    this.setState({
      operatorCode: operatorCode,
      Address: Address,
      hsnCode: hsnCode,
      name: name,
    });

    let FromDate = selectedComplaint.bkFromDate;
    console.log("FromDate--", FromDate);

    let complaintCountRequest = {
      applicationNumber: match.params.applicationId,
      uuid: userInfo.uuid,
      applicationStatus: "",
      mobileNumber: "",
      bookingType: "",
      tenantId: userInfo.tenantId,
    };

    let dataforSectorAndCategory = await httpRequest(
      "bookings/api/employee/_search",
      "_search",
      [],
      complaintCountRequest
    );
    console.log("dataforSectorAndCategory--", dataforSectorAndCategory);
    let bkLocation =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkLocation
        : "NA";
    let bkFromDate =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkFromDate
        : "NA";
    let bkToDate =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkToDate
        : "NA";
    let AppStatus =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkApplicationStatus
        : "NA";
    let bkBookingType =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkBookingType
        : "NA";
    let Sector =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkSector
        : "NA";
    let bkBookingVenue =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkBookingVenue
        : "NA";
    // let AppNo = dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList ? dataforSectorAndCategory.bookingsModelList[0].bkApplicationNumber : 'NA'
    let bookingRent =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkRent
        : "NA";
    console.log("AppNo--", AppNo);
    let AppNo =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkApplicationNumber
        : "NA";
    let isDiscount =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.bookingsModelList[0].bkPlotSketch
        : "Genral";
    let allDocumentList =
      dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
        ? dataforSectorAndCategory.documentList
        : [];
    //General
    if (isDiscount != "General") {
      this.setState({ isDiscount: true });
    }
    let proofOfResDocs;
    if (allDocumentList && allDocumentList.length > 0) {
      proofOfResDocs = allDocumentList.filter((item) => {
        return item.documentType != "BK_PCC_DISCOUNT_DOCUMENT";
      });
      allDocumentList.map((doc) => {
        if (doc.documentType != "BK_PCC_DISCOUNT_DOCUMENT") {
          // tempDoc=this.state.docFileData
          // tempDoc.push()
          // this.setState({})
          this.setState({
            proofOfResDocName: doc.fileName,
            proofOfResDocumentType: doc.documentType,
            proofOfResDocumentfileStoreId: doc.fileStoreId,
            allDocumentList: allDocumentList,
          });
        } else {
          this.setState({
            discountDocName: doc.fileName,
            discountDocfileStoreId: doc.fileStoreId,
            allDocumentList: allDocumentList,
          });
        }
      });
      // this.setState({proofOfResDocName: proofOfResDocs[0].fileName,
      // 	proofOfResDocumentType: proofOfResDocs[0].documentType,
      // 	allDocumentList: allDocumentList
      // })
    }
    console.log("nero proofOfResDocs", proofOfResDocs, "----", allDocumentList);
    if (dataforSectorAndCategory.bookingsModelList[0].timeslots.length > 0) {
      let arr2 = [];
      for(let i = 0; i < dataforSectorAndCategory.bookingsModelList[0].timeslots.length; i++){
        arr2.push(dataforSectorAndCategory.bookingsModelList[0].timeslots[i].slot)
      }
      console.log("arr",arr2)

      if(arr2.length == 1){
      console.log("it contain single element")
      console.log("your time slot is",arr2[0])
      let timeSlot =
        dataforSectorAndCategory.bookingsModelList[0].timeslots[0].slot;
      console.log("timeSlot--", timeSlot);

      prepareFinalObject("oldAvailabilityCheckData.TimeSlot", timeSlot);

      let res = timeSlot.split("-");
      console.log("res--", res);

      let fromTime = res[0];
      console.log("fromTime--", fromTime);

      prepareFinalObject("oldAvailabilityCheckData.TimeSlotfromTime", fromTime);

      let ToTime = res[1];
      console.log("ToTime--", ToTime);

      prepareFinalObject("oldAvailabilityCheckData.TimeSlotToTime", ToTime);

      let strMid = ",";

      let ConcatFromDateTime = bkFromDate.concat(strMid).concat(fromTime);
      console.log("ConcatFromDateTime--", ConcatFromDateTime);

      prepareFinalObject(
        "oldAvailabilityCheckData.ConcatFromDateTime",
        ConcatFromDateTime
      );

      let ConcatToDateTime = bkToDate.concat(strMid).concat(ToTime);
      console.log("ConcatToDateTime--", ConcatToDateTime);

      prepareFinalObject(
        "oldAvailabilityCheckData.ConcatToDateTime",
        ConcatToDateTime
      );

      //let bkDisplayFromDateTime =

      let timeSlotId =
        dataforSectorAndCategory.bookingsModelList[0].timeslots[0].id;
      console.log("timeSlotId--", timeSlotId);

      prepareFinalObject("oldAvailabilityCheckData.timeSlotId", timeSlotId);
      }
       else{
        let a = arr2[0]
        let b = arr2[1]
        console.log("a",a)
        console.log("b",b)
        let fromfirst = a.split("-")
        console.log("first",fromfirst)
       let fromsecond = b.split("-")
      console.log("second",fromsecond)
      
      let first = fromfirst[0]
      let second = fromsecond[1]
      console.log("first",first)
      console.log("second",second)

      let comfirstsecond = first + "-" + second
      console.log("comfirstsecond",comfirstsecond)

      let timeSlot = comfirstsecond
console.log("timeSlot54234",timeSlot)
      prepareFinalObject("oldAvailabilityCheckData.TimeSlot", timeSlot);


      let res = timeSlot.split("-");
      console.log("res--", res);

      let fromTime = res[0];
      console.log("fromTime--", fromTime);

      prepareFinalObject("oldAvailabilityCheckData.TimeSlotfromTime", fromTime);

      let ToTime = res[1];
      console.log("ToTime--", ToTime);

      prepareFinalObject("oldAvailabilityCheckData.TimeSlotToTime", ToTime);

      let strMid = ",";

      let ConcatFromDateTime = bkFromDate.concat(strMid).concat(fromTime);
      console.log("ConcatFromDateTime--", ConcatFromDateTime);

      prepareFinalObject(
        "oldAvailabilityCheckData.ConcatFromDateTime",
        ConcatFromDateTime
      );

      let ConcatToDateTime = bkToDate.concat(strMid).concat(ToTime);
      console.log("ConcatToDateTime--", ConcatToDateTime);

      prepareFinalObject(
        "oldAvailabilityCheckData.ConcatToDateTime",
        ConcatToDateTime
      );

      //let bkDisplayFromDateTime =

      let timeSlotId =
        dataforSectorAndCategory.bookingsModelList[0].timeslots[0].id;
      console.log("timeSlotId--", timeSlotId);

      prepareFinalObject("oldAvailabilityCheckData.timeSlotId", timeSlotId);

      let timeSlotIdTwo =
      dataforSectorAndCategory.bookingsModelList[0].timeslots[1].id;
    console.log("timeSlotIdTwo--", timeSlotIdTwo);

    prepareFinalObject("oldAvailabilityCheckData.timeSlotIdTwo", timeSlotIdTwo);  
       }
    }

    let NewfinanceBusinessService;
    if (bkBookingType == "Parks") {
      NewfinanceBusinessService = "BOOKING_BRANCH_SERVICES.MANUAL_OPEN_SPACE";
    }
    if (bkBookingType == "Community Center") {
      NewfinanceBusinessService =
        "BOOKING_BRANCH_SERVICES.COMMUNITY_CENTRES_JHANJ_GHAR";
    }

    prepareFinalObject("oldAvailabilityCheckData.BookingRent", bookingRent);

    prepareFinalObject("oldAvailabilityCheckData.bkBookingType", bkBookingType);

    prepareFinalObject("oldAvailabilityCheckData.Sector", Sector);

    prepareFinalObject("oldAvailabilityCheckData.bkBookingVenue", bkLocation);

    prepareFinalObject("oldAvailabilityCheckData.FromDate", bkFromDate);

    prepareFinalObject("oldAvailabilityCheckData.bkFromDate", bkFromDate);

    prepareFinalObject("oldAvailabilityCheckData.bkToDate", bkToDate);

    prepareFinalObject(
      "oldAvailabilityCheckData.bkBookingVenueID",
      bkBookingVenue
    );

    prepareFinalObject("PreviousBookingData.ToDate", bkToDate);

    prepareFinalObject("PreviousBookingData.FromDate", bkFromDate);

    prepareFinalObject("PreviousBookingData.bkBookingVenue", bkLocation);

    prepareFinalObject("PreviousBookingData.ApplicationStatus", AppStatus);

    allDocumentList.map(async (doc) => {
      console.log("Doccc---", doc);
      // doc.docmentType
      // doc.fileName
      // doc.fileStoreId
      let fileLink = await getFileUrlFromAPI(doc.fileStoreId, "ch");
      console.log("filelink--", fileLink);
      if (doc.documentType === "BK_PCC_DISCOUNT_DOCUMENT") {
        console.log("DIscountDoc==", doc);
        let dicscountDoc = [
          {
            documentCode: doc.documentType,
            documentType: "DOC",
            documents: [
              {
                fileName: doc.fileName,
                fileStoreId: doc.fileStoreId,
                fileUrl: fileLink[doc.fileStoreId],
                mendatoryDoc: true,
              },
            ],
            isDocumentRequired: true,
            isDocumentTypeRequired: true,
            mydocstate: true,
          },
        ];
        prepareFinalObject("discountDocumentsUploadRedux", dicscountDoc);
        return;
      } else {
        console.log("DocFIle==", doc);
        let Doc = [
          {
            documentCode: doc.documentType,
            documentType: "DOC",
            documents: [
              {
                fileName: doc.fileName,
                fileStoreId: doc.fileStoreId,
                fileUrl: fileLink[doc.fileStoreId],
                mendatoryDoc: true,
              },
            ],
            isDocumentRequired: true,
            isDocumentTypeRequired: true,
            mydocstate: true,
          },
        ];
        prepareFinalObject("documentsUploadRedux", Doc);
        return;
      }
    });

    let reqParams = [
      { key: "consumerCode", value: match.params.applicationId },
      { key: "tenantId", value: userInfo.tenantId },
    ];

    let BillingServiceData = await httpRequest(
      "billing-service/bill/v2/_search",
      "_search",
      reqParams
    );

    console.log("BillingService--abc", BillingServiceData);
    prepareFinalObject("DateVenueChngeAmount", BillingServiceData);
    //Bill[2].billDetails[0].billAccountDetails
    // let BillArray = BillingServiceData.Bill[2].billDetails[0].billAccountDetails
    // console.log("BillArray-",BillArray)

    this.setState({
      AppName:
        dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList
          ? dataforSectorAndCategory.bookingsModelList[0].bkApplicantName
          : "NA",
      fullAmountDetail: BillingServiceData.Bill[0], //BillingServiceData.Bill[2],
      CheckStatus: AppStatus,
      modifiedFirstAmount: BillingServiceData.Bill[2], //BillingServiceData.Bill[0]
    });

    prepareFormData("complaints", transformedComplaint);
    const { complaint } = transformedComplaint;
    fetchApplications({
      applicationNumber: match.params.applicationId,
      uuid: userInfo.uuid,
      applicationStatus: "",
      mobileNumber: "",
      bookingType: "",
      tenantId: userInfo.tenantId,
    });
    fetchHistory([
      { key: "businessIds", value: match.params.applicationId },
      { key: "history", value: true },
      { key: "tenantId", value: userInfo.tenantId },
    ]);

    fetchPayment([
      { key: "consumerCode", value: match.params.applicationId },
      { key: "businessService", value: NewfinanceBusinessService },
      { key: "tenantId", value: userInfo.tenantId },
    ]);
    fetchDataAfterPayment([
      { key: "consumerCodes", value: match.params.applicationId },
      { key: "tenantId", value: userInfo.tenantId },
    ]);

    const cancelBookingWfUsersRoles =
      userInfo &&
      userInfo.roles.some(
        (el) =>
          el.code === "BK_CLERK" ||
          el.code === "BK_DEO" ||
          el.code === "BK_SENIOR_ASSISTANT" ||
          el.code === "BK_AUDIT_DEPARTMENT" ||
          el.code === "BK_CHIEF_ACCOUNT_OFFICER" ||
          el.code === "BK_PAYMENT_PROCESSING_AUTHORITY" ||
          el.code === "BK_SUPERVISOR" ||
          el.code === "BK_OSD"
      );

    if (cancelBookingWfUsersRoles) {
      let totalRes = await this.calculateCancelledBookingRefundAmount(
        AppNo,
        funtenantId,
        FromDate,
        dataforSectorAndCategory.bookingsModelList[0].roomsModel
      );
      console.log("totalRes--inrefundPage", totalRes);

      this.setState({
        totalRefundAmount: totalRes,
      });

      this.setState({
        refundCard: true,
      });
    }

    let { details } = this.state;
  };

  BookRoom = async () => {
    let { prepareFinalObject, userInfo, toggleSnackbarAndSetText } = this.props;
    let { selectedComplaint } = this.props;
    let ApplicationNumber = selectedComplaint.bkApplicationNumber;
    let complaintCountRequest = {
      applicationNumber: ApplicationNumber,
    };

    let dataforSectorAndCategory = await httpRequest(
      "bookings/api/community/center/_search",
      "_search",
      [],
      complaintCountRequest
    );
    console.log("dataforSectorAndCategory --", dataforSectorAndCategory);
    if (dataforSectorAndCategory.bookingsModelList.length > 0) {
      prepareFinalObject("RoomBookingData", dataforSectorAndCategory);
      prepareFinalObject("SetPaymentURL", this.props.history.push);
      console.log("historyPropsToConsole--", this.props.history.push);
      console.log("historyPropsToConsole--", this.props.history);
      this.props.history.push(`/egov-services/ApplyRoomBooking`);
    } else {
      toggleSnackbarAndSetText(
        true,
        {
          labelName: "No Application Found With This Application Number",
          labelKey: `BK_ERR_APPLICATION_NOT_FOUND`,
        },
        "error"
      );
    }
    // this.props.history.push(`/egov-services/ApplyForRoomBooking`);
  };

  calculateCancelledBookingRefundAmount = async (
    applicationNumber,
    tenantId,
    bookingDate,
    bookedRoomArray
  ) => {
    const {
      payloadone,
      paymentDetailsForReceipt,
      payloadTwo,
      ConRefAmt,
      refConAmount,
    } = this.props;
    console.log("propsforcalculateCancelledBookingRefundAmount--", this.props);
    console.log(bookedRoomArray, "Nero bookedRoomArray");
    //refConAmount
    if (refConAmount != "NotFound") {
      this.setState({
        payload: refConAmount,
      });
    }

    // let payload = paymentDetailsForReceipt;

    var CheckDate = new Date(bookingDate);

    var todayDate = new Date();

    if (applicationNumber && tenantId) {
      console.log(
        "Payment Details",
        this.state.payload ? this.state.payload : "NOTFOUND"
      );
      if (this.state.payload) {
        console.log(CheckDate, todayDate, "Nero checkdate");

        if (todayDate > CheckDate) {
          // alert("refundCondition")
          let billAccountDetails = this.state.payload.Payments[0]
            .paymentDetails[0].bill.billDetails[0].billAccountDetails;
          let bookingAmount = 0;
          for (let i = 0; i < billAccountDetails.length; i++) {
            if (
              billAccountDetails[i].taxHeadCode ==
                "SECURITY_MANUAL_OPEN_SPACE_BOOKING_BRANCH" ||
              billAccountDetails[i].taxHeadCode ==
                "SECURITY_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
            ) {
              bookingAmount += billAccountDetails[i].amount;
            }
          }

          return bookingAmount;
        }
        if (todayDate < CheckDate) {
          console.log("Hello Booked");
          /********************************/
          let bookingNos = [];
          let bookingNosString = "";
          for (let i = 0; i < bookedRoomArray.length; i++) {
            if (
              !bookingNos.includes(bookedRoomArray[i].roomApplicationNumber)
            ) {
              bookingNos.push(bookedRoomArray[i].roomApplicationNumber);
              bookingNosString +=
                bookedRoomArray[i].roomApplicationNumber + ",";
            }
          }
          bookingNosString = bookingNosString.slice(0, -1); //Removing last Character
          if (bookingNosString && tenantId) {
            let queryObject = [
              { key: "tenantId", value: tenantId },
              { key: "consumerCodes", value: bookingNosString },
            ];
            const payload = await httpRequest(
              "post",
              "/collection-services/payments/_search",
              "",
              queryObject
            );
            let roomBookingAmount = 0;
            if (payload) {
              console.log(payload, "Nero Payload");
              // dispatch(
              // 	prepareFinalObject("bookedRoomsPaymentDetails", [
              // 		payload.Payments,
              // 	])
              // );
              let bookedRoomsPaymentDetails = payload.Payments;

              if (
                bookedRoomsPaymentDetails &&
                bookedRoomsPaymentDetails.length > 0
              ) {
                for (let j = 0; j < bookedRoomsPaymentDetails[0].length; j++) {
                  for (
                    let k = 0;
                    k <
                    bookedRoomsPaymentDetails[0][j].paymentDetails[0].bill
                      .billDetails[0].billAccountDetails.length;
                    k++
                  ) {
                    if (
                      bookedRoomsPaymentDetails[0][j].paymentDetails[0].bill
                        .billDetails[0].billAccountDetails[k].taxHeadCode ===
                      "RENT_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
                    ) {
                      roomBookingAmount +=
                        bookedRoomsPaymentDetails[0][j].paymentDetails[0].bill
                          .billDetails[0].billAccountDetails[k].amount;
                    }
                  }
                }
              }
            }
          }
          /********************************/
          // alert("cancelCondition")
          let billAccountDetails = this.state.payload.Payments[0]
            .paymentDetails[0].bill.billDetails[0].billAccountDetails;
          let bookingAmount = 0;
          let securityAmount = 0;
          for (let i = 0; i < billAccountDetails.length; i++) {
            if (
              billAccountDetails[i].taxHeadCode ==
                "SECURITY_MANUAL_OPEN_SPACE_BOOKING_BRANCH" ||
              billAccountDetails[i].taxHeadCode ==
                "SECURITY_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
            ) {
              securityAmount += billAccountDetails[i].amount;
            }
            if (
              billAccountDetails[i].taxHeadCode ==
                "PARKING_LOTS_MANUAL_OPEN_SPACE_BOOKING_BRANCH" ||
              billAccountDetails[i].taxHeadCode ==
                "RENT_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
            ) {
              bookingAmount += billAccountDetails[i].amount;
            }
          }

          if (roomBookingAmount > 0) {
            bookingAmount += roomBookingAmount;
          }
          console.log(bookingAmount, bookingNosString, "Nero Booking Amount");
          let mdmsBody = {
            MdmsCriteria: {
              tenantId: tenantId,
              moduleDetails: [
                {
                  moduleName: "Booking",
                  masterDetails: [
                    {
                      name: "bookingCancellationRefundCalc",
                    },
                  ],
                },
              ],
            },
          };

          let refundPercentage = "";

          let payloadRes = null;
          payloadRes = await httpRequest(
            "egov-mdms-service/v1/_search",
            "_search",
            [],
            mdmsBody
          );

          refundPercentage =
            payloadRes.MdmsRes.Booking.bookingCancellationRefundCalc[0];

          var date1 = new Date(bookingDate);

          var date2 = new Date();

          var Difference_In_Time = date1.getTime() - date2.getTime();

          // To calculate the no. of days between two dates
          var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

          let refundAmount = 0;
          if (Difference_In_Days > 29) {
            let refundPercent =
              refundPercentage.MORETHAN30DAYS.refundpercentage;

            refundAmount = (parseFloat(bookingAmount) * refundPercent) / 100;
          } else if (Difference_In_Days > 15 && Difference_In_Days < 30) {
            let refundPercent =
              refundPercentage.LETTHAN30MORETHAN15DAYS.refundpercentage;
            refundAmount = (parseFloat(bookingAmount) * refundPercent) / 100;
          }
          refundAmount = refundAmount + securityAmount;

          return refundAmount;
        }
      }
    }
  };

  componentWillReceiveProps = async (nextProps) => {
    // alert("checkwillreceiveprops")
    const { transformedComplaint, prepareFormData } = this.props;
    if (!isEqual(transformedComplaint, nextProps.transformedComplaint)) {
      prepareFormData("complaints", nextProps.transformedComplaint);
    }

    if (nextProps.paymentDetails != undefined) {
      //create new State To Send PaymentDetails for Refund
      this.setState({
        newPaymentDetails: nextProps.paymentDetails,
      });
    }
  };
  /*Cancel Emp Booking function*/
  CancelEmpBooking = async () => {
    this.setState({
      enterReasonForBookingCancellation: true,
    });
  };

  testpopup = () => {
    this.setState({
      dateVenchangePop: false,
    });
  };

  redirectToAvailPage = () => {
    console.log("Come in redirectToAvailPage");
    return (
      <div>
        <h5 style={{ marginBottom: "4%" }}>
          By changing date/venue, the booked rooms will be cancelled
        </h5>
        {/* <Button
            className="responsive-action-button"
            label={<Label
				buttonLabel={true}
				label="CONFIRM AND GO"
			/>}
            // fullWidth={true}
            primary={true}
            // style={{ float: 'right', marginRight: '50px', marginTop: '40px' }}
			style={{ width: "15%" }}
            onClick={() => this.continue()
            } /> */}

        <Button
          label={<Label buttonLabel={true} label="CONFIRM AND GO" />}
          primary={true}
          labelStyle={{
            letterSpacing: 0.7,
            padding: 0,
            // color: "#fe7a51"
          }}
          // buttonStyle={{ border: "1px solid #fe7a51" }}
          style={{ width: "28%" }}
          onClick={() => this.continue()}
        />
      </div>
    );
  };

  //actionButtonOnClick = (e, complaintNo, label)
  actionButtonOnClick = async (e, complaintNo, label) => {
    let AmountCondition = false;
    const { prepareFinalObject } = this.props;
    let { match, userInfo, selectedComplaint } = this.props;
    if (label == "APPROVED") {
      this.setState({
        actionTittle: "Approve Application",
      });

      if (selectedComplaint.bkApplicationStatus == "PENDING_FOR_APPROVAL_OSD") {
        AmountCondition = true;

        prepareFinalObject("ConditionForAmount", AmountCondition);
        console.log("AmountCondition--", AmountCondition);
      }

      // if(selectedComplaint.bkApplicationStatus == "PENDING_FOR_DISBURSEMENT"){
      // 	let RequestData = [
      // 		{ key: "consumerCode", value: match.params.applicationId },
      // 		{ key: "tenantId", value: userInfo.tenantId }
      // 	  ];
      // 	let payloadfund = await httpRequest(
      // 		"pg-service/transaction/v1/_search",
      // 		"_search",
      // 		RequestData
      // 	  );

      // 	console.log("RequestData--",RequestData)
      // 	console.log("payloadfund--",payloadfund)
      // 	console.log("payloadfund.Transaction--",payloadfund.Transaction)
      // }
    } else {
      this.setState({
        actionTittle: "Reject Application",
      });
    }
    this.setState({
      togglepopup: !this.state.togglepopup,
      actionOnApplication: label,
    });
  };

  btnTwoOnClick = (complaintNo, label) => {
    let { history } = this.props;
    switch (label) {
      case "ES_COMMON_ASSIGN":
        history.push(`/assign-complaint/${complaintNo}`);
        break;
      case "ES_COMMON_REASSIGN":
        history.push(`/reassign-complaint/${complaintNo}`);
        break;
      case "BK_MYBK_RESOLVE_MARK_RESOLVED":
        history.push(`/booking-resolved/${complaintNo}`);
        break;
    }
  };

  handleClickOpen = () => {
    this.setState({
      open: true,
    });
  };
  handleClose = () => {
    this.setState({
      openPopup: false,
    });
  };

  NumInWords = (number) => {
    const first = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const mad = ["", "Thousand", "Million", "Billion", "Trillion"];
    let word = "";

    for (let i = 0; i < mad.length; i++) {
      let tempNumber = number % (100 * Math.pow(1000, i));
      if (Math.floor(tempNumber / Math.pow(1000, i)) !== 0) {
        if (Math.floor(tempNumber / Math.pow(1000, i)) < 20) {
          word =
            first[Math.floor(tempNumber / Math.pow(1000, i))] +
            mad[i] +
            " " +
            word;
        } else {
          word =
            tens[Math.floor(tempNumber / (10 * Math.pow(1000, i)))] +
            first[Math.floor(tempNumber / Math.pow(1000, i)) % 10] +
            mad[i] +
            " " +
            word;
        }
      }

      tempNumber = number % Math.pow(1000, i + 1);
      if (Math.floor(tempNumber / (100 * Math.pow(1000, i))) !== 0)
        word =
          first[Math.floor(tempNumber / (100 * Math.pow(1000, i)))] +
          "Hunderd " +
          word;
    }
    return word + "Rupees Only";
  };

  downloadPaymentReceiptFunction = async (e) => {
    const {
      transformedComplaint,
      paymentDetailsForReceipt,
      paymentDetails,
      offlineTransactionDate,
      offlinePayementMode,
      offlineTransactionNum,
      six,
      one,
      recNumber,
      downloadReceiptForPCC,
      userInfo,
      selectedComplaint,
      downloadEsampPaymentReceipt,PaccCitizenPaymentRecpt,
      PACC,
      LUXURY_TAX,
      REFUNDABLE_SECURITY,
      PACC_TAX,
      PACC_ROUND_OFF,
      FACILITATION_CHARGE,
      amountTodisplay,
    } = this.props;
    console.log("pcccpaymentreceipt", this.props);
    let NumAmount = 0;
    NumAmount = Number(amountTodisplay);
    const { complaint } = transformedComplaint; //amountTodisplay

    let applicationDetails = selectedComplaint;
    let Newugst;
    let perFind = 50;
    let ugst = PACC_TAX;
    let find50Per = (perFind / 100) * ugst;
    console.log("find50Per--", find50Per);
    let findNumOrNot = Number.isInteger(find50Per);
    console.log("findNumOrNot--", findNumOrNot);
    if (findNumOrNot == true) {
      Newugst = find50Per;
      console.log("trueCondition");
    } else {
      Newugst = find50Per.toFixed(2);
      console.log("second-Newugst-", Newugst);
    }

    let approverName;
    for (let i = 0; i < userInfo.roles.length; i++) {
      if (userInfo.roles[i].code == "BK_E-SAMPARK-CENTER") {
        approverName = userInfo.roles[i].name;
      }
    }
    // let fdocname = Object.entries(documentMap)[0][1]


if(applicationDetails.bkAction === "RE_INITIATE" || applicationDetails.bkAction === "APPLY" || applicationDetails.bkAction === "CANCEL" || applicationDetails.bkAction === "MODIFY"){
console.log("comeInCitizenPaymentReceipt")

let  RequestGateWay = [
  { key: "consumerCode", value: match.params.applicationId },
  { key: "tenantId", value: userInfo.tenantId }
  ];
  let payloadGateWay = await httpRequest(
  "pg-service/transaction/v1/_search",
  "_search",
  RequestGateWay
  );
  //Transaction[0].gateway
let gateWay
 if(payloadGateWay.Transaction.length > 0){
gateWay = payloadGateWay.Transaction[0].gateway; 
}

 let BookingInfo = [
    {
      applicantDetail: {
        name: applicationDetails.bkApplicantName,
        mobileNumber: applicationDetails.bkMobileNumber,
        email: applicationDetails.bkEmail,
        permanentAddress: applicationDetails.bkHouseNo,
        permanentCity: "Chandigarh",
        sector: applicationDetails.bkSector,
        fatherName: "",
        placeOfService: this.state.placeOfService,
      },
      booking: {
        bkApplicationNumber: applicationDetails.bkApplicationNumber,
        applicationDate: applicationDetails.createdDate,
          bkLocation: applicationDetails.bkLocation,
          bkDept: applicationDetails.bkBookingType,
          bkFromTo: getDurationDate(
            applicationDetails.bkFromDate,
            applicationDetails.bkToDate
          ),
        },
        generated: {
          generatedBy: userInfo.name,
        },
        approvedBy: {
          approvedBy: userInfo.name,
          role: approverName,
        },
        paymentInfo: {
          cleaningCharges: applicationDetails.bkCleansingCharges,
          baseCharge: PACC,
          cgst: applicationDetails.bkCgst,
          utgst: applicationDetails.bkCgst,
          totalgst: PACC_TAX,
          refundableCharges: this.props.REFUNDABLE_SECURITY,
          totalPayment: amountTodisplay,
          paymentDate: convertEpochToDate(
            this.props.offlineTransactionDate,
            "dayend"
          ),
          receiptNo: this.props.recNumber,
          paymentType: this.props.offlinePayementMode,
          facilitationCharge: FACILITATION_CHARGE,
          discType: applicationDetails.bkPlotSketch,
          transactionId: this.props.offlineTransactionNum,
          totalPaymentInWords: this.NumInWords(NumAmount), //offlineTransactionDate,,
          bankName: gateWay,
          mcGSTN: this.state.mcGSTN,
          "custGSTN": applicationDetails.bkCustomerGstNo
        },
        OtherDetails: {
          clchargeforwest: applicationDetails.bkCleansingCharges,
          westaddress: "",
          clchargeforother: "",
        },
        tenantInfo: {
          municipalityName: "Municipal Corporation Chandigarh",
          address: "New Deluxe Building, Sector 17, Chandigarh",
          contactNumber: "+91-172-2541002, 0172-2541003",
          logoUrl: "https://chstage.blob.core.windows.net/fileshare/logo.png",
          webSite: "http://mcchandigarh.gov.in",
          statecode: this.state.stateCode, ////stateCode  placeOfService  mcGSTN
          hsncode: this.state.hsnCode,
        },
        bankInfo: {
          accountholderName: applicationDetails.bkBankAccountHolder,
          rBankName: applicationDetails.bkBankName,
          rBankACNo: applicationDetails.bkBankAccountNumber,
          rIFSCCode: applicationDetails.bkIfscCode,
        },

    }
]
console.log("citizenPaymentRequestBody",BookingInfo)
PaccCitizenPaymentRecpt({ BookingInfo: BookingInfo });
}
else{
console.log("employeePaymentReceipt")
    let BookingInfo = [
      {
        applicantDetail: {
          name: applicationDetails.bkApplicantName,
          mobileNumber: applicationDetails.bkMobileNumber,
          email: applicationDetails.bkEmail,
          permanentAddress: applicationDetails.bkHouseNo,
          permanentCity: "Chandigarh",
          sector: applicationDetails.bkSector,
          fatherName: "",
          custGSTN: applicationDetails.bkCustomerGstNo,
          placeOfService: this.state.placeOfService,
        },
        bookingDetail: {
          bkApplicationNumber: applicationDetails.bkApplicationNumber,
          applicationDate: applicationDetails.createdDate,
          bookingPeriod: getDurationDate(
            applicationDetails.bkFromDate,
            applicationDetails.bkToDate
          ),
          bookingType: applicationDetails.bkBookingType,
          venueName: applicationDetails.bkLocation,
          sector: applicationDetails.bkSector,
          bookingPurpose: applicationDetails.bkBookingPurpose,
        },
        booking: {
          bkLocation: applicationDetails.bkLocation,
          bkDept: applicationDetails.bkBookingType,
          bkFromTo: getDurationDate(
            applicationDetails.bkFromDate,
            applicationDetails.bkToDate
          ),
          applicationNumber: applicationDetails.bkApplicationNumber,
        },
        generated: {
          generatedBy: userInfo.name,
        },
        approvedBy: {
          approvedBy: userInfo.name,
          role: approverName,
        },
        emp: {
          samparkName: this.state.name,
          address: this.state.Address,
          OpCode: this.state.operatorCode,
        },
        paymentInfo: {
          cleaningCharges: applicationDetails.bkCleansingCharges,
          baseCharge: PACC,
          cgst: applicationDetails.bkCgst,
          utgst: applicationDetails.bkCgst,
          totalgst: PACC_TAX,
          refundableCharges: this.props.REFUNDABLE_SECURITY,
          totalPayment: amountTodisplay,
          paymentDate: convertEpochToDate(
            this.props.offlineTransactionDate,
            "dayend"
          ),
          receiptNo: this.props.recNumber,
          paymentType: this.props.offlinePayementMode,
          facilitationCharge: FACILITATION_CHARGE,
          discType: applicationDetails.bkPlotSketch,
          transactionId: this.props.offlineTransactionNum,
          totalPaymentInWords: this.NumInWords(NumAmount), //offlineTransactionDate,,
          bankName: "",
          cardNumberLast4: "Not Applicable",
          dateVenueChangeCharges:
            this.props.DATEVENUECHARGE == 0
              ? "Not Applicable"
              : this.props.DATEVENUECHARGE,
        },
        OtherDetails: {
          clchargeforwest: applicationDetails.bkCleansingCharges,
          westaddress: "",
          clchargeforother: "",
        },
        tenantInfo: {
          municipalityName: "Municipal Corporation Chandigarh",
          address: "New Deluxe Building, Sector 17, Chandigarh",
          contactNumber: "+91-172-2541002, 0172-2541003",
          logoUrl: "https://chstage.blob.core.windows.net/fileshare/logo.png",
          webSite: "http://mcchandigarh.gov.in",
          mcGSTN: this.state.mcGSTN,
          statecode: this.state.stateCode, ////stateCode  placeOfService  mcGSTN
          hsncode: this.state.hsnCode,
        },

        bankInfo: {
          accountholderName: applicationDetails.bkBankAccountHolder,
          rBankName: applicationDetails.bkBankName,
          rBankACNo: applicationDetails.bkBankAccountNumber,
          rIFSCCode: applicationDetails.bkIfscCode,
        },
      },
    ];
    downloadEsampPaymentReceipt({ BookingInfo: BookingInfo });
  }
};

  downloadApplicationFunction = async (e) => {
    const {
      downloadEsamparkApp,
      userInfo,
      createPACCApplicationData,
      selectedComplaint,
      documentMap,
      six,
    } = this.props;
    let fdocname;
    let checkDocumentUpload = Object.entries(documentMap).length === 0;
    console.log("checkDocumentUpload", checkDocumentUpload);

    if (checkDocumentUpload === true) {
      fdocname = "Not Found";
    }
    if (checkDocumentUpload === false) {
      fdocname = Object.entries(documentMap)[0][1];
    }

    let BookingInfo = [
      {
        applicantDetail: {
          name: selectedComplaint.bkApplicantName,
          mobileNumber: selectedComplaint.bkMobileNumber,
          email: selectedComplaint.bkEmail,
          permanentAddress: selectedComplaint.bkHouseNo,
          permanentCity: "Chandigarh",
          sector: selectedComplaint.bkSector,
          fatherName: " ",
        },
        bookingDetail: {
          applicationNumber: selectedComplaint.bkApplicationNumber,
          applicationDate: "",
          bookingPeriod: getDurationDate(
            selectedComplaint.bkFromDate,
            selectedComplaint.bkToDate
          ),
          venueName: selectedComplaint.bkLocation,
          sector: selectedComplaint.bkSector,
          bookingPurpose: selectedComplaint.bkBookingPurpose,
          parkDim: selectedComplaint.bkDimension,
        },
        feeDetail: {
          baseCharge: selectedComplaint.bkRent,
          cleaningCharge: selectedComplaint.bkCleansingCharges,
          surcharges: selectedComplaint.bkSurchargeRent,
          facilitationCharge: six ? six : "100",
          utgst: selectedComplaint.bkUtgst,
          cgst: selectedComplaint.bkCgst,
          gst: selectedComplaint.bkCgst,
          totalAmount: selectedComplaint.bkRent,
        },
        generatedBy: {
          generatedBy: userInfo.name,
          generatedDateTime: userInfo.createdDate,
        },
        documentDetail: {
          documentName: fdocname,
        },
      },
    ];

    downloadEsamparkApp({ BookingInfo: BookingInfo });
  };

  downloadApplicationButton = async (mode) => {
    await this.downloadApplicationFunction(); //Downloadesamparkdetails
    setTimeout(async () => {
      let documentsPreviewData;
      const { Downloadesamparkdetails, userInfo } = this.props;
      var documentsPreview = [];
      if (
        Downloadesamparkdetails &&
        Downloadesamparkdetails.filestoreIds.length > 0
      ) {
        documentsPreviewData = Downloadesamparkdetails.filestoreIds[0];
        documentsPreview.push({
          title: "DOC_DOC_PICTURE",
          fileStoreId: documentsPreviewData,
          linkText: "View",
        });
        let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
        let fileUrls =
          fileStoreIds.length > 0
            ? await getFileUrlFromAPI(fileStoreIds, userInfo.tenantId)
            : {};

        documentsPreview = documentsPreview.map(function (doc, index) {
          doc["link"] =
            (fileUrls &&
              fileUrls[doc.fileStoreId] &&
              fileUrls[doc.fileStoreId].split(",")[0]) ||
            "";

          doc["name"] =
            (fileUrls[doc.fileStoreId] &&
              decodeURIComponent(
                fileUrls[doc.fileStoreId]
                  .split(",")[0]
                  .split("?")[0]
                  .split("/")
                  .pop()
                  .slice(13)
              )) ||
            `Document - ${index + 1}`;
          return doc;
        });

        if (mode === "print") {
          var response = await axios.get(documentsPreview[0].link, {
            //responseType: "blob",
            responseType: "arraybuffer",

            headers: {
              "Content-Type": "application/json",
              Accept: "application/pdf",
            },
          });
          console.log("responseData---", response);
          const file = new Blob([response.data], { type: "application/pdf" });
          const fileURL = URL.createObjectURL(file);
          var myWindow = window.open(fileURL);
          if (myWindow != undefined) {
            myWindow.addEventListener("load", (event) => {
              myWindow.focus();
              myWindow.print();
            });
          }
        } else {
          setTimeout(() => {
            window.open(documentsPreview[0].link);
          }, 100);
        }

        prepareFinalObject("documentsPreview", documentsPreview);
      }
    }, 1500);
  };

  downloadPermissionLetterButton = async (mode) => {
    const {selectedComplaint} = this.props
    let applicationDetails = selectedComplaint;
    await this.downloadPermissionLetterFunction(); //
    if(applicationDetails.bkAction === "RE_INITIATE" || applicationDetails.bkAction === "APPLY" || applicationDetails.bkAction === "CANCEL" || applicationDetails.bkAction === "MODIFY"){
      if(applicationDetails.bkBookingType == "Parks"){
        setTimeout(async () => {
          let documentsPreviewData;
          const { DownloadCitizenPACCPermissionLetter, userInfo } = this.props;
          var documentsPreview = [];
          if (
            DownloadCitizenPACCPermissionLetter &&
            DownloadCitizenPACCPermissionLetter.filestoreIds.length > 0
          ) {
            documentsPreviewData = DownloadCitizenPACCPermissionLetter.filestoreIds[0];
            documentsPreview.push({
              title: "DOC_DOC_PICTURE",
              fileStoreId: documentsPreviewData,
              linkText: "View",
            });
            let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
            let fileUrls =
              fileStoreIds.length > 0
                ? await getFileUrlFromAPI(fileStoreIds, userInfo.tenantId)
                : {};
    
            documentsPreview = documentsPreview.map(function (doc, index) {
              doc["link"] =
                (fileUrls &&
                  fileUrls[doc.fileStoreId] &&
                  fileUrls[doc.fileStoreId].split(",")[0]) ||
                "";
    
              doc["name"] =
                (fileUrls[doc.fileStoreId] &&
                  decodeURIComponent(
                    fileUrls[doc.fileStoreId]
                      .split(",")[0]
                      .split("?")[0]
                      .split("/")
                      .pop()
                      .slice(13)
                  )) ||
                `Document - ${index + 1}`;
              return doc;
            });
    
            if (mode === "print") {
              var response = await axios.get(documentsPreview[0].link, {
                //responseType: "blob",
                responseType: "arraybuffer",
    
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/pdf",
                },
              });
              console.log("responseData---", response);
              const file = new Blob([response.data], { type: "application/pdf" });
              const fileURL = URL.createObjectURL(file);
              var myWindow = window.open(fileURL);
              if (myWindow != undefined) {
                myWindow.addEventListener("load", (event) => {
                  myWindow.focus();
                  myWindow.print();
                });
              }
            } else {
              setTimeout(() => {
                window.open(documentsPreview[0].link);
              }, 100);
            }
    
            prepareFinalObject("documentsPreview", documentsPreview);
          }
        }, 1500);
      
      }
      else{
      setTimeout(async () => {
        let documentsPreviewData;
        const { CitizenCCPermissionLetter, userInfo } = this.props;
        var documentsPreview = [];
        if (
          CitizenCCPermissionLetter &&
          CitizenCCPermissionLetter.filestoreIds.length > 0
        ) {
          documentsPreviewData = CitizenCCPermissionLetter.filestoreIds[0];
          documentsPreview.push({
            title: "DOC_DOC_PICTURE",
            fileStoreId: documentsPreviewData,
            linkText: "View",
          });
          let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
          let fileUrls =
            fileStoreIds.length > 0
              ? await getFileUrlFromAPI(fileStoreIds, userInfo.tenantId)
              : {};
  
          documentsPreview = documentsPreview.map(function (doc, index) {
            doc["link"] =
              (fileUrls &&
                fileUrls[doc.fileStoreId] &&
                fileUrls[doc.fileStoreId].split(",")[0]) ||
              "";
  
            doc["name"] =
              (fileUrls[doc.fileStoreId] &&
                decodeURIComponent(
                  fileUrls[doc.fileStoreId]
                    .split(",")[0]
                    .split("?")[0]
                    .split("/")
                    .pop()
                    .slice(13)
                )) ||
              `Document - ${index + 1}`;
            return doc;
          });
  
          if (mode === "print") {
            var response = await axios.get(documentsPreview[0].link, {
              //responseType: "blob",
              responseType: "arraybuffer",
  
              headers: {
                "Content-Type": "application/json",
                Accept: "application/pdf",
              },
            });
            console.log("responseData---", response);
            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            var myWindow = window.open(fileURL);
            if (myWindow != undefined) {
              myWindow.addEventListener("load", (event) => {
                myWindow.focus();
                myWindow.print();
              });
            }
          } else {
            setTimeout(() => {
              window.open(documentsPreview[0].link);
            }, 100);
          }
  
          prepareFinalObject("documentsPreview", documentsPreview);
        }
      }, 1500);
    }
  }
    else{
      setTimeout(async () => {
        let documentsPreviewData;
        const { EmpPaccPermissionLetter, userInfo } = this.props;
        var documentsPreview = [];
        if (
          EmpPaccPermissionLetter &&
          EmpPaccPermissionLetter.filestoreIds.length > 0
        ) {
          documentsPreviewData = EmpPaccPermissionLetter.filestoreIds[0];
          documentsPreview.push({
            title: "DOC_DOC_PICTURE",
            fileStoreId: documentsPreviewData,
            linkText: "View",
          });
          let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
          let fileUrls =
            fileStoreIds.length > 0
              ? await getFileUrlFromAPI(fileStoreIds, userInfo.tenantId)
              : {};
  
          documentsPreview = documentsPreview.map(function (doc, index) {
            doc["link"] =
              (fileUrls &&
                fileUrls[doc.fileStoreId] &&
                fileUrls[doc.fileStoreId].split(",")[0]) ||
              "";
  
            doc["name"] =
              (fileUrls[doc.fileStoreId] &&
                decodeURIComponent(
                  fileUrls[doc.fileStoreId]
                    .split(",")[0]
                    .split("?")[0]
                    .split("/")
                    .pop()
                    .slice(13)
                )) ||
              `Document - ${index + 1}`;
            return doc;
          });
  
          if (mode === "print") {
            var response = await axios.get(documentsPreview[0].link, {
              //responseType: "blob",
              responseType: "arraybuffer",
  
              headers: {
                "Content-Type": "application/json",
                Accept: "application/pdf",
              },
            });
            console.log("responseData---", response);
            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            var myWindow = window.open(fileURL);
            if (myWindow != undefined) {
              myWindow.addEventListener("load", (event) => {
                myWindow.focus();
                myWindow.print();
              });
            }
          } else {
            setTimeout(() => {
              window.open(documentsPreview[0].link);
            }, 100);
          }
  
          prepareFinalObject("documentsPreview", documentsPreview);
        }
      }, 1500);
    }
   
  };

  downloadPermissionLetterFunction = async (e) => {
    const {
      transformedComplaint,
      paymentDetails,
      downloadPLForPCC,
      userInfo,
      createPACCApplicationData,
      downloadEsamparkPL,
      Downloadesamparkdetailspl,
      selectedComplaint,
      PACC,
      LUXURY_TAX,
      REFUNDABLE_SECURITY,
      PACC_TAX,
      PACC_ROUND_OFF,
      FACILITATION_CHARGE,
      downloadPaccPermissionLetter,PaccCitizenPermissionLetter,citizenCommunityPL
    } = this.props;
    let applicationDetails = selectedComplaint;
    let Newugst;
    let perFind = 50;
    let ugst = PACC_TAX;
    let find50Per = (perFind / 100) * ugst;
    console.log("find50Per--", find50Per);
    let findNumOrNot = Number.isInteger(find50Per);
    console.log("findNumOrNot--", findNumOrNot);
    if (findNumOrNot == true) {
      Newugst = find50Per;
      console.log("trueCondition");
    } else {
      Newugst = find50Per.toFixed(2);
      console.log("second-Newugst-", Newugst);
    }

    let approverName;
    for (let i = 0; i < userInfo.roles.length; i++) {
      if (userInfo.roles[i].code == "BK_E-SAMPARK-CENTER") {
        approverName = userInfo.roles[i].name;
      }
    }
    // let fdocname = Object.entries(documentMap)[0][1]

if(applicationDetails.bkAction === "RE_INITIATE" || applicationDetails.bkAction === "APPLY" || applicationDetails.bkAction === "CANCEL" || applicationDetails.bkAction === "MODIFY"){
console.log("citizenPaymentReceipt")
  if(applicationDetails.bkBookingType == "Parks"){
  let BookingInfo=[
    {
        applicantDetail: {
          name: applicationDetails.bkApplicantName,
          mobileNumber: applicationDetails.bkMobileNumber,
          email: applicationDetails.bkEmail,
          permanentAddress: applicationDetails.bkHouseNo,
          permanentCity: "Chandigarh",
          sector: applicationDetails.bkSector,
          fatherName: "",
          custGSTN: applicationDetails.bkCustomerGstNo,
          placeOfService: this.state.placeOfService,
        },
        bookingDetail: {
          applicationNumber: applicationDetails.bkApplicationNumber,
          applicationDate: applicationDetails.bkDateCreated,
          bookingPeriod: getDurationDate(
            applicationDetails.bkFromDate,
            applicationDetails.bkToDate
          ),
          bookingType: applicationDetails.bkBookingType,
          venueName: applicationDetails.bkLocation,
          sector: applicationDetails.bkSector,
          bookingPurpose: applicationDetails.bkBookingPurpose,
          statecode: this.state.stateCode,
        hsncode: this.state.hsnCode,
        },
        generated: {
          generatedBy: userInfo.name,
        },
        approvedBy: {
          approvedBy: userInfo.name,
          role: approverName,
        },
        paymentInfo: {
          cleaningCharges: applicationDetails.bkCleansingCharges,
          baseCharge: PACC,
          cgst: applicationDetails.bkCgst,
          utgst: applicationDetails.bkCgst,
          totalgst: PACC_TAX,
          refundableCharges: this.props.REFUNDABLE_SECURITY,
          totalPayment: this.props.totalAmount,
          paymentDate: convertEpochToDate(
            this.props.offlineTransactionDate,
            "dayend"
          ),
          receiptNo: this.props.recNumber,
          custGSTN: applicationDetails.bkCustomerGstNo,
          mcGSTN: this.state.mcGSTN,
        },
        OtherDetails: {
          clchargeforwest: applicationDetails.bkCleansingCharges,
          westaddress: "",
          clchargeforother: "",
        },
        tenantInfo: {
          municipalityName: "Municipal Corporation Chandigarh",
          address: "New Deluxe Building, Sector 17, Chandigarh",
          contactNumber: "+91-172-2541002, 0172-2541003",
          logoUrl: "https://chstage.blob.core.windows.net/fileshare/logo.png",
          webSite: "http://mcchandigarh.gov.in",
          statecode: this.state.stateCode,
          hsncode: this.state.hsnCode,
        },
        bankInfo: {
          accountholderName: applicationDetails.bkBankAccountHolder,
          rBankName: applicationDetails.bkBankName,
          rBankACNo: applicationDetails.bkBankAccountNumber,
          rIFSCCode: applicationDetails.bkIfscCode,
        },
    }
]
console.log("BookingRequestBodyInCaseOfPark",BookingInfo)
PaccCitizenPermissionLetter({ BookingInfo: BookingInfo });
}
else{
  let BookingInfo=[
    {
        applicantDetail: {
          name: applicationDetails.bkApplicantName,
          mobileNumber: applicationDetails.bkMobileNumber,
          email: applicationDetails.bkEmail,
          permanentAddress: applicationDetails.bkHouseNo,
          permanentCity: "Chandigarh",
          sector: applicationDetails.bkSector,
          fatherName: "",
          custGSTN: applicationDetails.bkCustomerGstNo,
          placeOfService: this.state.placeOfService,
        },
        bookingDetail: {
          applicationNumber: applicationDetails.bkApplicationNumber,
          applicationDate: applicationDetails.bkDateCreated,
          bookingPeriod: getDurationDate(
            applicationDetails.bkFromDate,
            applicationDetails.bkToDate
          ),
          bookingType: applicationDetails.bkBookingType,
          venueName: applicationDetails.bkLocation,
          sector: applicationDetails.bkSector,
          bookingPurpose: applicationDetails.bkBookingPurpose
        },
        generated: {
          generatedBy: userInfo.name,
        },
        approvedBy: {
          approvedBy: userInfo.name,
          role: approverName,
        },
        paymentInfo: {
          cleaningCharges: applicationDetails.bkCleansingCharges,
          baseCharge: PACC,
          cgst: applicationDetails.bkCgst,
          utgst: applicationDetails.bkCgst,
          totalgst: PACC_TAX,
          refundableCharges: this.props.REFUNDABLE_SECURITY,
          totalPayment: this.props.totalAmount,
          paymentDate: convertEpochToDate(
            this.props.offlineTransactionDate,
            "dayend"
          ),
          receiptNo: this.props.recNumber,
          custGSTN: applicationDetails.bkCustomerGstNo,
          mcGSTN: this.state.mcGSTN,
        },
        OtherDetails: {
          clchargeforwest: applicationDetails.bkCleansingCharges,
          westaddress: "",
          clchargeforother: "",
        },
        tenantInfo: {
          municipalityName: "Municipal Corporation Chandigarh",
          address: "New Deluxe Building, Sector 17, Chandigarh",
          contactNumber: "+91-172-2541002, 0172-2541003",
          logoUrl: "https://chstage.blob.core.windows.net/fileshare/logo.png",
          webSite: "http://mcchandigarh.gov.in",
          mcGSTN: this.state.mcGSTN, 
          statecode: this.state.stateCode,
          hsncode: this.state.hsnCode,
        },
        bankInfo: {
          accountholderName: applicationDetails.bkBankAccountHolder,
          rBankName: applicationDetails.bkBankName,
          rBankACNo: applicationDetails.bkBankAccountNumber,
          rIFSCCode: applicationDetails.bkIfscCode,
        },
    }
]
console.log("BookingInfoIncCseOfCommunityPl",BookingInfo)
citizenCommunityPL({ BookingInfo: BookingInfo });
}
}
else{
  console.log("plForemployeeside")
  let BookingInfo = [
    {
      applicantDetail: {
        name: applicationDetails.bkApplicantName,
        mobileNumber: applicationDetails.bkMobileNumber,
        email: applicationDetails.bkEmail,
        permanentAddress: applicationDetails.bkHouseNo,
        permanentCity: "Chandigarh",
        sector: applicationDetails.bkSector,
        fatherName: "",
        custGSTN: applicationDetails.bkCustomerGstNo,
        placeOfService: this.state.placeOfService,
      },
      bookingDetail: {
        applicationNumber: applicationDetails.bkApplicationNumber,
        applicationDate: applicationDetails.bkDateCreated,
        bookingPeriod: getDurationDate(
          applicationDetails.bkFromDate,
          applicationDetails.bkToDate
        ),
        bookingType: applicationDetails.bkBookingType,
        venueName: applicationDetails.bkLocation,
        sector: applicationDetails.bkSector,
        bookingPurpose: applicationDetails.bkBookingPurpose,
      },
      generated: {
        generatedBy: userInfo.name,
      },
      approvedBy: {
        approvedBy: userInfo.name,
        role: approverName,
      },
      emp: {
        samparkName: this.state.name, //"":
        samparkaddress: this.state.Address,
        OpCode: this.state.operatorCode,
      },
      //PACC,LUXURY_TAX,REFUNDABLE_SECURITY,PACC_TAX,PACC_ROUND_OFF,FACILITATION_CHARGE
      paymentInfo: {
        cleaningCharges: applicationDetails.bkCleansingCharges,
        baseCharge: PACC,
        cgst: applicationDetails.bkCgst,
        utgst: applicationDetails.bkCgst,
        totalgst: PACC_TAX,
        refundableCharges: this.props.REFUNDABLE_SECURITY,
        totalPayment: this.props.totalAmount,
        paymentDate: convertEpochToDate(
          this.props.offlineTransactionDate,
          "dayend"
        ),
        receiptNo: this.props.recNumber,
        cardNumberLast4: "Not Applicable",
        dateVenueChangeCharges:
          this.props.DATEVENUECHARGE == 0
            ? "Not Applicable"
            : this.props.DATEVENUECHARGE,
      },
      OtherDetails: {
        clchargeforwest: applicationDetails.bkCleansingCharges,
        westaddress: "",
        clchargeforother: "",
      },
      tenantInfo: {
        municipalityName: "Municipal Corporation Chandigarh",
        address: "New Deluxe Building, Sector 17, Chandigarh",
        contactNumber: "+91-172-2541002, 0172-2541003",
        logoUrl: "https://chstage.blob.core.windows.net/fileshare/logo.png",
        webSite: "http://mcchandigarh.gov.in",
        statecode: this.state.stateCode,
        hsncode: this.state.hsnCode,
        mcGSTN: this.state.mcGSTN, ////stateCode  placeOfService  mcGSTN
      },
      bankInfo: {
        accountholderName: applicationDetails.bkBankAccountHolder,
        rBankName: applicationDetails.bkBankName,
        rBankACNo: applicationDetails.bkBankAccountNumber,
        rIFSCCode: applicationDetails.bkIfscCode,
      },
    },
  ];
  // downloadEsamparkApp({ BookingInfo: BookingInfo })
  downloadPaccPermissionLetter({ BookingInfo: BookingInfo });


  }
  };
  downloadPaymentReceiptButton = async (mode) => {
    //
    const {selectedComplaint} = this.props
    let applicationDetails = selectedComplaint;
    this.downloadPaymentReceiptFunction();

    if(applicationDetails.bkAction === "RE_INITIATE" || applicationDetails.bkAction === "APPLY" || applicationDetails.bkAction === "CANCEL" || applicationDetails.bkAction === "MODIFY"){
      setTimeout(async () => {
        let documentsPreviewData;
        const { DownloadCitizenPACCReceipt, userInfo } = this.props;
        var documentsPreview = [];
        if (
          DownloadCitizenPACCReceipt &&
          DownloadCitizenPACCReceipt.filestoreIds.length > 0
        ) {
          documentsPreviewData = DownloadCitizenPACCReceipt.filestoreIds[0];
          documentsPreview.push({
            title: "DOC_DOC_PICTURE",
            fileStoreId: documentsPreviewData,
            linkText: "View",
          });
          let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
          let fileUrls =
            fileStoreIds.length > 0
              ? await getFileUrlFromAPI(fileStoreIds, userInfo.tenantId)
              : {};
  
          documentsPreview = documentsPreview.map(function (doc, index) {
            doc["link"] =
              (fileUrls &&
                fileUrls[doc.fileStoreId] &&
                fileUrls[doc.fileStoreId].split(",")[0]) ||
              "";
  
            doc["name"] =
              (fileUrls[doc.fileStoreId] &&
                decodeURIComponent(
                  fileUrls[doc.fileStoreId]
                    .split(",")[0]
                    .split("?")[0]
                    .split("/")
                    .pop()
                    .slice(13)
                )) ||
              `Document - ${index + 1}`;
            return doc;
          });
  
          if (mode === "print") {
            var response = await axios.get(documentsPreview[0].link, {
              //responseType: "blob",
              responseType: "arraybuffer",
  
              headers: {
                "Content-Type": "application/json",
                Accept: "application/pdf",
              },
            });
            console.log("responseData---", response);
            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            var myWindow = window.open(fileURL);
            if (myWindow != undefined) {
              myWindow.addEventListener("load", (event) => {
                myWindow.focus();
                myWindow.print();
              });
            }
          } else {
            setTimeout(() => {
              window.open(documentsPreview[0].link);
            }, 100);
          }
  
          prepareFinalObject("documentsPreview", documentsPreview);
        }
      }, 1500);

}else{
  setTimeout(async () => {
    let documentsPreviewData;
    const { PaymentReceiptByESamp, userInfo } = this.props;
    var documentsPreview = [];
    if (
      PaymentReceiptByESamp &&
      PaymentReceiptByESamp.filestoreIds.length > 0
    ) {
      documentsPreviewData = PaymentReceiptByESamp.filestoreIds[0];
      documentsPreview.push({
        title: "DOC_DOC_PICTURE",
        fileStoreId: documentsPreviewData,
        linkText: "View",
      });
      let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
      let fileUrls =
        fileStoreIds.length > 0
          ? await getFileUrlFromAPI(fileStoreIds, userInfo.tenantId)
          : {};

      documentsPreview = documentsPreview.map(function (doc, index) {
        doc["link"] =
          (fileUrls &&
            fileUrls[doc.fileStoreId] &&
            fileUrls[doc.fileStoreId].split(",")[0]) ||
          "";

        doc["name"] =
          (fileUrls[doc.fileStoreId] &&
            decodeURIComponent(
              fileUrls[doc.fileStoreId]
                .split(",")[0]
                .split("?")[0]
                .split("/")
                .pop()
                .slice(13)
            )) ||
          `Document - ${index + 1}`;
        return doc;
      });

      if (mode === "print") {
        var response = await axios.get(documentsPreview[0].link, {
          //responseType: "blob",
          responseType: "arraybuffer",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        });
        console.log("responseData---", response);
        const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        var myWindow = window.open(fileURL);
        if (myWindow != undefined) {
          myWindow.addEventListener("load", (event) => {
            myWindow.focus();
            myWindow.print();
          });
        }
      } else {
        setTimeout(() => {
          window.open(documentsPreview[0].link);
        }, 100);
      }

      prepareFinalObject("documentsPreview", documentsPreview);
    }
  }, 1500);
}
    
  
  };

  callApiForDocumentData = async (fileStoreId, docCode) => {
    // let {fileStoreId,docCode}=data;
    console.log("callApiForDocumentData", fileStoreId, docCode);
    console.log("State----------", this.state);
    console.log(
      "Document-----data",
      this.state.proofOfResDocumentfileStoreId,
      this.state.proofOfResDocumentType
    );

    const { userInfo } = this.props;
    // let allDocumentList = this.state && this.state.allDocumentList;
    // let proofOfResDocs;
    // 	if(allDocumentList && allDocumentList.length > 0){
    // 		proofOfResDocs = allDocumentList.filter( (item) => {
    // 		   return item.documentType != "BK_PCC_DISCOUNT_DOCUMENT";
    // 	   })

    //    }
    var documentsPreview = [];
    if (fileStoreId && docCode) {
      documentsPreview.push({
        title: docCode,
        fileStoreId: fileStoreId,
        linkText: "View",
      });
      let changetenantId = userInfo.tenantId
        ? userInfo.tenantId.split(".")[0]
        : "ch";
      let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
      let fileUrls =
        fileStoreIds.length > 0
          ? await getFileUrlFromAPI(fileStoreIds, changetenantId)
          : {};

      documentsPreview = documentsPreview.map(function (doc, index) {
        doc["link"] =
          (fileUrls &&
            fileUrls[doc.fileStoreId] &&
            fileUrls[doc.fileStoreId].split(",")[0]) ||
          "";

        doc["name"] =
          (fileUrls[doc.fileStoreId] &&
            decodeURIComponent(
              fileUrls[doc.fileStoreId]
                .split(",")[0]
                .split("?")[0]
                .split("/")
                .pop()
                .slice(13)
            )) ||
          `Document - ${index + 1}`;
        return doc;
      });
      setTimeout(() => {
        window.open(documentsPreview[0].link);
      }, 100);
      prepareFinalObject("documentsPreview", documentsPreview);
    }
  };
  // callApiForDocumentData = async (e) => {
  // 	const { documentMap, userInfo } = this.props;
  // 	var documentsPreview = [];
  // 	if (documentMap && Object.keys(documentMap).length > 0) {
  // 		let keys = Object.keys(documentMap);
  // 		let values = Object.values(documentMap);
  // 		let id = keys[0],
  // 			fileName = values[0];

  // 		documentsPreview.push({
  // 			title: "DOC_DOC_PICTURE",
  // 			fileStoreId: id,
  // 			linkText: "View",
  // 		});
  // 		let changetenantId = userInfo.tenantId ? userInfo.tenantId.split(".")[0] : "ch";
  // 		let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
  // 		let fileUrls =
  // 			fileStoreIds.length > 0 ? await getFileUrlFromAPI(fileStoreIds, changetenantId) : {};

  // 		documentsPreview = documentsPreview.map(function (doc, index) {
  // 			doc["link"] =
  // 				(fileUrls &&
  // 					fileUrls[doc.fileStoreId] &&
  // 					fileUrls[doc.fileStoreId].split(",")[0]) ||
  // 				"";

  // 			doc["name"] =
  // 				(fileUrls[doc.fileStoreId] &&
  // 					decodeURIComponent(
  // 						fileUrls[doc.fileStoreId]
  // 							.split(",")[0]
  // 							.split("?")[0]
  // 							.split("/")
  // 							.pop()
  // 							.slice(13)
  // 					)) ||
  // 				`Document - ${index + 1}`;
  // 			return doc;
  // 		});
  // 		setTimeout(() => {
  // 			window.open(documentsPreview[0].link);
  // 		}, 100);
  // 		prepareFinalObject('documentsPreview', documentsPreview)
  // 	}

  // }

  GOTOPAY = (selectedNumber) => {
    this.props.history.push(
      `/egov-services/PaymentReceiptDteail/${selectedNumber}`
    );
  };

  continue = () => {
    console.log("InContinue Function");
    let { selectedComplaint, toggleSnackbarAndSetText } = this.props;

    let bookingDate = selectedComplaint.bkFromDate;
    console.log("FromDate--yyy", bookingDate);

    let dateFromDate = new Date(bookingDate);
    console.log("dateFromDate--", dateFromDate);
    let CurrentDate = new Date();
    console.log("CurrentDate--", CurrentDate);

    let Difference_In_Time_check =
      dateFromDate.getTime() - CurrentDate.getTime();
    console.log("Difference_In_Time--uuuuu", Difference_In_Time_check);
    // To calculate the no. of days between two dates
    let Difference_In_Days_check =
      Difference_In_Time_check / (1000 * 3600 * 24);
    console.log("Difference_In_Days--", Difference_In_Days_check);
    if (Difference_In_Days_check === 1 || Difference_In_Days_check > 1) {
      // this.setState({
      // 	dateVenchangePop : true,
      // 	togglepopup: !this.state.togglepopup
      // })

      this.props.history.push(`/egov-services/checkavailability_pcc`);
    } else {
      toggleSnackbarAndSetText(
        true,
        {
          labelName: "You Can Change Till Before One Day Of Booking",
          labelKey: `You Can Change Till Before One Day Of Booking`,
        },
        "error"
      );
    }
  };

  setPop = (booking) => {
    this.props.prepareFinalObject(
      "EmployeeDateVenueChange",
      "UserApplyForDateVenueChange"
    );
    if (
      booking.bookingType == "Community Center" &&
      booking.roomsModel.length > 0
    ) {
      this.setState({
        dateVenchangePop: true,
      });
    } else {
      this.continue();
    }
  };
OfflineRefundForCG = async () => {
  let { selectedComplaint } = this.props;
  console.log("propsInCancelEmpBooking--CG", selectedComplaint);
 
  let Booking = {
    "bkRemarks": selectedComplaint.bkRemarks,
    "timeslots": [],
    "roomsModel": [],
    "reInitiateStatus": false,
    "createdDate": selectedComplaint.createdDate,
    "lastModifiedDate": selectedComplaint.lastModifiedDate,
    "bkNomineeName": selectedComplaint.bkNomineeName,
    "refundableSecurityMoney": null,
    "bkApplicationNumber": selectedComplaint.bkApplicationNumber,
    "bkHouseNo": selectedComplaint.bkHouseNo,
    "bkAddress": selectedComplaint.bkAddress,
    "bkSector": selectedComplaint.bkSector,
    "bkVillCity": selectedComplaint.bkVillCity,
    "bkAreaRequired": selectedComplaint.bkVillCity,
    "bkDuration": selectedComplaint.bkDuration,
    "bkCategory": selectedComplaint.bkDuration,
    "bkEmail": selectedComplaint.bkEmail,
    "bkContactNo": selectedComplaint.bkContactNo,
    "bkDocumentUploadedUrl": selectedComplaint.bkDocumentUploadedUrl,
    "bkDateCreated": selectedComplaint.bkDateCreated,
    "bkCreatedBy": selectedComplaint.bkCreatedBy,
    "bkWfStatus": selectedComplaint.bkWfStatus,
    "bkAmount": selectedComplaint.bkAmount,
    "bkPaymentStatus": selectedComplaint.bkPaymentStatus,
    "bkBookingType": selectedComplaint.bkBookingType,
    "bkFromDate": selectedComplaint.bkFromDate,
    "bkToDate": selectedComplaint.bkToDate,
    "bkApplicantName": selectedComplaint.bkApplicantName,
    "bkBookingPurpose": selectedComplaint.bkBookingPurpose,
    "bkVillage": selectedComplaint.bkVillage,
    "bkDimension": selectedComplaint.bkDimension,
    "bkLocation": selectedComplaint.bkLocation,
    "bkStartingDate": selectedComplaint.bkStartingDate,
    "bkEndingDate": selectedComplaint.bkEndingDate,
    "bkType": selectedComplaint.bkType,
    "bkResidenceProof": selectedComplaint.bkResidenceProof,
    "bkCleansingCharges": selectedComplaint.bkCleansingCharges,
    "bkRent": selectedComplaint.bkRent,
    "bkSurchargeRent": selectedComplaint.bkSurchargeRent,
    "bkFacilitationCharges": selectedComplaint.bkFacilitationCharges,
    "bkUtgst": selectedComplaint.bkUtgst,
    "bkCgst": selectedComplaint.bkCgst,
    "bkMobileNumber": selectedComplaint.bkMobileNumber,
    "bkCustomerGstNo": selectedComplaint.bkCustomerGstNo,
    "bkCurrentCharges": selectedComplaint.bkCurrentCharges,
    "bkLocationChangeAmount": selectedComplaint.bkLocationChangeAmount,
    "bkVenue": selectedComplaint.bkVenue,
    "bkDate": selectedComplaint.bkDate,
    "bkFatherName": selectedComplaint.bkFatherName,
    "bkBookingVenue": selectedComplaint.bkBookingVenue,
    "bkBookingDuration": selectedComplaint.bkBookingDuration,
    "bkIdProof": selectedComplaint.bkIdProof,
    "bkApplicantContact": selectedComplaint.bkApplicantContact,
    "bkOpenSpaceLocation": selectedComplaint.bkOpenSpaceLocation,
    "bkLandmark": selectedComplaint.bkLandmark,
    "bkRequirementArea": selectedComplaint.bkRequirementArea,
    "bkLocationPictures": selectedComplaint.bkLocationPictures,
    "bkParkOrCommunityCenter": selectedComplaint.bkParkOrCommunityCenter,
    "bkRefundAmount": null,
    "bkBankAccountNumber": selectedComplaint.bkBankAccountNumber,
    "bkBankName": selectedComplaint.bkBankName,
    "bkIfscCode": selectedComplaint.bkIfscCode,
    "bkAccountType": selectedComplaint.bkAccountType,
    "bkBankAccountHolder": selectedComplaint.bkBankAccountHolder,
    "bkPropertyOwnerName": selectedComplaint.bkPropertyOwnerName,
    "bkCompleteAddress": selectedComplaint.bkCompleteAddress,
    "bkResidentialOrCommercial": selectedComplaint.bkResidentialOrCommercial,
    "bkMaterialStorageArea": selectedComplaint.bkMaterialStorageArea,
    "bkPlotSketch": selectedComplaint.bkPlotSketch,
    "bkApplicationStatus": selectedComplaint.bkApplicationStatus,
    "bkTime": selectedComplaint.bkTime,
    "bkStatusUpdateRequest": selectedComplaint.bkStatusUpdateRequest,
    "bkStatus": selectedComplaint.bkStatus,
    "bkDriverName": selectedComplaint.bkDriverName,
    "bkVehicleNumber": selectedComplaint.bkVehicleNumber,
    "bkEstimatedDeliveryTime": selectedComplaint.bkEstimatedDeliveryTime,
    "bkActualDeliveryTime": selectedComplaint.bkActualDeliveryTime,
    "bkNormalWaterFailureRequest": selectedComplaint.bkNormalWaterFailureRequest,
    "bkUpdateStatusOption": selectedComplaint.bkUpdateStatusOption,
    "bkAddSpecialRequestDetails": selectedComplaint.bkAddSpecialRequestDetails,
    "bkBookingTime": selectedComplaint.bkBookingTime,
    "bkApprovedBy": selectedComplaint.bkApprovedBy,
    "bkModuleType": selectedComplaint.bkModuleType,
    "uuid": selectedComplaint.uuid,
    "tenantId": selectedComplaint.tenantId,
    "bkAction": "SECURITY_REFUND",
    "bkConstructionType": selectedComplaint.bkConstructionType,
    "businessService": selectedComplaint.businessService,
    "bkApproverName": selectedComplaint.bkApproverName,
    "discount": selectedComplaint.discount,
    "assignee": selectedComplaint.assignee,
    "wfDocuments": selectedComplaint.wfDocuments,
    "financialYear": "2021-2022",
    "financeBusinessService": selectedComplaint.financeBusinessService
  }

  console.log("BookingRequestBodyforCommercial", Booking);
  let createAppData = {
    applicationType: "GFCP",
    applicationStatus: "",
    applicationId: selectedComplaint.bkApplicationNumber,
    tenantId: selectedComplaint.tenantId,
    Booking: Booking,
  };
  console.log("updateForSecurityRefundforCommercial", createAppData);
  let payloadRefundCommercial = await httpRequest(
    "bookings/api/_update",  
    "_search",
    [],
    createAppData
  );
  console.log("payloadRefundCommercial", payloadRefundCommercial);
  this.props.history.push(`/egov-services/apply-refund-success`);
};


  ApplyOfflineSecurityRefund = async () => {
    let { selectedComplaint } = this.props;
    console.log("propsInCancelEmpBooking--", selectedComplaint);

    let refundAction;

    if (selectedComplaint.bkApplicationStatus == "APPLIED") {
      refundAction = "SECURITY_REFUND";
    } else {
      refundAction = "OFFLINE_SECURITY_REFUND";
    }
    let Booking = {
      bkRemarks: selectedComplaint.bkRemarks,
      timeslots: [],
      reInitiateStatus: false,
      bkApplicationNumber: selectedComplaint.bkApplicationNumber,
      bkHouseNo: selectedComplaint.bkHouseNo,
      bkAddress: null,
      bkSector: selectedComplaint.bkSector,
      bkVillCity: null,
      bkAreaRequired: null,
      bkDuration: null,
      bkCategory: null,
      bkEmail: selectedComplaint.bkEmail,
      bkContactNo: null,
      bkDocumentUploadedUrl: null,
      bkDateCreated: selectedComplaint.bkDateCreated,
      bkCreatedBy: null,
      bkWfStatus: null,
      bkAmount: null,
      bkPaymentStatus: selectedComplaint.bkPaymentStatus,
      bkBookingType: selectedComplaint.bkBookingType,
      bkFromDate: selectedComplaint.bkFromDate,
      bkToDate: selectedComplaint.bkToDate,
      bkApplicantName: selectedComplaint.bkApplicantName,
      bkBookingPurpose: selectedComplaint.bkBookingPurpose,
      bkVillage: null,
      bkDimension: selectedComplaint.bkDimension,
      bkLocation: selectedComplaint.bkLocation,
      bkStartingDate: null,
      bkEndingDate: null,
      bkType: null,
      bkResidenceProof: null,
      bkCleansingCharges: selectedComplaint.bkCleansingCharges,
      bkRent: selectedComplaint.bkRent,
      bkSurchargeRent: selectedComplaint.bkSurchargeRent,
      bkFacilitationCharges: null,
      bkUtgst: selectedComplaint.bkUtgst,
      bkCgst: selectedComplaint.bkCgst,
      bkMobileNumber: selectedComplaint.bkMobileNumber,
      bkCustomerGstNo: null,
      bkCurrentCharges: null,
      bkLocationChangeAmount: null,
      bkVenue: null,
      bkDate: null,
      bkFatherName: null,
      bkBookingVenue: selectedComplaint.bkBookingVenue,
      bkBookingDuration: null,
      bkIdProof: null,
      bkApplicantContact: null,
      bkOpenSpaceLocation: null,
      bkLandmark: null,
      bkRequirementArea: null,
      bkLocationPictures: null,
      bkParkOrCommunityCenter: null,
      bkRefundAmount: null,
      bkPropertyOwnerName: null,
      bkCompleteAddress: null,
      bkResidentialOrCommercial: null,
      bkMaterialStorageArea: null,
      bkPlotSketch: null,
      bkApplicationStatus: selectedComplaint.bkApplicationStatus,
      bkTime: null,
      bkStatusUpdateRequest: null,
      bkStatus: null,
      bkDriverName: null,
      bkVehicleNumber: null,
      bkEstimatedDeliveryTime: null,
      bkActualDeliveryTime: null,
      bkNormalWaterFailureRequest: null,
      bkUpdateStatusOption: null,
      bkAddSpecialRequestDetails: null,
      bkBookingTime: null,
      bkApprovedBy: null,
      bkModuleType: null,
      uuid: null,
      tenantId: selectedComplaint.tenantId,
      bkAction: refundAction,
      bkConstructionType: null,
      businessService: selectedComplaint.businessService,
      bkApproverName: null,
      discount: selectedComplaint.discount,
      assignee: null,
      wfDocuments: [],
      financialYear: selectedComplaint.financialYear,
      bkBankAccountNumber: selectedComplaint.bkBankAccountNumber,
      bkBankName: selectedComplaint.bkBankName,
      bkIfscCode: selectedComplaint.bkIfscCode,
      bkAccountType: selectedComplaint.bkAccountType,
      bkBankAccountHolder: selectedComplaint.bkBankAccountHolder,
      bkNomineeName: selectedComplaint.bkNomineeName,
      financeBusinessService: null,
    };
    console.log("CancelEmpBooking-Booking", Booking);
    let createAppData = {
      applicationType: "PACC",
      applicationStatus: "",
      applicationId: selectedComplaint.bkApplicationNumber
        ? selectedComplaint.bkApplicationNumber
        : null,
      tenantId: selectedComplaint.tenantId,
      Booking: Booking,
    };
    console.log("createAppData--createAppData", createAppData);
    let payloadfund = await httpRequest(
      "bookings/park/community/_update",
      "_search",
      [],
      createAppData
    );
    console.log("payloadfund--cancel--", payloadfund);
    this.props.history.push(`/egov-services/apply-refund-success`);
  };




  TotalPACCDays = () => {
    let { selectedComplaint, toggleSnackbarAndSetText } = this.props;
    let bookingDate = selectedComplaint.bkFromDate;
    let check;

    console.log("FromDate--yyy-jjj", bookingDate);

    let dateFromDate = new Date(bookingDate);
    console.log("dateFromDate--gg", dateFromDate);
    let CurrentDate = new Date();
    console.log("CurrentDate--", CurrentDate);

    if (dateFromDate < CurrentDate) {
      check = true;
    } else {
      check = false;
    }
    console.log("hjhjhjjhjhj--", check);
    let Difference_In_Time_check =
      dateFromDate.getTime() - CurrentDate.getTime();
    console.log("Difference_In_Time--uuuuu-fgfgfg", Difference_In_Time_check);
    // To calculate the no. of days between two dates
    let Difference_In_Days_check =
      Difference_In_Time_check / (1000 * 3600 * 24);
    console.log("Difference_In_Days--dadada", Difference_In_Days_check);
    this.setState({
      checkGreaterDate: check,
      checkNumDays: Difference_In_Days_check,
    });

    return Difference_In_Time_check;
  };

  continueComplaintSubmit = () => {
    this.props.history.push(`/egov-services/all-applications`);
    window.location.reload();
  };

  ConfirmCancelEmpBooking = async () => {
    let { selectedComplaint, toggleSnackbarAndSetText } = this.props;

    console.log("propsInCancelEmpBooking--", selectedComplaint);

    let cancelAction;
    if (selectedComplaint.bkApplicationStatus == "APPLIED") {
      cancelAction = "CANCEL";
    } else {
      cancelAction = "OFFLINE_CANCEL";
    }

    if(this.state.reasonForBookingCancellation  !== ""){

      let Booking = {
        bkStatusUpdateRequest: this.state.reasonForBookingCancellation,
        bkRemarks: selectedComplaint.bkRemarks,
        timeslots: selectedComplaint.timeslots,
        reInitiateStatus: false,
        bkApplicationNumber: selectedComplaint.bkApplicationNumber,
        bkHouseNo: selectedComplaint.bkHouseNo,
        bkAddress: null,
        bkSector: selectedComplaint.bkSector,
        bkVillCity: null,
        bkAreaRequired: null,
        bkDuration: null,
        bkCategory: null,
        bkEmail: selectedComplaint.bkEmail,
        bkContactNo: null,
        bkDocumentUploadedUrl: null,
        bkDateCreated: selectedComplaint.bkDateCreated,
        bkCreatedBy: null,
        bkWfStatus: null,
        bkAmount: null,
        bkPaymentStatus: selectedComplaint.bkPaymentStatus,
        bkBookingType: selectedComplaint.bkBookingType,
        bkFromDate: selectedComplaint.bkFromDate,
        bkToDate: selectedComplaint.bkToDate,
        bkApplicantName: selectedComplaint.bkApplicantName,
        bkBookingPurpose: selectedComplaint.bkBookingPurpose,
        bkVillage: null,
        bkDimension: selectedComplaint.bkDimension,
        bkLocation: selectedComplaint.bkLocation,
        bkStartingDate: null,
        bkEndingDate: null,
        bkType: null,
        bkResidenceProof: null,
        bkCleansingCharges: selectedComplaint.bkCleansingCharges,
        bkRent: selectedComplaint.bkRent,
        bkSurchargeRent: selectedComplaint.bkSurchargeRent,
        bkFacilitationCharges: null,
        bkUtgst: selectedComplaint.bkUtgst,
        bkCgst: selectedComplaint.bkCgst,
        bkMobileNumber: selectedComplaint.bkMobileNumber,
        bkCustomerGstNo: null,
        bkCurrentCharges: null,
        bkLocationChangeAmount: null,
        bkVenue: null,
        bkDate: null,
        bkFatherName: null,
        bkBookingVenue: selectedComplaint.bkBookingVenue,
        bkBookingDuration: null,
        bkIdProof: null,
        bkApplicantContact: null,
        bkOpenSpaceLocation: null,
        bkLandmark: null,
        bkRequirementArea: null,
        bkLocationPictures: null,
        bkParkOrCommunityCenter: null,
        bkRefundAmount: null,
        bkPropertyOwnerName: null,
        bkCompleteAddress: null,
        bkResidentialOrCommercial: null,
        bkMaterialStorageArea: null,
        bkPlotSketch: null,
        bkApplicationStatus: selectedComplaint.bkApplicationStatus,
        bkTime: null,
        bkStatus: null,
        bkDriverName: null,
        bkVehicleNumber: null,
        bkEstimatedDeliveryTime: null,
        bkActualDeliveryTime: null,
        bkNormalWaterFailureRequest: null,
        bkUpdateStatusOption: null,
        bkAddSpecialRequestDetails: null,
        bkBookingTime: null,
        bkApprovedBy: null,
        bkModuleType: null,
        uuid: null,
        tenantId: selectedComplaint.tenantId,
        bkAction: cancelAction,
        bkConstructionType: null,
        businessService: selectedComplaint.businessService,
        bkApproverName: null,
        discount: selectedComplaint.discount,
        assignee: null,
        wfDocuments: [],
        financialYear: selectedComplaint.financialYear,
        bkBankAccountNumber: selectedComplaint.bkBankAccountNumber,
        bkBankName: selectedComplaint.bkBankName,
        bkIfscCode: selectedComplaint.bkIfscCode,
        bkAccountType: selectedComplaint.bkAccountType,
        bkBankAccountHolder: selectedComplaint.bkBankAccountHolder,
        bkNomineeName: selectedComplaint.bkNomineeName,
        financeBusinessService: null,
      };
      console.log("CancelEmpBooking-Booking", Booking);
      let createAppData = {
        applicationType: "PACC",
        applicationStatus: "",
        applicationId: selectedComplaint.bkApplicationNumber
          ? selectedComplaint.bkApplicationNumber
          : null,
        tenantId: selectedComplaint.tenantId,
        Booking: Booking,
      };
      console.log("createAppData--createAppData", createAppData);
      let payloadfund = await httpRequest(
        "bookings/park/community/_update",
        "_search",
        [],
        createAppData
      );
      console.log("payloadfund--cancel--", payloadfund);
      if(payloadfund.status == "200"){
        this.props.history.push(`/egov-services/application-cancelled-success`);
      }
      else{
        toggleSnackbarAndSetText(
          true,
          {
            labelName: "Something went wrong.Try Again",
            labelKey: `BK_CC_ROOM_GETTING_WRONG`
          },
          "error"
        );
      }
    }
    else {
      toggleSnackbarAndSetText(
        true,
        {
          labelName: "Please enter reason for booking cancellation",
          labelKey: `BK_ERR_PACC_MCC_BOOKING_CANCEL`,
        },
        "error"
      );
    }
   
   
  };

  ReasonOfCanValue = (e) => {
    this.setState(
      {
        reasonForBookingCancellation: e.target.value,
      },
      console.log("ReasonOfCanValue", e.target.value)
    );
  };

  // CheckGreaterDate = () =>{
  // 	let { selectedComplaint,toggleSnackbarAndSetText } = this.props;
  // 	let check;
  // 	let bookingDate = selectedComplaint.bkFromDate
  // 	console.log("FromDate--yyy-last",bookingDate)

  // 	let dateFromDate = new Date(bookingDate)
  // 	console.log("dateFromDate--gg",dateFromDate)
  // 	let CurrentDate = new Date();
  // 	console.log("CurrentDate--",CurrentDate)
  // if(dateFromDate > CurrentDate){
  // 	check == false
  // }
  // else{
  // 	check == true
  // }
  // console.log("ValueOfCheckInFunction--",check)
  // this.setState({
  // 	checkGreaterDate: check,
  // })

  // return check
  // }

  render() {
    const hintTextStyle = {
      letterSpacing: "0.7px",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      width: "90%",
      overflow: "hidden",
    };

    const dropbordernone = {
      float: "right",
      paddingRight: "20px",
    };
    let { shareCallback } = this;
    let {
      reasonForBookingCancellation,
      operatorCode,
      Address,
      hsnCode,
      comments,
      openMap,
      AppName,
      name,
      checkNumDays,
      checkGreaterDate,
      createdDate,
      BKROOM_TAX,
      BKROOM,
      BKROOM_ROUND_OFF,
      four,
      totalAmountPaid,
      PaymentDate,
      receiptNumber,
      PaymentMode,
      transactionNumber,
    } = this.state;
    console.log("CheckstateForRefund--", this.state);
    let { complaint, timeLine } = this.props.transformedComplaint;
    let {
      documentMap,
      selectedComplaint,
      Difference_In_Days_check,
      first,
      uploadeDocType,
    } = this.props;
    let {
      historyApiData,
      paymentDetails,
      match,
      userInfo,
      paymentDetailsForReceipt,
      PayMentTwo,
      PayMentOne,
      selectedNumber,
    } = this.props;
    console.log("this.props.match--", this.props);
    console.log("this.state.totalRefundAmount", this.state.totalRefundAmount);
    let {
      role,
      serviceRequestId,
      history,
      isAssignedToEmployee,
      reopenValidChecker,
    } = this.props;
    let checkuploadeDocType = "NotFound";
    let valueForDocDropDown;

    checkuploadeDocType =
      uploadeDocType !== undefined && uploadeDocType !== null
        ? uploadeDocType.length > 0
          ? uploadeDocType[0].documentType !== undefined &&
            uploadeDocType[0].documentType !== null
            ? uploadeDocType[0].documentType
            : "NotFound"
          : "NotFound"
        : "NotFound";

    if (checkuploadeDocType !== "NotFound") {
      valueForDocDropDown = `-${checkuploadeDocType}`;
    }

    console.log("valueForDocDropDown", valueForDocDropDown);

    // var ForAllNoDays = this.TotalPACCDays();     `-${uploadeDocType}`
    // console.log("ForAllNoDays--",ForAllNoDays)    uploadeDocType[0].documentType    uploadeDocType.length > 0 ?

    // var check = this.CheckGreaterDate();
    // console.log("CheckGreaterDat--",check)
    let btnOneLabel = "";
    let btnTwoLabel = "";
    let action;
    let complaintLoc = {};

    if (complaint) {
      if (role === "employee") {
        btnOneLabel = "BK_MYBK_REJECT_BUTTON";
        btnTwoLabel = "BK_MYBK_RESOLVE_MARK_RESOLVED";
      }
    }
    if (timeLine && timeLine[0]) {
      action = timeLine[0].action;
    }
    const foundFirstLavel =
      userInfo &&
      userInfo.roles.some(
        (el) => el.code === "BK_CLERK" || el.code === "BK_DEO"
      );
    const foundSecondLavel =
      userInfo &&
      userInfo.roles.some((el) => el.code === "BK_SENIOR_ASSISTANT");
    const foundThirdLavel =
      userInfo &&
      userInfo.roles.some((el) => el.code === "BK_AUDIT_DEPARTMENT");
    const foundFourthLavel =
      userInfo &&
      userInfo.roles.some((el) => el.code === "BK_CHIEF_ACCOUNT_OFFICER");
    const foundFifthLavel =
      userInfo &&
      userInfo.roles.some(
        (el) => el.code === "BK_PAYMENT_PROCESSING_AUTHORITY"
      );
    const foundTenthLavel =
      userInfo && userInfo.roles.some((el) => el.code === "BK_MCC_USER"); //BK_MCC_USER
    const foundSixthLavel =
      userInfo &&
      userInfo.roles.some((el) => el.code === "BK_E-SAMPARK-CENTER");
    const foundSevenLavel =
      userInfo && userInfo.roles.some((el) => el.code === "BK_SUPERVISOR");
    const foundEightLavel =
      userInfo && userInfo.roles.some((el) => el.code === "BK_OSD");
    const foundNineLavel =
      userInfo && userInfo.roles.some((el) => el.code === "BK_OSD");

    return (
      <div>
        <style>
          {`
    @media screen and (min-width: 320px) and (max-width: 568px) {
.mob-mb10{margin-bottom:10px;}

}
    `}
        </style>

        <Screen>
          {complaint && !openMap && (
            <div>
              {console.log("matchOne--", match)}
              {console.log("matchparms--", this.props.match)}
              <div className="form-without-button-cont-generic">
                <div className="container">
                  <div className="row">
                    <div
                      className="col-12 col-md-6"
                      style={{ fontSize: "26px" }}
                    >
                      {/* <Label style={{ fontSize: '26px',marginTop: '10px' }} label="BK_MYBK_APPLICATION_DETAILS" /> */}
                      Application Details
                    </div>
                    <div className="col-12 col-md-6 row">
                      <div class="col-12 col-md-6 col-sm-3 mob-mb10">
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "Download ",
                              labelKey: "BK_COMMON_DOWNLOAD_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            leftIcon: "cloud_download",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                color: "#FE7A51",
                                height: "60px",
                              },
                              className: "tl-download-button",
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Receipt",
                                  labelKey: "BK_MYBK_DOWNLOAD_RECEIPT",
                                },

                                link: () =>
                                  this.downloadPaymentReceiptButton("Receipt"),
                                leftIcon: "receipt",
                              },
                              {
                                label: {
                                  labelName: "PermissionLetter",
                                  labelKey:
                                    "BK_MYBK_DOWNLOAD_PERMISSION_LETTER",
                                },
                                link: () =>
                                  this.downloadPermissionLetterButton(
                                    "PermissionLetter"
                                  ),
                                leftIcon: "book",
                              },
                              {
                                label: {
                                  labelName: "Application",
                                  labelKey: "BK_MYBK_PRINT_APPLICATION",
                                },
                                link: () =>
                                  this.downloadApplicationButton("Application"),
                                leftIcon: "assignment",
                              },
                            ],
                          }}
                        />
                      </div>
                      <div class="col-12 col-md-6 col-sm-3">
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "Print",
                              labelKey: "BK_COMMON_PRINT_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            leftIcon: "print",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                color: "#FE7A51",
                                height: "60px",
                              },
                              className: "tl-download-button",
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Receipt",
                                  labelKey: "BK_MYBK_PRINT_RECEIPT",
                                },

                                link: () =>
                                  this.downloadPaymentReceiptButton("print"),
                                leftIcon: "receipt",
                              },
                              {
                                label: {
                                  labelName: "PermissionLetter",
                                  labelKey:
                                    "BK_MYBK_DOWNLOAD_PERMISSION_LETTER",
                                },
                                link: () =>
                                  this.downloadPermissionLetterButton("print"),
                                leftIcon: "book",
                              },
                              {
                                label: {
                                  labelName: "Application",
                                  labelKey: "BK_MYBK_PRINT_APPLICATION",
                                },
                                link: () =>
                                  this.downloadApplicationButton("print"),
                                leftIcon: "assignment",
                              },
                            ],
                            // }] : [{
                            // 	label: {
                            // 		labelName: "Application",
                            // 		labelKey: "BK_MYBK_PRINT_APPLICATION"
                            // 	},
                            // 	link: () => this.downloadApplicationButton('print'),
                            // 	leftIcon: "assignment"
                            // }]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <OSMCCBookingDetails
                  {...complaint}
                  historyApiData={historyApiData && historyApiData}
                />

                {this.state.CheckStatus != "OFFLINE_MODIFIED" ? (
                  <PaymentDetails
                    paymentDetails={paymentDetails && paymentDetails}
                    PayMentTwo={PayMentTwo && PayMentTwo}
                    PayMentOne={PayMentOne && PayMentOne}
                    PACC={this.props.PACC}
                    LUXURY_TAX={this.props.LUXURY_TAX}
                    REFUNDABLE_SECURITY={this.props.REFUNDABLE_SECURITY}
                    PACC_TAX={this.props.PACC_TAX}
                    PACC_ROUND_OFF={this.props.PACC_ROUND_OFF}
                    FACILITATION_CHARGE={this.props.FACILITATION_CHARGE}
                  />
                ) : (
                  " "
                )}

                {this.state.CheckStatus ==
                "OFFLINE_MODIFIED" /*Bill[2].totalAmount   Bill[0].totalAmount       */ ? (
                  <div>
                    <PaymentDetailFirstModified
                      paymentDetails={
                        this.state.fullAmountDetail &&
                        this.state.fullAmountDetail
                      }
                    />
                    <AppStateModifiedPayDetail
                      paymentDetails={this.state.modifiedFirstAmount}
                    />
                  </div>
                ) : (
                  " " 
                )} 

                {this.state.refundCard == true ? (
                  <RefundCard
                    paymentDetails={
                      this.state.newPaymentDetails != "NotFound" &&
                      this.state.newPaymentDetails
                    }
                    selectedComplaint = {this.props.selectedComplaint}
                    RefAmount={
                      this.state.totalRefundAmount &&
                      this.state.totalRefundAmount
                    }
                    payload={paymentDetailsForReceipt}
                    refundableSecurityMoney={
                      this.props.selectedComplaint.refundableSecurityMoney
                    }
                    bookedRoomArray={this.props.selectedComplaint.roomsModel}
                    {...complaint}
                  />
                ) : (
                  " "
                )}

                <AppDetails {...complaint} />

                <BookingDetails
                  {...complaint}
                  historyApiData={historyApiData && historyApiData}
                />

                {this.props.showRoomCard == true ? (
                  <RoomCard
                    // roomData={this.props.roomsData}
                    history={this.props.history}
                    roomData={this.props.roomsData}
                    RoomApplicationNumber={this.props.RoomApplicationNumber}
                    totalNumber={this.props.totalNumber}
                    typeOfRoom={this.props.typeOfRoom}
                    roomFromDate={this.props.roomFromDate}
                    roomToDate={this.props.roomToDate}
                    createdDate={createdDate}
                    selectedComplaint={selectedComplaint}
                    userInfo={this.props.userInfo}
                    BKROOM_TAX={BKROOM_TAX}
                    BKROOM={BKROOM}
                    BKROOM_ROUND_OFF={BKROOM_ROUND_OFF}
                    four={four}
                    totalAmountPaid={totalAmountPaid}
                    PaymentDate={PaymentDate}
                    receiptNumber={receiptNumber}
                    PaymentMode={PaymentMode}
                    transactionNumber={transactionNumber}
                    operatorCode={operatorCode}
                    Address={Address}
                    hsnCode={hsnCode}
                    name={name}

                    //PaymentDate,receiptNumber,PaymentMode,transactionNumber   operatorCode,Address,hsnCode
                  />
                ) : (
                  ""
                )}

                {/* {this.props.showRoomCard == true ? <PaymentCardForRoom   //BKROOM_TAX,BKROOM,BKROOM_ROUND_OFF,four
BKROOM_TAX = {BKROOM_TAX}
BKROOM = {BKROOM}
BKROOM_ROUND_OFF = {BKROOM_ROUND_OFF}
four = {four}
totalAmountPaid = {totalAmountPaid}
/> : ""} */}

                <ViewBankDetails {...complaint} />

                <div
                  style={{
                    height: "130px",
                    width: "100",
                    backgroundColor: "white",
                    border: "2px solid white",
                    boxShadow: "0 0 2px 2px #e7dcdc",
                    paddingLeft: "30px",
                    paddingTop: "10px",
                  }}
                >
                  <b>Documents</b> 
                  <br></br>

                  {checkuploadeDocType !== "NotFound" ? (
                    <Label
                      className="col-xs-12  col-sm-12 col-md-12  status-result-color"
                      id="complaint-details-current-status"
                      labelStyle={{ color: "inherit", marginLeft: "-16px" }}
                      label={`Proof of Residence - ${
                        this.state && this.state.proofOfResDocumentType
                      }`}
                    />
                  ) : (
                    ""
                  )}

                  {/* {documentMap && Object.values(documentMap) ? Object.values(documentMap) : "Not found"} */}
                  {this.state && this.state.proofOfResDocName
                    ? this.state.proofOfResDocName
                    : "Not found"}
                  {/* <button className="ViewDetailButton" data-doc={documentMap} onClick={(e) => { this.callApiForDocumentData(e) }}>VIEW</button> */}
                  <button
                    className="ViewDetailButton"
                    data-doc={documentMap}
                    onClick={() => {
                      this.callApiForDocumentData(
                        this.state.proofOfResDocumentfileStoreId,
                        this.state.proofOfResDocumentType
                      );
                    }}
                  >
                    VIEW
                  </button>
                </div>

                <div
                  style={{
                    height: "130px",
                    width: "100",
                    marginTop: "15px",
                    backgroundColor: "white",
                    border: "2px solid white",
                    boxShadow: "0 0 2px 2px #e7dcdc",
                    paddingLeft: "30px",
                    paddingTop: "10px",
                  }}
                >
                  <b>Documents</b>
                  <br></br>

                  {this.state.discountDocName ? (
                    <Label
                      className="col-xs-12  col-sm-12 col-md-12  status-result-color"
                      id="complaint-details-current-status"
                      labelStyle={{ color: "inherit", marginLeft: "-16px" }}
                      label={`BK_PCC_DISCOUNT_DOCUMENT`}
                    />
                  ) : (
                    ""
                  )}

                  {this.state && this.state.discountDocName
                    ? this.state.discountDocName
                    : "Not found"}
                  <button
                    className="ViewDetailButton"
                    data-doc={documentMap}
                    onClick={(e) => {
                      this.callApiForDocumentData(
                        this.state.discountDocfileStoreId,
                        "BK_PCC_DISCOUNT_DOCUMENT"
                      );
                    }}
                  >
                    VIEW
                  </button>
                </div>

                {this.state.enterReasonForBookingCancellation == true ? (
                  <div
                    style={{
                      height: "117px",
                      width: "100",
                      marginTop: "15px",
                      backgroundColor: "white",
                      border: "2px solid white",
                      boxShadow: "0 0 2px 2px #e7dcdc",
                      paddingLeft: "30px",
                      paddingTop: "10px",
                    }}
                  >
                    {/* <b><Label label="BK_EMP_REASON_FOR_CANCEL_BOOKING"/></b>  */}
                    {/* <b> Reason For Cancellation</b> */}
                    <br></br>
                    <div className="col-sm-6 col-xs-6">
                      <TextField
                        id="ReasonForPaccBookingCancel"
                        name="ReasonForPaccBookingCancel"
                        type="text"
                        // disabled = {checkDateVenueChange == true ? true : false}
                        value={this.state.reasonForBookingCancellation}
                        pattern="[A-Za-z]"
                         required={true}
                        hintText={
                          <Label
                            label="BK_EMP_ENTER_REASON_FOR_CANCEL_BOOKING" // Please Enter The Reason For Cancellation
                            color="rgba(0, 0, 0, 0.3799999952316284)"
                            fontSize={16}
                            labelStyle={hintTextStyle}
                          />
                        }
                        floatingLabelText={
                          <Label
                            key={0}
                            label="BK_EMP_REASON_FOR_CANCEL_BOOKING"
                            color="rgba(0,0,0,0.60)"
                            style={{ marginTop: "-6%" }}
                            fontSize="12px"
                          />
                        }
                        onChange={(e) => this.ReasonOfCanValue(e)}
                        underlineStyle={{ bottom: 7 }}
                        underlineFocusStyle={{ bottom: 7 }}
                        hintStyle={{ width: "100%" }}
                      />
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {this.state.enterReasonForBookingCancellation == true ? (
                  <div
                    style={{
                      height: "96px",
                      width: "100",
                      marginTop: "15px",
                      backgroundColor: "white",
                      border: "2px solid white",
                      boxShadow: "0 0 2px 2px #e7dcdc",
                      paddingLeft: "30px",
                      paddingTop: "10px",
                    }}
                  >
                    <b></b>
                    <br></br>
                    <div className="col-sm-6 col-xs-6">
                      <Label
                        label="BK_PACC_CONFIRMATION_MSG"
                        style={{
                          marginTop: "-5%",
                          color: "black",
                          fontWeight: "bolder",
                        }}
                        fontSize="17px"
                      />
                    </div>
                  </div>
                ) : (
                  ""
                )}

                <Comments
                  comments={comments}
                  role={role}
                  isAssignedToEmployee={isAssignedToEmployee}
                />
              </div>
              <div
                style={{
                  paddingTop: "30px",
                  paddingRight: "30px",
                  float: "right",
                }}
              >
                {role === "employee" &&
                  complaint.status == "PENDING_FOR_APPROVAL_CLEARK_DEO" &&
                  foundFirstLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "TAKE ACTION ",
                              labelKey: "BK_COMMON_TAKE_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                backgroundColor: "#FE7A51",
                                color: "#fff",
                                border: "none",
                                height: "60px",
                                width: "250px",
                              },
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Approve",
                                  labelKey: "BK_MYBK_APPROVE_ACTION_BUTTON",
                                },

                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "APPROVED"
                                  ),
                              },
                              {
                                label: {
                                  labelName: "Reject",
                                  labelKey: "BK_MYBK_REJECT_ACTION_BUTTON",
                                },
                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "REJECT"
                                  ),
                              },
                            ],
                          }}
                        />
                      }
                    ></Footer>
                    // 						<button
                    // onClick={(e)=>this.GOTOPAY(selectedNumber)}
                    // >PAY </button>
                  )}
                {role === "employee" &&
                  complaint.status == "PENDING_FOR_APPROVAL_SENIOR_ASSISTANT" &&
                  foundSecondLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "TAKE ACTION ",
                              labelKey: "BK_COMMON_TAKE_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                backgroundColor: "#FE7A51",
                                color: "#fff",
                                border: "none",
                                height: "60px",
                                width: "250px",
                              },
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Approve",
                                  labelKey: "BK_MYBK_APPROVE_ACTION_BUTTON",
                                },

                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "APPROVED"
                                  ),
                              },
                              {
                                label: {
                                  labelName: "Reject",
                                  labelKey: "BK_MYBK_REJECT_ACTION_BUTTON",
                                },
                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "REJECT"
                                  ),
                              },
                            ],
                          }}
                        />
                      }
                    ></Footer>
                  )}
                {role === "employee" &&
                  complaint.status == "PENDING_FOR_APPROVAL_AUDIT_DEPARTMENT" &&
                  foundThirdLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "TAKE ACTION ",
                              labelKey: "BK_COMMON_TAKE_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                backgroundColor: "#FE7A51",
                                color: "#fff",
                                border: "none",
                                height: "60px",
                                width: "250px",
                              },
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Approve",
                                  labelKey: "BK_MYBK_APPROVE_ACTION_BUTTON",
                                },

                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "APPROVED"
                                  ),
                              },
                              {
                                label: {
                                  labelName: "Reject",
                                  labelKey: "BK_MYBK_REJECT_ACTION_BUTTON",
                                },
                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "REJECT"
                                  ),
                              },
                            ],
                          }}
                        />
                      }
                    ></Footer>
                  )}
                {role === "employee" &&
                  complaint.status == "PENDING_FOR_APPROVAL_CAO" &&
                  foundFourthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "TAKE ACTION ",
                              labelKey: "BK_COMMON_TAKE_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                backgroundColor: "#FE7A51",
                                color: "#fff",
                                border: "none",
                                height: "60px",
                                width: "250px",
                              },
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Approve",
                                  labelKey: "BK_MYBK_APPROVE_ACTION_BUTTON",
                                },

                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "APPROVED"
                                  ),
                              },
                              {
                                label: {
                                  labelName: "Reject",
                                  labelKey: "BK_MYBK_REJECT_ACTION_BUTTON",
                                },
                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "REJECT"
                                  ),
                              },
                            ],
                          }}
                        />
                      }
                    ></Footer>
                  )}
                {/*Book Room After Date/Venue Change*/}
                {role === "employee" &&
                  complaint.status == "OFFLINE_MODIFIED" &&
                  foundSixthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <div
                          className="col-sm-12 col-xs-12"
                          style={{ textAlign: "right" }}
                        >
                          {complaint.bookingType == "Community Center" &&
                          complaint.bkLocation !==
                            "HALL FOR 4 HOURS AT COMMUNITY CENTRE SECTOR 39 CHANDIGARH" &&
                          this.props.RoomBookingDate == "Valid" ? ( //"OFFLINE_APPLIED"
                            <Button
                              label={
                                <Label
                                  buttonLabel={true}
                                  color="#fe7a51"
                                  label="Room Book"
                                />
                              }
                              labelStyle={{
                                letterSpacing: 0.7,
                                padding: 0,
                                color: "#fe7a51",
                              }}
                              buttonStyle={{ border: "1px solid #fe7a51" }}
                              style={{ width: "15%" }}
                              onClick={() => this.BookRoom()}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      }
                    ></Footer>
                  )}

                {/*sixStep*/}
                {role === "employee" &&
                  complaint.status == "OFFLINE_APPLIED" &&
                  foundSixthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <div
                          className="col-sm-12 col-xs-12"
                          style={{ textAlign: "right" }}
                        >
                          {complaint.bookingType == "Community Center" &&
                          complaint.bkLocation !==
                            "HALL FOR 4 HOURS AT COMMUNITY CENTRE SECTOR 39 CHANDIGARH" &&
                          this.props.RoomBookingDate == "Valid" ? ( //"OFFLINE_APPLIED"
                            <Button
                              label={
                                <Label
                                  buttonLabel={true}
                                  color="#fe7a51"
                                  label="Room Book"
                                />
                              }
                              labelStyle={{
                                letterSpacing: 0.7,
                                padding: 0,
                                color: "#fe7a51",
                              }}
                              buttonStyle={{ border: "1px solid #fe7a51" }}
                              style={{ width: "15%" }}
                              onClick={() => this.BookRoom()}
                            />
                          ) : (
                            ""
                          )}

                          {/*Date Venue Change*/}

                          {Difference_In_Days_check > 1 ||
                          Difference_In_Days_check == 1 ? (
                            <Button
                              label={
                                <Label
                                  buttonLabel={true}
                                  color="#fe7a51"
                                  label="CHANGE DATE/VENUE"
                                />
                              }
                              labelStyle={{
                                letterSpacing: 0.7,
                                padding: 0,
                                color: "#fe7a51",
                              }}
                              buttonStyle={{ border: "1px solid #fe7a51" }}
                              style={{ width: "15%", marginLeft: "2%" }}
                              onClick={() => this.setPop(complaint)}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      }
                    ></Footer>
                  )}
                {/*Cancel button MCC User*/}

                {role === "employee" &&
                  (complaint.status == "OFFLINE_APPLIED" ||
                    complaint.status == "APPLIED") &&
                  foundTenthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <div
                          className="col-sm-12 col-xs-12"
                          style={{ textAlign: "right" }}
                        >
                          {Difference_In_Days_check > 15 ||
                          Difference_In_Days_check == 15 ? (
                            <Button
                              label={
                                <Label
                                  buttonLabel={true}
                                  color="#fe7a51"
                                  label="CANCEL BOOKING"
                                />
                              }
                              labelStyle={{
                                letterSpacing: 0.7,
                                padding: 0,
                                color: "#fe7a51",
                              }}
                              buttonStyle={{ border: "1px solid #fe7a51" }}
                              style={{ width: "15%", marginLeft: "2%" }}
                              onClick={() => this.CancelEmpBooking()}
                            />
                          ) : (
                            ""
                          )}
                          {/*Security Refund*/}
                          {/* {first == true ?
													<Button
														label={
															<Label
																buttonLabel={true}
																color="#fe7a51"
																label="SECURITY REFUND"
															/>
														}
														labelStyle={{
															letterSpacing: 0.7,
															padding: 0,
															color: "#fe7a51",
														}}
														buttonStyle={{ border: "1px solid #fe7a51" }}
														style={{ width: "15%", marginLeft: "2%" }}
														onClick={() => this.ApplyOfflineSecurityRefund()}
													/>
													: ""} */}
                        </div>
                      }
                    ></Footer>
                  )}

                {/*MCC USER CANCEL THE PACC APPLICATION AFTER CLICK CANCEL BUTTON AND NOW IT NEED TO CLICK ON CONFIRM TO CANCEL THE BOOKING*/}

                {role === "employee" &&
                  (complaint.status == "OFFLINE_APPLIED" ||
                    complaint.status == "APPLIED") &&
                  foundTenthLavel &&
                  this.state.enterReasonForBookingCancellation == true && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <div
                          className="col-sm-12 col-xs-12"
                          style={{ textAlign: "right" }}
                        >
                          {Difference_In_Days_check > 15 ||
                          Difference_In_Days_check == 15 ? (
                            <div>
                              <Button
                                label={
                                  <Label
                                    buttonLabel={true}
                                    color="#fe7a51"
                                    label="BK_PACC_BUTTON_CANCEL_BOOKING_CONFIRM"
                                  />
                                }
                                labelStyle={{
                                  letterSpacing: 0.7,
                                  padding: 0,
                                  color: "#fe7a51",
                                }}
                                buttonStyle={{ border: "1px solid #fe7a51" }}
                                style={{ width: "15%", marginLeft: "2%" }}
                                onClick={() => this.ConfirmCancelEmpBooking()}
                              />
                              <Button
                                label={
                                  <Label
                                    buttonLabel={true}
                                    color="#fe7a51"
                                    label="BK_MY_BK_BUTTON_CANCEL"
                                  />
                                }
                                labelStyle={{
                                  letterSpacing: 0.7,
                                  padding: 0,
                                  color: "#fe7a51",
                                }}
                                buttonStyle={{ border: "1px solid #fe7a51" }}
                                style={{ width: "15%", marginLeft: "2%" }}
                                onClick={() => this.continueComplaintSubmit()}
                              />
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      }
                    ></Footer>
                  )}

                {/*Refund Button for MCC user*/}

                {role === "employee" &&
                  (complaint.status == "OFFLINE_MODIFIED" ||
                    complaint.status == "MODIFIED") &&
                  foundTenthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <div
                          className="col-sm-12 col-xs-12"
                          style={{ textAlign: "right" }}
                        >
                          {/*Security Refund*/}
                          {first == true ? (
                            <Button
                              label={
                                <Label
                                  buttonLabel={true}
                                  color="#fe7a51"
                                  label="SECURITY REFUND"
                                />
                              }
                              labelStyle={{
                                letterSpacing: 0.7,
                                padding: 0,
                                color: "#fe7a51",
                              }}
                              buttonStyle={{ border: "1px solid #fe7a51" }}
                              style={{ width: "15%", marginLeft: "2%" }}
                              onClick={() => this.ApplyOfflineSecurityRefund()}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      }
                    ></Footer>
                  )}

                  {/*Security Refund Button for commercial ground*/}
{console.log("this.props.RefoundCGAmount",this.props.RefoundCGAmount)}
                  {role === "employee" && complaint.status == "APPLIED" && complaint.businessService == "GFCP" && this.props.RefoundCGAmount > 0 &&
                  foundTenthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <div
                          className="col-sm-12 col-xs-12"
                          style={{ textAlign: "right" }}
                        >
                          {/*Security Refund*/}
                          {first == true ? (
                            <Button
                              label={
                                <Label
                                  buttonLabel={true}
                                  color="#fe7a51"
                                  label="SECURITY REFUND"
                                />
                              }
                              labelStyle={{
                                letterSpacing: 0.7,
                                padding: 0,
                                color: "#fe7a51",
                              }}
                              buttonStyle={{ border: "1px solid #fe7a51" }}
                              style={{ width: "15%", marginLeft: "2%" }}
                              onClick={() => this.OfflineRefundForCG()}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      }
                    ></Footer>
                  )}



                {/*sevenlevel*/}

                {role === "employee" &&
                  complaint.status == "PENDING_FOR_APPROVAL_SUPERVISOR" &&
                  foundSevenLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "TAKE ACTION ",
                              labelKey: "BK_COMMON_TAKE_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                backgroundColor: "#FE7A51",
                                color: "#fff",
                                border: "none",
                                height: "60px",
                                width: "250px",
                              },
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Approve",
                                  labelKey: "BK_MYBK_APPROVE_ACTION_BUTTON",
                                },

                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "APPROVED"
                                  ),
                              },
                              {
                                label: {
                                  labelName: "Reject",
                                  labelKey: "BK_MYBK_REJECT_ACTION_BUTTON",
                                },
                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "REJECT"
                                  ),
                              },
                            ],
                          }}
                        />
                      }
                    ></Footer>
                  )}
                {role === "employee" &&
                  complaint.status == "PENDING_FOR_APPROVAL_OSD" &&
                  foundEightLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "TAKE ACTION ",
                              labelKey: "BK_COMMON_TAKE_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                backgroundColor: "#FE7A51",
                                color: "#fff",
                                border: "none",
                                height: "60px",
                                width: "250px",
                              },
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "Approve",
                                  labelKey: "BK_MYBK_APPROVE_ACTION_BUTTON",
                                },

                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "APPROVED"
                                  ),
                              },
                              {
                                label: {
                                  labelName: "Reject",
                                  labelKey: "BK_MYBK_REJECT_ACTION_BUTTON",
                                },
                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "REJECT"
                                  ),
                              },
                            ],
                          }}
                        />
                      }
                    ></Footer>
                  )}

                {role === "employee" &&
                  complaint.status == "PENDING_FOR_DISBURSEMENT" &&
                  foundFifthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <ActionButtonDropdown
                          data={{
                            label: {
                              labelName: "TAKE ACTION ",
                              labelKey: "BK_COMMON_TAKE_ACTION",
                            },
                            rightIcon: "arrow_drop_down",
                            props: {
                              variant: "outlined",
                              style: {
                                marginLeft: 5,
                                marginRight: 15,
                                backgroundColor: "#FE7A51",
                                color: "#fff",
                                border: "none",
                                height: "60px",
                                width: "250px",
                              },
                            },
                            menu: [
                              {
                                label: {
                                  labelName: "PAY",
                                  labelKey: "PAY",
                                },

                                link: () =>
                                  this.actionButtonOnClick(
                                    "state",
                                    "dispatch",
                                    "APPROVED"
                                  ),
                              },
                              // {
                              // 	label: {
                              // 		labelName: "Reject",
                              // 		labelKey: "BK_MYBK_REJECT_ACTION_BUTTON"
                              // 	},
                              // 	link: () => this.actionButtonOnClick('state', "dispatch", 'REJECT')
                              // }
                            ],
                          }}
                        />
                      }
                    ></Footer>
                  )}
                {console.log(
                  "match.params.applicationId--",
                  match.params.applicationId
                )}

                <DialogContainer
                  toggle={this.state.dateVenchangePop} //open
                  actionTittle={"Date/Venue change Terms & Conditions"} //data
                  togglepopup={this.testpopup} //close
                  children={this.redirectToAvailPage()}
                  maxWidth={"sm"}
                />

                <DialogContainer
                  toggle={this.state.togglepopup}
                  actionTittle={this.state.actionTittle}
                  togglepopup={this.actionButtonOnClick}
                  maxWidth={"md"}
                  children={
                    this.state.actionOnApplication == "APPROVED" ? (
                      <ApproveCancellation
                        applicationNumber={match.params.applicationId}
                        matchparams={match.params}
                        match={this.props.match}
                        selectedComplaint={this.props.selectedComplaint}
                        userInfo={userInfo}
                        payload={paymentDetailsForReceipt}
                        payloadTwo={this.props.paymentDetailsForReceipt}
                      />
                    ) : (
                      <RejectCancellation
                        applicationNumber={match.params.applicationId}
                        userInfo={userInfo}
                      />
                    )
                  }
                />
              </div>
            </div>
          )}
        </Screen>
      </div>
    );
  }
}

const roleFromUserInfo = (roles = [], role) => {
  const roleCodes = roles.map((role, index) => {
    return role.code;
  });
  return roleCodes && roleCodes.length && roleCodes.indexOf(role) > -1
    ? true
    : false;
};

const mapCitizenIdToMobileNumber = (citizenObjById, id) => {
  return citizenObjById && citizenObjById[id]
    ? citizenObjById[id].mobileNumber
    : "";
};
let gro = "";

const mapStateToProps = (state, ownProps) => {
  const { bookings, common, auth, form } = state;
  const { DownloadReceiptDetailsforPCC } = bookings;

  const {
    applicationData,
    createPACCApplicationData,
    Downloadesamparkdetails,
    Downloadesamparkdetailspl,
    PaymentReceiptByESamp,DownloadCitizenPACCReceipt
  } = bookings;
  const {
    DownloadPaymentReceiptDetails,
    DownloadApplicationDetails,
    DownloadPermissionLetterDetails,
    EmpPaccPermissionLetter,DownloadCitizenPACCPermissionLetter,CitizenCCPermissionLetter
  } = bookings;
  const { id } = auth.userInfo;
  const { employeeById, departmentById, designationsById, cities } =
    common || {};

  const { userInfo } = state.auth;
  const serviceRequestId = ownProps.match.params.applicationId;
  let selectedComplaint = applicationData
    ? applicationData.bookingsModelList[0]
    : "";
  let selectedNumber = selectedComplaint
    ? selectedComplaint.bkApplicationNumber
    : "NotFoundAnyApplicationNumber";
  console.log("selectedNumber--", selectedNumber);

  let OfflineInitatePayArray;
  let PACC = 0;
  let LUXURY_TAX = 0;
  let REFUNDABLE_SECURITY = 0;
  let PACC_TAX = 0;
  let PACC_ROUND_OFF = 0;
  let FACILITATION_CHARGE = 0;
  let DATEVENUECHARGE = 0;

  let roomData = selectedComplaint.roomsModel
    ? selectedComplaint.roomsModel.length > 0
      ? selectedComplaint.roomsModel
      : "NA"
    : "NA";
  console.log("roomData-----", roomData);
  let RoomApplicationNumber = "NA";
  let showRoomCard;
  let totalNumber;
  let typeOfRoom;
  let roomFromDate;
  let roomToDate;
  let dataForBothSelection;
  if (roomData !== "NA") {
    let roomModels = roomData;
    console.log("roomModels-roomModels-roomModels", roomModels);
    let tempArray = [];
    var roomsData = roomModels
      .map((roomData) => {
        if (!tempArray.includes(roomData.roomApplicationNumber)) {
          tempArray.push(roomData.roomApplicationNumber);
          let slicearray = roomModels.slice(
            _.findIndex(roomModels, roomData) + 1,
            roomModels.length
          );
          let duplicateObject = slicearray.filter(
            (data) =>
              data.roomApplicationNumber == roomData.roomApplicationNumber
          );
          if (duplicateObject.length > 0) {
            let newObj = {
              roomApplicationNumber: roomData.roomApplicationNumber,
              toDate: roomData.toDate,
              fromDate: roomData.fromDate,
              typeOfRooms: "BOTH",
            };
            if (duplicateObject[0].typeOfRoom == "NON-AC") {
              newObj.totalNoOfACRooms = roomData.totalNoOfRooms;
              newObj.totalNoOfNonACRooms = duplicateObject[0].totalNoOfRooms;
            } else {
              newObj.totalNoOfACRooms = duplicateObject[0].totalNoOfRooms;
              newObj.totalNoOfNonACRooms = roomData.totalNoOfRooms;
            }
            return newObj;
          } else {
            let newObj = {
              roomApplicationNumber: roomData.roomApplicationNumber,
              toDate: roomData.toDate,
              fromDate: roomData.fromDate,
            };
            if (roomData.typeOfRoom === "NON-AC") {
              newObj.totalNoOfACRooms = 0;
              newObj.typeOfRooms = "NON-AC";
              newObj.totalNoOfNonACRooms = roomData.totalNoOfRooms;
            } else {
              newObj.totalNoOfACRooms = roomData.totalNoOfRooms;
              newObj.typeOfRooms = "AC";
              newObj.totalNoOfNonACRooms = 0;
            }
            return newObj;
          }
        }
        return;
      })
      .filter(Boolean);

    console.log("DataForRoomsData--", roomsData);
    console.log("dataForBothSelection--", dataForBothSelection);
    showRoomCard = true;
    RoomApplicationNumber = roomData[0].roomApplicationNumber;
    totalNumber = roomData[0].totalNoOfRooms;
    typeOfRoom = roomData[0].typeOfRoom;
    roomFromDate = roomData[0].fromDate;
    roomToDate = roomData[0].toDate;
  }

  let newRoomAppNumber =
    RoomApplicationNumber != "NA" ? RoomApplicationNumber : "";
  console.log("newRoomAppNumber--", newRoomAppNumber);

  let bookFDate = selectedComplaint ? selectedComplaint.bkFromDate : "";
  console.log("bookFDate--", bookFDate);

  let bookTDate = selectedComplaint ? selectedComplaint.bkToDate : "";
  console.log("bookTDate--", bookTDate);

  let dateFromDate = new Date(bookFDate);
  console.log("dateFromDate--gg", dateFromDate);

  let RoomDate = new Date(bookTDate);
  console.log("RoomDate--", RoomDate);

  let Todaydate = new Date();
  console.log("Todaydate--", Todaydate);

  let RoomBookingDate = "";
  if (Todaydate.getTime() < RoomDate.getTime()) {
    RoomBookingDate = "Valid";
  }
  console.log("RoomBookingDate--", RoomBookingDate);
  let first = false;
  if (dateFromDate < Todaydate) {
    first = true;
  }
  console.log("first--", first);

  let Difference_In_Time_check = dateFromDate.getTime() - Todaydate.getTime();
  console.log("Difference_In_Time--uuuuu-fgfgfg", Difference_In_Time_check);

  let Difference_In_Days_check = Difference_In_Time_check / (1000 * 3600 * 24);
  console.log("Difference_In_Days--dadada", Difference_In_Days_check);

  let businessService = applicationData ? applicationData.businessService : "";
  let bookingDocs;
  let documentMap =
    applicationData && applicationData.documentMap
      ? applicationData.documentMap
      : "";

  let uploadeDocType = get(
    state,
    "bookings.applicationData.documentList",
    "NotFound"
  );

  console.log("DetailPageDocType", uploadeDocType);
  const { HistoryData } = bookings;
  let historyObject = HistoryData ? HistoryData : "";
  const { paymentData } = bookings;
  console.log("paymentData--", paymentData ? paymentData : "NopaymentData");

  const { fetchPaymentAfterPayment } = bookings;
  console.log(
    "fetchPaymentAfterPayment--",
    fetchPaymentAfterPayment
      ? fetchPaymentAfterPayment
      : "NofetchPaymentAfterPaymentData"
  );

  let paymentDetailsForReceipt = fetchPaymentAfterPayment;
  let paymentDetails;

  let PayMentOne =
    fetchPaymentAfterPayment &&
    fetchPaymentAfterPayment.Payments[0] &&
    fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill;
  let xyz = PayMentOne && PayMentOne ? PayMentOne : "xyz";
  console.log("xyz--", xyz);
  console.log("PayMentOne--", PayMentOne);
  let PayMentTwo = paymentData ? paymentData.Bill[0] : "";
  console.log("PayMentTwo--", PayMentTwo);
  let abc = PayMentTwo && PayMentTwo ? PayMentTwo : "abc";
  console.log("abc--", abc);

  let RefoundCGAmount = 0;

  //fetch security amount in case of commercial
if(selectedComplaint.bkBookingType == "GROUND_FOR_COMMERCIAL_PURPOSE"){
  let cgSecurityAmount = get(
    state,
    "bookings.fetchPaymentAfterPayment.Payments",
    "NotFound"
  );
  // bookings.fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails[2].taxHeadCode

console.log("cgSecurityAmount",cgSecurityAmount)
  if(cgSecurityAmount !== "NotFound"){
    for (let i = 0; i < cgSecurityAmount.length; i++) {
      if (
        cgSecurityAmount[i].taxHeadCode ==
        "SECURITY_COMMERCIAL_GROUND_BOOKING_BRANCH"
      ){
        RefoundCGAmount = cgSecurityAmount[i].amount;
      }
      }

}
}
console.log("RefoundCGAmount",RefoundCGAmount)
  if (
    selectedComplaint &&
    selectedComplaint.bkApplicationStatus == "OFFLINE_APPLIED"
  ) {
    console.log("offlineApplied--", selectedComplaint.bkApplicationStatus);

    let fetchPaymentAfterPaymentData = get(
      state,
      "bookings.fetchPaymentAfterPayment.Payments",
      "NotFound"
    );

    let AfterPaymentData = get(
      state,
      "bookings.paymentData",
      "NotFound"
    );
    console.log("fetchPaymentAfterPaymentData--000888",fetchPaymentAfterPaymentData)
    console.log("AfterPaymentDataAfterPaymentData",AfterPaymentData)
    if (selectedComplaint.bkPaymentStatus == "SUCCESS") {
      console.log("yes--fetchPaymentAfterPaymentData")
      if (fetchPaymentAfterPaymentData.length > 0 && fetchPaymentAfterPaymentData !=="NotFound") {
        console.log("onetwothreefourfive")
        paymentDetails =
          fetchPaymentAfterPayment &&
          fetchPaymentAfterPayment.Payments[0] &&
          fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill;
          console.log("paymentDetails-One--", paymentDetails);
console.log("fetchPaymentAfterPayment",fetchPaymentAfterPayment)
      } 
      else {
        console.log("false--fetchPaymentAfterPaymentData")
        console.log("paymentData-pppp--oooo",paymentData)
        paymentDetails = paymentData ? paymentData.Bill[0] : "";
        console.log("paymentDetails-false-false",paymentDetails)
      }
    } 
    else {
      console.log("two");
      paymentDetails = paymentData ? paymentData.Bill[0] : "";
      console.log("paymentDetails-two--", paymentDetails);
    }
  }
  if (
    selectedComplaint &&
    selectedComplaint.bkApplicationStatus == "OFFLINE_INITIATED"
  ){
    paymentDetails =
      paymentData && paymentData !== null && paymentData !== undefined
        ? paymentData.Bill &&
          paymentData.Bill !== undefined &&
          paymentData.Bill !== null
          ? paymentData.Bill.length > 0
            ? paymentData.Bill[0]
            : "NA"
          : "NA"
        : "NA";
    if (paymentDetails !== "NA") {
      //paymentData.Bill[0].billDetails[0].billAccountDetails
      OfflineInitatePayArray =
        paymentData.Bill[0].billDetails !== undefined &&
        paymentData.Bill[0].billDetails !== null
          ? paymentData.Bill[0].billDetails !== undefined &&
            paymentData.Bill[0].billDetails !== null
            ? paymentData.Bill[0].billDetails.length > 0
              ? paymentData.Bill[0].billDetails[0].billAccountDetails !==
                  undefined &&
                paymentData.Bill[0].billDetails[0].billAccountDetails !== null
                ? paymentData.Bill[0].billDetails[0].billAccountDetails
                  ? paymentData.Bill[0].billDetails[0].billAccountDetails
                      .length > 0
                    ? paymentData.Bill[0].billDetails[0].billAccountDetails
                    : "NA"
                  : "NA"
                : "NA"
              : "NA"
            : "NA"
          : "NA";
    }

    if (
      OfflineInitatePayArray !== "NA" &&
      OfflineInitatePayArray !== undefined &&
      OfflineInitatePayArray !== null
    ) {
      if (selectedComplaint.bkBookingType == "Parks") {
        for (let i = 0; i < OfflineInitatePayArray.length; i++) {
          if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "PARKING_LOTS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            PACC = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CLEANING_CHRGS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            LUXURY_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "SECURITY_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            REFUNDABLE_SECURITY = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CGST_UTGST_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            PACC_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode == "PACC_ROUND_OFF"
          ) {
            PACC_ROUND_OFF = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "FACILITATION_CHRGS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            FACILITATION_CHARGE = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "PARK_LOCATION_AND_VENUE_CHANGE_AMOUNT"
          ) {
            DATEVENUECHARGE = OfflineInitatePayArray[i].amount;
          }
        }
      }

      if (selectedComplaint.bkBookingType == "Community Center") {
        for (let i = 0; i < OfflineInitatePayArray.length; i++) {
          if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "RENT_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            PACC = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CLEANING_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            LUXURY_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "SECURITY_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            REFUNDABLE_SECURITY = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CGST_UTGST_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            PACC_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode == "PACC_ROUND_OFF"
          ) {
            PACC_ROUND_OFF = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "FACILITATION_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            FACILITATION_CHARGE = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "COMMUNITY_LOCATION_AND_VENUE_CHANGE_AMOUNT"
          ) {
            DATEVENUECHARGE = OfflineInitatePayArray[i].amount;
          }
        }
      }
    }
  } 
  else {
    // paymentDetails =
    //   fetchPaymentAfterPayment &&
    //   fetchPaymentAfterPayment.Payments[0] &&
    //   fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill;

    let fetchPaymentAfterPaymentData = get(
      state,
      "bookings.fetchPaymentAfterPayment.Payments",
      "NotFound"
    );

    let AfterPaymentData = get(
      state,
      "bookings.paymentData",
      "NotFound"
    );
    console.log("fetchPaymentAfterPaymentData--000888",fetchPaymentAfterPaymentData)
    console.log("AfterPaymentDataAfterPaymentData",AfterPaymentData)

    if (fetchPaymentAfterPaymentData.length > 0 && fetchPaymentAfterPaymentData !=="NotFound") {
      console.log("comeInConditionOfIfTest")
      paymentDetails =
        fetchPaymentAfterPayment &&
        fetchPaymentAfterPayment.Payments[0] &&
        fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill;
        console.log("paymentDetails-One--", paymentDetails);
console.log("fetchPaymentAfterPayment",fetchPaymentAfterPayment)
    } 
    else {
      console.log("comeInElseConditionOfTestt")
      console.log("ppagalPagal",paymentData)
      paymentDetails =
      paymentData && paymentData !== null && paymentData !== undefined
        ? paymentData.Bill &&
          paymentData.Bill !== undefined &&
          paymentData.Bill !== null
          ? paymentData.Bill.length > 0
            ? paymentData.Bill[0]
            : "NA"
          : "NA"
        : "NA";
    if (paymentDetails !== "NA") {
      //paymentData.Bill[0].billDetails[0].billAccountDetails
      OfflineInitatePayArray =
        paymentData.Bill[0].billDetails !== undefined &&
        paymentData.Bill[0].billDetails !== null
          ? paymentData.Bill[0].billDetails !== undefined &&
            paymentData.Bill[0].billDetails !== null
            ? paymentData.Bill[0].billDetails.length > 0
              ? paymentData.Bill[0].billDetails[0].billAccountDetails !==
                  undefined &&
                paymentData.Bill[0].billDetails[0].billAccountDetails !== null
                ? paymentData.Bill[0].billDetails[0].billAccountDetails
                  ? paymentData.Bill[0].billDetails[0].billAccountDetails
                      .length > 0
                    ? paymentData.Bill[0].billDetails[0].billAccountDetails
                    : "NA"
                  : "NA"
                : "NA"
              : "NA"
            : "NA"
          : "NA";
    }

    if (
      OfflineInitatePayArray !== "NA" &&
      OfflineInitatePayArray !== undefined &&
      OfflineInitatePayArray !== null
    ) {
      if (selectedComplaint.bkBookingType == "Parks") {
        for (let i = 0; i < OfflineInitatePayArray.length; i++) {
          if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "PARKING_LOTS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            PACC = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CLEANING_CHRGS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            LUXURY_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "SECURITY_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            REFUNDABLE_SECURITY = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CGST_UTGST_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            PACC_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode == "PACC_ROUND_OFF"
          ) {
            PACC_ROUND_OFF = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "FACILITATION_CHRGS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
          ) {
            FACILITATION_CHARGE = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "PARK_LOCATION_AND_VENUE_CHANGE_AMOUNT"
          ) {
            DATEVENUECHARGE = OfflineInitatePayArray[i].amount;
          }
        }
      }

      if (selectedComplaint.bkBookingType == "Community Center") {
        for (let i = 0; i < OfflineInitatePayArray.length; i++) {
          if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "RENT_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            PACC = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CLEANING_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            LUXURY_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "SECURITY_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            REFUNDABLE_SECURITY = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "CGST_UTGST_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            PACC_TAX = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode == "PACC_ROUND_OFF"
          ) {
            PACC_ROUND_OFF = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "FACILITATION_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
          ) {
            FACILITATION_CHARGE = OfflineInitatePayArray[i].amount;
          } else if (
            OfflineInitatePayArray[i].taxHeadCode ==
            "COMMUNITY_LOCATION_AND_VENUE_CHANGE_AMOUNT"
          ) {
            DATEVENUECHARGE = OfflineInitatePayArray[i].amount;
          }
        }
      }
    }




    }


  }

  let refConAmount = fetchPaymentAfterPayment
    ? fetchPaymentAfterPayment
    : "NotFound";
  console.log("refConAmount", refConAmount);

  let ReceiptPaymentDetails = fetchPaymentAfterPayment;
  console.log("ReceiptPaymentDetails--", ReceiptPaymentDetails); //Payments[0].totalAmountPaid

  let amountTodisplay = 0;

  if (
    ReceiptPaymentDetails !== undefined &&
    ReceiptPaymentDetails !== null &&
    ReceiptPaymentDetails.Payments.length > 0
  ) {
    amountTodisplay = ReceiptPaymentDetails.Payments[0].totalAmountPaid;
  } else {
    let getAmount = get(
      state,
      "bookings.paymentData.Bill[0].totalAmount",
      "NotFound"
    );
    console.log("getAmount", getAmount);
    if (getAmount === "NotFound") {
      amountTodisplay = getAmount;
    }
  }

  //let offlinePayementMode = ReceiptPaymentDetails ? (ReceiptPaymentDetails.Payments[0].paymentMode ): "NotFound"
  let offlinePayementMode = ReceiptPaymentDetails
    ? ReceiptPaymentDetails.Payments.length > 0
      ? ReceiptPaymentDetails.Payments[0].paymentMode !== undefined &&
        ReceiptPaymentDetails.Payments[0].paymentMode !== null
        ? ReceiptPaymentDetails.Payments[0].paymentMode
        : "NotFound"
      : "NotFound"
    : "NotFound";
  console.log("offlinePayementMode--", offlinePayementMode);

  //transactionDate
  // let offlineTransactionDate = ReceiptPaymentDetails ? ReceiptPaymentDetails.Payments[0].transactionDate : "NotFound"
  let offlineTransactionDate =
    ReceiptPaymentDetails !== undefined && ReceiptPaymentDetails !== null
      ? ReceiptPaymentDetails.Payments.length > 0
        ? ReceiptPaymentDetails.Payments[0].transactionDate !== undefined &&
          ReceiptPaymentDetails.Payments[0].transactionDate !== null
          ? ReceiptPaymentDetails.Payments[0].transactionDate
          : "NotFound"
        : "NotFound"
      : "NotFound";
  console.log("offlineTransactionDate--", offlineTransactionDate);

  // let offlineTransactionNum = ReceiptPaymentDetails ? ReceiptPaymentDetails.Payments[0].transactionNumber : "NotFound"
  let offlineTransactionNum =
    ReceiptPaymentDetails !== undefined && ReceiptPaymentDetails !== null
      ? ReceiptPaymentDetails.Payments.length > 0
        ? ReceiptPaymentDetails.Payments[0].transactionNumber !== undefined &&
          ReceiptPaymentDetails.Payments[0].transactionNumber !== null
          ? ReceiptPaymentDetails.Payments[0].transactionNumber
          : "NotFound"
        : "NotFound"
      : "NotFound";
  console.log("offlineTransactionNum--", offlineTransactionNum);
  //receipt Number

  // let recNumber = ReceiptPaymentDetails ? ReceiptPaymentDetails.Payments[0].paymentDetails[0].receiptNumber : "NotFound"
  let recNumber =
    ReceiptPaymentDetails !== undefined && ReceiptPaymentDetails !== null
      ? ReceiptPaymentDetails.Payments.length > 0
        ? ReceiptPaymentDetails.Payments[0].paymentDetails[0].receiptNumber !==
            undefined &&
          ReceiptPaymentDetails.Payments[0].paymentDetails[0].receiptNumber !==
            null
          ? ReceiptPaymentDetails.Payments[0].paymentDetails[0].receiptNumber
          : "NotFound"
        : "NotFound"
      : "NotFound";
  console.log("recNumber--", recNumber);

  //ReceiptPaymentDetails.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails
  let billAccountDetailsArray =
    ReceiptPaymentDetails !== undefined && ReceiptPaymentDetails !== null
      ? ReceiptPaymentDetails.Payments.length > 0
        ? ReceiptPaymentDetails.Payments[0].paymentDetails[0].bill
            .billDetails[0].billAccountDetails
        : "NOt found Any Array"
      : "NOt found Any Array";
  console.log("billAccountDetailsArray--", billAccountDetailsArray);

  if (
    billAccountDetailsArray !== "NOt found Any Array" &&
    billAccountDetailsArray !== undefined &&
    billAccountDetailsArray !== null
  ) {
    if (selectedComplaint.bkBookingType == "Parks") {
      for (let i = 0; i < billAccountDetailsArray.length; i++) {
        if (
          billAccountDetailsArray[i].taxHeadCode ==
          "PARKING_LOTS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
        ) {
          //PACC
          PACC = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "CLEANING_CHRGS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
        ) {
          //LUXURY_TAX
          LUXURY_TAX = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "SECURITY_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
        ) {
          //REFUNDABLE_SECURITY
          REFUNDABLE_SECURITY = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "CGST_UTGST_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
        ) {
          //PACC_TAX
          PACC_TAX = billAccountDetailsArray[i].amount;
        } else if (billAccountDetailsArray[i].taxHeadCode == "PACC_ROUND_OFF") {
          PACC_ROUND_OFF = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "FACILITATION_CHRGS_MANUAL_OPEN_SPACE_BOOKING_BRANCH"
        ) {
          //FACILITATION_CHARGE
          FACILITATION_CHARGE = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "PARK_LOCATION_AND_VENUE_CHANGE_AMOUNT"
        ) {
          DATEVENUECHARGE = billAccountDetailsArray[i].amount;
        }
      }
    }

    if (selectedComplaint.bkBookingType == "Community Center") {
      for (let i = 0; i < billAccountDetailsArray.length; i++) {
        if (
          billAccountDetailsArray[i].taxHeadCode ==
          "RENT_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
        ) {
          //PACC
          PACC = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "CLEANING_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
        ) {
          //LUXURY_TAX
          LUXURY_TAX = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "SECURITY_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
        ) {
          //REFUNDABLE_SECURITY
          REFUNDABLE_SECURITY = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "CGST_UTGST_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
        ) {
          //PACC_TAX
          PACC_TAX = billAccountDetailsArray[i].amount;
        } else if (billAccountDetailsArray[i].taxHeadCode == "PACC_ROUND_OFF") {
          PACC_ROUND_OFF = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "FACILITATION_CHRGS_COMMUNITY_CENTRES_JHANJ_GHAR_BOOKING_BRANCH"
        ) {
          //FACILITATION_CHARGE
          FACILITATION_CHARGE = billAccountDetailsArray[i].amount;
        } else if (
          billAccountDetailsArray[i].taxHeadCode ==
          "COMMUNITY_LOCATION_AND_VENUE_CHANGE_AMOUNT"
        ) {
          DATEVENUECHARGE = billAccountDetailsArray[i].amount;
        }
      }
    }
  }

  let one = 0;
  let two = 0;
  let three = 0;
  let four = 0;
  let five = 0;
  let six = 0;
  if (billAccountDetailsArray !== "NOt found Any Array") {
    for (let i = 0; i < billAccountDetailsArray.length; i++) {
      if (billAccountDetailsArray[i].taxHeadCode == "PACC") {
        one = billAccountDetailsArray[i].amount;
      } else if (billAccountDetailsArray[i].taxHeadCode == "LUXURY_TAX") {
        two = billAccountDetailsArray[i].amount;
      } else if (
        billAccountDetailsArray[i].taxHeadCode == "REFUNDABLE_SECURITY"
      ) {
        three = billAccountDetailsArray[i].amount;
      } else if (billAccountDetailsArray[i].taxHeadCode == "PACC_TAX") {
        four = billAccountDetailsArray[i].amount;
      } else if (billAccountDetailsArray[i].taxHeadCode == "PACC_ROUND_OFF") {
        five = billAccountDetailsArray[i].amount;
      } else if (
        billAccountDetailsArray[i].taxHeadCode == "FACILITATION_CHARGE"
      ) {
        six = billAccountDetailsArray[i].amount;
      }
    }
  }
  if (billAccountDetailsArray !== "NOt found Any Array") {
    for (let i = 0; i < billAccountDetailsArray.length; i++) {
      if (billAccountDetailsArray[i].taxHeadCode == "PACC") {
        PACC = billAccountDetailsArray[i].amount;
      } else if (billAccountDetailsArray[i].taxHeadCode == "LUXURY_TAX") {
        LUXURY_TAX = billAccountDetailsArray[i].amount;
      } else if (
        billAccountDetailsArray[i].taxHeadCode == "REFUNDABLE_SECURITY"
      ) {
        REFUNDABLE_SECURITY = billAccountDetailsArray[i].amount;
      } else if (billAccountDetailsArray[i].taxHeadCode == "PACC_TAX") {
        PACC_TAX = billAccountDetailsArray[i].amount;
      } else if (billAccountDetailsArray[i].taxHeadCode == "PACC_ROUND_OFF") {
        PACC_ROUND_OFF = billAccountDetailsArray[i].amount;
      } else if (
        billAccountDetailsArray[i].taxHeadCode == "FACILITATION_CHARGE"
      ) {
        FACILITATION_CHARGE = billAccountDetailsArray[i].amount;
      }
    }
  }
  let historyApiData = {};
  if (historyObject) {
    historyApiData = historyObject;
  }

  // const role =
  //   roleFromUserInfo(userInfo.roles, "GRO") ||
  //   roleFromUserInfo(userInfo.roles, "DGRO")
  //     ? "ao"
  //     : roleFromUserInfo(userInfo.roles, "ESCALATION_OFFICER1") ||
  //       roleFromUserInfo(userInfo.roles, "ESCALATION_OFFICER2")
  //     ? "eo"
  //     : roleFromUserInfo(userInfo.roles, "CSR")
  //     ? "csr"
  //     : "employee";

  const role = "employee";

  let isAssignedToEmployee = true;
  if (selectedComplaint && businessService) {
    let details = {
      applicantName: selectedComplaint.bkApplicantName,
      roomsModel: selectedComplaint.roomsModel,
      status: selectedComplaint.bkApplicationStatus,
      applicationNo: selectedComplaint.bkApplicationNumber,
      address: selectedComplaint.bkCompleteAddress,
      bookingType: selectedComplaint.bkBookingType, //bkBookingType
      sector: selectedComplaint.bkSector,
      bkEmail: selectedComplaint.bkEmail,
      bkMobileNumber: selectedComplaint.bkMobileNumber,
      houseNo: selectedComplaint.bkHouseNo,
      dateCreated: selectedComplaint.bkDateCreated,
      areaRequired: selectedComplaint.bkAreaRequired,
      bkDuration: selectedComplaint.bkDuration,
      bkCategory: selectedComplaint.bkCategory,
      constructionType: selectedComplaint.bkConstructionType,
      villageCity: selectedComplaint.bkVillCity,
      residentialCommercial: selectedComplaint.bkType,
      businessService: selectedComplaint.businessService,
      bkConstructionType: selectedComplaint.bkConstructionType,
      bkFromDate: selectedComplaint.bkFromDate,
      bkToDate: selectedComplaint.bkToDate,
      bkBookingPurpose: selectedComplaint.bkBookingPurpose,
      bkDimension: selectedComplaint.bkDimension,
      bkLocation: selectedComplaint.bkLocation,
      tenantId: selectedComplaint.tenantId,
      bkBankAccountNumber: selectedComplaint.bkBankAccountNumber,
      bkNomineeName: selectedComplaint.bkNomineeName,
      bkBankName: selectedComplaint.bkBankName,
      bkIfscCode: selectedComplaint.bkIfscCode,
      bkAccountType: selectedComplaint.bkAccountType,
      bkBankAccountHolder: selectedComplaint.bkBankAccountHolder,
      bkSurchargeRent: selectedComplaint.bkSurchargeRent,
      bkRent: selectedComplaint.bkRent,
      bkUtgst: selectedComplaint.bkUtgst,
      bkCgst: selectedComplaint.bkCgst,
      refundableSecurityMoney: selectedComplaint.refundableSecurityMoney,
    };

    let transformedComplaint;
    if (applicationData != null && applicationData != undefined) {
      transformedComplaint = {
        complaint: details,
      };
    }
    const { localizationLabels } = state.app;
    const complaintTypeLocalised = getTranslatedLabel(
      `SERVICEDEFS.${transformedComplaint.complaint.complaint}`.toUpperCase(),
      localizationLabels
    );

    return {
      paymentDetails,
      offlineTransactionNum,
      recNumber,
      DownloadReceiptDetailsforPCC,
      refConAmount,
      RoomBookingDate,
      offlineTransactionDate,
      RoomApplicationNumber,
      totalNumber,
      typeOfRoom,
      roomFromDate,
      roomToDate,
      historyApiData,
      showRoomCard,
      roomData,
      DownloadPaymentReceiptDetails,
      paymentDetailsForReceipt,
      DownloadApplicationDetails,
      DownloadPermissionLetterDetails,
      documentMap,
      form,
      transformedComplaint,
      role,
      serviceRequestId,
      isAssignedToEmployee,
      complaintTypeLocalised,
      Downloadesamparkdetailspl,
      Downloadesamparkdetails,
      selectedComplaint,
      userInfo,
      PayMentOne,
      PayMentTwo,
      selectedNumber,
      offlinePayementMode,
      Difference_In_Days_check,
      first,
      PACC,
      LUXURY_TAX,
      REFUNDABLE_SECURITY,
      PACC_TAX,
      PACC_ROUND_OFF,
      DATEVENUECHARGE,
      FACILITATION_CHARGE,
      one,
      two,
      three,
      four,
      five,
      newRoomAppNumber,
      dataForBothSelection,
      roomsData,
      amountTodisplay,
      PaymentReceiptByESamp,DownloadCitizenPACCReceipt,
      EmpPaccPermissionLetter,DownloadCitizenPACCPermissionLetter,CitizenCCPermissionLetter,
      uploadeDocType,RefoundCGAmount
    };
  } else {
    return {
      dataForBothSelection,
      roomsData,
      DATEVENUECHARGE,
      uploadeDocType,
      paymentDetails,
      offlineTransactionNum,
      recNumber,
      DownloadReceiptDetailsforPCC,
      refConAmount,
      RoomBookingDate,
      amountTodisplay,
      offlinePayementMode,
      Difference_In_Days_check,
      first,
      showRoomCard,
      offlineTransactionDate,
      RoomApplicationNumber,
      totalNumber,
      typeOfRoom,
      roomFromDate,
      roomToDate,
      historyApiData,
      DownloadPaymentReceiptDetails,
      paymentDetailsForReceipt,
      DownloadApplicationDetails,
      DownloadPermissionLetterDetails,
      newRoomAppNumber,
      documentMap,
      form,
      transformedComplaint: {},
      role,
      serviceRequestId,
      isAssignedToEmployee,
      Downloadesamparkdetailspl,
      Downloadesamparkdetails,
      selectedComplaint,
      userInfo,
      PayMentOne,
      PayMentTwo,
      selectedNumber,
      PACC,
      LUXURY_TAX,
      REFUNDABLE_SECURITY,
      PACC_TAX,
      PACC_ROUND_OFF,
      FACILITATION_CHARGE,
      one,
      two,
      three,
      four,
      five,
      six,
      roomData,
      PaymentReceiptByESamp,DownloadCitizenPACCReceipt,
      EmpPaccPermissionLetter,DownloadCitizenPACCPermissionLetter,CitizenCCPermissionLetter,RefoundCGAmount
    };
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchApplications: (criteria) => dispatch(fetchApplications(criteria)), //fetchResponseForRefdunf
    // fetchResponseForRefdunf: criteria => dispatch(fetchResponseForRefdunf(criteria)),
    fetchPayment: (criteria) => dispatch(fetchPayment(criteria)),
    fetchDataAfterPayment: (criteria) =>
      dispatch(fetchDataAfterPayment(criteria)), //citizenCommunityPL  
      citizenCommunityPL: (criteria) =>
      dispatch(citizenCommunityPL(criteria)),
    downloadEsampPaymentReceipt: (criteria) =>
      dispatch(downloadEsampPaymentReceipt(criteria)),
      PaccCitizenPaymentRecpt: (criteria) =>
      dispatch(PaccCitizenPaymentRecpt(criteria)),
    downloadPaccPermissionLetter: (criteria) =>
      dispatch(downloadPaccPermissionLetter(criteria)),
      PaccCitizenPermissionLetter: (criteria) =>
      dispatch(PaccCitizenPermissionLetter(criteria)),
    downloadReceiptForPCC: (criteria) =>
      dispatch(downloadReceiptForPCC(criteria)),
    downloadPLForPCC: (criteria) => dispatch(downloadPLForPCC(criteria)),
    downloadAppForPCC: (criteria) => dispatch(downloadAppForPCC(criteria)),
    fetchHistory: (criteria) => dispatch(fetchHistory(criteria)),
    resetFiles: (formKey) => dispatch(resetFiles(formKey)),
    sendMessage: (message) => dispatch(sendMessage(message)),
    sendMessageMedia: (message) => dispatch(sendMessageMedia(message)),
    prepareFormData: (jsonPath, value) =>
      dispatch(prepareFormData(jsonPath, value)),
    prepareFinalObject: (jsonPath, value) =>
      dispatch(prepareFinalObject(jsonPath, value)),
    downloadEsamparkApp: (criteria) => dispatch(downloadEsamparkApp(criteria)),
    downloadEsamparkPL: (criteria) => dispatch(downloadEsamparkPL(criteria)),
    toggleSnackbarAndSetText: (open, message, error) =>
      dispatch(toggleSnackbarAndSetText(open, message, error)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationDetails);
