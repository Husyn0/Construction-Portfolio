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

// Helper to determine if a section uses separate endpoints
const usesSeparateEndpoints = (section) => {
  return ['projects', 'services', 'team'].includes(section);
};

// Helper to get the correct endpoint
const getEndpoint = (section, action = '') => {
  if (usesSeparateEndpoints(section)) {
    return `${API_URL}/${section}${action}`;
  }
  return `${API_URL}/content/${section}${action}`;
};

export const fetchContent = async (section) => {
  try {
    let response;
    const endpoint = getEndpoint(section);
    
    // For separate endpoints (projects, services, team)
    if (usesSeparateEndpoints(section)) {
      response = await fetch(endpoint, {
        headers: headers()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${section}`);
      }
      
      const result = await response.json();

      // Handle different response structures
      let sectionData = [];
      let title = '';
      let subtitle = '';
      
      // If the response has a data property that's an array
      if (result.data && Array.isArray(result.data)) {
        sectionData = result.data;
      } 
      // If the response itself is the array (some APIs return array directly)
      else if (Array.isArray(result)) {
        sectionData = result;
      }
      // If the response has items or the section name as property
      else if (result[section] && Array.isArray(result[section])) {
        sectionData = result[section];
      }
      // If the response has a 'items' property
      else if (result.items && Array.isArray(result.items)) {
        sectionData = result.items;
      }
      
      // Get title and subtitle if they exist
      if (result.title) title = result.title;
      if (result.subtitle) subtitle = result.subtitle;

      // Return in the format expected by the editors
      return {
        title: title,
        subtitle: subtitle,
        [section]: sectionData
      };
    } else {
      // For content sections (hero, about, contact)
      response = await fetch(`${API_URL}/content/${section}`, {
        headers: headers()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const result = await response.json();
      const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      return data;
    }
  } catch (error) {
    console.error(`Error fetching ${section}:`, error);
    throw error;
  }
};

export const fetchAllContent = async () => {
  try {
    const response = await fetch(`${API_URL}/content/all`, {
      headers: headers()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch all content');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching all content:', error);
    throw error;
  }
};

export const saveContent = async (section, data) => {
  try {
    let response;
    const endpoint = getEndpoint(section);
    
    // For separate endpoints (projects, services, team)
    if (usesSeparateEndpoints(section)) {
      // For these sections, we need to handle the data differently
      // Extract the items from the data object
      const items = data[section] || data.data || [];
      
      // For services, projects, team - we need to save each item or the collection
      // This depends on your API design. If your API expects bulk update:
      response = await fetch(endpoint, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          title: data.title || '',
          subtitle: data.subtitle || '',
          data: items // Send the items in a 'data' field
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save ${section}`);
      }
      
      const result = await response.json();
      // Return the data in the expected format
      return {
        title: result.title || data.title || '',
        subtitle: result.subtitle || data.subtitle || '',
        [section]: result.data || items
      };
    } else {
      // For content sections (hero, about, contact)
      const cleanData = { ...data };
      
      response = await fetch(`${API_URL}/content/${section}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ data: cleanData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content');
      }
      
      const result = await response.json();
      const responseData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      return responseData;
    }
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

// export const uploadImage = async (section, file, field = 'hero_image') => {
//   try {
//     const token = getToken();
//     const formData = new FormData();
//     formData.append('image', file);
//     formData.append('field', field);
//     formData.append('original_name', file.name);
    
//     let endpoint;
//     if (usesSeparateEndpoints(section)) {
//       endpoint = `${API_URL}/${section}/upload-image`;
//     } else {
//       endpoint = `${API_URL}/content/${section}/upload-image`;
//     }
    
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: {
//         ...(token && { 'Authorization': `Bearer ${token}` })
//       },
//       body: formData
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to upload image');
//     }
    
//     const result = await response.json();
//     return result.data;
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     throw error;
//   }
// };

// Update the uploadImage function
export const uploadImage = async (section, file, field = 'hero_image') => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    formData.append('field', field);
    formData.append('original_name', file.name);
    
    // Determine the endpoint based on section type
    let endpoint;
    if (usesSeparateEndpoints(section)) {
      endpoint = `${API_URL}/${section}/upload-image`;
    } else {
      endpoint = `${API_URL}/content/${section}/upload-image`;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image: ${errorText}`);
    }
    
    const result = await response.json();
    
    // Ensure the path is clean (remove /api/v1 if present)
    if (result.data && result.data.path) {
      // Store just the path as returned (should be relative like /uploads/filename.jpg)
      // We'll handle the URL construction in ImageUpload component
      return result.data;
    }
    
    return result.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (section, field = 'hero_image') => {
  try {
    const token = getToken();
    
    let endpoint;
    if (usesSeparateEndpoints(section)) {
      endpoint = `${API_URL}/${section}/delete-image`;
    } else {
      endpoint = `${API_URL}/content/${section}/delete-image`;
    }
    
    const response = await fetch(endpoint, {
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

// Auth functions remain the same...
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
      throw new Error('Invalid response from server. Please check if the backend is running.');
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