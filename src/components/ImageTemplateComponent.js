// ImageTemplatesComponent.js
import React from 'react';
import { useHistory } from 'react-router-dom';

const ImageTemplatesComponent = () => {
  const history = useHistory();

  // Function to handle image click and redirect to input form page
  const handleImageClick = (templateId) => {
    history.push(`/input-form/${templateId}`);
  };

  // Sample image template data
  const templates = [
    { id: 1, imageUrl: 'https://i.pinimg.com/originals/d4/de/1a/d4de1a86d04a9a0d1637d18e50ee4a7c.jpg' },
    { id: 2, imageUrl: 'https://i.pinimg.com/originals/d4/de/1a/d4de1a86d04a9a0d1637d18e50ee4a7c.jpg' },
    // Add more template objects as needed
  ];

  return (
    <div>
      <h2>Choose Image Template</h2>
      <div>
        {templates.map((template) => (
          <div key={template.id} onClick={() => handleImageClick(template.id)}>
            <img src={template.imageUrl} alt={`Template ${template.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTemplatesComponent;
