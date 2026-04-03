import React, { useState, useEffect} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import TransliterationInput from "./form/TransliterationInput";
import ImageCropComponent from "./form/ImageCropComponent";
import ganeshaImg from "../assets/images/ganesha.png";
import lakshmiImg from "../assets/images/lakshmi.png";
import bismillahImg from "../assets/images/bismillah.png";
import christImg from "../assets/images/christ.png";

/** Display labels for field keys and title variants (English biodata). */
const FIELD_LABELS = {
  name: "Name",
  "Boy's Name": "Boy's Name",
  "Girl's Name": "Girl's Name",
  date_of_birth: "Date of Birth",
  DOB: "DOB",
  time_of_birth: "Time of Birth",
  place_of_birth: "Place of Birth",
  "Birth Place": "Birth Place",
  birth_name: "Birth Name",
  Nickname: "Nickname",
  "Rashi Name": "Rashi Name",
  religion: "Religion",
  caste: "Caste",
  family_deity: "Family Deity",
  devak: "Devak",
  gotra: "Gotra",
  nakshatra: "Nakshatra",
  rashi: "Rashi",
  gana: "Gana",
  nadi: "Nadi",
  height: "Height",
  complexion: "Complexion",
  "Skin tone": "Skin tone",
  blood_group: "Blood Group",
  education: "Education",
  profession: "Profession",
  annual_income: "Annual Income",
  "Salary (Annual)": "Salary (Annual)",
  "Income (Annual)": "Income (Annual)",
  other_information: "Other Information",
  fathers_name: "Father's Name",
  fathers_occupation: "Father's Occupation",
  mothers_name: "Mother's Name",
  sisters: "Sister(s)",
  brothers: "Brother(s)",
  maternal_uncles: "Maternal Uncle(s)",
  brothers_in_law: "Brother-in-law(s)",
  paternal_uncles: "Paternal Uncle(s)",
  relatives: "Relatives",
  other: "Other",
  address: "Address",
  mobile_number: "Mobile Number",
};

const SECTION_TITLES_EN = {
  personal: "Personal Details",
  astrology: "Astrology",
  education: "Education & Work",
  family: "Family Details",
  contact: "Contact",
};

function toEnglishLabel(keyOrLabel) {
  if (!keyOrLabel) return "";
  const raw = String(keyOrLabel);
  const key = raw.replace(/ /g, "_");
  return FIELD_LABELS[key] || FIELD_LABELS[raw] || raw.replace(/_/g, " ");
}

const InputFormPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const location = useLocation();
  const initialFormData = location.state?.initialFormData; // Ensure this line exists and correctly references the passed state


  useEffect(() => {
    window.scrollTo(0, 0);
  
  }, []);
  
  const [formData, setFormData] = useState(initialFormData || {
    name: { value: "", type: "text", titleOptions: ["Name", "Boy's Name", "Girl's Name"], restrictNumbers: true },
    date_of_birth: { day: "", month: "", year: "", varr: "", type: "date", titleOptions: ["Date of Birth", "DOB"] },
    time_of_birth: { hour: "", minute: "", period: "", type: "time" },
    place_of_birth: { value: "", type: "text", titleOptions: ["Place of Birth", "Birth Place"] },

    birth_name: { value: "", type: "text", titleOptions: ["Birth Name", "Nickname", "Rashi Name"], restrictNumbers: true },
    religion: { value: "", type: "text", titleOptions: ["Religion"], restrictNumbers: true },
    caste: { value: "", type: "text", titleOptions: ["Caste"] },
    family_deity: { value: "", type: "text", titleOptions: ["Family Deity"], restrictNumbers: true },
    devak: { value: "", type: "text", titleOptions: ["Devak"], restrictNumbers: true },

    gotra: { value: "", type: "select", titleOptions: ["Gotra"] },
    nakshatra: { value: "", type: "select", titleOptions: ["Nakshatra"] },
    rashi: { value: "", type: "select", titleOptions: ["Rashi"] },
    gana: { value: "", type: "select", titleOptions: ["Gana"] },
    nadi: { value: "", type: "select", titleOptions: ["Nadi"] },
    height: { value: "", type: "select", titleOptions: ["Height"] },
    complexion: { value: "", type: "select", titleOptions: ["Complexion", "Skin tone"] },
    blood_group: { value: "", type: "select", titleOptions: ["Blood Group"] },
    education: { value: "", type: "text", titleOptions: ["Education"] },
    profession: { value: "", type: "text", titleOptions: ["Profession", "Occupation"] },
    annual_income: { value: "", type: "text", titleOptions: ["Annual Income", "Salary (Annual)", "Income (Annual)"] },
    other_information: { value: "", type: "text", titleOptions: ["Other Information"] },

    fathers_name: { value: "", type: "text", titleOptions: ["Father's Name"], restrictNumbers: true },
    fathers_occupation: { value: "", type: "text", titleOptions: ["Father's Occupation"] },
    mothers_name: { value: "", type: "text", titleOptions: ["Mother's Name"], restrictNumbers: true },
    sisters: [{ value: "", type: "text", titleOptions: ["Sister(s)"], maritalStatus: "", restrictNumbers: true }],
    brothers: [{ value: "", type: "text", titleOptions: ["Brother(s)"], maritalStatus: "", restrictNumbers: true }],
    maternal_uncles: [{ value: "", type: "text", titleOptions: ["Maternal Uncle(s)"], restrictNumbers: true }],
    brothers_in_law: [{ value: "", type: "text", titleOptions: ["Brother-in-law(s)"], restrictNumbers: true }],
    paternal_uncles: [{ value: "", type: "text", titleOptions: ["Paternal Uncle(s)"], restrictNumbers: true }],
    relatives: { value: "", type: "text", titleOptions: ["Relatives"], restrictNumbers: true },
    other: { value: "", type: "text", titleOptions: ["Other"] },

    address: { value: "", type: "text", titleOptions: ["Address"] },
    mobile_number: { value: "", type: "text", titleOptions: ["Mobile Number"] },
  });
  

  const [imagePreview, setImagePreview] = useState(ganeshaImg);
const [additionalImage, setAdditionalImage] = useState(location.state?.additionalImage || null);
  const [centerText, setCenterText] = useState("|| Shri Ganeshaya Namah ||");
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
            const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthIndexMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  const varr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ["AM", "PM"];

  const selectOptions = {
    complexion: ["Fair", "Very fair", "Wheatish", "Dusky", "Dark"],
    blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    height: [
      "4'4\"",
      "4'5\"",
      "4'6\"",
      "4'7\"",
      "4'8\"",
      "4'9\"",
      "4'10\"",
      "4'11\"",
      "5'0\"",
      "5'1\"",
      "5'2\"",
      "5'3\"",
      "5'4\"",
      "5'5\"",
      "5'6\"",
      "5'7\"",
      "5'8\"",
      "5'9\"",
      "5'10\"",
      "5'11\"",
      "6'0\"",
      "6'1\"",
      "6'2\"",
      "6'3\"",
      "6'4\"",
      "6'5\"",
      "6'6\"",
      "6'7\"",
      "6'8\""
  ],
    nadi: ["Adi", "Madhya", "Antya"],
    gana: ["Deva", "Manushya", "Rakshasa"],
    rashi: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
    nakshatra: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
    gotra: ["Kashyap", "Bharadwaj", "Atri", "Vashishtha", "Vishwamitra", "Jamadagni", "Gautam", "Shandilya"],
  };

  const REQUIRED_FIELD_KEYS = ["name", "date_of_birth", "time_of_birth", "fathers_name", "address", "mobile_number"];

  const formSections = [
    { id: "personal", title: SECTION_TITLES_EN.personal, keys: ["name", "date_of_birth", "time_of_birth", "place_of_birth", "birth_name", "religion", "caste", "family_deity", "devak"] },
    { id: "astrology", title: SECTION_TITLES_EN.astrology, keys: ["gotra", "nakshatra", "rashi", "gana", "nadi", "height", "complexion", "blood_group"] },
    { id: "education", title: SECTION_TITLES_EN.education, keys: ["education", "profession", "annual_income", "other_information"] },
    { id: "family", title: SECTION_TITLES_EN.family, keys: ["fathers_name", "fathers_occupation", "mothers_name", "sisters", "brothers", "maternal_uncles", "brothers_in_law", "paternal_uncles", "relatives", "other"] },
    { id: "contact", title: SECTION_TITLES_EN.contact, keys: ["address", "mobile_number"] },
  ];

  return (
    <div className="container py-3 py-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <h1 className="h2 fw-bold text-center mb-2">Fill Biodata Details</h1>
          <p className="text-muted text-center mb-4">Enter your details to generate your biodata.</p>
          <form onSubmit={handleSubmit}>
            <div className="card border-0 shadow-sm mb-4 rounded-3">
              <div className="card-body p-4 p-md-5">
                <h2 className="h5 fw-bold text-primary mb-3 pb-2 border-bottom border-2 border-warning">Header Image & Center Text</h2>
                <div className="row g-3 align-items-center mb-3">
                  <div className="col-12 col-md-4 text-center">
                    <img src={imagePreview} alt="Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: '120px', objectFit: 'contain' }} />
                  </div>
                  <div className="col-12 col-md-8">
                    <button type="button" className="btn btn-outline-primary mb-2 w-100" onClick={() => setIsPopupOpen(true)}>Choose a header image</button>
                    <div className="mb-0 form-group-spaced deity-accent mt-3">
                      <label htmlFor="centerText" className="form-label small text-muted">Center Text</label>
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
                      <h5 id="deityModalTitle" className="modal-title">Choose a header image</h5>
                      <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsPopupOpen(false)} />
                    </div>
                    <div className="modal-body d-flex flex-wrap gap-3 justify-content-center">
                      {predefinedImages.map((img, index) => (
                        <button key={index} type="button" className="border-0 bg-transparent p-0" onClick={() => { setImagePreview(img); setIsPopupOpen(false); }}>
                          <img src={img} alt={`Predefined ${index + 1}`} className="img-fluid rounded shadow-sm" style={{ maxHeight: '80px', cursor: 'pointer' }} />
                        </button>
                      ))}
                      <label className="btn btn-outline-primary mb-0 w-100">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="d-none" /> Upload
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formSections.map((sec) => (
              <div key={sec.id} className="card border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
                <div className="card-header bg-light border-0 border-start border-4 border-primary py-3 px-4">
                  <h2 className="h5 fw-bold text-primary mb-0">{sec.title}</h2>
                  {sec.id === "personal" && <p className="small text-muted mb-0 mt-1">Fill name, date of birth, religion, etc.</p>}
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
                      const requiredLabel = isRequired ? <span className="text-danger ms-1" aria-label="Required">*</span> : null;
                      const wrapperClass = `form-group-spaced ${isMissing ? 'field-missing' : ''} ${isRequired ? 'field-required' : ''}`;

          if (Array.isArray(fieldData)  ) {
            return (
              <div key={field} className={`col-12 ${wrapperClass}`}>
                <label className="form-label fw-medium text-dark">{toEnglishLabel(field)}{isRequired && requiredLabel}</label>
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
                        placeholder={toEnglishLabel(field)}
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
                      <option value="">Status</option>
                      <option value="Married">Married</option>
                      <option value="Unmarried">Unmarried</option>
                      <option value="Widowed">Widowed</option>
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
                <label className="form-label fw-medium text-dark">{toEnglishLabel(fieldData.title ?? titleOptions[0])}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{toEnglishLabel(title)}</option>
                    ))}
                  </select>
                )}
                <div className="row g-2">
                  <div className="col-6 col-md-3">
                    <select name={`${field}-day`} value={fieldData.day} onChange={handleChange} className="form-select">
                      <option value="">Day</option>
                      {days.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <select name={`${field}-month`} value={fieldData.month} onChange={handleChange} className="form-select">
                      <option value="">Month</option>
                      {months.map((month, index) => (
                        <option key={index} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <select name={`${field}-year`} value={fieldData.year} onChange={handleChange} className="form-select">
                      <option value="">Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <select name={`${field}-varr`} value={fieldData.varr} onChange={handleChange} disabled className="form-select bg-light">
                      <option value="">Weekday</option>
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
                <label className="form-label fw-medium text-dark">{toEnglishLabel(fieldData.title ?? titleOptions[0])}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{toEnglishLabel(title)}</option>
                    ))}
                  </select>
                )}
                <div className="row g-2">
                  <div className="col-4">
                    <select name={`${field}-hour`} value={fieldData.hour} onChange={handleChange} className="form-select">
                      <option value="">Hour</option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <select name={`${field}-minute`} value={fieldData.minute} onChange={handleChange} className="form-select">
                      <option value="">Minute</option>
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <select name={`${field}-period`} value={fieldData.period} onChange={handleChange} className="form-select">
                      <option value="">AM/PM</option>
                      {periods.map((period, index) => (
                        <option key={index} value={period}>{period}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          } 
          else if (field === "fathers_name") {
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
          else if (field === "address") {
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
                <label className="form-label fw-medium text-dark">{toEnglishLabel(fieldData.title ?? titleOptions[0])}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{toEnglishLabel(title)}</option>
                    ))}
                  </select>
                )}
                <select name={field} value={fieldData.value} onChange={handleChange} className="form-select">
                  <option value="">{`Select ${toEnglishLabel(field)}`}</option>
                  {selectOptions[field].map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            );
          } else {
            // const isDeityField = field === "family_deity" || field === "devak";
            const isDeityField = false;
            return (
              <div key={field} className={`col-12 col-md-6 ${wrapperClass} ${isDeityField ? "deity-accent rounded p-3" : ""}`}>
                <label className="form-label fw-medium text-dark">{toEnglishLabel(fieldData.title ?? titleOptions[0])}{isRequired && requiredLabel}</label>
                {titleOptions.length > 1 && (
                  <select name={`${field}-title`} value={fieldData.title ?? titleOptions[0]} onChange={handleChange} className="form-select form-select-sm w-auto d-inline-block mb-2 text-muted">
                    {titleOptions.map((title, index) => (
                      <option key={index} value={title}>{toEnglishLabel(title)}</option>
                    ))}
                  </select>
                )}
                <TransliterationInput
                  value={fieldData.value}
                  onChange={(value) => handleTransliterationChange(field, value)}
                  placeholder={toEnglishLabel(fieldData.title ?? titleOptions[0])}
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
                <h2 className="h5 fw-bold text-primary mb-0">Add Your Photo</h2>
                <p className="small text-muted mb-0 mt-1">Upload your photo and crop it into a circle for best results.</p>
              </div>
              <div className="card-body p-4 p-md-5">
                <ImageCropComponent handleCroppedImageChange={handleAdditionalImageChange} />
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4 rounded-3">
              <div className="card-body p-4 p-md-5 text-center">
                <button type="submit" className="btn btn-primary btn-lg px-5">Preview Biodata</button>
              </div>
            </div>
          </form>

          {missingFields.length > 0 && (
            <div className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2 shadow-sm" role="alert">
              <div>
                <strong className="d-block mb-1">Please fill the following fields:</strong>
                <span className="small">{missingFields.map((k) => toEnglishLabel(k)).join(', ')}</span>
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