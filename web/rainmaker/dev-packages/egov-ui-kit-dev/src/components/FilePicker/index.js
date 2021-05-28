import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getImageUrlByFile } from "./utils";
import { toggleSnackbar } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { toggleSnackbarAndSetText } from "egov-ui-kit/redux/app/actions";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
// pass the index
class FilePicker extends Component {
  handleFileChange = (event) => {
    const input = event.target;
    const { maxFiles } = this.props.inputProps;
    const { toggleSnackbar,toggleSnackbarAndSetText } = this.props;
    if (input.files && input.files.length > 0) {
      const files = input.files;
      Object.keys(files)
        .slice(0, maxFiles)
        .forEach(async (key, index) => {
          const file = files[key];
            // check filename
            // const extension = [".txt",
            //                     ".php",
            //                     ".exe",
            //                     ".json"
            //                     ];
            let valid = ((file.name.toLowerCase().indexOf(".txt") !== -1)
                      || (file.name.toLowerCase().indexOf(".php") !== -1)
                      || (file.name.toLowerCase().indexOf(".exe") !== -1)
                      || (file.name.toLowerCase().indexOf(".json") !== -1))//extension.includes(file.name);
                      if(file.size<5242880)
                      {
                        if(!valid)
            {
            if (file.type.match(/^image\//)) {
              const imageUri = await getImageUrlByFile(file);
              this.props.handleimage(file, imageUri);
              if(imageUri)
              {
                //toggleSnackbarAndSetText(true, { labelName: "The file is not a valid image", labelKey: "CORE_COMMON_IMAGE_FILE_UPLOAD_SUCCESS" }, "success");
              }
              }
           
            else
            {
              
              toggleSnackbarAndSetText(true, { labelName: "The file is not a valid image", labelKey: "CORE_COMMON_INVALID_IMAGE_FILE" }, "warning");
  
            }
          }
          else
            {
              
              toggleSnackbarAndSetText(true, { labelName: "Please select valid file!", labelKey: "CORE_COMMON_INVALID_FILE_EXTENSION" }, "warning");
  
            }

                      }
                      else{
                        toggleSnackbarAndSetText(true, { labelName: "The file is more than 5mb", labelKey: "ERR_FILE_MORE_THAN_FIVEMB" }, "warning");

                      }
            
        });
    }
  };

  openFileDialog = () => {
    this.upload.click();
  };

  render() {
    const { inputProps, children, id ,className} = this.props;
    const { multiple, accept } = inputProps;
    const { handleFileChange, openFileDialog } = this;
    return (
      <div onClick={openFileDialog} className = {className}>
        <input
          id={id}
          type="file"
          multiple={multiple}
          accept={accept}
          ref={(ref) => (this.upload = ref)}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {children}
      </div>
    );
  }
}

FilePicker.propTypes = {
  "inputProps.accept": PropTypes.string,
  "inputProps.id": PropTypes.string,
  "inputProps.multiple": PropTypes.bool,
  "labelProps.icon": PropTypes.node,
};
const mapStateToProps = state => {
  const { screenConfiguration } = state;
  const { preparedFinalObject } = screenConfiguration;  
  return { preparedFinalObject };
};
const mapDispacthToProps = dispatch => {
  return {
    toggleSnackbarAndSetText: (open, message, error) => dispatch(toggleSnackbarAndSetText(open, message, error)),
    prepareFinalObject: (path, value) =>
      dispatch(prepareFinalObject(path, value)),
    toggleSnackbar: (open, message, variant) =>
      dispatch(toggleSnackbar(open, message, variant))
  };
};

export default connect(
  mapStateToProps,
  mapDispacthToProps
)(FilePicker);

// export default FilePicker;
