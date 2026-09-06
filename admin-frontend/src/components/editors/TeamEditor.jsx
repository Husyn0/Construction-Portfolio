// admin-frontend/src/components/editors/TeamEditor.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import TextAreaField from '../common/TextAreaField';
import { FaTrash, FaPlus } from "react-icons/fa";

const TeamEditor = ({ data, onChange }) => {
  const defaultData = {
    title: '',
    subtitle: '',
    members: []
  };

  const [formData, setFormData] = useState({ ...defaultData, ...data });

  useEffect(() => {
    if (data) {
      
      // Ensure members is always an array
      let membersArray = [];
      
      if (data.members && Array.isArray(data.members)) {
        membersArray = data.members;
      } else if (data.data && Array.isArray(data.data)) {
        membersArray = data.data;
      } else if (Array.isArray(data)) {
        membersArray = data;
      } else if (data.items && Array.isArray(data.items)) {
        membersArray = data.items;
      }

      setFormData(prev => ({
        ...defaultData,
        ...data,
        members: membersArray
      }));
    }
  }, [data]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    const updated = { ...formData, members: updatedMembers };
    setFormData(updated);
    onChange(updated);
  };

  const addMember = () => {
    const updatedMembers = [...formData.members, { name: '', role: '', experience: '' }];
    const updated = { ...formData, members: updatedMembers };
    setFormData(updated);
    onChange(updated);
  };

  const removeMember = (index) => {
    const currentMembers = formData.members || [];
    const updatedMembers = currentMembers.filter((_, i) => i !== index);
    const updated = { ...formData, members: updatedMembers };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="editor-section">
      <h3>Team Section Content</h3>
      
      <div className="editor-grid">
        <InputField
          label="Section Title"
          value={formData.title}
          onChange={(val) => handleChange('title', val)}
          placeholder="Our Team"
        />

        <TextAreaField
          label="Section Subtitle"
          value={formData.subtitle}
          onChange={(val) => handleChange('subtitle', val)}
          placeholder="Meet the experts behind our award-winning projects..."
          rows={2}
        />

        <div className="team-editor">
          <div className="team-header">
            <label>Team Members</label>
            <button type="button" onClick={addMember} className="add-btn">
              <FaPlus /> Add Member
            </button>
          </div>
          
          {formData.members.map((member, index) => (
            <div key={index} className="member-item">
              <div className="member-fields">
                <InputField
                  label="Full Name"
                  value={member.name}
                  onChange={(val) => handleMemberChange(index, 'name', val)}
                  placeholder="David Martinez"
                />
                <InputField
                  label="Role"
                  value={member.role}
                  onChange={(val) => handleMemberChange(index, 'role', val)}
                  placeholder="CEO & Founder"
                />
                <InputField
                  label="Experience"
                  value={member.experience}
                  onChange={(val) => handleMemberChange(index, 'experience', val)}
                  placeholder="25+ years"
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeMember(index)}
                className="remove-btn"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamEditor;
