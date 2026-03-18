import React, { useState, useEffect} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import TransliterationInput from "./form/TransliterationInput";
import ImageCropComponent from "./form/ImageCropComponent";
import ganeshaImg from "../assets/images/ganesha.png";
import lakshmiImg from "../assets/images/lakshmi.png";
import bismillahImg from "../assets/images/bismillah.png";
import christImg from "../assets/images/christ.png";
const InputFormPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const location = useLocation();
  const initialFormData = location.state?.initialFormData; // Ensure this line exists and correctly references the passed state


  useEffect(() => {
    window.scrollTo(0, 0);
  
  }, []);
  
  const [formData, setFormData] = useState(initialFormData || {
    नाव: { value: "", type: "text", titleOptions: ["नाव", "मुलाचे नाव", "मुलीचे नाव"],  restrictNumbers: true },
    जन्मतारीख: { day: "", month: "", year: "", varr:"", type: "date", titleOptions: ["जन्मतारीख", "जन्मदिनांक"] },
    जन्मवेळ: { hour: "", minute: "", period: "", type: "time" },
    जन्मस्थान: { value: "", type: "text", titleOptions: ["जन्म स्थळ", "जन्म ठिकाण"] },

    जन्मनाव: { value: "", type: "text", titleOptions: ["जन्मनाव", "नावरस नाव", "रास नाव"], restrictNumbers: true },
    धर्म: { value: "", type: "text", titleOptions: ["धर्म"], restrictNumbers: true },
    जात: { value: "", type: "text", titleOptions: ["जात"]},
    कुलदैवत: { value: "", type: "text", titleOptions: ["कुलदैवत"],restrictNumbers: true },
    देवक: { value: "", type: "text", titleOptions: ["देवक"],restrictNumbers: true },

    गोत्र: { value: "", type: "select", titleOptions: ["गोत्र"] },
    नक्षत्र: { value: "", type: "select", titleOptions: ["नक्षत्र"] },
    रास: { value: "", type: "select", titleOptions: ["रास"] },
    गण: { value: "", type: "select", titleOptions: ["गण"] },
    नाडी: { value: "", type: "select", titleOptions: ["नाडी"] },
    ऊंची: { value: "", type: "select", titleOptions: ["ऊंची"] },
    रंग: { value: "", type: "select", titleOptions: ["रंग", "वर्ण"] },
    रक्तगट: { value: "", type: "select", titleOptions: ["रक्तगट"] },
    शिक्षण: { value: "", type: "text", titleOptions: ["शिक्षण"] },
    नोकरी: { value: "", type: "text", titleOptions: ["नोकरी", "व्यवसाय"] },
    पगार: { value: "", type: "text", titleOptions: ["पगार(वार्षिक)", "वेतन(वार्षिक)" , "उत्पन्न(वार्षिक)"] },
    इतर_माहिती: { value: "", type: "text", titleOptions: ["इतर_माहिती"] },

    वडिलांचे_नाव: { value: "", type: "text", titleOptions: ["वडिलांचे_नाव"], restrictNumbers: true },
    वडिलांचा_व्यवसाय: { value: "", type: "text", titleOptions: ["वडिलांचा_व्यवसाय"] },
    आईचे_नाव: { value: "", type: "text", titleOptions: ["आईचे_नाव"], restrictNumbers: true },
    बहीण: [{ value: "", type: "text", titleOptions: ["बहीण"], maritalStatus: "", restrictNumbers: true }],
    भाऊ: [{ value: "", type: "text", titleOptions: ["भाऊ"], maritalStatus: "", restrictNumbers: true }],
    मामा: [{ value: "", type: "text", titleOptions: ["मामा"], restrictNumbers: true }],
    दाजी: [{ value: "", type: "text", titleOptions: ["दाजी"], restrictNumbers: true }],
    चूलते: [{ value: "", type: "text", titleOptions: ["चूलते"], restrictNumbers: true  }],
    नातेसंबंध: { value: "", type: "text", titleOptions: ["नातेसंबंध"], restrictNumbers: true  },
    इतर: { value: "", type: "text", titleOptions: ["इतर"] },

    पत्ता: { value: "", type: "text", titleOptions: ["पत्ता"] },
    मोबाईल_नं: { value: "", type: "text", titleOptions: ["मोबाईल_नं"] },
    
  });
  

  const [imagePreview, setImagePreview] = useState(ganeshaImg);
const [additionalImage, setAdditionalImage] = useState(location.state?.additionalImage || null);
  const [centerText, setCenterText] = useState("|| श्री गणेशाय नम: ||");
  const [missingFields, setMissingFields] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  const predefinedImages = [
    lakshmiImg,
    bismillahImg,
    christImg,
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [field, subfield] = name.split("-");
  
    if (subfield) {
      const updatedField = { ...formData[field], [subfield]: value };
  
      // Check if we need to calculate the weekday
      if (subfield === "day" || subfield === "month" || subfield === "year") {
        const { day, month, year } = updatedField;
  
        if (day && month && year) {
          const monthIndex = monthIndexMap[month];
          if (monthIndex !== undefined) {
            const date = new Date(year, monthIndex, day); // Month is zero-based in JS Date
            const weekdays = ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
            updatedField.varr = weekdays[date.getDay()];
          } else {
            updatedField.varr = "";
          }
        } else {
          updatedField.varr = "";
        }
      }
  
      setFormData((prevState) => ({
        ...prevState,
        [field]: updatedField,
      }));
    } else if (Array.isArray(formData[field])) {
      const updatedArray = [...formData[field]];
      updatedArray[subfield] = { ...updatedArray[subfield], value };
      setFormData((prevState) => ({
        ...prevState,
        [field]: updatedArray,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: { ...prevState[name], value },
      }));
    }
  };
  
const handleArrayChange = (e, index, field) => {
  const { name, value } = e.target;
  
  // Check if 'name' is defined
  if (!name) {
    return;
  }

  // Extract key from name
  const nameParts = name.split('-');

  // Ensure name has expected parts
  if (nameParts.length < 3) {
    return;
  }

  const key = nameParts[2];

  setFormData((prevFormData) => {
    const updatedArray = [...prevFormData[field]];
    const currentItem = updatedArray[index];

    if (key === 'maritalStatus') {
      // Update the maritalStatus field
      updatedArray[index] = { 
        ...currentItem, 
        maritalStatus: value,
        value: currentItem.value ? `${currentItem.value} (${value})` : `(${value})`
      };
    } else {
      // Update other fields
      updatedArray[index] = { ...currentItem, [key]: value };
    }

    return { ...prevFormData, [field]: updatedArray };
  });
};

  
  
  

  const handleAddField = (field) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: [...prevFormData[field], { value: "", type: "text" }],
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleDeleteField = (field, index) => {
    setFormData((prevFormData) => {
      const updatedArray = prevFormData[field].filter((_, i) => i !== index);
      return { ...prevFormData, [field]: updatedArray };
    });
  };
  

  const handleAdditionalImageChange = (croppedImage) => {
    // croppedImage is now a base64 image (Data URL)
    if (croppedImage) {
      const byteString = atob(croppedImage.split(',')[1]); // Decode base64 to byte string
      const mimeString = croppedImage.split(',')[0].split(':')[1].split(';')[0]; // Extract mime type
  
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
  
      const file = new Blob([arrayBuffer], { type: mimeString }); // Convert byte string to Blob object (similar to a file)
  
   
      // Create a URL for the cropped image and set it
      setAdditionalImage(URL.createObjectURL(file));
    }
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = Object.entries(formData)
      .filter(([key]) => REQUIRED_FIELD_KEYS.includes(key))
      .map(([key, value]) => {
        if (value.type === "date") {
          return {
            key,
            isValid: value.day && value.month && value.year
          };
        } else if (value.type === "time") {
          return {
            key,
            isValid: value.hour && value.minute && value.period
          };
        } else {
          return {
            key,
            isValid: !!value.value
          };
        }
      });

    const missing = requiredFields.filter(field => !field.isValid).map(field => field.key);
    if (missing.length > 0) {
      setMissingFields(missing);
    } else {
      const completeFormData = {
        ...formData
        
      };
      navigate("/preview", {
        state: {
          formData: completeFormData,
          templateId,
          imagePreview,
          additionalImage,
          centerText,
        },
      });
    }
  };

  const handleArrayChangee = (e, index, field) => {
    const { value } = e.target;
  
    setFormData((prevFormData) => {
      const updatedArray = [...prevFormData[field]];
      updatedArray[index] = { ...updatedArray[index], value };
      return { ...prevFormData, [field]: updatedArray };
    });
  };

  const handleTransliterationChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: { ...prevState[field], value },
    }));
  };

  

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "जानेवारी",
    "फेब्रुवारी",
    "मार्च",
    "एप्रिल",
    "मे",
    "जून",
    "जुलै",
    "ऑगस्ट",
    "सप्टेंबर",
    "ऑक्टोबर",
    "नोव्हेंबर",
    "डिसेंबर",
  ];

  const monthIndexMap = {
    "जानेवारी": 0,
    "फेब्रुवारी": 1,
    "मार्च": 2,
    "एप्रिल": 3,
    "मे": 4,
    "जून": 5,
    "जुलै": 6,
    "ऑगस्ट": 7,
    "सप्टेंबर": 8,
    "ऑक्टोबर": 9,
    "नोव्हेंबर": 10,
    "डिसेंबर": 11,
  };
  const varr = ["सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ["पहाटे", "सकाळी", "दुपारी", "संध्याकाळी", "रात्री"];

  const selectOptions = {
    रंग: ["गोरापान", "गोरा", "गहूवर्णीय", "सावळा", "काळा"],
    रक्तगट: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    ऊंची: [
      "4 फूट 4 इंच",
      "4 फूट 5 इंच",
      "4 फूट 6 इंच",
      "4 फूट 7 इंच",
      "4 फूट 8 इंच",
      "4 फूट 9 इंच",
      "4 फूट 10 इंच",
      "4 फूट 11 इंच",
      "5 फूट 0 इंच",
      "5 फूट 1 इंच",
      "5 फूट 2 इंच",
      "5 फूट 3 इंच",
      "5 फूट 4 इंच",
      "5 फूट 5 इंच",
      "5 फूट 6 इंच",
      "5 फूट 7 इंच",
      "5 फूट 8 इंच",
      "5 फूट 9 इंच",
      "5 फूट 10 इंच",
      "5 फूट 11 इंच",
      "6 फूट 0 इंच",
      "6 फूट 1 इंच",
      "6 फूट 2 इंच",
      "6 फूट 3 इंच",
      "6 फूट 4 इंच",
      "6 फूट 5 इंच",
      "6 फूट 6 इंच",
      "6 फूट 7 इंच",
      "6 फूट 8 इंच" 
  ],
    नाडी: ["आदि", "मध्य", "अन्त्य"],
    गण: ["देव", "मनुष्य", "राक्षस"],
    रास: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
    नक्षत्र: ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्रेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूला", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शततारका", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"],
    गोत्र: ["कश्यप", "भारद्वाज", "अत्रि", "वशिष्ठ", "विश्वामित्र", "जमदग्नि", "गौतम", "शांडिल्य"],
    };

  const REQUIRED_FIELD_KEYS = ["नाव", "जन्मतारीख", "जन्मवेळ", "वडिलांचे_नाव", "पत्ता", "मोबाईल_नं"];

  const formSections = [
    { title: "वैयक्तिक माहिती", keys: ["नाव", "जन्मतारीख", "जन्मवेळ", "जन्मस्थान", "जन्मनाव", "धर्म", "जात", "कुलदैवत", "देवक"] },
    { title: "ज्योतिष", keys: ["गोत्र", "नक्षत्र", "रास", "गण", "नाडी", "ऊंची", "रंग", "रक्तगट"] },
    { title: "शिक्षण आणि काम", keys: ["शिक्षण", "नोकरी", "पगार", "इतर_माहिती"] },
    { title: "कौटुंबिक माहिती", keys: ["वडिलांचे_नाव", "वडिलांचा_व्यवसाय", "आईचे_नाव", "बहीण", "भाऊ", "मामा", "दाजी", "चूलते", "नातेसंबंध", "इतर"] },
    { title: "संपर्क", keys: ["पत्ता", "मोबाईल_नं"] },
  ];

  return (
    <div className="container py-3 py-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <h1 className="h2 fw-bold text-center marathi-text mb-2">बायोडाटा माहिती भरा</h1>
          <p className="text-muted text-center marathi-text mb-4">आपली माहिती भरा आणि बायोडाटा तयार करा.</p>
          <form onSubmit={handleSubmit}>
            <div className="card border-0 shadow-sm mb-4 rounded-3">
              <div className="card-body p-4 p-md-5">
                <h2 className="h5 fw-bold text-primary mb-3 pb-2 border-bottom border-2 border-warning">कुलदैवत आणि मध्यवर्ती मजकूर</h2>
                <div className="row g-3 align-items-center mb-3">
                  <div className="col-12 col-md-4 text-center">
                    <img src={imagePreview} alt="Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: '120px', objectFit: 'contain' }} />
                  </div>
                  <div className="col-12 col-md-8">
                    <button type="button" className="btn btn-outline-primary mb-2 w-100" onClick={() => setIsPopupOpen(true)}>आपल्या कुलदैवताचा फोटो निवडा</button>
                    <div className="mb-0 form-group-spaced deity-accent mt-3">
                      <label htmlFor="centerText" className="form-label small text-muted">मध्यवर्ती मजकूर (Center Text)</label>
                      <input type="text" id="centerText" className="form-control" value={centerText} onChange={(e) => setCenterText(e.target.value)} placeholder="Center Text" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isPopupOpen && (
              <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="deityModalTitle">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content shadow">
                    <div className="modal-header border-0">
                      <h5 id="deityModalTitle" className="modal-title">कुलदैवताचा फोटो निवडा</h5>
                      <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsPopupOpen(false)} />
                    </div>
                    <div className="modal-body d-flex flex-wrap gap-3 justify-content-center">
                      {predefinedImages.map((img, index) => (
                        <button key={index} type="button" className="border-0 bg-transparent p-0" onClick={() => { setImagePreview(img); setIsPopupOpen(false); }}>
                          <img src={img} alt={`Predefined ${index + 1}`} className="img-fluid rounded shadow-sm" style={{ maxHeight: '80px', cursor: 'pointer' }} />
                        </button>
                      ))}
                      <label className="btn btn-outline-primary mb-0 w-100">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="d-none" /> अपलोड करा
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formSections.map((sec) => (
              <div key={sec.title} className="card border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
                <div className="card-header bg-light border-0 border-start border-4 border-primary py-3 px-4">
                  <h2 className="h5 fw-bold text-primary mb-0">{sec.title}</h2>
                  {sec.title === "वैयक्तिक माहिती" && <p className="small text-muted mb-0 mt-1">नाव, जन्मतारीख, धर्म इ. माहिती भरा</p>}
                </div>
                <div className="card-body p-4 p-md-5">
                  <div className="row g-3">
                    {sec.keys.map((field) => {
                      const fieldData = formData[field];
                      if (!fieldData) return null;
                      const titleOptions = fieldData.titleOptions || [field];
                      const type = fieldData.type;
                      const restrictNumbers = fieldData.restrictNumbers;
                      const isRequired = REQUIRED_FIELD_KEYS.includes(field);
                      const isMissing = missingFields.includes(field);
                      const requiredLabel = isRequired ? <span className="text-danger ms-1" aria-label="आवश्यक">*</span> : null;
                      const wrapperClass = `form-group-spaced ${isMissing ? 'field-missing' : ''} ${isRequired ? 'field-required' : ''}`;

          if (Array.isArray(fieldData)  ) {
            return (
              <div key={field} className={`col-12 ${wrapperClass}`}>
                <label className="form-label fw-medium text-dark">{field}{isRequired && requiredLabel}</label>
                {fieldData.map((item, index) => (
                  <div key={index} className="d-flex flex-wrap align-items-center gap-2 mb-2 p-2 rounded bg-light">
                    <div className="flex-grow-1" style={{ minWidth: '120px' }}>
                      <TransliterationInput
                        value={item.value}
                        onChange={(value) =>
                          handleArrayChange(
                            { target: { value, name: `${field}-${index}-value` } },
                            index,
                            field
                          )
                        }
                        placeholder={field}
                        inputType="text"
                        restrictNumbers={true}
                      />
                    </div>
                    <select
                      name={`${field}-${index}-maritalStatus`}
                      value={item.maritalStatus || ""}
                      onChange={(e) => handleArrayChange(e, index, field)}
                      className="form-select form-select-sm"
                      style={{ maxWidth: '140px' }}
                    >
                      <option value="">स्थिती</option>
                      <option value="विवाहित">विवाहित</option>
                      <option value="अविवाहित">अविवाहित</option>
                      <option value="विधुर/विधवा">विधुर/विधवा</option>
                    </select>
                    {fieldData.length > 1 && (
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteField(field, index)} aria-label="Remove">−</button>
                    )}
                    {index === fieldData.length - 1 && (
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleAddField(field)} aria-label="Add">+</button>
                    )}
                  </div>
                ))}
              </div>
            );
          }
          else if (Array.isArray(fieldData)) {
            return (
              <div key={field} className="col-12 form-group-spaced">
                <label className="form-label fw-medium text-dark">{titleOptions[0]}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{title}</option>
                    ))}
                  </select>
                )}
                {fieldData.map((item, index) => (
                  <div key={index} className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <div className="flex-grow-1" style={{ minWidth: '120px' }}>
                      <TransliterationInput
                        value={item.value}
                        onChange={(value) =>
                          handleArrayChangee(
                            { target: { value } },
                            index,
                            field
                          )
                        }
                        placeholder={titleOptions[0]}
                        inputType="text"
                        restrictNumbers={true}
                      />
                    </div>
                    {fieldData.length > 1 && (
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteField(field, index)} aria-label="Remove">−</button>
                    )}
                    {index === fieldData.length - 1 && (
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleAddField(field)} aria-label="Add">+</button>
                    )}
                  </div>
                ))}
              </div>
            );
          } 
          if (fieldData.type === "date") {
            return (
              <div key={field} className={`col-12 col-md-6 ${wrapperClass}`}>
                <label className="form-label fw-medium text-dark">{titleOptions[0]}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{title}</option>
                    ))}
                  </select>
                )}
                <div className="row g-2">
                  <div className="col-6 col-md-3">
                    <select name={`${field}-day`} value={fieldData.day} onChange={handleChange} className="form-select">
                      <option value="">दिवस</option>
                      {days.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <select name={`${field}-month`} value={fieldData.month} onChange={handleChange} className="form-select">
                      <option value="">महिना</option>
                      {months.map((month, index) => (
                        <option key={index} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <select name={`${field}-year`} value={fieldData.year} onChange={handleChange} className="form-select">
                      <option value="">वर्ष</option>
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <select name={`${field}-varr`} value={fieldData.varr} onChange={handleChange} disabled className="form-select bg-light">
                      <option value="">वार</option>
                      {varr.map((v, index) => (
                        <option key={index} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          } else if (fieldData.type === "time") {
            return (
              <div key={field} className={`col-12 col-md-6 ${wrapperClass}`}>
                <label className="form-label fw-medium text-dark">{titleOptions[0]}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{title}</option>
                    ))}
                  </select>
                )}
                <div className="row g-2">
                  <div className="col-4">
                    <select name={`${field}-hour`} value={fieldData.hour} onChange={handleChange} className="form-select">
                      <option value="">तास</option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <select name={`${field}-minute`} value={fieldData.minute} onChange={handleChange} className="form-select">
                      <option value="">मिनिट</option>
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <select name={`${field}-period`} value={fieldData.period} onChange={handleChange} className="form-select">
                      <option value="">प्रहर</option>
                      {periods.map((period, index) => (
                        <option key={index} value={period}>{period}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          } 
          else if (field === "वडिलांचे_नाव") {
            return (
              <div key={field} className={`col-12 col-md-6 ${wrapperClass}`}>
                <label className="form-label fw-medium text-dark">{titleOptions[0]}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{title}</option>
                    ))}
                  </select>
                )}
                <TransliterationInput
                  value={fieldData.value}
                  onChange={(value) => handleTransliterationChange(field, value)}
                  placeholder={titleOptions[0]}
                  inputType={type}
                  restrictNumbers={restrictNumbers}
                />
              </div>
            );
          }
          else if (field === "पत्ता") {
            return (
              <div key={field} className={`col-12 col-md-6 ${wrapperClass}`}>
                <label className="form-label fw-medium text-dark">{titleOptions[0]}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{title}</option>
                    ))}
                  </select>
                )}
                <TransliterationInput
                  value={fieldData.value}
                  onChange={(value) => handleTransliterationChange(field, value)}
                  placeholder={titleOptions[0]}
                  inputType={type}
                  restrictNumbers={restrictNumbers}
                />
              </div>
            );
          }
          else if (fieldData.type === "select" && selectOptions[field]) {
            return (
              <div key={field} className={`col-12 col-md-6 ${wrapperClass}`}>
                <label className="form-label fw-medium text-dark">{titleOptions[0]}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{title}</option>
                    ))}
                  </select>
                )}
                <select name={field} value={fieldData.value} onChange={handleChange} className="form-select">
                  <option value="">{field} निवडा</option>
                  {selectOptions[field].map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            );
          } else {
            // const isDeityField = field === "कुलदैवत" || field === "देवक";
            const isDeityField = false;
            return (
              <div key={field} className={`col-12 col-md-6 ${wrapperClass} ${isDeityField ? "deity-accent rounded p-3" : ""}`}>
                <label className="form-label fw-medium text-dark">{titleOptions[0]}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{title}</option>
                    ))}
                  </select>
                )}
                <TransliterationInput
                  value={fieldData.value}
                  onChange={(value) => handleTransliterationChange(field, value)}
                  placeholder={titleOptions[0]}
                  inputType={type}
                  restrictNumbers={restrictNumbers}
                />
              </div>
            );
          }
                    })}
                  </div>
                </div>
              </div>
            ))}

            <div className="card border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
              <div className="card-header bg-light border-0 border-start border-4 border-primary py-3 px-4">
                <h2 className="h5 fw-bold text-primary mb-0">तुमचा फोटो जोडा</h2>
                <p className="small text-muted mb-0 mt-1">आपला फोटो अपलोड करून गोल आकारात क्रॉप करा. सर्व डिव्हाइसवर चांगला दिसेल.</p>
              </div>
              <div className="card-body p-4 p-md-5">
                <ImageCropComponent handleCroppedImageChange={handleAdditionalImageChange} />
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4 rounded-3">
              <div className="card-body p-4 p-md-5 text-center">
                <button type="submit" className="btn btn-primary btn-lg px-5">बायोडाटा पहा</button>
              </div>
            </div>
          </form>

          {missingFields.length > 0 && (
            <div className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2 shadow-sm" role="alert">
              <div>
                <strong className="d-block mb-1">कृपया खालील फील्ड भरा:</strong>
                <span className="small">{missingFields.join(', ')}</span>
              </div>
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => setMissingFields([])}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputFormPage;