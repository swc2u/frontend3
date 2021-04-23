import React, { Component } from "react";
import { Details } from "modules/common";
import { ComplaintTimeLine } from "modules/common";
import { Comments } from "modules/common";
import { ActionButton } from "modules/common";
import { Icon, MapLocation, ShareButton } from "components";
import CommonShare from "egov-ui-kit/components/CommonShare";
import { Screen } from "modules/common";
import pinIcon from "egov-ui-kit/assets/Location_pin.svg";
import { resetFiles } from "egov-ui-kit/redux/form/actions";
import { Button, TextField } from "components";
import ShareIcon from "@material-ui/icons/Share";
import get from "lodash/get"; 
import Footer from "../../modules/footer"
import isEqual from "lodash/isEqual";
import Label from "egov-ui-kit/utils/translationNode"; 
import { httpRequest } from "egov-ui-kit/utils/api";
import { prepareFormData } from "egov-ui-kit/redux/common/actions";
import { getTenantId } from "egov-ui-kit/utils/localStorageUtils";
import CGAppDetails from "../AllApplications/components/CGAppDetails"
import PaymentDetails from "../AllApplications/components/PaymentDetails"
import CGPaymentDetails from "../AllApplications/components/CGPaymentDetails"
import CGBookingDetails from "../AllApplications/components/CGBookingDetails"
import DocumentPreview from "../AllApplications/components/DocumentPreview"
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import DownloadFileContainer from "../../modules/DownloadFileContainer";
import jp from "jsonpath";
import ApproveCancellation from "../CancelledAppApproved";
import RejectCancellation from "../CancelledAppReject";
import RefundCard from "../ParkAndCommunityCenterAppDetails/components/RefundCard"
import ViewBankDetails  from "../ParkAndCommunityCenterAppDetails/components/ViewBankDetails"

// import {
// 	getQueryArg,
// 	setBusinessServiceDataToLocalStorage,
// 	getFileUrlFromAPI,
// 	setDocuments
// } from "egov-ui-framework/ui-utils/commons";
import {
	getDateFromEpoch,
	mapCompIDToName,
	isImage,
	fetchImages,
	returnSLAStatus,
	getPropertyFromObj,
	findLatestAssignee,
	getTranslatedLabel
} from "egov-ui-kit/utils/commons";
import {
	fetchApplications, fetchPayment, fetchperDayRate,fetchHistory, fetchDataAfterPayment,downloadPaymentReceiptforCG,downloadReceiptforCG,
	sendMessage,downloadLetterforCG,
	sendMessageMedia,downloadPermissionLetterforCG,downloadApplicationforCG
} from "egov-ui-kit/redux/bookings/actions";
import { connect } from "react-redux";

import "./index.css";

import { convertEpochToDate, getDurationDate,getFileUrlFromAPI} from '../../modules/commonFunction'
import DialogContainer from "../../modules/DialogContainer";
import ActionButtonDropdown from "../../modules/ActionButtonDropdown"
class CGApplicationDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			openMap: false,
			docFileData: [],
			bookingType:'',
			rSector:'',
            rCategormy:'',
			togglepopup: false,
			actionTittle: "",
			actionOnApplication: "",
		};
	};

	componentDidMount = async () => {
		let {
			fetchApplications,
			fetchHistory,
			fetchPayment,fetchperDayRate,
			fetchDataAfterPayment,downloadReceiptforCG,downloadPaymentReceiptforCG,downloadLetterforCG,downloadPermissionLetterforCG,downloadApplicationforCG,
			match,
			resetFiles,
			transformedComplaint,
			prepareFormData,
			userInfo,
			documentMap,
			prepareFinalObject
		} = this.props;

		prepareFormData("complaints", transformedComplaint);

		const { complaint } = transformedComplaint;

    await fetchApplications(
			{
				"applicationNumber": match.params.applicationId, 'uuid': userInfo.uuid,
				"applicationStatus": "",
				"mobileNumber": "", "bookingType": "",
				"tenantId":userInfo.tenantId
			}
		);
		fetchHistory([
			{ key: "businessIds", value: match.params.applicationId }, { key: "history", value: true }, { key: "tenantId", value: userInfo.tenantId }])
		
		fetchPayment(
			[{ key: "consumerCode", value: match.params.applicationId }, { key: "businessService", value: "BOOKING_BRANCH_SERVICES.BOOKING_COMMERCIAL_GROUND" }, { key: "tenantId", value: userInfo.tenantId }
			])
		fetchDataAfterPayment(
			[{ key: "consumerCodes", value: match.params.applicationId }, { key: "tenantId", value: userInfo.tenantId }
			])
		
		let complaintCountRequest = 
			{
				"applicationNumber": match.params.applicationId, 'uuid': userInfo.uuid,
				"applicationStatus": "",
				"mobileNumber": "", "bookingType": "","tenantId" : userInfo.tenantId
			}
		  
		let dataforSectorAndCategory = await httpRequest( 	
			"bookings/api/employee/_search",
		    "_search",[],
		    complaintCountRequest
		  );
		
		let venueData = dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList ? dataforSectorAndCategory.bookingsModelList[0].bkBookingVenue : 'NA'
        let categoryData = dataforSectorAndCategory && dataforSectorAndCategory.bookingsModelList ? dataforSectorAndCategory.bookingsModelList[0].bkCategory : 'NA'
		

    fetchperDayRate({	
				bookingVenue:venueData ,
	          	category:categoryData
			});
	}
	
	actionButtonOnClick = async (e, complaintNo, label) => {
		const { prepareFinalObject } = this.props;
		let { match, userInfo, selectedComplaint } = this.props;
		if (label == "APPROVED") {
		  this.setState({
			actionTittle: "Approve Application",
		  });
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
	
	

	componentWillReceiveProps = async (nextProps) =>  {
		const { transformedComplaint, prepareFormData } = this.props;
		if (!isEqual(transformedComplaint, nextProps.transformedComplaint)) {
			prepareFormData("complaints", nextProps.transformedComplaint);
		}
	}


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

	btnOneOnClick = (e,complaintNo, label) => {
	
		
		let { history } = this.props;
		if (e.target.value=="REJECTED") {
				history.push(`/reject-booking/${complaintNo}`);
		}else if(e.target.value=='APPROVED'){
			history.push(`/booking-resolved/${complaintNo}`);

		}		
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
	downloadPermissionLetterFunction = async (e) => {
		
		const { transformedComplaint,paymentDetails,downloadPermissionLetterforCG,userInfo } = this.props;
		
		var date2 = new Date();

		var generatedDateTime = `${date2.getDate()}-${date2.getMonth() + 1}-${date2.getFullYear()}, ${date2.getHours()}:${date2.getMinutes() < 10 ? "0" : ""}${date2.getMinutes()}`;
	

		const {complaint} = transformedComplaint;
		let receiptData = [
			{
				applicantDetail: {
					name: complaint.applicantName,
					mobileNumber: complaint.bkMobileNumber,
					houseNo: complaint.houseNo,
					permanentAddress: complaint.address,
					permanentCity: complaint.villageCity,
					sector: complaint.sector,
				},
				bookingDetail: {
					applicationNumber:
					complaint.applicationNo,
					applicationDate: convertEpochToDate(
						complaint.dateCreated,"dayend"
					),
					bookingPeriod: getDurationDate(
						complaint.bkFromDate,
						complaint.bkToDate
					),
					groundName:complaint.sector
				},
				generatedBy: {
					generatedBy: userInfo.name,
					"generatedDateTime":generatedDateTime
				},
			}]
	
			downloadPermissionLetterforCG({BookingInfo:receiptData})
	
	
	}


downloadPaymentReceiptFunction = async (e) => {
	const { transformedComplaint, paymentDetailsForReceipt, downloadPaymentReceiptforCG, userInfo, paymentDetails } = this.props;
	const { complaint } = transformedComplaint;
	let receiptData = [
		{
			applicantDetail: {
				name: complaint.applicantName,
				mobileNumber: complaint.bkMobileNumber,
				houseNo: complaint.houseNo,
				permanentAddress: complaint.address,
				permanentCity: complaint.villageCity,
				sector: complaint.sector,
				permanentCity: "ch"
			},
			bookingDetail: {
				applicationNumber:
				complaint.applicationNo,
				applicationDate: convertEpochToDate(
					complaint.dateCreated,"dayend"
				),
				bookingPeriod: getDurationDate(
					complaint.bkFromDate,
					complaint.bkToDate
				),
				groundName:complaint.sector
			},
			generatedBy: {
				generatedBy: userInfo.name,
			},
			approvedBy: {
				approvedBy: "Renil Commissioner",
				role: "Additional Commissioner"
			  },
			  tenantInfo: {
				municipalityName: "Municipal Corporation Chandigarh",
				address: "New Deluxe Building, Sector 17, Chandigarh",
				contactNumber: "+91-172-2541002, 0172-2541003",
				logoUrl: "https://chstage.blob.core.windows.net/fileshare/logo.png",
				webSite: "http://mcchandigarh.gov.in"
			  }
		}]
	downloadPaymentReceiptforCG({BookingInfo:receiptData})
}


downloadApplicationFunction = async (e) => {
const { transformedComplaint,paymentDetails,downloadApplicationforCG,paymentDetailsForReceipt,userInfo } = this.props;

const {complaint} = transformedComplaint;

let BookingInfo = [{
	"applicantDetail": {
		"name": complaint && complaint.applicantName ? complaint.applicantName : 'NA',
		"mobileNumber": complaint && complaint.bkMobileNumber ? complaint.bkMobileNumber : '',
		"houseNo": complaint && complaint.houseNo ? complaint.houseNo : '',
		"permanentAddress": complaint && complaint.address ? complaint.address : '',
		"permanentCity": complaint && complaint.villageCity ? complaint.villageCity : '',
		"sector": complaint && complaint.sector ? complaint.sector : '',
		"fatherName":complaint.bkFatherName,
		"DOB": null,
		"email":complaint.bkEmail,
	},
	"bookingDetail": {
		"applicationNumber":complaint.applicationNo,
		"venue": complaint.sector,
        "bookingCategory": complaint.bkCategory,
        "bookingPeriod": getDurationDate(
			complaint.bkFromDate,
			complaint.bkToDate
		),
        "bookingPurpose": complaint.bkBookingPurpose
	},
	"feeDetail": {
		// "baseCharge": paymentDetailsForReceipt.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.filter(
		// 	(el) => !el.taxHeadCode.includes("TAX")
		// )[0].amount,
		// "taxes": paymentDetailsForReceipt.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.filter(
		// 	(el) => el.taxHeadCode.includes("TAX")
		// )[0].amount,
		"baseCharge": this.props.CommercialParkingCharges,
			// "tax": paymentDetailsForReceipt.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.filter(
			// 	(el) => el.taxHeadCode.includes("TAX")
			// )[0].amount,
			"taxes": this.props.CommercialTaxes,
		"totalAmount": paymentDetailsForReceipt.Payments[0].totalAmountPaid,
	},
	generatedBy: {
		generatedBy: userInfo.name,
	},
}
]
downloadApplicationforCG({BookingInfo:BookingInfo})
}


downloadApplicationButton = async (e) => {
	await this.downloadApplicationFunction();
	let documentsPreviewData;
	const { DownloadApplicationDetailsforCG,userInfo } = this.props;
	
	var documentsPreview = [];
	if (DownloadApplicationDetailsforCG && DownloadApplicationDetailsforCG.filestoreIds.length > 0) {

		 documentsPreviewData=DownloadApplicationDetailsforCG.filestoreIds[0];

		documentsPreview.push({
			title: "DOC_DOC_PICTURE",
			fileStoreId: documentsPreviewData,
			linkText: "View",
		});
		let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
		let fileUrls =
			fileStoreIds.length > 0 ? await getFileUrlFromAPI(fileStoreIds,userInfo.tenantId) : {};
	

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
		prepareFinalObject('documentsPreview', documentsPreview)
	}
}


downloadReceiptButton = async (e) => {
	
	await this.downloadReceiptFunction();

	
	let documentsPreviewData;
	const { DownloadReceiptDetailsforCG,userInfo } = this.props;
	
	var documentsPreview = [];
	if (DownloadReceiptDetailsforCG && DownloadReceiptDetailsforCG.filestoreIds.length > 0) {
		 documentsPreviewData=DownloadReceiptDetailsforCG.filestoreIds[0];
		

		documentsPreview.push({
			title: "DOC_DOC_PICTURE",
			fileStoreId: documentsPreviewData,
			linkText: "View",
		});
		let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
		let fileUrls =
			fileStoreIds.length > 0 ? await getFileUrlFromAPI(fileStoreIds,userInfo.tenantId) : {};
		

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
		prepareFinalObject('documentsPreview', documentsPreview)
	}
}

downloadReceiptFunction = async (e) => {
	const { transformedComplaint, paymentDetailsForReceipt, downloadPaymentReceiptforCG,downloadReceiptforCG, userInfo, paymentDetails } = this.props;
	const { complaint } = transformedComplaint;

	var date2 = new Date();

	var generatedDateTime = `${date2.getDate()}-${date2.getMonth() + 1}-${date2.getFullYear()}, ${date2.getHours()}:${date2.getMinutes() < 10 ? "0" : ""}${date2.getMinutes()}`;


	let BookingInfo = [{
		"applicantDetail": {
			"name": complaint && complaint.applicantName ? complaint.applicantName : 'NA',
			"mobileNumber": complaint && complaint.bkMobileNumber ? complaint.bkMobileNumber : '',
			"houseNo": complaint && complaint.houseNo ? complaint.houseNo : '',
			"permanentAddress": complaint && complaint.address ? complaint.address : '',
			"permanentCity": complaint && complaint.villageCity ? complaint.villageCity : '',
			"sector": complaint && complaint.sector ? complaint.sector : ''
		},
		"booking": {
			"bkApplicationNumber": complaint && complaint.applicationNo ? complaint.applicationNo : ''
		},
		"paymentInfo": {
			"paymentDate": paymentDetailsForReceipt && convertEpochToDate(paymentDetailsForReceipt.Payments[0].transactionDate, "dayend"),
			"transactionId": paymentDetailsForReceipt && paymentDetailsForReceipt.Payments[0].transactionNumber,
			"bookingPeriod": getDurationDate(
				complaint.bkFromDate,
				complaint.bkToDate
			),
			"bookingItem": "Online Payment Against Booking of Commercial Ground",//
			// "amount": paymentDetailsForReceipt.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.filter(
			// 	(el) => !el.taxHeadCode.includes("TAX")
			// )[0].amount, 
			"amount": this.props.CommercialParkingCharges,
			// "tax": paymentDetailsForReceipt.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.filter(
			// 	(el) => el.taxHeadCode.includes("TAX")
			// )[0].amount,
			"tax": this.props.CommercialTaxes,
			"grandTotal": paymentDetailsForReceipt.Payments[0].totalAmountPaid,
			"amountInWords": this.NumInWords(
				paymentDetailsForReceipt.Payments[0].totalAmountPaid
			),
			paymentItemExtraColumnLabel: "Booking Period",
			paymentMode:
				paymentDetailsForReceipt.Payments[0].paymentMode,
			receiptNo:
				paymentDetailsForReceipt.Payments[0].paymentDetails[0]
					.receiptNumber,
		},
		payerInfo: {
			payerName: paymentDetailsForReceipt.Payments[0].payerName,
			payerMobile:
				paymentDetailsForReceipt.Payments[0].mobileNumber,
		},
		generatedBy: {
			generatedBy: userInfo.name,
			"generatedDateTime":generatedDateTime
		},
	}
	]
	downloadReceiptforCG({BookingInfo: BookingInfo})
}

downloadPaymentReceiptButton = async (e) => {
	
	await this.downloadPaymentReceiptFunction();

	let documentsPreviewData;
	const { DownloadPaymentReceiptDetailsforCG,userInfo } = this.props;
	
	var documentsPreview = [];
	if (DownloadPaymentReceiptDetailsforCG && DownloadPaymentReceiptDetailsforCG.filestoreIds.length > 0) {
		 documentsPreviewData=DownloadPaymentReceiptDetailsforCG.filestoreIds[0];

		documentsPreview.push({
			title: "DOC_DOC_PICTURE",
			fileStoreId: documentsPreviewData,
			linkText: "View",
		});
		let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
		let fileUrls =
			fileStoreIds.length > 0 ? await getFileUrlFromAPI(fileStoreIds,userInfo.tenantId) : {};
	

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
		prepareFinalObject('documentsPreview', documentsPreview)
	}



}

callApiDorData = async (e) =>  {

const {documentMap,userInfo}=this.props;

		var documentsPreview = [];
		if (documentMap && Object.keys(documentMap).length > 0) {
			let keys = Object.keys(documentMap);
			let values = Object.values(documentMap);
			let id = keys[0],
				fileName = values[0];

			documentsPreview.push({
				title: "DOC_DOC_PICTURE",
				fileStoreId: id,
				linkText: "View",
			});
			let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
			let fileUrls =
				fileStoreIds.length > 0 ? await getFileUrlFromAPI(fileStoreIds,userInfo.tenantId) : {};

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
			prepareFinalObject('documentsPreview', documentsPreview)
		}


		
	}

	callApiForDocumentData = async (e) => {
		const { documentMap,userInfo } = this.props;
		var documentsPreview = [];
		console.log("document--",documentMap)
		if (documentMap && Object.keys(documentMap).length > 0) {
			let keys = Object.keys(documentMap);
			console.log("keys--",keys)
			console.log("Types--keys--",typeof(keys))
			let values = Object.values(documentMap);
			console.log("values--values",values)
			let id = keys[0]
			console.log("id--cg",id);
			let	fileName = values[0];
            console.log("fileName--",fileName)
			documentsPreview.push({
				title: "DOC_DOC_PICTURE",
				fileStoreId: id,
				linkText: "View",
			});
			let changetenantId = userInfo.tenantId ? userInfo.tenantId.split(".")[0] : "ch";
			let fileStoreIds = jp.query(documentsPreview, "$.*.fileStoreId");
			let fileUrls =
				fileStoreIds.length > 0 ? await getFileUrlFromAPI(fileStoreIds,changetenantId) : {};
		

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
			prepareFinalObject('documentsPreview', documentsPreview)
		}



	}

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
		  "bkCategory": selectedComplaint.bkCategory,
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
		  "financialYear": "2020-2021",
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
	  

	render() {
		const dropbordernone = {
			float: "right",
			paddingRight: "20px"
		
		};
		let { shareCallback } = this;
		let { comments, openMap } = this.state;
		let { complaint, timeLine } = this.props.transformedComplaint;
		let { documentMap } = this.props;
		let { historyApiData, paymentDetails, perDayRupees, match, userInfo } = this.props;
		let {
			role,
			serviceRequestId,
			history,
			isAssignedToEmployee,
			reopenValidChecker
		} = this.props;
		let btnOneLabel = "";
		let btnTwoLabel = "";
		let action;
		let complaintLoc = {};
		
let checkDocumentUpload = Object.entries(documentMap).length === 0;
console.log("checkDocumentUpload",checkDocumentUpload)

const foundTenthLavel =
userInfo && userInfo.roles.some((el) => el.code === "BK_MCC_USER"); 
console.log("foundTenthLavel",foundTenthLavel)

const foundFirstLavel =
userInfo &&
userInfo.roles.some(
  (el) => el.code === "BK_CLERK" || el.code === "BK_DEO"
);
console.log("foundFirstLavel",foundFirstLavel)

		if (complaint) {
			// if (role === "ao") {
			// 	if (complaint.complaintStatus.toLowerCase() === "unassigned") {
			// 		btnOneLabel = "ES_REJECT_BUTTON";
			// 		btnTwoLabel = "ES_COMMON_ASSIGN";
			// 	} else if (complaint.complaintStatus.toLowerCase() === "reassign") {
			// 		btnOneLabel = "ES_REJECT_BUTTON";
			// 		btnTwoLabel = "ES_COMMON_REASSIGN";
			// 	} else if (complaint.complaintStatus.toLowerCase() === "assigned") {
			// 		btnTwoLabel = "ES_COMMON_REASSIGN";
			// 	}
			// 	else if (complaint.complaintStatus.toLowerCase() === "escalated") {
			// 		btnOneLabel = "ES_REJECT_BUTTON";
			// 		btnTwoLabel = "ES_RESOLVE_MARK_RESOLVED";
			// 	}
			// } else if (role == "eo") {
			// 	if (complaint.status.toLowerCase() === "escalatedlevel1pending" ||
			// 		complaint.status.toLowerCase() === "escalatedlevel2pending") {
			// 		btnOneLabel = "ES_REJECT_BUTTON";
			// 		btnTwoLabel = "ES_RESOLVE_MARK_RESOLVED";
			// 	}
			// 	else if (complaint.status.toLowerCase() === "assigned") {
			// 		btnOneLabel = "ES_REQUEST_REQUEST_RE_ASSIGN";
			// 		btnTwoLabel = "ES_RESOLVE_MARK_RESOLVED";
			// 	}
			// }
			if (role === "employee") {
				btnOneLabel = "BK_MYBK_REJECT_BUTTON";
				btnTwoLabel = "BK_MYBK_RESOLVE_MARK_RESOLVED";
				
			}
		}
		if (timeLine && timeLine[0]) {
			action = timeLine[0].action;
		}
		return (
			<div>
				<Screen>
				{complaint && !openMap && (
						<div>
							<div className="form-without-button-cont-generic">
								<div className="container" >
									<div className="row">
										<div className="col-12 col-md-6" style={{fontSize: 'x-large'}}>
											
Application Details
										</div>
										<div className="col-12 col-md-6 row">
										<div class="col-12 col-md-6 col-sm-3" >
										<ActionButtonDropdown data={{
									label: { labelName: "Download ", labelKey: "BK_COMMON_DOWNLOAD_ACTION" },
									rightIcon: "arrow_drop_down",
									leftIcon: "cloud_download",
									props: {
										variant: "outlined",
										style: { marginLeft: 5, marginRight: 15, color: "#FE7A51", height: "60px" }, className: "tl-download-button"
									},
									menu: [{


										label: {
											labelName: "PermissionLetter",
											labelKey: "BK_MYBK_DOWNLOAD_PERMISSION_LETTER"
										},
										leftIcon: "book",
										link: () => this.downloadPaymentReceiptButton('Receipt')
									},
									{
										label: {
											labelName: "Receipt",
											labelKey: "BK_MYBK_DOWNLOAD_RECEIPT"
										},
										leftIcon: "receipt",

										link: () => this.downloadReceiptButton('PermissionLetter')
									},
									{
										label: {
											labelName: "Application",
											labelKey: "BK_MYBK_DOWNLOAD_APPLICATION"
										},
										leftIcon:"assignment",
										 link: () => this.downloadApplicationButton('Application')
									}]
								}} />
								</div>
								<div class="col-12 col-md-6 col-sm-3" >
										<ActionButtonDropdown data={{
									label: { labelName: "Print", labelKey: "BK_COMMON_PRINT_ACTION" },
									rightIcon: "arrow_drop_down",
									leftIcon: "print",
									props: {
										variant: "outlined",
										style: { marginLeft: 5, marginRight: 15, color: "#FE7A51", height: "60px" }, className: "tl-download-button"
									},
									menu: [{


										label: {
											labelName: "PermissionLetter",
											labelKey: "BK_MYBK_DOWNLOAD_PERMISSION_LETTER"
										},
										leftIcon: "book",
										link: () => this.downloadPaymentReceiptButton('Receipt')
									},
									{
										label: {
											labelName: "Receipt",
											labelKey: "BK_MYBK_DOWNLOAD_RECEIPT"
										},
										leftIcon: "receipt",

										link: () => this.downloadReceiptButton('PermissionLetter')
									},
									{
										label: {
											labelName: "Application",
											labelKey: "BK_MYBK_DOWNLOAD_APPLICATION"
										},
										leftIcon:"assignment",
										 link: () => this.downloadApplicationButton('Application')
									}]
								}} />

</div>
										</div>
									</div>
								</div>

								<CGPaymentDetails  
	paymentDetails={paymentDetails && paymentDetails}
	perDayRupees={perDayRupees && perDayRupees}
	CommercialcleaningCharge={this.props.CommercialcleaningCharge}//1
	CommercialFaciliCharges={this.props.CommercialFaciliCharges}//2
	CommercialSecurityCharges={this.props.CommercialSecurityCharges}//3
	CommercialTaxes={this.props.CommercialTaxes}//4
	CommercialParkingCharges={this.props.CommercialParkingCharges}//5
/>

{this.props.selectedComplaint.bkApplicationStatus == "PENDING_FOR_APPROVAL_CLEARK_DEO" || this.props.selectedComplaint.bkApplicationStatus == "REFUND_APPROVED" ? (
                  <RefundCard
				  CGRefundAmount = {this.props.CommercialSecurityCharges}
				  refundableSecurityMoney={
					this.props.selectedComplaint.refundableSecurityMoney
	 			  }
				  selectedComplaint={this.props.selectedComplaint}
                  />
                ) : (
                  " "
                )}

								<CGAppDetails
									{...complaint}
								/>
 
                              <CGBookingDetails
									{...complaint}
								/> 
                                 
								< ViewBankDetails 
							    	{...complaint}
									bkBankAccountNumber={this.props.selectedComplaint.bkBankAccountNumber}
									bkBankName={this.props.selectedComplaint.bkBankName}
									bkIfscCode={this.props.selectedComplaint.bkIfscCode}
									bkAccountType={this.props.selectedComplaint.bkAccountType}
									bkBankAccountHolder={this.props.selectedComplaint.bkBankAccountHolder}
								/>

                             <div style={{
									height: "100px",
									width: "100",
									backgroundColor: "white",
									border: "2px solid white",
									boxShadow: "0 0 2px 2px #e7dcdc", paddingLeft: "30px", paddingTop: "10px"
								}}><b>Documents</b><br></br>

									{documentMap && Object.values(documentMap) ? Object.values(documentMap) : "Not found"}
									{checkDocumentUpload == true ? " ":<button className="ViewDetailButton" data-doc={documentMap} onClick={(e) => { this.callApiForDocumentData(e) }}>VIEW</button>}
                        		</div>
							</div>



							{role === "employee" && this.props.first == true &&complaint.status == "APPLIED" && complaint.businessService == "GFCP" && this.props.RefoundCGAmount > 0 &&
                  foundTenthLavel && (
                    <Footer
                      className="apply-wizard-footer"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      children={
                        <div
                          className="col-sm-12 col-xs-12"
                          style={{ textAlign: "right" }}
                        >
							{console.log("hello come In footer condition",this.props.RefoundCGAmount)}
                          {/*Security Refund*/}  
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
                        </div>
                      }
                    ></Footer>
                  )}


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
                        selectedComplaint={this.props.selectedComplaint}
                         userInfo={userInfo}
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


let gro = "";
const mapStateToProps = (state, ownProps) => {
	const { bookings, common, auth, form } = state;
	const { applicationData } = bookings;
	const {DownloadPaymentReceiptDetailsforCG}=bookings;
	const {DownloadPermissionLetterDetailsforCG}=bookings;
	const {DownloadApplicationDetailsforCG,DownloadReceiptDetailsforCG}=bookings;
	const { id } = auth.userInfo;
	const { citizenById } = common || {};
	const { employeeById, departmentById, designationsById, cities } =
		common || {};
	// const { categoriesById } = complaints;
	const { userInfo } = state.auth;
	const serviceRequestId = ownProps.match.params.applicationId;
	let selectedComplaint = applicationData ? applicationData.bookingsModelList[0] : ''
	let businessService = applicationData ? applicationData.businessService : "";
	let bookingDocs;
	const { documentMap } = applicationData;
	const { HistoryData } = bookings;
	let temp;
	let historyObject = HistoryData ? HistoryData : ''
	const { paymentData } = bookings;
	const { fetchPaymentAfterPayment } = bookings;
	console.log("fetchPaymentAfterPayment-123-comm",fetchPaymentAfterPayment)
	const { perDayRate } = bookings;
	let paymentDetailsForReceipt = fetchPaymentAfterPayment;
	let paymentDetails;  //bookings.paymentData.Bill[0].billDetails[0].billAccountDetails
	let perDayRupees;

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

  let RefoundCGAmount = 0;
  let getChargesArray;
  let cgSecurityAmount
  if(selectedComplaint.bkBookingType == "GROUND_FOR_COMMERCIAL_PURPOSE"){
	 cgSecurityAmount = get(
	  state,
	  "bookings.fetchPaymentAfterPayment.Payments",
	  "NotFound"
	);
	// bookings.fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails[2].taxHeadCode

	console.log("cgSecurityAmount",cgSecurityAmount)
	if(cgSecurityAmount !== "NotFound"){
console.log("comeInCheckNotFoundCondition")
		getChargesArray = bookings.fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails

		let cgSecurityAmount2 = get(
			state,
			"bookings.fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails",
			"NotFound"
		  );
console.log("cgSecurityAmount2",cgSecurityAmount2)
		// getChargesArray =  cgSecurityAmount !== null && cgSecurityAmount !== undefined &&  cgSecurityAmount.length > 0 ? 
		//      (cgSecurityAmount[0].paymentDetails !== null && cgSecurityAmount[0].paymentDetails !== undefined && cgSecurityAmount[0].paymentDetails.length >0 ?
		// 	 (cgSecurityAmount[0].paymentDetails[0].bill !== null && cgSecurityAmount[0].paymentDetails[0].bill !== undefined ? 
		// 	(cgSecurityAmount[0].paymentDetails[0].bill.billDetails != null && cgSecurityAmount[0].paymentDetails[0].bill.billDetails != undefined && cgSecurityAmount[0].paymentDetails[0].bill.billDetails.length > 0 ?	
		// 	(cgSecurityAmount[0].paymentDetails[0].bill.billDetails.billAccountDetails !== null && cgSecurityAmount[0].paymentDetails[0].bill.billDetails.billAccountDetails !== undefined && cgSecurityAmount[0].paymentDetails[0].bill.billDetails.billAccountDetails.length > 0 ? 
		// 	(cgSecurityAmount[0].paymentDetails[0].bill.billDetails.billAccountDetails): "NotFound"): "NotFound") :"NotFound") : "NotFound" ): "NotFound"
            console.log("getChargesArray",getChargesArray)

for(let i = 0; i < getChargesArray.length; i++){
	if(getChargesArray[i].taxHeadCode == "SECURITY_COMMERCIAL_GROUND_BOOKING_BRANCH"){
		console.log("getChargesArray[i].taxHeadCode",getChargesArray[i].taxHeadCode)
		console.log("getChargesArray[i]",getChargesArray[i])
		RefoundCGAmount = getChargesArray[i].amount
		console.log("RefoundCGAmount-in-loop",RefoundCGAmount)
	}
}
console.log("RefoundCGAmount",RefoundCGAmount)
	}
}

let OfflineInitatePayArray;
//Variables to show Amount
let CommercialcleaningCharge = 0;
let CommercialFaciliCharges = 0;
let CommercialSecurityCharges = 0;
let CommercialTaxes = 0;
let CommercialParkingCharges = 0;//CommercialcleaningCharge,CommercialFaciliCharges,CommercialSecurityCharges,CommercialTaxes,CommercialParkingCharges
	if (selectedComplaint && selectedComplaint.bkApplicationStatus == "APPLIED" || selectedComplaint && selectedComplaint.bkApplicationStatus == "PENDING_FOR_APPROVAL_CLEARK_DEO") {
//bookings.fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill
//bookings.fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails

paymentDetails = fetchPaymentAfterPayment && fetchPaymentAfterPayment.Payments[0] && fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill ;
console.log("paymentDetails-1",paymentDetails)

OfflineInitatePayArray = paymentDetails !== undefined && paymentDetails !== null ? 
(paymentDetails.billDetails !== undefined && paymentDetails.billDetails !== null ? (paymentDetails.billDetails.length > 0 ? 
(paymentDetails.billDetails[0].billAccountDetails !== undefined && paymentDetails.billDetails[0].billAccountDetails !== null ?
(paymentDetails.billDetails[0].billAccountDetails): "NA"): "NA") : "NA"): "NA"
console.log("OfflineInitatePayArray-1",OfflineInitatePayArray)		
perDayRupees = perDayRate && perDayRate ? perDayRate.data.ratePerDay : '';
} 
	else { 
paymentDetails = fetchPaymentAfterPayment && fetchPaymentAfterPayment.Payments[0] && fetchPaymentAfterPayment.Payments[0].paymentDetails[0].bill ;
console.log("paymentDetails-In-Case-Of-Else Condition",paymentDetails)

OfflineInitatePayArray = paymentDetails !== undefined && paymentDetails !== null ? 
(paymentDetails.billDetails !== undefined && paymentDetails.billDetails !== null ? (paymentDetails.billDetails.length > 0 ? 
(paymentDetails.billDetails[0].billAccountDetails !== undefined && paymentDetails.billDetails[0].billAccountDetails !== null ?
(paymentDetails.billDetails[0].billAccountDetails): "NA"): "NA") : "NA"): "NA"
console.log("OfflineInitatePayArray-else-condition",OfflineInitatePayArray)		
perDayRupees = perDayRate && perDayRate ? perDayRate.data.ratePerDay : '';
		// paymentDetails =paymentData && paymentData !== null && paymentData !== undefined ? 
		// (paymentData.Bill && paymentData.Bill !== undefined && paymentData.Bill !== null ? 
		// (paymentData.Bill.length > 0 ?(paymentData.Bill[0]):"NA"):"NA"): "NA";
        // console.log("paymentDetails-2",paymentDetails)
		// if(paymentDetails !== "NA"){
		// 	OfflineInitatePayArray = paymentData.Bill[0].billDetails !== undefined && paymentData.Bill[0].billDetails !== null ? 
		// 	(paymentData.Bill[0].billDetails !== undefined && paymentData.Bill[0].billDetails !== null ? (paymentData.Bill[0].billDetails.length > 0 ? (paymentData.Bill[0].billDetails[0].billAccountDetails !== undefined && paymentData.Bill[0].billDetails[0].billAccountDetails !== null ? 
		// 	(paymentData.Bill[0].billDetails[0].billAccountDetails ? (paymentData.Bill[0].billDetails[0].billAccountDetails.length > 0 ? (paymentData.Bill[0].billDetails[0].billAccountDetails) : "NA"): "NA"): "NA"): "NA"): "NA") : "NA"
		// 	}
		// 	console.log("OfflineInitatePayArray-1",OfflineInitatePayArray)		
		// perDayRupees = perDayRate && perDayRate ? perDayRate.data.ratePerDay : '';
	} 

	if(OfflineInitatePayArray !== "NA"){
		for(let i = 0; i < OfflineInitatePayArray.length ; i++ ){
		
		if(OfflineInitatePayArray[i].taxHeadCode == "CLEANING_CHRGS_COMMERCIAL_GROUND_BOOKING_BRANCH"){
			CommercialcleaningCharge = OfflineInitatePayArray[i].amount
		}
		else if(OfflineInitatePayArray[i].taxHeadCode == "FACILITATION_CHRGS_COMMERCIAL_GROUND_BOOKING_BRANCH"){
			CommercialFaciliCharges = OfflineInitatePayArray[i].amount
		}
		else if(OfflineInitatePayArray[i].taxHeadCode == "SECURITY_COMMERCIAL_GROUND_BOOKING_BRANCH"){
			CommercialSecurityCharges = OfflineInitatePayArray[i].amount
		}
		else if(OfflineInitatePayArray[i].taxHeadCode == "CGST_UTGST_COMMERCIAL_GROUND_BOOKING_BRANCH"){  //tax
			CommercialTaxes = OfflineInitatePayArray[i].amount
		}
		else if(OfflineInitatePayArray[i].taxHeadCode == "PARKING_LOTS_COMMERCIAL_GROUND_BOOKING_BRANCH"){
			CommercialParkingCharges = OfflineInitatePayArray[i].amount
		}
		}
	}
	let historyApiData = {}
	if (historyObject) {
		historyApiData = historyObject;
	}
	
    const role = "employee";

	let isAssignedToEmployee = true;
	if (selectedComplaint && businessService) {

		let details = {
			applicantName: selectedComplaint.bkApplicantName,
			status: selectedComplaint.bkApplicationStatus,
			applicationNo: selectedComplaint.bkApplicationNumber,
			address: selectedComplaint.bkCompleteAddress,
			bookingType: selectedComplaint.bkBookingType,
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
			businessService: businessService,
			bkConstructionType: selectedComplaint.bkConstructionType,
			bkFatherName: selectedComplaint.bkFatherName,
		    bkBookingPurpose: selectedComplaint.bkBookingPurpose,
		    bkFromDate: selectedComplaint.bkFromDate,
		    bkToDate: selectedComplaint.bkToDate
		}



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
			CommercialcleaningCharge,CommercialFaciliCharges,CommercialSecurityCharges,CommercialTaxes,CommercialParkingCharges,
			paymentDetails,
			historyApiData,
			DownloadPaymentReceiptDetailsforCG,
			DownloadReceiptDetailsforCG,
			DownloadPermissionLetterDetailsforCG,
			DownloadApplicationDetailsforCG,
			paymentDetailsForReceipt,
			perDayRupees,
			userInfo,
			documentMap,
			form,
			transformedComplaint,
			role,
			serviceRequestId,
			isAssignedToEmployee,
			complaintTypeLocalised,
			first,RefoundCGAmount,selectedComplaint
		};
	} else {
		return {
			CommercialcleaningCharge,CommercialFaciliCharges,CommercialSecurityCharges,CommercialTaxes,CommercialParkingCharges,selectedComplaint,
			paymentDetails,
			historyApiData,
			DownloadPaymentReceiptDetailsforCG,
			DownloadReceiptDetailsforCG,
			DownloadPermissionLetterDetailsforCG,
			DownloadApplicationDetailsforCG,
			paymentDetailsForReceipt,
			perDayRupees,
			userInfo,
			documentMap,
			form,
			transformedComplaint: {},
			role,
			serviceRequestId,
			isAssignedToEmployee,
			first,RefoundCGAmount
		};
	}
};

const mapDispatchToProps = dispatch => {
	return {
		fetchApplications: criteria => dispatch(fetchApplications(criteria)),
		fetchPayment: criteria => dispatch(fetchPayment(criteria)), 
		fetchperDayRate: criteria => dispatch(fetchperDayRate(criteria)),
		fetchDataAfterPayment: criteria => dispatch(fetchDataAfterPayment(criteria)),

		downloadPaymentReceiptforCG: criteria => dispatch(downloadPaymentReceiptforCG(criteria)),
		downloadReceiptforCG: criteria => dispatch(downloadReceiptforCG(criteria)),
		downloadLetterforCG: criteria => dispatch(downloadLetterforCG(criteria)),
		downloadPermissionLetterforCG: criteria => dispatch(downloadPermissionLetterforCG(criteria)),
		downloadApplicationforCG: criteria => dispatch(downloadApplicationforCG(criteria)),
		fetchHistory: criteria => dispatch(fetchHistory(criteria)),
		resetFiles: formKey => dispatch(resetFiles(formKey)),
		sendMessage: message => dispatch(sendMessage(message)),
		sendMessageMedia: message => dispatch(sendMessageMedia(message)),
		prepareFormData: (jsonPath, value) =>
		dispatch(prepareFormData(jsonPath, value)),
		prepareFinalObject: (jsonPath, value) =>
			dispatch(prepareFinalObject(jsonPath, value))
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CGApplicationDetails);
