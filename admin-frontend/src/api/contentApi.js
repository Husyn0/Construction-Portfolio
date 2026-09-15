// admin-frontend/src/api/contentApi.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const getToken = () => localStorage.getItem('token');

const headers = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ==================== CONTENT TABLE ROUTES (hero, about, contact) ====================

// Fetch content from content table
export const fetchContent = async (section) => {
  try {
    const response = await fetch(`${API_URL}/content/${section}`, {
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }
    
    const result = await response.json();
    const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    return data;
  } catch (error) {
    console.error(`Error fetching ${section}:`, error);
    throw error;
  }
};

// Save content to content table
export const saveContent = async (section, data) => {
  try {
    const response = await fetch(`${API_URL}/content/${section}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ data })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save content');
    }
    
    const result = await response.json();
    const responseData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    return responseData;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

// Upload image for content table sections
export const uploadContentImage = async (section, file, field = 'hero_image') => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    formData.append('field', field);
    
    const response = await fetch(`${API_URL}/content/${section}/upload-image`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from content table
export const deleteContentImage = async (section, field = 'hero_image') => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/content/${section}/delete-image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ field })
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// ==================== SERVICES TABLE ROUTES ====================

export const fetchServices = async () => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    
    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const createService = async (serviceData) => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(serviceData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create service');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const updateService = async (id, serviceData) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(serviceData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update service');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete service');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export const uploadServiceImage = async (id, file) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/services/${id}/upload-image`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload service image');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error uploading service image:', error);
    throw error;
  }
};

export const deleteServiceImage = async (id) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/services/${id}/delete-image`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete service image');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error deleting service image:', error);
    throw error;
  }
};

// ==================== PROJECTS TABLE ROUTES ====================

export const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const uploadProjectImage = async (id, file) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/projects/${id}/upload-image`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload project image');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw error;
  }
};

export const deleteProjectImage = async (id) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/projects/${id}/delete-image`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project image');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error deleting project image:', error);
    throw error;
  }
};

// ==================== TEAM TABLE ROUTES ====================

export const fetchTeam = async () => {
  try {
    const response = await fetch(`${API_URL}/team`, {
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    
    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const createTeamMember = async (memberData) => {
  try {
    const response = await fetch(`${API_URL}/team`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(memberData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create team member');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
};

export const updateTeamMember = async (id, memberData) => {
  try {
    const response = await fetch(`${API_URL}/team/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(memberData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update team member');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id) => {
  try {
    const response = await fetch(`${API_URL}/team/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete team member');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

// ==================== AUTH ROUTES ====================

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse login response:', parseError);
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      throw new Error(result.message || result.error || 'Invalid credentials');
    }
    
    if (result.success && result.data) {
      const token = result.data.token;
      const user = result.data.user;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return result.data;
      } else {
        throw new Error('No token received from server');
      }
    } else {
      throw new Error('Invalid response structure from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};